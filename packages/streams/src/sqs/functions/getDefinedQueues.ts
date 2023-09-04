import {QueueDef} from "../QueueDef";
import mergeQueueDefinitions from "./mergeQueueDefinitions";
import {SqsPluginConfiguration} from "../../PluginConfiguration";
import {StringKeyObject} from "../../utils";

//TODO: test

const getQueueDefinitionsFromConfig = (config: SqsPluginConfiguration): QueueDef[] => {
    const getRemoteEndpoint = (queueUri: string) => {
        const endpointRegex = /(https?:\/\/sqs\.[^.]+\.amazonaws\.com).*/
        const match = queueUri.match(endpointRegex)
        if (!match) {
            throw Error(`Invalid remote endpoint for remote queue: '${queueUri}'. Remote endpoints should be in the form: "http(s)://sqs.REGION.amazonaws.com"`)
        }
        return match[1]
    }

    const configQueues = config.queues || [];

    return configQueues.map((queue) => ({
        aliases: queue.aliases || [],
        delaySeconds: queue.delaySeconds,
        endpoint: queue.remote?.queueUrl ? getRemoteEndpoint(queue.remote.queueUrl) : config.endpoint,
        fifo: queue.name.trim().toLowerCase().endsWith(".fifo"),
        handlerFunctions: [],
        name: queue.name,
        source: 'CONFIG',
        targetType: queue.remote?.queueUrl ? 'REMOTE' : 'LOCAL',
        url: queue.remote?.queueUrl,
        visibilityTimeout: queue.visibilityTimeout,
    }))
}

export const getQueueDefinitionsFromResources = (localEndpoint: string, resources: StringKeyObject<any>): QueueDef[] => {
    if (!resources) return []
    return Object.entries(resources)
        .filter(([_, v]) => v?.Type === 'AWS::SQS::Queue')
        .map(([resourceKey, v]) => ({
            aliases: [],
            delaySeconds: v?.Properties?.DelaySeconds,
            endpoint: localEndpoint,
            fifo: v?.Properties?.FifoQueue,
            handlerFunctions: [],
            name: v?.Properties?.QueueName,
            resourceKey,
            source: 'RESOURCES',
            targetType: 'LOCAL',
            visibilityTimeout: v?.Properties?.VisibilityTimeout,
        }))
}

const getDefinedQueues = (config: SqsPluginConfiguration, resources: StringKeyObject<any>): QueueDef[] => {
    const configQueues = getQueueDefinitionsFromConfig(config)
    const resourcesQueues = getQueueDefinitionsFromResources(config.endpoint, resources)
    const allQueues = configQueues.concat(resourcesQueues);
    return mergeQueueDefinitions(allQueues)
}

export default getDefinedQueues