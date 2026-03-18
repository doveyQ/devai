package cmd

import (
	"fmt"
	"os"
	"sort"
	"strings"

	"github.com/doveyQ/devai/cli/internal/filter"
	"github.com/doveyQ/devai/cli/internal/git"
	"github.com/spf13/cobra"
)

var (
	flagModel   string
	flagAsyncAI bool
	flagSkipAI  bool
	flagSkipOSV bool
)

var scanCmd = &cobra.Command{
	Use:   "scan",
	Short: "Scan staged changes for vulnerabilities and code quality issues",
	Long: `Captures the git staging area, filters out noise files, checks dependencies
against the OSV vulnerability database, and runs a local AI code review.

OSV scanning is blocking — critical vulnerabilities prevent the commit.
AI review is non-blocking by default — it emits warnings but lets commits proceed.
Use --sync-ai to make AI findings block commits too.`,
	RunE: runScan,
}

func init() {
	scanCmd.Flags().StringVarP(
		&flagModel, "model", "m", "qwen2.5-coder:7b",
		"Ollama model to use for AI code review (e.g. codellama:7b, qwen2.5-coder:1.5b)",
	)
	scanCmd.Flags().BoolVar(
		&flagAsyncAI, "sync-ai", false,
		"Make AI findings blocking (by default AI runs async and only warns)",
	)
	scanCmd.Flags().BoolVar(
		&flagSkipAI, "skip-ai", false,
		"Skip AI code review entirely",
	)
	scanCmd.Flags().BoolVar(
		&flagSkipOSV, "skip-osv", false,
		"Skip OSV vulnerability scan (not recommended)",
	)

	rootCmd.AddCommand(scanCmd)
}

func runScan(cmd *cobra.Command, args []string) error {
	printBanner()

	// ── Step 1: Capture staged changes ──────────────────────────────────────
	fmt.Print("  📋 Reading staged changes ... ")

	result, err := git.GetStagedChanges("")
	if err != nil {
		fmt.Println()
		return fmt.Errorf("git error: %w", err)
	}
	fmt.Println("done")

	if result.IsEmpty {
		fmt.Println()
		fmt.Println("  ⚠  Nothing staged. Run `git add` first.")
		fmt.Println()
		return nil
	}

	fmt.Printf("  → %d file(s) staged\n", len(result.Files))

	// ── Step 2: Filter noise ────────────────────────────────────────────────
	classified := filter.Classify(result.Files)

	if classified.NoiseCount > 0 {
		fmt.Printf("  → Ignored %d noise file(s) (lockfiles, images, build output)\n",
			classified.NoiseCount)
	}

	if len(classified.Meaningful) == 0 {
		fmt.Println()
		fmt.Println("  ✓ All staged files are generated/noise — nothing to review.")
		fmt.Println("  Commit can proceed.")
		fmt.Println()
		return nil
	}

	fmt.Printf("  → Reviewing %d meaningful file(s):\n", len(classified.Meaningful))

	sorted := make([]string, len(classified.Meaningful))
	copy(sorted, classified.Meaningful)
	sort.Strings(sorted)
	for _, f := range sorted {
		fmt.Printf("      • %s\n", f)
	}

	fmt.Println()
	printSeparator()

	// ── Step 3: OSV vulnerability scan (blocking) ────────────────────────────
	if flagSkipOSV {
		fmt.Println("  ⏭  OSV scan skipped (--skip-osv)")
	} else {
		fmt.Print("  🔍 OSV vulnerability scan ... ")
		// Stub — implemented in Increment 4
		fmt.Println("(not yet implemented — coming in Increment 4)")
	}

	fmt.Println()

	// ── Step 4: AI code review (non-blocking by default) ──────────────────
	if flagSkipAI {
		fmt.Println("  ⏭  AI review skipped (--skip-ai)")
	} else {
		mode := "async (non-blocking)"
		if flagAsyncAI {
			mode = "sync (blocking)"
		}
		fmt.Printf("  🤖 AI review via Ollama [model: %s] [mode: %s]\n", flagModel, mode)
		fmt.Println("     (not yet implemented — coming in Increment 5)")
	}

	fmt.Println()
	printSeparator()

	// ── All gates passed ─────────────────────────────────────────────────────
	fmt.Println("  ✅ All checks complete — commit can proceed.")
	fmt.Println()

	return nil
}

func printBanner() {
	fmt.Println()
	fmt.Println("  ⚡ DevAI — Automated Quality Gate")
	printSeparator()
	fmt.Println()
}

func printSeparator() {
	fmt.Println("  " + strings.Repeat("─", 48))
}

// exitWithError prints a red-prefixed error and exits with code 1.
// Used for blocking failures (e.g., critical OSV vulns).
func exitWithError(msg string) {
	fmt.Fprintf(os.Stderr, "\n  ✗ %s\n\n", msg)
	os.Exit(1)
}
