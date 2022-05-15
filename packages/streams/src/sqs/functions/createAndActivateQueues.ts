import {ActiveQueueDef, QueueDef, QueueTargetType} from "../QueueDef";
import {CreateQueueCommand, GetQueueAttributesCommand, ListQueuesCommand, SQSClient} from "@aws-sdk/client-sqs";
import {SqsPluginConfiguration} from "../../PluginConfiguration";
import {getQueueNameFromArnString} from "../utils";
import {mapBy} from "../../utils";
import {CreateSQSClientFunc} from "./createSQSClient";

export interface ExistingQueueDetails {
    name: string,
    url: string,
    arn: string
}


const getQueueDetails = async (sqsClient: SQSClient, QueueUrl: string): Promise<ExistingQueueDetails> => {
    const response = await sqsClient.send(new GetQueueAttributesCommand({
        QueueUrl,
        AttributeNames: ['QueueArn']
    }))
    return {
        name: getQueueNameFromArnString(response.Attributes.QueueArn),
        url: QueueUrl,
        arn: response.Attributes.QueueArn
    }
}

const getExistingQueues = async (sqsClient: SQSClient): Promise<ExistingQueueDetails[]> => {
    const existingQueues = await sqsClient.send(new ListQueuesCommand({}))
    return await Promise.all(
        (existingQueues?.QueueUrls || []).map(async (QueueUrl) => await getQueueDetails(sqsClient, QueueUrl))
    )
}

const createQueues = async (sqsClient: SQSClient, queueDefinitions: QueueDef[]): Promise<ActiveQueueDef[]> => {
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
            return {...queue, ...details, sqsClient}
        })
    )
}

const createAndActivateLocalQueues = async (config: SqsPluginConfiguration, sqsClient: SQSClient, definedQueues: QueueDef[]): Promise<ActiveQueueDef[]> => {
    const queuesToActivate = definedQueues
        .filter(queue => config.localQueueManagement.createFromResources || queue.source !== 'RESOURCES') // Filter resource queues if flag set

    // Get all queues that currently exist in the MQ instance
    const existingQueues = await getExistingQueues(sqsClient)
    const existingQueueNames = new Set(existingQueues.map(queue => queue.name))

    // Create any queues which are defined but do not currently exist
    const queuesToCreate = config.localQueueManagement.createFromResources ?
        queuesToActivate
            .filter((queue) => !existingQueueNames.has(queue.name)) // Doesn't exist
            .filter((queue) => queue.create !== false) : // Not excluded from creation
        []

    const createdActiveQueues = await createQueues(sqsClient, queuesToCreate)
    const createdQueueNames = new Set(createdActiveQueues.map(queue => queue.name))

    // Create active queue definitions for any queues which are defined and already existed
    const queuesToActivateByName = mapBy(queuesToActivate, v => v.name)
    const existingActiveQueues = existingQueues
        .filter(queue => !!queuesToActivateByName[queue.name]) // Queue is defined
        .filter(queue => !createdQueueNames.has(queue.name)) // Queue was not just created
        .map(queue => ({
            sqsClient,
            ...queuesToActivateByName[queue.name], // Full Queue Definition
            ...queue // Queue ARN and URI
        }))

    return createdActiveQueues.concat(existingActiveQueues)
}

const activateRemoteQueues = async (createSQSClient: CreateSQSClientFunc, config: SqsPluginConfiguration, definedQueues: QueueDef[]): Promise<ActiveQueueDef[]> => {
    const queuesToActivate = definedQueues

    // Create active queue definitions for any queues which are defined and already existed
    const endpointRegex = /https?:\/\/sqs\.([^.]+)\.amazonaws\.com/
    return await Promise.all(
        queuesToActivate
            .map(async (queue) => {
                const endpointMatch = queue.endpoint.match(endpointRegex)
                if (!endpointMatch) {
                    throw Error(`Invalid remote endpoint for remote queue: '${queue.endpoint}'. Remote endpoints should be in the form: "http(s)://sqs.REGION.amazonaws.com"`)
                }
                const sqsClient = await createSQSClient(endpointMatch[1], queue.endpoint)
                const queueDetails = await getQueueDetails(sqsClient, queue.url)

                return {
                    sqsClient,
                    ...queue, // Full Queue Definition
                    url: queueDetails.url,
                    arn: queueDetails.arn,
                };
            })
    )
}
export const createAndActivateQueues = async (createSQSClient: CreateSQSClientFunc, config: SqsPluginConfiguration, sqsClient: SQSClient, definedQueues: QueueDef[]): Promise<ActiveQueueDef[]> => {
    const queuesWithTarget = (targetType: QueueTargetType) => definedQueues.filter(v => v.targetType === targetType)

    const activeLocalQueues = await createAndActivateLocalQueues(config, sqsClient, queuesWithTarget('LOCAL'))
    const activeRemoteQueues = await activateRemoteQueues(createSQSClient, config, queuesWithTarget('REMOTE'))
    return activeLocalQueues.concat(activeRemoteQueues)
}

export default createAndActivateQueues