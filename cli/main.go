package main

import (
	"os"

	"github.com/doveyQ/devai/cli/cmd"
)

func main() {
	if err := cmd.Execute(); err != nil {
		os.Exit(1)
	}
}
