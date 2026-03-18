package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

const version = "0.1.0"

var rootCmd = &cobra.Command{
	Use:   "devai",
	Short: "DevAI — AI-powered code quality gate",
	Long: `DevAI is a local CLI agent that hooks into your git workflow.
It captures staged diffs, scans dependencies against the OSV vulnerability
database, and runs smart code review using a small local AI model via Ollama.`,
	Version: version,
}

func Execute() error {
	return rootCmd.Execute()
}

func init() {
	rootCmd.SetVersionTemplate(fmt.Sprintf("devai v%s\n", version))
}
