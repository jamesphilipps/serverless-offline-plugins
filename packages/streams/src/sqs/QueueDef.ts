import {SQSClient} from "@aws-sdk/client-sqs";

export type QueueSource = 'RESOURCES' | 'CONFIG'

export type QueueTargetType = 'LOCAL' | 'REMOTE'

export interface QueueDef {
    aliases: string[]
    create?: boolean
    delaySeconds?: number
    endpoint: string
    fifo: boolean
    handlerFunctions: string[]
    name: string
    resourceKey?: string
    source: QueueSource,
    targetType: QueueTargetType,
    url?: string
    visibilityTimeout?: number
}

export interface ActiveQueueDef extends QueueDef {
    sqsClient: SQSClient
    url: string
    arn: string
}