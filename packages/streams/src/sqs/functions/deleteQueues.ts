import {DeleteQueueCommand, ListQueuesCommand, SQSClient} from "@aws-sdk/client-sqs";
import {getLogger} from "../../logging";

//TODO: test

const deleteQueues = async (sqsClient: SQSClient) => {
    const existingQueues = await sqsClient.send(new ListQueuesCommand({}))
    const existingQueueCount = existingQueues.QueueUrls?.length || 0;
    if (existingQueueCount > 0) {
        getLogger().debug("Removing existing queues..")
        await Promise.all(
            existingQueues.QueueUrls.map((QueueUrl) => sqsClient.send(new DeleteQueueCommand({QueueUrl})))
        )
    }
}

export default deleteQueues