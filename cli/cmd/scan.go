package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var scanCmd = &cobra.Command{
	Use:   "scan",
	Short: "Scan staged changes for vulnerabilities and code quality issues",
	Long: `Captures the current git staged diff, scans dependencies against the
OSV vulnerability database, and sends code through a local AI model for review.

If any critical issues are found, the scan exits with a non-zero code,
which blocks the commit when used as a pre-commit hook.`,
	RunE: func(cmd *cobra.Command, args []string) error {
		fmt.Println("⚡ DevAI scan — not implemented yet")
		fmt.Println("")
		fmt.Println("Planned pipeline:")
		fmt.Println("  1. Capture staged diff")
		fmt.Println("  2. Scan dependencies (OSV API)")
		fmt.Println("  3. AI code review (Ollama)")
		fmt.Println("")
		fmt.Println("Coming in the next increments!")
		return nil
	},
}

func init() {
	rootCmd.AddCommand(scanCmd)
}
