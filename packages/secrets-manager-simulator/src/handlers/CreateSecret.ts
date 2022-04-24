import {IncomingMessage, ServerResponse} from "http";
import {Handler} from "./Handler";
import {readRequestBody, writeResponse} from "../server";
import Context from "../Context";
import {createSecret} from "../Secret";


const CreateSecret: Handler = (context: Context) => async (req: IncomingMessage, res: ServerResponse) => {
    const {Name, SecretString} = JSON.parse(await readRequestBody(req))
    if (!Name || !SecretString) {
        writeResponse(res, 400, "Missing Name or SecretString property")
    }

    const secret = createSecret(context.region, Name, SecretString)
    context.secretStore.add(Name, secret)

    const {ARN, VersionId} = secret
    const response = {ARN, Name, VersionId, ReplicationStatus: []}

    writeResponse(res, 200, JSON.stringify(response))
}

export default CreateSecret