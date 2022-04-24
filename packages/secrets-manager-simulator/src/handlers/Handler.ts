import {IncomingMessage, ServerResponse} from "http";
import Context from "../Context";

export type Handler = (context: Context) => (req: IncomingMessage, res: ServerResponse) => Promise<void>