export type QueueSource = 'RESOURCES' | 'CONFIG'

export type QueueTargetType = 'LOCAL' | 'REMOTE'

export interface QueueDef {
    aliases: string[]
    create?: boolean
    delaySeconds?: number
    fifo: boolean
    handlerFunctions: string[]
    name: string
    queueUrl?: string
    resourceKey?: string
    source: QueueSource,
    targetType: QueueTargetType,
    visibilityTimeout?: number
}

export interface ActiveQueueDef extends QueueDef {
    queueUrl: string
    queueArn: string
}