import {QueueDef} from "../QueueDef";
import mergeQueueDefinitions from "./mergeQueueDefinitions";
import {SqsPluginConfiguration} from "../../PluginConfiguration";
import {StringKeyObject} from "../../utils";

//TODO: test

const getQueueDefinitionsFromConfig = (config: SqsPluginConfiguration): QueueDef[] => {
    const configQueues = config.queues || [];
    return configQueues.map((queue) => ({
        aliases: queue.aliases || [],
        delaySeconds: queue.delaySeconds,
        fifo: queue.name.trim().toLowerCase().endsWith(".fifo"),
        handlerFunctions: [],
        name: queue.name,
        queueUrl: queue.queueUrl,
        source: 'CONFIG',
        targetType: queue.queueUrl ? 'REMOTE' : 'LOCAL',
        visibilityTimeout: queue.visibilityTimeout,
    }))
}

export const getQueueDefinitionsFromResources = (resources: StringKeyObject<any>): QueueDef[] => {
    if (!resources) return []
    return Object.entries(resources)
        .filter(([_, v]) => v?.Type === 'AWS::SQS::Queue')
        .map(([resourceKey, v]) => ({
            aliases: [],
            delaySeconds: v?.Properties?.DelaySeconds,
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
    const resourcesQueues = getQueueDefinitionsFromResources(resources)
    const allQueues = configQueues.concat(resourcesQueues);
    return mergeQueueDefinitions(allQueues)
}

export default getDefinedQueues