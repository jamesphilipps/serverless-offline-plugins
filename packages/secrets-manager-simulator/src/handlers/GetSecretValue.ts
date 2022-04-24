import {IncomingMessage, ServerResponse} from "http";
import {Handler} from "./Handler";
import {readRequestBody, writeResponse} from "../server";
import Context from "../Context";
import {logDebug} from "../logging";


const GetSecretValue: Handler = (context: Context) => async (req: IncomingMessage, res: ServerResponse) => {
    const {SecretId} = JSON.parse(await readRequestBody(req))
    if (!SecretId) {
        writeResponse(res, 400, "Missing SecretId")
    }

    const secret = context.secretStore.get(SecretId)
    if (secret) {
        const {ARN, CreatedDate, Name, SecretBinary, SecretString, VersionId, VersionStages} = secret
        const response = {ARN, CreatedDate, Name, SecretBinary, SecretString, VersionId, VersionStages}
        writeResponse(res, 200, JSON.stringify(response))
    } else {
        logDebug(`No secret found with id: ${SecretId}`)
        writeResponse(res, 400)
    }
}

export default GetSecretValue