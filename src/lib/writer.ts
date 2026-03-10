export interface DocSuggestion {
    file: string;
    type: 'missing-jsdoc' | 'outdated-readme' | 'missing-changelog' | 'naming-inconsistency' | 'other';
    message: string;
    suggestedText?: string;
}

export interface WriterResult {
    suggestions: DocSuggestion[];
    summary: string;
}

/**
 * @param diff  - The unified diff string of staged changes
 * @param files - The list of staged file paths (post-filtering)
 * @returns A WriterResult with documentation suggestions
 */
export async function runTechnicalWriter(
    diff: string,
    files: string[],
): Promise<WriterResult> {

    await new Promise((resolve) => setTimeout(resolve, 50));

    return {
        suggestions: [],
        summary: `[STUB] TechnicalWriter reviewed ${files.length} file(s) — no suggestions (Phase 1 skeleton).`,
    };
}
