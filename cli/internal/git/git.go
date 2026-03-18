// Package git provides utilities for inspecting the git staging area.
// It uses go-git (pure Go) so there is no dependency on a git binary in PATH.
package git

import (
	"bytes"
	"fmt"
	"strings"

	gogit "github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing/object"
)

// StagedResult holds the files changed and the full unified diff of the index.
type StagedResult struct {
	// Files is the list of relative paths of staged files.
	Files []string
	// Diff is the unified diff text (+ / - lines) of the index vs HEAD.
	Diff string
	// IsEmpty is true when nothing is staged.
	IsEmpty bool
}

// GetStagedChanges opens the git repo at repoPath (use "" for cwd) and
// returns the staged files and a unified diff.
func GetStagedChanges(repoPath string) (*StagedResult, error) {
	if repoPath == "" {
		repoPath = "."
	}

	repo, err := gogit.PlainOpenWithOptions(repoPath, &gogit.PlainOpenOptions{
		DetectDotGit: true,
	})
	if err != nil {
		return nil, fmt.Errorf("could not open git repository: %w", err)
	}

	worktree, err := repo.Worktree()
	if err != nil {
		return nil, fmt.Errorf("could not access worktree: %w", err)
	}

	// Worktree.Status() gives us the staging state of every file.
	status, err := worktree.Status()
	if err != nil {
		return nil, fmt.Errorf("could not read git status: %w", err)
	}

	// Collect files that have staged changes.
	var stagedFiles []string
	for path, s := range status {
		if s.Staging != gogit.Unmodified && s.Staging != gogit.Untracked {
			stagedFiles = append(stagedFiles, path)
		}
	}

	if len(stagedFiles) == 0 {
		return &StagedResult{IsEmpty: true}, nil
	}

	// Try to get HEAD tree for diffing (fails on initial commit).
	var headTree *object.Tree
	if ref, err := repo.Head(); err == nil {
		if commit, err := repo.CommitObject(ref.Hash()); err == nil {
			headTree, _ = commit.Tree()
		}
	}

	diff, err := buildUnifiedDiff(worktree, status, headTree)
	if err != nil {
		// Non-fatal: still return the file list.
		return &StagedResult{Files: stagedFiles, Diff: ""}, nil
	}

	return &StagedResult{
		Files: stagedFiles,
		Diff:  diff,
	}, nil
}

// buildUnifiedDiff produces a unified diff string from the staging area.
func buildUnifiedDiff(wt *gogit.Worktree, status gogit.Status, headTree *object.Tree) (string, error) {
	var buf bytes.Buffer

	for path, s := range status {
		if s.Staging == gogit.Unmodified || s.Staging == gogit.Untracked {
			continue
		}

		buf.WriteString(fmt.Sprintf("diff --git a/%s b/%s\n", path, path))

		switch s.Staging {
		case gogit.Added:
			buf.WriteString("new file mode 100644\n")
			buf.WriteString("--- /dev/null\n")
			buf.WriteString(fmt.Sprintf("+++ b/%s\n", path))
			newLines := readWorkFileLines(wt, path)
			buf.WriteString(fmt.Sprintf("@@ -0,0 +1,%d @@\n", len(newLines)))
			for _, l := range newLines {
				buf.WriteString("+" + l + "\n")
			}

		case gogit.Deleted:
			buf.WriteString(fmt.Sprintf("--- a/%s\n", path))
			buf.WriteString("+++ /dev/null\n")
			oldLines := readTreeFileLines(headTree, path)
			buf.WriteString(fmt.Sprintf("@@ -1,%d +0,0 @@\n", len(oldLines)))
			for _, l := range oldLines {
				buf.WriteString("-" + l + "\n")
			}

		case gogit.Modified, gogit.Renamed, gogit.Copied:
			buf.WriteString(fmt.Sprintf("--- a/%s\n", path))
			buf.WriteString(fmt.Sprintf("+++ b/%s\n", path))
			oldLines := readTreeFileLines(headTree, path)
			newLines := readWorkFileLines(wt, path)
			writeHunk(&buf, oldLines, newLines)
		}
	}

	return buf.String(), nil
}

func readWorkFileLines(wt *gogit.Worktree, path string) []string {
	f, err := wt.Filesystem.Open(path)
	if err != nil {
		return nil
	}
	defer f.Close()
	var buf bytes.Buffer
	buf.ReadFrom(f)
	return splitLines(buf.String())
}

func readTreeFileLines(tree *object.Tree, path string) []string {
	if tree == nil {
		return nil
	}
	f, err := tree.File(path)
	if err != nil {
		return nil
	}
	content, err := f.Contents()
	if err != nil {
		return nil
	}
	return splitLines(content)
}

func splitLines(s string) []string {
	s = strings.TrimRight(s, "\n")
	if s == "" {
		return nil
	}
	return strings.Split(s, "\n")
}

// writeHunk emits a unified diff hunk comparing old and new line slices.
func writeHunk(buf *bytes.Buffer, old, new []string) {
	lcs := lcsLines(old, new)

	buf.WriteString(fmt.Sprintf("@@ -1,%d +1,%d @@\n", len(old), len(new)))

	io, in := 0, 0
	for _, l := range lcs {
		for io < len(old) && old[io] != l {
			buf.WriteString("-" + old[io] + "\n")
			io++
		}
		for in < len(new) && new[in] != l {
			buf.WriteString("+" + new[in] + "\n")
			in++
		}
		buf.WriteString(" " + l + "\n")
		io++
		in++
	}
	for ; io < len(old); io++ {
		buf.WriteString("-" + old[io] + "\n")
	}
	for ; in < len(new); in++ {
		buf.WriteString("+" + new[in] + "\n")
	}
}

// lcsLines returns the longest common subsequence of two line slices.
func lcsLines(a, b []string) []string {
	m, n := len(a), len(b)
	dp := make([][]int, m+1)
	for i := range dp {
		dp[i] = make([]int, n+1)
	}
	for i := 1; i <= m; i++ {
		for j := 1; j <= n; j++ {
			if a[i-1] == b[j-1] {
				dp[i][j] = dp[i-1][j-1] + 1
			} else if dp[i-1][j] > dp[i][j-1] {
				dp[i][j] = dp[i-1][j]
			} else {
				dp[i][j] = dp[i][j-1]
			}
		}
	}
	result := make([]string, 0, dp[m][n])
	i, j := m, n
	for i > 0 && j > 0 {
		if a[i-1] == b[j-1] {
			result = append([]string{a[i-1]}, result...)
			i--
			j--
		} else if dp[i-1][j] > dp[i][j-1] {
			i--
		} else {
			j--
		}
	}
	return result
}
