import {ActiveQueueDef, QueueDef, QueueSource, QueueTargetType} from "./QueueDef";
import {SQSClient} from "@aws-sdk/client-sqs";

interface QueueDefTestInput {
    aliases?: string[]
    create?: boolean
    delaySeconds?: number
    endpoint?: string
    fifo?: boolean
    handlerFunctions?: string[]
    name: string
    resourceKey?: string
    source?: QueueSource
    targetType?: QueueTargetType
    url?: string
    visibilityTimeout?: number
}

export const queueDef = ({
                             aliases = [],
                             create = true,
                             delaySeconds,
                             endpoint = TEST_ENDPOINT,
                             fifo = false,
                             handlerFunctions = [],
                             name,
                             resourceKey,
                             source = 'CONFIG',
                             targetType = 'LOCAL',
                             url,
                             visibilityTimeout,
                         }: QueueDefTestInput): QueueDef => ({
    aliases,
    create,
    delaySeconds,
    endpoint,
    fifo,
    handlerFunctions,
    name,
    resourceKey,
    source,
    targetType,
    url,
    visibilityTimeout,
})

interface ActiveQueueDefTestInput extends QueueDefTestInput {
    queueArn?: string
    queueUrl?: string
}

export const activeQueueDef = (sqsClient: SQSClient, input: ActiveQueueDefTestInput): ActiveQueueDef => ({
    sqsClient,
    ...queueDef(input),
    url: createQueueUrl(input.name),
    arn: createQueueArn(input.name),
})

interface ExistingQueueTestInput {
    name: string
    url?: string
    arn?: string
}

export const TEST_ENDPOINT = 'http://www.example.com/'

export const createQueueUrl = (name: string) => `${TEST_ENDPOINT}/${name}`
export const createQueueArn = (name: string) => `arn:aws:sqs:eu-west-1:444455556666:${name}`

export const existingQueue = ({name, url, arn}: ExistingQueueTestInput) => ({
    name,
    url: url || createQueueUrl(name),
    arn: arn || createQueueArn(name)
})