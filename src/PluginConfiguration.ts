import {DEFAULT_SQS_POLL_INTERVAL_MS} from "./constants";
import {StringKeyObject} from "./utils";

export interface AdditionalQueue {
    name: string
}

export  interface PluginConfiguration {
    dynamodb?: {
        enabled?: boolean
    }
    sqs?: {
        enabled?: boolean
        host?: string
        createQueuesFromResources?: boolean
        removeExistingQueuesOnStart?: boolean
        purgeExistingQueuesOnStart?: boolean
        queueNames?: StringKeyObject<string>
        additionalQueues?: AdditionalQueue[]
        pollInterval?: number
    }
}

export const getDefaultPluginConfiguration = (): PluginConfiguration => ({
    dynamodb: {
        enabled: false
    },
    sqs: {
        enabled: false,
        createQueuesFromResources: true,
        removeExistingQueuesOnStart: true,
        purgeExistingQueuesOnStart: false,
        pollInterval: DEFAULT_SQS_POLL_INTERVAL_MS,
        queueNames: {},
        additionalQueues: []
    }
})

export default PluginConfiguration