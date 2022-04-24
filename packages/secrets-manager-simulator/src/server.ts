import * as http from "http";
import {IncomingMessage, RequestListener, Server, ServerResponse} from "http";
import {logDebug} from "./logging";
import {StringKeyObject} from "./types";
import {Handler} from "./handlers/Handler";
import CreateSecret from "./handlers/CreateSecret";
import Context from "./Context";
import GetSecretValue from "./handlers/GetSecretValue";
import DeleteSecret from "./handlers/DeleteSecret";

const handlers: StringKeyObject<Handler> = {
    CreateSecret,
    GetSecretValue,
    DeleteSecret
}

export const createRequestListener = (context: Context) => (req: IncomingMessage, res: ServerResponse) => {
    const {url, method, headers} = req
    logDebug("SSMS: Received request", {url, method, headers})
    console.log("SSMS: Received request", {url, method, headers})

    const target = req.headers['x-amz-target'] as string
    try {
        if (url === '/') {
            if (!target) {
                console.error('No handler key (x-amz-target)')
                writeResponse(res, 400)
                return
            }

            const key = target.split('.')[1]
            const handler = handlers[key]
            if (!handler) {
                console.error("Handler not found")
                writeResponse(res, 500)
                return
            }

            handler(context)(req, res)
        } else if (url === '/list' && context.enableDebugEndpoint) {
            const secrets = context.secretStore.all()
            writeResponse(res, 200, JSON.stringify(secrets))
        } else {
            writeResponse(res, 404)
        }

    } catch (e) {
        console.error(e.message)
        writeResponse(res, 500)
        return
    }
}

export const createAndStartServer = (port: number, requestListener: RequestListener): Server => {
    const server = http.createServer(requestListener);
    server.listen(port);
    return server
}

export const writeResponse = (res: ServerResponse, statusCode: number, msg?: string) => {
    res.writeHead(statusCode);
    res.end(msg)
}

export const readRequestBody = async (req: IncomingMessage): Promise<string> => {
    const buffers = [];

    for await (const chunk of req) {
        buffers.push(chunk);
    }

    return Buffer.concat(buffers).toString();
}