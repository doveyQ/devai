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
		fmt.Println("scan not implemented yet")
		return nil
	},
}

func init() {
	rootCmd.AddCommand(scanCmd)
}
