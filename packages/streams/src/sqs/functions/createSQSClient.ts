import {ListQueuesCommand, SQSClient} from "@aws-sdk/client-sqs";

export type CreateSQSClientFunc = (region: string, endpoint: string) => Promise<SQSClient>

const createSQSClient: CreateSQSClientFunc = async (region: string, endpoint: string): Promise<SQSClient> => {
    if (!endpoint) {
        throw Error("No endpoint specified when creating SQS client")
    }

    const client = new SQSClient({region, endpoint});
    // Ping the queue to see if it is available
    try {
        await client.send(new ListQueuesCommand({}))
    } catch (e: any) {
        if (e.code?.trim()?.toUpperCase() === 'ECONNREFUSED') {
            throw Error(`An SQS API compatible queue is not available at '${endpoint}'. If this is a local queue, did you forget to start your elasticmq instance?`)
        }
        throw e
    }
    return client
};

export default createSQSClient