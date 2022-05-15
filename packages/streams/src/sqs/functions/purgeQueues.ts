import {ListQueuesCommand, PurgeQueueCommand, SQSClient} from "@aws-sdk/client-sqs";
import {logDebug} from "../../logging";

//TODO: test

export const purgeQueues = async (sqsClient: SQSClient) => {
    const existingQueues = await sqsClient.send(new ListQueuesCommand({}))
    const existingQueueCount = existingQueues.QueueUrls?.length || 0;
    if (existingQueueCount > 0) {
        logDebug("Purging existing queues..")
        await Promise.all(
            existingQueues.QueueUrls.map((QueueUrl) => sqsClient.send(new PurgeQueueCommand({QueueUrl})))
        )
    }
}

export default purgeQueues