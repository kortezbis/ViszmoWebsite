import { type LearnCard, type TeachingContent } from '../../learn-mode/types';

/**
 * Claude API integration for generating structured teaching content.
 */
export async function generateTeachingContent(card: LearnCard, testMode: boolean = false): Promise<TeachingContent> {
    const apiKey = (window as any).CLAUDE_API_KEY || (import.meta as any).env?.VITE_CLAUDE_API_KEY;

    if (testMode || !apiKey) {
        // Return structured mock data
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    headline: `${card.term}: The Guardian of Digital Access`,
                    keyTerms: [
                        { term: "Authentication", definition: "Verifying who you are." },
                        { term: "Authorization", definition: "Verifying what you are allowed to do." },
                        { term: "Auditing", definition: "Tracking what you did." }
                    ],
                    comparison: [
                        { type: "Authentication", description: "Identity check (ID card)" },
                        { type: "Authorization", description: "Permission check (Key card)" }
                    ],
                    breakdown: [
                        { point: "Key Concept", description: "It's the first line of defense in cybersecurity." },
                        { point: "Mechanism", description: "Uses credentials like passwords or biometrics." }
                    ],
                    realWorldExamples: [
                        "Logging into your bank account securely.",
                        "Using a keycard to enter a restricted server room.",
                        "Setting up 2FA for your email."
                    ],
                    importance: "Without this, anyone could access any data, leading to total system compromise.",
                    eli5: "Think of it like a bouncer at a club. They check your ID to make sure you're allowed in (Authentication) and then give you a wristband for the VIP area if you paid extra (Authorization).",
                    detailed: "This involves protocols like OAuth 2.0, SAML, and Kerberos to ensure secure token exchange and session management across distributed systems."
                });
            }, 800);
        });
    }

    const prompt = `
You are an expert cybersecurity instructor. Create a structured teaching lesson for this concept:

Term: "${card.term}"
Definition: "${card.definition}"

Return a JSON object with this EXACT structure:
{
  "headline": "A catchy, one-sentence summary of what this is",
  "keyTerms": [
    {"term": "Related Term 1", "definition": "Short def"},
    {"term": "Related Term 2", "definition": "Short def"},
    {"term": "Related Term 3", "definition": "Short def"}
  ],
  "comparison": [ // OPTIONAL: Only if relevant (e.g. types of X), otherwise null
    {"type": "Type A", "description": "How it differs"},
    {"type": "Type B", "description": "How it differs"}
  ],
  "breakdown": [
    {"point": "Description", "description": "What it is physically/digitally"},
    {"point": "Mechanism", "description": "How it works step-by-step"},
    {"point": "Why it matters", "description": "The 'so what' factor"}
  ],
  "realWorldExamples": [
    "Example 1",
    "Example 2",
    "Example 3"
  ],
  "importance": "2-3 sentences on why a security pro needs to know this.",
  "eli5": "Explain Like I'm 5 version.",
  "detailed": "Advanced technical deep dive (protocols, standards, etc)."
}
`;

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey || '',
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20240620',
                max_tokens: 1000,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
        });

        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();
        let content = data.content?.[0]?.text;

        if (!content) throw new Error('Empty response from AI');

        // Simple cleanup if the model wraps json in markdown blocks
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(content);
    } catch (error) {
        console.error('Failed to generate teaching content:', error);
        // Fallback
        return {
            headline: `Understanding ${card.term}`,
            keyTerms: [],
            breakdown: [{ point: "Error", description: "Could not generate content. Please rely on the definition." }],
            realWorldExamples: [],
            importance: "Critical for understanding the subject matter.",
            eli5: "No simple explanation available.",
            detailed: "No detailed breakdown available."
        };
    }
}
