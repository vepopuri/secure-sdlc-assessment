export default async function handler(req: any, res: any) {
  res.status(200).json({ debug: 'absolute-zero-imports', action: req.query?.action });
}
