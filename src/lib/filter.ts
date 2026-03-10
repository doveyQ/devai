export const NOISE_PATTERNS: RegExp[] = [
    /package-lock\.json$/i,
    /yarn\.lock$/i,
    /pnpm-lock\.yaml$/i,
    /composer\.lock$/i,
    /Gemfile\.lock$/i,
    /Cargo\.lock$/i,
    /poetry\.lock$/i,

    /\.(png|jpe?g|gif|svg|ico|bmp|webp|tiff?)$/i,

    /\.(wasm|exe|dll|so|dylib|o|a|class|pyc)$/i,

    /\.min\.(js|css)$/i,
    /\.map$/i,
    /\.bundle\.(js|css)$/i,
    /dist\//i,
    /build\//i,

    /\.(woff2?|ttf|eot|otf)$/i,

    /\.DS_Store$/,
    /Thumbs\.db$/i,
];

/**
 * @param files - Array of relative file paths from `git diff --cached --name-only`
 * @returns Only the files that do NOT match any noise pattern
 */
export function filterNoiseFiles(files: string[]): string[] {
    return files.filter((file) => {
        const isNoise = NOISE_PATTERNS.some((pattern) => pattern.test(file));
        return !isNoise;
    });
}


export interface InsertionCheckResult {
    count: number;
    exceedsThreshold: boolean;
    threshold: number;
}

/**
 * @param diff - The raw unified diff string from `git diff --cached`
 * @returns The number of inserted lines
 */
export function countInsertions(diff: string): number {
    const lines = diff.split('\n');
    let count = 0;

    for (const line of lines) {
        // Match lines starting with '+' but NOT '+++'  (diff header)
        if (line.startsWith('+') && !line.startsWith('+++')) {
            count++;
        }
    }

    return count;
}

/**
 * @param count     - The number of insertions (from countInsertions)
 * @param threshold - The maximum "comfortable" insertion count (default: 500)
 * @returns An InsertionCheckResult with the verdict
 */
export function checkInsertionThreshold(
    count: number,
    threshold: number = 500,
): InsertionCheckResult {
    return {
        count,
        exceedsThreshold: count > threshold,
        threshold,
    };
}
