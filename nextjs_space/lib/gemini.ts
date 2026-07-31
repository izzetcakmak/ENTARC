/**
 * Gemini analysis layer for the ENTARC agent (Build with Gemini XPRIZE).
 *
 * The agent's investment reasoning runs on Gemini when GOOGLE_API_KEY is set
 * (aistudio.google.com/apikey) and falls back to the legacy Abacus proxy so a
 * missing key degrades gracefully instead of breaking analysis.
 */

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
/** Same default the Circle google-adk starter kit ships with. */
const DEFAULT_MODEL = 'gemini-3-flash-preview';

export function geminiModel(): string {
  return process.env.LLM_MODEL || DEFAULT_MODEL;
}

export function hasGemini(): boolean {
  return Boolean(process.env.GOOGLE_API_KEY);
}

/**
 * Run a JSON-producing analysis prompt. Returns the raw model text (expected
 * to be a JSON document — Gemini is forced to JSON via responseMimeType).
 */
export async function generateAnalysis(system: string, prompt: string): Promise<string> {
  if (hasGemini()) {
    const model = geminiModel();
    const res = await fetch(`${GEMINI_ENDPOINT}/${model}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GOOGLE_API_KEY as string,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.4,
          maxOutputTokens: 1500,
        },
      }),
    });
    if (!res.ok) {
      throw new Error(`Gemini API error ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts
      ?.map((p: any) => p?.text ?? '')
      .join('');
    if (!text) throw new Error('Gemini returned no content');
    return text;
  }

  // Legacy fallback: Abacus OpenAI-compatible proxy.
  const res = await fetch('https://apps.abacus.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
      temperature: 0.4,
    }),
  });
  if (!res.ok) {
    throw new Error(`LLM API error ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('LLM returned no content');
  return text;
}
