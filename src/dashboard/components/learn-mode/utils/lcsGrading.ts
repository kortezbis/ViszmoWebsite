/**
 * Computes the Longest Common Subsequence (LCS) similarity between two strings.
 */
export function calculateLCS(s1: string, s2: string): string {
    const n = s1.length;
    const m = s2.length;
    const dp = Array(n + 1).fill(0).map(() => Array(m + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            if (s1[i - 1] === s2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    // Backtrack to build the LCS string
    let res = "";
    let i = n, j = m;
    while (i > 0 && j > 0) {
        if (s1[i - 1] === s2[j - 1]) {
            res = s1[i - 1] + res;
            i--; j--;
        } else if (dp[i - 1][j] > dp[i][j - 1]) {
            i--;
        } else {
            j--;
        }
    }
    return res;
}

export function gradeWrittenAnswer(userAnswer: string, correctAnswer: string): {
    score: number;
    isCorrect: boolean;
    feedback: string;
} {
    const sanitize = (str: string) => str.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const userClean = sanitize(userAnswer);
    const correctClean = sanitize(correctAnswer);

    if (!correctClean) return { score: 0, isCorrect: false, feedback: 'No answer provided.' };

    const lcs = calculateLCS(userClean, correctClean);
    const similarity = (lcs.length / correctClean.length) * 100;

    return {
        score: similarity,
        isCorrect: similarity >= 85, // 85% threshold
        feedback: similarity >= 85
            ? 'Correct!'
            : `Close, but not quite. You got ${Math.round(similarity)}% correct.`
    };
}
