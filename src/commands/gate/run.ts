import { Command, Flags, ux } from '@oclif/core';
import chalk from 'chalk';

import { getStagedDiff } from '../../lib/git.js';
import { filterNoiseFiles, countInsertions, checkInsertionThreshold } from '../../lib/filter.js';
import { runPreflightScan } from '../../lib/preflight.js';
import { runCynicalAuditor } from '../../lib/auditor.js';
import { runTechnicalWriter } from '../../lib/writer.js';

export default class GateRun extends Command {
    static override description =
        'Run the Automated Quality Gate on your staged changes.\n\n' +
        'Captures the staged diff, filters noise, runs pre-flight security checks, ' +
        'and sends the diff through AI-powered review agents. If any gate fails, ' +
        'the commit is blocked.';

    static override examples = [
        '<%= config.bin %> gate:run',
        '<%= config.bin %> gate:run --threshold 1000',
        '<%= config.bin %> gate:run --skip-preflight',
    ];

    static override flags = {
        threshold: Flags.integer({
            char: 't',
            default: 500,
            description: 'Maximum insertion count before showing a large diff warning',
            required: false,
        }),
        'skip-preflight': Flags.boolean({
            char: 's',
            default: false,
            description: 'Skip the pre-flight regex security scan',
            required: false,
        }),
    };

    async run(): Promise<void> {
        const { flags } = await this.parse(GateRun);

        this.log('');
        this.log(chalk.bold.cyan('⚡ Automated Quality Gate — Phase 1'));
        this.log(chalk.dim('─'.repeat(50)));
        this.log('');

        ux.action.start(chalk.blue('📋 Capturing staged diff'));

        const { files, diff } = await getStagedDiff();

        ux.action.stop(chalk.green('done'));

        if (files.length === 0) {
            this.log('');
            this.log(chalk.yellow('⚠  No files are staged for commit.'));
            this.log(chalk.dim('   Stage some changes with `git add` first, then run this command again.'));
            this.log('');
            return;
        }

        this.log(chalk.dim(`   Found ${files.length} staged file(s)`));

        const meaningfulFiles = filterNoiseFiles(files);
        const filteredCount = files.length - meaningfulFiles.length;

        if (filteredCount > 0) {
            this.log(chalk.dim(`   Filtered out ${filteredCount} noise file(s) (lockfiles, images, etc.)`));
        }

        // If ALL files were noise, there's nothing meaningful to review.
        if (meaningfulFiles.length === 0) {
            this.log('');
            this.log(chalk.yellow('⚠  All staged files are noise (lockfiles, images, etc.).'));
            this.log(chalk.dim('   Nothing to review — commit can proceed.'));
            this.log('');
            return;
        }

        this.log(chalk.dim(`   Reviewing ${meaningfulFiles.length} meaningful file(s):`));
        for (const file of meaningfulFiles) {
            this.log(chalk.dim(`     • ${file}`));
        }

        const insertionCount = countInsertions(diff);
        const insertionCheck = checkInsertionThreshold(insertionCount, flags.threshold);

        this.log('');
        this.log(chalk.dim(`   Total insertions: ${insertionCount} line(s)`));

        if (insertionCheck.exceedsThreshold) {
            this.log('');
            this.warn(
                chalk.yellow(`Large diff detected: ${insertionCount} insertions exceed the threshold of ${insertionCheck.threshold}.\n`) +
                chalk.dim('   Consider breaking this into smaller, more reviewable commits.\n') +
                chalk.dim('   Proceeding anyway...')
            );
        }

        if (!flags['skip-preflight']) {
            this.log('');
            ux.action.start(chalk.blue('🔍 Running pre-flight scan'));

            const preflightResult = runPreflightScan(diff);

            ux.action.stop(chalk.green('done'));

            // Show all violations (both errors and warnings)
            if (preflightResult.violations.length > 0) {
                this.log('');

                for (const violation of preflightResult.violations) {
                    const icon = violation.severity === 'error' ? '🚫' : '⚠️';
                    const color = violation.severity === 'error' ? chalk.red : chalk.yellow;

                    this.log(color(`   ${icon}  [${violation.patternId}] ${violation.description}`));
                    this.log(chalk.dim(`      ${violation.file}:${violation.lineNumber}: ${violation.line}`));
                }

                // If ANY error-severity violations exist, block the commit
                if (!preflightResult.passed) {
                    this.log('');
                    this.error(
                        chalk.red.bold('Pre-flight scan FAILED — commit blocked.\n') +
                        chalk.dim('   Fix the issues above and try again.\n') +
                        chalk.dim('   Use --skip-preflight to bypass (not recommended).'),
                    );
                }

                // If only warnings, let them through
                this.log('');
                this.log(chalk.yellow('   Warnings found but no blocking issues — proceeding.'));
            } else {
                this.log(chalk.dim('   No issues found'));
            }
        } else {
            this.log('');
            this.log(chalk.dim('   ⏭  Pre-flight scan skipped (--skip-preflight)'));
        }


        this.log('');
        ux.action.start(chalk.blue('🤖 Running CynicalAuditor'));

        const auditResult = await runCynicalAuditor(diff, meaningfulFiles);

        ux.action.stop(chalk.green('done'));

        if (!auditResult.passed) {
            // In Phase 2+, we'll display the findings here
            this.log('');
            for (const finding of auditResult.findings) {
                this.log(chalk.red(`   🚫  [${finding.severity}] ${finding.file}:${finding.startLine}-${finding.endLine}`));
                this.log(chalk.red(`       ${finding.message}`));
                if (finding.suggestion) {
                    this.log(chalk.dim(`       Suggestion: ${finding.suggestion}`));
                }
            }

            this.log('');
            this.error(
                chalk.red.bold('CynicalAuditor FAILED — commit blocked.\n') +
                chalk.dim(`   ${auditResult.summary}\n`) +
                chalk.dim('   Address the findings above and try again.'),
            );
        }

        this.log(chalk.dim(`   ${auditResult.summary}`));
        this.log(chalk.green('   ✓ CynicalAuditor passed'));

        this.log('');
        this.log(chalk.dim('   ℹ  TechnicalWriter would be triggered here (Phase 2)'));

        this.log('');
        this.log(chalk.dim('─'.repeat(50)));
        this.log(chalk.green.bold('✅ All quality gates passed — commit proceeding!'));
        this.log('');
    }
}
