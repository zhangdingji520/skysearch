import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../server/app.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  app(req as Parameters<typeof app>[0], res as Parameters<typeof app>[1]);
}
