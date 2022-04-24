import {ActiveQueueDef, QueueDef} from "../QueueDef";
import {
    CreateQueueCommand,
    DeleteQueueCommand,
    GetQueueAttributesCommand,
    ListQueuesCommand,
    PurgeQueueCommand,
    SQSClient
} from "@aws-sdk/client-sqs";
import {logDebug} from "../../logging";
import PluginConfiguration from "../../PluginConfiguration";
import {getQueueNameFromArnString} from "../utils";
import {StringKeyObject} from "../../utils";

interface ExistingQueueDetails {
    name: string,
    queueUrl: string,
    queueArn: string
}

export const deleteOrPurgeQueuesIfRequired = async (sqsClient: SQSClient, removeExistingQueuesOnStart: boolean, purgeExistingQueuesOnStart: boolean) => {
    if (!removeExistingQueuesOnStart && !purgeExistingQueuesOnStart) {
        return
    }

    const existingQueues = await sqsClient.send(new ListQueuesCommand({}))
    const existingQueueCount = existingQueues.QueueUrls?.length || 0;
    if (removeExistingQueuesOnStart && existingQueueCount > 0) {
        logDebug("Removing existing queues..")
        await Promise.all(
            existingQueues.QueueUrls.map((QueueUrl) => sqsClient.send(new DeleteQueueCommand({QueueUrl})))
        )
    } else if (purgeExistingQueuesOnStart && existingQueueCount > 0) {
        logDebug("Purging existing queues..")
        await Promise.all(
            existingQueues.QueueUrls.map((QueueUrl) => sqsClient.send(new PurgeQueueCommand({QueueUrl})))
        )
    }
}

export const getSingleQueueDetails = async (sqsClient: SQSClient, QueueUrl: string): Promise<ExistingQueueDetails> => {
    const response = await sqsClient.send(new GetQueueAttributesCommand({
        QueueUrl,
        AttributeNames: ['QueueArn']
    }))
    return {
        name: getQueueNameFromArnString(response.Attributes.QueueArn),
        queueUrl: QueueUrl,
        queueArn: response.Attributes.QueueArn
    }
}

export const getAllExistingQueuesDetails = async (sqsClient: SQSClient) => {
    const existingQueues = await sqsClient.send(new ListQueuesCommand({}))
    return Object.fromEntries(await Promise.all(
        (existingQueues?.QueueUrls || []).map(async (QueueUrl) => {
            const details = await getSingleQueueDetails(sqsClient, QueueUrl)
            return [details.name, details] as [string, ExistingQueueDetails]
        })
    ))
}

export const getQueuesToCreate = async (queueDefinitions: QueueDef[], existingQueues: StringKeyObject<ExistingQueueDetails>): Promise<QueueDef[]> => {
    const existingQueueNames = new Set(Object.keys(existingQueues))
    if (existingQueueNames.size === 0) {
        return queueDefinitions
    }
    return queueDefinitions.filter((queue) => !existingQueueNames.has(queue.name))
}

export const createQueues = async (sqsClient: SQSClient, queueDefinitions: QueueDef[]): Promise<ActiveQueueDef[]> => {
    return Promise.all(
        queueDefinitions.map(async (queue) => {
            // TODO: support RedrivePolicy
            const createResult = await sqsClient.send(new CreateQueueCommand({
                QueueName: queue.name,
                Attributes: {
                    VisibilityTimeout: queue.visibilityTimeout?.toString(),
                    DelaySeconds: queue.delaySeconds?.toString()
                }
            }))
            const details = await getSingleQueueDetails(sqsClient, createResult.QueueUrl)
            return {...queue, ...details}
        })
    )
}

const getActiveQueueDefs = (queueDefinitions: QueueDef[], existingQueues: StringKeyObject<ExistingQueueDetails>): ActiveQueueDef[] => {
    const queueDefMap = Object.fromEntries(
        queueDefinitions.map((queue) => [queue.name, queue] as [string, QueueDef])
    )
    return Object.entries(existingQueues)
        .map(([queueName, existingQueue]) => {
            const queueDef = queueDefMap[queueName]
            if (queueDef) {
                return {...queueDef, ...existingQueue} as ActiveQueueDef
            }
        })
        .filter(v => !!v)
}

export const setupQueues = (config: PluginConfiguration, sqsClient: SQSClient) => async (queueDefinitions: QueueDef[]): Promise<ActiveQueueDef[]> => {
    const {removeExistingQueuesOnStart, purgeExistingQueuesOnStart} = config.sqs

    await deleteOrPurgeQueuesIfRequired(sqsClient, removeExistingQueuesOnStart, purgeExistingQueuesOnStart)
    const existingQueues: StringKeyObject<ExistingQueueDetails> = await getAllExistingQueuesDetails(sqsClient)
    const queuesToCreate = await getQueuesToCreate(queueDefinitions, existingQueues);
    const createdQueues = await createQueues(sqsClient, queuesToCreate)

    return getActiveQueueDefs(queueDefinitions, existingQueues).concat(createdQueues)
}

export default setupQueues