#!/usr/bin/env npx ts-node --esm

/**
 * Development entry point for the DevAI CLI.
 *
 * This script runs commands directly from TypeScript source (via ts-node)
 * so you don't need to compile before every test run. Use this during
 * development:
 *
 *   ./bin/dev.js gate:run
 *
 * It sets NODE_ENV to 'development' and tells @oclif/core to use the
 * TypeScript source in ./src/commands instead of compiled JS in ./dist.
 */

// eslint-disable-next-line n/shebang
import { execute } from '@oclif/core';

await execute({ development: true, dir: import.meta.url });
