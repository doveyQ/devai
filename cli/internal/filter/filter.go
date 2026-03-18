// Package filter removes files that are not worth reviewing —
// generated artifacts, lock files, binary assets, and other noise.
package filter

import "regexp"

// noisePatterns is the list of file path regex patterns that should be skipped.
// Any file matching at least one pattern is considered "noise".
var noisePatterns = []*regexp.Regexp{
	// Package lock files — machine-generated, never meaningful to review
	regexp.MustCompile(`(?i)package-lock\.json$`),
	regexp.MustCompile(`(?i)yarn\.lock$`),
	regexp.MustCompile(`(?i)pnpm-lock\.yaml$`),
	regexp.MustCompile(`(?i)composer\.lock$`),
	regexp.MustCompile(`(?i)Gemfile\.lock$`),
	regexp.MustCompile(`(?i)Cargo\.lock$`),
	regexp.MustCompile(`(?i)poetry\.lock$`),
	regexp.MustCompile(`(?i)go\.sum$`),

	// Images and media
	regexp.MustCompile(`(?i)\.(png|jpe?g|gif|svg|ico|bmp|webp|tiff?)$`),
	regexp.MustCompile(`(?i)\.(mp4|webm|mov|avi|mkv|mp3|wav|ogg|flac)$`),

	// Binary / compiled
	regexp.MustCompile(`(?i)\.(wasm|exe|dll|so|dylib|o|a|class|pyc)$`),

	// Build output
	regexp.MustCompile(`(?i)\.min\.(js|css)$`),
	regexp.MustCompile(`(?i)\.map$`),
	regexp.MustCompile(`(?i)\.bundle\.(js|css)$`),
	regexp.MustCompile(`(?i)(^|/)dist/`),
	regexp.MustCompile(`(?i)(^|/)build/`),
	regexp.MustCompile(`(?i)(^|/)\.next/`),
	regexp.MustCompile(`(?i)(^|/)out/`),

	// Fonts
	regexp.MustCompile(`(?i)\.(woff2?|ttf|eot|otf)$`),

	// OS metadata
	regexp.MustCompile(`\.DS_Store$`),
	regexp.MustCompile(`(?i)Thumbs\.db$`),
}

// IsNoise reports whether a file path should be excluded from review.
func IsNoise(path string) bool {
	for _, p := range noisePatterns {
		if p.MatchString(path) {
			return true
		}
	}
	return false
}

// FilterFiles returns only the files that are worth reviewing.
func FilterFiles(files []string) []string {
	meaningful := files[:0] // reuse backing array
	for _, f := range files {
		if !IsNoise(f) {
			meaningful = append(meaningful, f)
		}
	}
	return meaningful
}

// FilterResult holds the outcome of filtering a file list.
type FilterResult struct {
	Meaningful []string
	Noise      []string
	NoiseCount int
	TotalCount int
}

// Classify separates a file list into meaningful and noise categories.
func Classify(files []string) FilterResult {
	r := FilterResult{TotalCount: len(files)}
	for _, f := range files {
		if IsNoise(f) {
			r.Noise = append(r.Noise, f)
		} else {
			r.Meaningful = append(r.Meaningful, f)
		}
	}
	r.NoiseCount = len(r.Noise)
	return r
}
