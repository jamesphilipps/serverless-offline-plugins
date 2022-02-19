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
    }
}