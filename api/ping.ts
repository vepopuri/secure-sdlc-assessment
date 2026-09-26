interface VercelRequest {
  method?: string;
}

interface VercelResponse {
  status(code: number): VercelResponse;
  json(body: unknown): void;
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ debug: 'top-level-ping' });
}
