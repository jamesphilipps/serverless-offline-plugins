import {SLS_CUSTOM_OPTION} from "../constants";
import {QueueDef} from "./QueueDef";
import PluginConfiguration from "../PluginConfiguration";
import {extractResourceNameFromArn, StringKeyObject} from "../utils";


export const getQueueNameFromArnString = (arn: string) => getQueueNameFromArnParts(arn.split(":"))
export const getQueueNameFromArnParts = (parts: string[]) => parts[5]
export const getQueueNameFromArn = (config: PluginConfiguration, resources: StringKeyObject<any>) => (arn: any) => {
    return extractResourceNameFromArn(
        getQueueNameFromArnParts,
        (key) => getQueueDefinitionsFromResources(resources)
            .filter(queue => queue.resourceKey === key)
            .map(queue => queue.name)
            .find(_ => true),
        `custom.${SLS_CUSTOM_OPTION}.sqs.queueNames.${arn}`,
        (key) => config.sqs?.queueNames?.[arn]
    )(arn)
}

export const getQueueDefinitionsFromResources = (resources: StringKeyObject<any>): QueueDef[] => {
    if (!resources) {
        return []
    }

    return Object.entries(resources)
        .filter(([_, v]) => v?.Type === 'AWS::SQS::Queue')
        .map(([resourceKey, v]) => ({
            resourceKey,
            name: v?.Properties?.QueueName,
            fifo: v?.Properties?.FifoQueue,
            visibilityTimeout: v?.Properties?.VisibilityTimeout,
            delaySeconds: v?.Properties?.DelaySeconds,
            handlerFunctions: []
        }))
}