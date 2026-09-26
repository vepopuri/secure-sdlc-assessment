// Vercel serverless function: the ONLY place in this project that holds an
// AI API key. The rest of the app is frontend-only by design (see
// README's Architecture section); this is the one deliberate exception,
// added specifically so the executive summary can be genuinely
// AI-drafted rather than templated. Never expose the key to the client;
// only a compact, pre-aggregated snapshot of real scoring data is sent to
// the model, never raw evidence files or the full observation set.

interface VercelRequest {
  method?: string;
  body?: unknown;
}

interface VercelResponse {
  status(code: number): VercelResponse;
  json(body: unknown): void;
}

interface GapSnapshot {
  framework: string;
  code: string;
  name: string;
  rating: number | null;
}

interface ReportSnapshot {
  frameworkNames: string[];
  totalControls: number;
  ratedControls: number;
  averageMaturity: number;
  topGaps: GapSnapshot[];
  reviewerContext?: string;
}

const MODEL = 'claude-sonnet-5';
const MAX_TOKENS = 700;
const MAX_GAPS = 15;
const MAX_CONTEXT_CHARS = 2000;

function isReportSnapshot(value: unknown): value is ReportSnapshot {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return Array.isArray(v.frameworkNames) && typeof v.totalControls === 'number' && typeof v.ratedControls === 'number';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(501).json({
      error:
        'AI generation is not configured for this deployment. Set the ANTHROPIC_API_KEY environment variable in your Vercel project settings, then redeploy.',
    });
    return;
  }

  if (!isReportSnapshot(req.body)) {
    res.status(400).json({ error: 'Malformed request body.' });
    return;
  }
  const snapshot = req.body;

  const gaps = snapshot.topGaps.slice(0, MAX_GAPS);
  const context = (snapshot.reviewerContext ?? '').slice(0, MAX_CONTEXT_CHARS);

  const prompt = `You are drafting the executive summary of a secure software development lifecycle (SSDLC) assessment report. Write in a clear, confident, professional consulting tone. Use only the facts given below. Never invent findings, statistics, or organization names that are not provided here. Do not use em dashes or hyphens as sentence punctuation; use periods or commas instead. Write 3 to 5 sentences, no heading, no preamble, just the paragraph.

Frameworks assessed: ${snapshot.frameworkNames.join(', ') || 'none'}
Total in scope controls: ${snapshot.totalControls}
Controls rated so far: ${snapshot.ratedControls}
Average maturity on a 0 to 3 scale: ${snapshot.averageMaturity}
Most significant gaps: ${
    gaps.length > 0
      ? gaps.map((g) => `${g.framework} ${g.code}: ${g.name} (${g.rating === null ? 'unrated' : `rated ${g.rating} of 3`})`).join('; ')
      : 'none identified'
  }
${context ? `Additional context from the reviewer: ${context}` : ''}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      res.status(502).json({ error: `The AI service returned an error (${response.status}). ${detail.slice(0, 300)}` });
      return;
    }

    const data = (await response.json()) as { content?: { type: string; text?: string }[] };
    const text = data.content?.find((block) => block.type === 'text')?.text?.trim();
    if (!text) {
      res.status(502).json({ error: 'The AI service returned an empty response.' });
      return;
    }

    res.status(200).json({ executiveSummary: text });
  } catch (err) {
    res.status(502).json({ error: `Could not reach the AI service: ${err instanceof Error ? err.message : 'unknown error'}` });
  }
}
