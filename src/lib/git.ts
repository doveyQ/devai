import { simpleGit, type SimpleGit } from 'simple-git';

/**
 * @property files - Array of relative file paths that are staged
 * @property diff  - The full unified diff string of all staged changes
 */
export interface StagedDiffResult {
    files: string[];
    diff: string;
}


export function createGitClient(basePath?: string): SimpleGit {
    return simpleGit(basePath ?? process.cwd());
}

/**
 * @param git - An optional SimpleGit instance (useful for testing/DI)
 * @returns A StagedDiffResult with the files and diff
 */
export async function getStagedDiff(git?: SimpleGit): Promise<StagedDiffResult> {
    const client = git ?? createGitClient();

    const nameOnlyOutput = await client.diff(['--cached', '--name-only']);
    const files = nameOnlyOutput
        .split('\n')
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

    // Full unified diff with 3 lines of context
    const diff = await client.diff(['--cached', '--unified=3']);

    return { files, diff };
}
