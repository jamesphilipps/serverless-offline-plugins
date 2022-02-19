import {ActiveQueueDef} from "./QueueDef";
import {DEFAULT_SQS_POLL_INTERVAL_MS} from "../constants";
import {log, logDebug} from "../logging";
import {ReceiveMessageCommand, SQSClient} from "@aws-sdk/client-sqs";
import PluginConfiguration from "../PluginConfiguration";
import {StringKeyObject} from "../utils";

export default class SQSPoller {
    pollInterval?: NodeJS.Timer

    constructor(private options: StringKeyObject<any>, private config: PluginConfiguration, private queueDefinitions: ActiveQueueDef[], private sqsClient: SQSClient, private lambda: any) {
    }

    start() {
        this.pollInterval = setInterval(this._poll.bind(this), DEFAULT_SQS_POLL_INTERVAL_MS)
    }

    async stop() {
        clearInterval(this.pollInterval)
    }

    private async _poll() {
        const processMessages = async (queue: ActiveQueueDef) => {
            const activeHandlers: Promise<void>[] = []
            let messageCount: number = 0
            do {
                const response = await this.sqsClient.send(new ReceiveMessageCommand({
                    QueueUrl: queue.queueUrl,
                }))

                let messageCount = response.Messages?.length || 0;
                if (messageCount > 0) {
                    log(`Retrieved ${messageCount} messages for '${queue.name}`)

                    const event = {
                        Records: response.Messages.map((message) => ({
                            messageId: message.MessageId,
                            "receiptHandle": message.ReceiptHandle,
                            "body": message.Body,
                            "attributes": message.Attributes,
                            "messageAttributes": message.MessageAttributes,
                            "md5OfBody": message.MD5OfBody,
                            "eventSource": "aws:sqs",
                            "eventSourceARN": queue.queueArn,
                            "awsRegion": this.options.region
                        }))
                    }

                    const lambdaFunction = this.lambda.get(queue.handlerFunctions)
                    lambdaFunction.setEvent(event)

                    // Run handler and return on completion
                    activeHandlers.push(lambdaFunction.runHandler())
                } else {
                    logDebug(`No messages for '${queue.name}`)
                }
            } while (messageCount > 0)

            return Promise.all(activeHandlers)
        }

        logDebug("Polling SQS queues..")
        for (const queue of this.queueDefinitions) {
            logDebug(`Polling SQS queue: '${queue.name}'`)
            await processMessages(queue)
        }

        logDebug("Finished polling SQS queues")
    }
}

