import {ActiveQueueDef} from "./QueueDef";
import {DeleteMessageBatchCommand, Message, ReceiveMessageCommand} from "@aws-sdk/client-sqs";
import {SqsPluginConfiguration} from "../PluginConfiguration";
import {StringKeyObject} from "../utils";
import {getLogger} from "../logging";

interface HandlerInvocationResult {
    successMessageIds: Set<string>
    successMessages: Message[]
    failedMessageIds: Set<string>
    failedMessages: Message[]
}

interface SqsHandlerResponse {
    batchItemFailures: { itemIdentifier: string } []
}

interface SqsRecord {
    messageId: string
    receiptHandle: string
    body: string
    attributes: object
    messageAttributes: object
    md5OfBody: string
    eventSource: "aws:sqs",
    eventSourceARN: string
    awsRegion: string
}

interface SqsEvent {
    Records: SqsRecord[]
}

interface MessageProcessResult {
    retrievedMessageCount: number
    successMessageCount: number
    failedMessageCount: number
}

export default class SQSPoller {
    private pollInterval: number
    private nextPoll: NodeJS.Timeout | undefined

    constructor(private options: StringKeyObject<any>, private config: SqsPluginConfiguration, private queueDefinitions: ActiveQueueDef[], private lambda: any) {
        this.pollInterval = config.pollConfig?.minIntervalMs!


    }

    start() {
        this._clearNextPoll()
        this._scheduleNextPoll(false)
    }

    async stop() {
        this._clearNextPoll()
    }

    private _clearNextPoll() {
        if (this.nextPoll) clearTimeout(this.nextPoll)
    }

    private _scheduleNextPoll(messagesRetrievedOnLastPoll: boolean) {
        const getNextPollInterval = (): number => {
            const {pollConfig} = this.config
            const {strategy, fixedIntervalMs, minIntervalMs, maxIntervalMs, backoffType, intervalStepMs} = pollConfig!

            if (strategy === 'backoff') {
                if (!this.pollInterval || messagesRetrievedOnLastPoll) {
                    return minIntervalMs!
                }
                if (backoffType === 'double') {
                    return Math.min(maxIntervalMs!, this.pollInterval * 2)
                }
                return Math.min(maxIntervalMs!, this.pollInterval + intervalStepMs!)
            }
            return fixedIntervalMs!
        }

        this.pollInterval = getNextPollInterval()
        this.nextPoll = setTimeout(this._poll.bind(this), this.pollInterval)
        getLogger().debug("Next poll interval: " + this.pollInterval)
    }

    private async _poll() {
        getLogger().debug("Polling SQS queues..")
        const processResults = await Promise.all(
            this.queueDefinitions.map(async (queue) => this._processMessages(queue))
        )

        const retrievedMessageCount = processResults
            .map(r => r.retrievedMessageCount)
            .reduce((acc, v) => acc + v, 0)

        getLogger().debug("Finished polling SQS queues")

        this._scheduleNextPoll(retrievedMessageCount > 0)
    }

    private async _processMessages(queue: ActiveQueueDef): Promise<MessageProcessResult> {
        const {pollConfig} = this.config
        const noMessagesResult = {retrievedMessageCount: 0, successMessageCount: 0, failedMessageCount: 0}

        const processInternal = async (): Promise<MessageProcessResult> => {
            const response = await queue.sqsClient.send(new ReceiveMessageCommand({
                QueueUrl: queue.url,
                MaxNumberOfMessages: 10
            }))
            getLogger().debug(JSON.stringify(response))

            const messages = response.Messages;
            const messageCount = messages?.length || 0;
            if (messageCount > 0) {
                getLogger().debug(`Retrieved ${messageCount} messages for '${queue.name}`)
                const invocationResult = await this._invokeHandlersForQueue(queue, messages || [])
                const {successMessages, successMessageIds, failedMessages, failedMessageIds} = invocationResult

                if (successMessages.length > 0) {
                    getLogger().debug(`Successfully handled message Ids: ${setToString(successMessageIds)}`)
                    getLogger().debug(`Removing successfully handled messages from queue..`)
                    await queue.sqsClient.send(new DeleteMessageBatchCommand({
                        QueueUrl: queue.url,
                        Entries: successMessages.map(m => ({Id: m.MessageId, ReceiptHandle: m.ReceiptHandle}))
                    }))
                }
                if (failedMessages.length > 0) {
                    getLogger().debug(`Failed to handle message Ids: ${setToString(failedMessageIds)}`)
                }

                const results = pollConfig?.drainQueues ? await processInternal() : noMessagesResult
                return {
                    retrievedMessageCount: (messages?.length || 0) + results.retrievedMessageCount,
                    successMessageCount: successMessages.length + results.successMessageCount,
                    failedMessageCount: failedMessages.length + results.failedMessageCount
                }
            } else {
                return noMessagesResult
            }
        }

        const results = await processInternal()
        if (results.retrievedMessageCount === 0) {
            getLogger().debug(`No messages for '${queue.name}`)
        }
        return results
    }

    private async _invokeHandlersForQueue(queue: ActiveQueueDef, messages: Message[]): Promise<HandlerInvocationResult> {
        const invokeHandler = (handlerName: string, event: SqsEvent): SqsHandlerResponse => {
            getLogger().debug(`Invoking handler: '${handlerName}'`)
            const lambdaFunction = this.lambda.get(handlerName)
            lambdaFunction.setEvent(event)
            return lambdaFunction.runHandler()
        }

        const event: SqsEvent = {
            Records: messages.map(m => ({
                messageId: m.MessageId,
                receiptHandle: m.ReceiptHandle,
                body: m.Body,
                attributes: m.Attributes,
                messageAttributes: m.MessageAttributes,
                md5OfBody: m.MD5OfBody,
                eventSource: "aws:sqs",
                eventSourceARN: queue.arn,
                awsRegion: this.options?.['region']!
            }) as SqsRecord)
        }
        getLogger().debug("Using event: " + event)

        const handlerResults = await Promise.all(
            queue.handlerFunctions.map((handlerName) => invokeHandler(handlerName, event))
        )

        const failedMessageIds = new Set(
            handlerResults.map(r =>
                (r?.batchItemFailures || []).map(f => f.itemIdentifier)
            ).flat()
        )
        const failedMessages = messages.filter(m => failedMessageIds.has(m.MessageId!))
        const successMessages = messages.filter(m => !failedMessageIds.has(m.MessageId!))
        const successMessageIds = new Set(successMessages.map(v => v.MessageId!))

        return {failedMessageIds, failedMessages, successMessageIds, successMessages}
    }
}

const setToString = <T>(s: Set<T>) => `[${Array.from(s).join(', ')}]`
