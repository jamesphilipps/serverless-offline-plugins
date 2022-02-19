import {log, logDebug} from "../logging";
import * as Serverless from "serverless";
import {default as Lambda} from 'serverless-offline/dist/lambda'
import {StreamHandler} from "../StreamHandler";
import SQSPoller from "./SQSPoller";
import {ListQueuesCommand, SQSClient} from "@aws-sdk/client-sqs";
import {getFunctionDefinitionsWithStreamsEvents} from "../StreamFunctionDefinitions";
import {getQueueDefinitionsFromResources} from "./utils";
import getQueuesToCreate from "./functions/getQueuesToCreate";
import setupQueues from "./functions/setupQueues";
import PluginConfiguration from "../PluginConfiguration";
import getFunctionQueueDefinitions from "./functions/getFunctionQueueDefinitions";
import {StringKeyObject} from "../utils";


export class SQStreamHandler implements StreamHandler {
    private slsOfflineLambda?: typeof Lambda
    private sqsClient: SQSClient
    private sqsPoller?: SQSPoller

    constructor(private serverless: Serverless, private options: StringKeyObject<any>, private config: PluginConfiguration) {
    }

    async start() {
        log(`Starting Offline SQS Streams: ${this.options.stage}/${this.options.region}..`)
        this.sqsClient = await this._createSQSClient()
        this.slsOfflineLambda = new Lambda(this.serverless, this.options)

        const resources = this.serverless.resources?.Resources

        const functionsWithSqsEvents = getFunctionDefinitionsWithStreamsEvents(this.serverless, 'SQS')

        const resourceQueueDefinitions = getQueueDefinitionsFromResources(this.serverless)
        logDebug("resourceQueueDefinitions", resourceQueueDefinitions)
        const functionQueueDefinitions = getFunctionQueueDefinitions(this.config, resources)(functionsWithSqsEvents)
        logDebug("functionQueueDefinitions", functionQueueDefinitions)

        const queuesToCreate = getQueuesToCreate(this.config)(resourceQueueDefinitions, functionQueueDefinitions)
        logDebug("queuesToCreate", queuesToCreate)
        const activeQueueDefinitions = await setupQueues(this.config, this.sqsClient)(queuesToCreate)
        logDebug("activeQueueDefinitions", activeQueueDefinitions)

        const queuesWithFunctionEventHandler = new Set(functionQueueDefinitions.map((queue) => queue.name))
        const queuesToPoll = activeQueueDefinitions.filter((queue) => queuesWithFunctionEventHandler.has(queue.name))
        logDebug("queuesToPoll", queuesToPoll)


        this.sqsPoller = new SQSPoller(this.options, this.config, queuesToPoll, this.sqsClient, this.slsOfflineLambda)
        this.sqsPoller.start()

        log(`Started Offline SQS Streams. `)
    }

    async shutdown() {
        log("Halting Offline SQS Streams..")

        const cleanupPromises = []

        if (this.slsOfflineLambda) {
            cleanupPromises.push(this.slsOfflineLambda.cleanup())
        }

        if (this.sqsPoller) {
            cleanupPromises.push(this.sqsPoller.stop())
        }

        return Promise.all(cleanupPromises)
    }

    async _createSQSClient(): Promise<SQSClient> {
        const endpoint = this.config?.sqs?.host;
        if (!endpoint) {
            throw Error("No endpoint specified for Offline SQS Streams")
        }

        const client = new SQSClient({region: this.options.region, endpoint});
        // Ping the queue to see if it is available
        try {
            await client.send(new ListQueuesCommand({}))
        } catch (e) {
            if (e.code?.trim()?.toUpperCase() === 'ECONNREFUSED') {
                throw Error(`An SQS API compatible queue is not available at '${endpoint}'. Did you forget to start your elasticmq instance?`)
            }
            throw e
        }
        return client
    }
}