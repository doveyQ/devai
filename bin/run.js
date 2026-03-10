#!/usr/bin/env node

/**
 * Production entry point for the DevAI CLI.
 *
 * This is the script that gets invoked when a user runs `npx devai` or
 * `./bin/run.js`. It delegates to @oclif/core's `execute()` which handles
 * command discovery, argument parsing, and lifecycle management.
 *
 * The `execute()` function reads the `oclif` config from package.json to
 * know where compiled commands live (./dist/commands).
 */
import { execute } from '@oclif/core';

await execute({ dir: import.meta.url });
