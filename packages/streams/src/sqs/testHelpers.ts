import {ActiveQueueDef, QueueDef, QueueSource, QueueTargetType} from "./QueueDef";

interface QueueDefTestInput {
    aliases?: string[]
    create?: boolean
    delaySeconds?: number
    fifo?: boolean
    handlerFunctions?: string[]
    name: string
    queueUrl?: string
    resourceKey?: string
    source?: QueueSource,
    targetType?: QueueTargetType,
    visibilityTimeout?: number
}

export const queueDef = ({
                             aliases = [],
                             create = true,
                             delaySeconds,
                             fifo = false,
                             handlerFunctions = [],
                             name,
                             queueUrl,
                             resourceKey,
                             source = 'CONFIG',
                             targetType = 'LOCAL',
                             visibilityTimeout,
                         }: QueueDefTestInput): QueueDef => ({
    aliases,
    create,
    delaySeconds,
    fifo,
    handlerFunctions,
    name,
    queueUrl,
    resourceKey,
    source,
    targetType,
    visibilityTimeout,
})

interface ActiveQueueDefTestInput extends QueueDefTestInput {
    queueArn?: string
    queueUrl?: string
}

export const activeQueueDef = (input: ActiveQueueDefTestInput): ActiveQueueDef => ({
    ...queueDef(input),
    queueUrl: createQueueUrl(input.name),
    queueArn: createQueueArn(input.name),
})

interface ExistingQueueTestInput {
    name: string
    queueUrl?: string
    queueArn?: string
}

export const createQueueUrl = (name: string) => `http://www.example.com/${name}`
export const createQueueArn = (name: string) => `arn:aws:sqs:eu-west-1:444455556666:${name}`

export const existingQueue = ({name, queueUrl, queueArn}: ExistingQueueTestInput) => {
    const _queueUrl = queueUrl || createQueueUrl(name)
    const _queueArn = queueArn || createQueueArn(name)
    return {
        name,
        queueUrl: _queueUrl,
        queueArn: _queueArn
    }
}