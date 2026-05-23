import { createServer } from "http";
import app from "../server/app";

const handler = (req: any, res: any) => app(req, res);
export default handler;
