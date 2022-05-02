import {DEFAULT_SQS_POLL_INTERVAL_MS} from "./constants";
import {StringKeyObject} from "./utils";

export interface ConfigurationQueueDef {
    name: string
    aliases?: string[]
    visibilityTimeout?: number
    delaySeconds?: number
}

export interface PluginConfiguration {
    dynamodb?: {
        // TODO: no config options for dynamodb streams
        enabled?: boolean
    }
    sqs?: {
        enabled?: boolean
        host?: string
        createQueuesFromResources?: boolean
        removeExistingQueuesOnStart?: boolean
        purgeExistingQueuesOnStart?: boolean
        errorOnMissingQueueDefinition?: boolean
        queues?: ConfigurationQueueDef[]

        pollConfig?: {
            strategy: 'fixed-interval' | 'backoff'
            drainQueues: boolean
            messageBatchSize: number

            // Fixed Interval Strategy
            fixedIntervalMs?: number

            // Backoff Strategy
            backoffType?: 'double' | 'step'
            //  Double Type
            minIntervalMs?: number
            maxIntervalMs?: number
            //  Step Type
            intervalStepMs?: number
        }
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
        errorOnMissingQueueDefinition: true,
        queues: [],
        pollConfig: {
            strategy: 'backoff',
            drainQueues: false,
            messageBatchSize: 10,
            backoffType: 'double',
            minIntervalMs: 100,
            maxIntervalMs: 5000
        }
    }
})

export const validateConfig = (config: PluginConfiguration): PluginConfiguration => {
    const {pollConfig} = config.sqs

    if (!new Set(['fixed-inteval', 'backoff']).has(pollConfig.strategy)) {
        throw Error(`Unknown polling strategy: '${pollConfig.strategy}`)
    }
    if (!new Set(['double', 'step']).has(pollConfig.backoffType)) {
        throw Error(`Unknown polling backoffType: '${pollConfig.backoffType}`)
    }

    return config
}

export default PluginConfiguration