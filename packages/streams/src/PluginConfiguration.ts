export interface ConfigurationQueueDef {
    name: string
    aliases?: string[]
    visibilityTimeout?: number
    delaySeconds?: number
    remote?: {
        queueUrl: string
    }
}

export interface DynamoPluginConfiguration {
    // TODO: no config options for dynamodb streams
    enabled?: boolean
}

export interface SqsPluginConfiguration {
    enabled?: boolean
    endpoint?: string

    localQueueManagement?: {
        createFromResources?: boolean
        removeOnStart?: boolean
        purgeOnStart?: boolean
    }

    // TODO: purge remote queues
    // remoteQueueManagement?: {
    //     purgeOnStart?: boolean
    // }

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

export interface PluginConfiguration {
    dynamodb?: DynamoPluginConfiguration
    sqs?: SqsPluginConfiguration
}

export const getDefaultPluginConfiguration = (): PluginConfiguration => ({
    dynamodb: {
        enabled: false
    },
    sqs: {
        enabled: false,
        localQueueManagement: {
            createFromResources: true,
            removeOnStart: true,
            purgeOnStart: false,
        },

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

export const validateConfig = (config: PluginConfiguration): Required<PluginConfiguration> => {
    if (!config.dynamodb || !config.sqs) throw Error("Expected config field not set: dynamodb")
    if (!config.sqs) throw Error("Expected config field not set: sqs")

    const {pollConfig} = config.sqs

    if (!new Set(['fixed-inteval', 'backoff']).has(pollConfig?.strategy!)) {
        throw Error(`Unknown polling strategy: '${pollConfig?.strategy}`)
    }
    if (!new Set(['double', 'step']).has(pollConfig?.backoffType!)) {
        throw Error(`Unknown polling backoffType: '${pollConfig?.backoffType!}`)
    }


    return config as Required<PluginConfiguration>
}

export default PluginConfiguration