export interface QueueDef {
    resourceKey?: string
    name: string
    fifo: boolean
    visibilityTimeout?: number
    delaySeconds?: number
    handlerFunctions: string[]
}

export interface ActiveQueueDef extends QueueDef {
    queueUrl: string
    queueArn: string
}