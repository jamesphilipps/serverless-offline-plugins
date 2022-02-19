import {DEFAULT_SQS_POLL_INTERVAL_MS} from "./constants";
import {StringKeyObject} from "./utils";

interface PluginConfiguration {
    dynamodb?: {
        enabled?: boolean
    }
    sqs?: {
        enabled?: boolean
        host?: string
        createQueuesFromResources?: boolean
        removeExistingQueuesOnStart?: boolean
        purgeExistingQueuesOnStart?: boolean
        pollInterval: number
        queueNames: StringKeyObject<string>
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
        queueNames: {}
    }
})

export default PluginConfiguration