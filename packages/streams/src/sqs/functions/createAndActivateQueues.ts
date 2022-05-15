import {ActiveQueueDef, QueueDef} from "../QueueDef";
import {CreateQueueCommand, GetQueueAttributesCommand, ListQueuesCommand, SQSClient} from "@aws-sdk/client-sqs";
import {SqsPluginConfiguration} from "../../PluginConfiguration";
import {getQueueNameFromArnString} from "../utils";
import {mapBy} from "../../utils";

export interface ExistingQueueDetails {
    name: string,
    queueUrl: string,
    queueArn: string
}


export const getQueueDetails = async (sqsClient: SQSClient, QueueUrl: string): Promise<ExistingQueueDetails> => {
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

export const getExistingQueues = async (sqsClient: SQSClient): Promise<ExistingQueueDetails[]> => {
    const existingQueues = await sqsClient.send(new ListQueuesCommand({}))
    return await Promise.all(
        (existingQueues?.QueueUrls || []).map(async (QueueUrl) => await getQueueDetails(sqsClient, QueueUrl))
    )
}

export const createQueues = async (sqsClient: SQSClient, queueDefinitions: QueueDef[]): Promise<ActiveQueueDef[]> => {
    return Promise.all(
        queueDefinitions.map(async (queue) => {
            // TODO: support RedrivePolicy
            const createResult = await sqsClient.send(new CreateQueueCommand({
                QueueName: queue.name,
                Attributes: {
                    VisibilityTimeout: queue.visibilityTimeout?.toString(),
                    DelaySeconds: queue.delaySeconds?.toString(),
                    FifoQueue: queue.fifo || false as any
                }
            }))
            const details = await getQueueDetails(sqsClient, createResult.QueueUrl)
            return {...queue, ...details}
        })
    )
}

export const createAndActivateQueues = async (config: SqsPluginConfiguration, sqsClient: SQSClient, definedQueues: QueueDef[]): Promise<ActiveQueueDef[]> => {
    const queuesToActivate = definedQueues
        .filter(queue => config.createQueuesFromResources || queue.source !== 'RESOURCES') // Filter resource queues if flag set

    // Get all queues that currently exist in the MQ instance
    const existingQueues = await getExistingQueues(sqsClient)
    const existingQueueNames = new Set(existingQueues.map(queue => queue.name))

    // Create any queues which are defined but do not currently exist
    const queuesToCreate = config.createQueuesFromResources ?
        queuesToActivate
            .filter((queue) => !existingQueueNames.has(queue.name)) // Doesn't exist
            .filter((queue) => queue.create!==false) : // Not excluded from creation
        []

    const createdActiveQueues = await createQueues(sqsClient, queuesToCreate)
    const createdQueueNames = new Set(createdActiveQueues.map(queue => queue.name))

    // Create active queue definitions for any queues which are defined and already existed
    const queuesToActivateByName = mapBy(queuesToActivate, v => v.name)
    const existingActiveQueues = existingQueues
        .filter(queue => !!queuesToActivateByName[queue.name]) // Queue is defined
        .filter(queue => !createdQueueNames.has(queue.name)) // Queue was not just created
        .map(queue => ({
            ...queuesToActivateByName[queue.name], // Full Queue Definition
            ...queue // Queue ARN and URL
        }))

    return createdActiveQueues.concat(existingActiveQueues)
}

export default createAndActivateQueues