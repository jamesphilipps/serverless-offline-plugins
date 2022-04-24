import {IncomingMessage, ServerResponse} from "http";
import {Handler} from "./Handler";
import {readRequestBody, writeResponse} from "../server";
import Context from "../Context";
import {logDebug} from "../logging";


const DeleteSecret: Handler = (context: Context) => async (req: IncomingMessage, res: ServerResponse) => {
    const {SecretId} = JSON.parse(await readRequestBody(req))
    if (!SecretId) {
        writeResponse(res, 400, "Missing SecretId")
    }

    const secret = context.secretStore.delete(SecretId)
    // TODO: delete
    if (secret) {
        const {ARN, Name} = secret
        const response = {ARN, Name, DeletionDate: new Date().getTime(),}
        writeResponse(res, 200, JSON.stringify(response))
    } else {
        logDebug(`No secret found with id: ${SecretId}`)
        writeResponse(res, 400)
    }
}

export default DeleteSecret