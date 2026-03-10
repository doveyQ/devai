export interface PreflightPattern {
    id: string;
    description: string;
    regex: RegExp;
    severity: 'error' | 'warning';
}

export interface Violation {
    patternId: string;
    description: string;
    file: string;
    line: string;
    lineNumber: number;
    severity: 'error' | 'warning';
}


export interface PreflightResult {
    passed: boolean;
    violations: Violation[];
}

export const PREFLIGHT_PATTERNS: PreflightPattern[] = [
    {
        id: 'todo-deploy',
        description: 'TODO' + ': DEPLOY marker left in code',
        regex: /TODO:\s*DEPLOY/i,
        severity: 'error',
    },
    {
        id: 'fixme-before-merge',
        description: 'FIXME' + ': BEFORE_MERGE marker left in code',
        regex: /FIXME:\s*BEFORE_MERGE/i,
        severity: 'error',
    },

    {
        id: 'hardcoded-api-key',
        description: 'Possible hardcoded API key',
        regex: /API_KEY\s*=\s*['"][A-Za-z0-9]/i,
        severity: 'error',
    },
    {
        id: 'hardcoded-secret',
        description: 'Possible hardcoded secret',
        regex: /SECRET\s*=\s*['"][A-Za-z0-9]/i,
        severity: 'error',
    },
    {
        id: 'hardcoded-password',
        description: 'Possible hardcoded password',
        regex: /password\s*=\s*['"][^'"]+['"]/i,
        severity: 'error',
    },
    {
        id: 'hardcoded-private-key',
        description: 'Possible hardcoded private key',
        regex: /PRIVATE_KEY\s*=\s*['"]/i,
        severity: 'error',
    },

    {
        id: 'logging-sensitive-data',
        description: 'Logging potentially sensitive data',
        regex: /console\.log\(.*(?:token|secret|password|key)/i,
        severity: 'warning',
    },
];

/**
 * @param diff - The raw unified diff string from `git diff --cached`
 * @returns A PreflightResult indicating pass/fail and all violations
 */
export function runPreflightScan(diff: string): PreflightResult {
    const violations: Violation[] = [];
    const lines = diff.split('\n');

    let currentFile = 'unknown';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Track which file we're in by parsing diff headers
        // Format: diff --git a/path/to/file b/path/to/file
        const diffHeaderMatch = line.match(/^diff --git a\/.+ b\/(.+)$/);
        if (diffHeaderMatch) {
            currentFile = diffHeaderMatch[1];
            continue;
        }

        if (!line.startsWith('+') || line.startsWith('+++')) {
            continue;
        }

        // Remove the leading '+' to get the actual code content
        const codeContent = line.slice(1);

        for (const pattern of PREFLIGHT_PATTERNS) {
            if (pattern.regex.test(codeContent)) {
                violations.push({
                    patternId: pattern.id,
                    description: pattern.description,
                    file: currentFile,
                    line: codeContent.trim(),
                    lineNumber: i + 1,
                    severity: pattern.severity,
                });
            }
        }
    }

    const hasErrors = violations.some((v) => v.severity === 'error');

    return {
        passed: !hasErrors,
        violations,
    };
}
