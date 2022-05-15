import {StringKeyObject} from "../../utils";
import {QueueDef} from "../QueueDef";

//TODO: test
const getQueueDefinitionsFromResources = (resources: StringKeyObject<any>): QueueDef[] => {
    if (!resources) {
        return []
    }

    return Object.entries(resources)
        .filter(([_, v]) => v?.Type === 'AWS::SQS::Queue')
        .map(([resourceKey, v]) => ({
            resourceKey,
            name: v?.Properties?.QueueName,
            aliases: [],
            fifo: v?.Properties?.FifoQueue,
            visibilityTimeout: v?.Properties?.VisibilityTimeout,
            delaySeconds: v?.Properties?.DelaySeconds,
            handlerFunctions: []
        }))
}

export default getQueueDefinitionsFromResources