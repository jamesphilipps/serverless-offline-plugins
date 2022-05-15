import {log, logDebug} from "../logging";
import * as Serverless from "serverless";
import {default as Lambda} from 'serverless-offline/dist/lambda'
import {StreamHandler} from "../StreamHandler";
import SQSPoller from "./SQSPoller";
import {ListQueuesCommand, SQSClient} from "@aws-sdk/client-sqs";
import {getFunctionDefinitionsWithStreamsEvents} from "../StreamFunctionDefinitions";
import getQueuesToCreate from "./functions/getQueuesToCreate";
import setupQueues from "./functions/setupQueues";
import PluginConfiguration from "../PluginConfiguration";
import {getHandlersAsLambdaFunctionDefinitions, StringKeyObject} from "../utils";
import getQueueDefinitionsFromConfig from "./functions/getQueueDefinitionsFromConfig";
import bindHandlersToQueues from "./functions/bindHandlersToQueues";
import getQueueDefinitionsFromResources from "./functions/getQueueDefinitionsFromResources";


export class SQStreamHandler implements StreamHandler {
    private slsOfflineLambda?: typeof Lambda
    private sqsClient: SQSClient
    private sqsPoller?: SQSPoller

    constructor(private serverless: Serverless, private options: StringKeyObject<any>, private config: PluginConfiguration) {
    }

    async start() {
        const resources = this.serverless.service?.resources?.Resources

        log(`Starting Offline SQS Streams: ${this.options.stage}/${this.options.region}..`)
        this.sqsClient = await this._createSQSClient()

        this.slsOfflineLambda = new Lambda(this.serverless, this.options)
        this.slsOfflineLambda.create(getHandlersAsLambdaFunctionDefinitions(this.serverless))

        // Load queue definitions from defined resources
        const resourceQueueDefinitions = getQueueDefinitionsFromResources(resources)
        logDebug("resourceQueueDefinitions", resourceQueueDefinitions)

        // Load queue definitions from plugin configuration
        const configQueueDefinitions = getQueueDefinitionsFromConfig(this.config)
        logDebug("configQueueDefinitions", configQueueDefinitions)

        // Filter any queues that should not be created (either because the plugin is set to not create resource
        // definitions, or a queue is marked as create=false
        const queuesToCreate = getQueuesToCreate(this.config)(resourceQueueDefinitions, configQueueDefinitions)
        logDebug("queuesToCreate", queuesToCreate)

        // Activate the queues by removing, creating and purging as required
        const activeQueues = await setupQueues(this.config, this.sqsClient)(queuesToCreate)
        logDebug("activeQueues", activeQueues)

        // Bind the queues to event handler mappings
        const functionsWithSqsEvents = getFunctionDefinitionsWithStreamsEvents(this.serverless, 'SQS')
        const boundQueues = bindHandlersToQueues(this.config, resources, activeQueues, functionsWithSqsEvents)
        logDebug("boundQueues", boundQueues)

        // Start polling for bound queues
        this.sqsPoller = new SQSPoller(this.options, this.config, boundQueues, this.sqsClient, this.slsOfflineLambda)
        this.sqsPoller.start()

        log(`Started Offline SQS Streams. `)
    }

    async shutdown() {
        log("Halting Offline SQS Streams..")
        return Promise.all([
                this.slsOfflineLambda ? this.slsOfflineLambda.cleanup() : Promise.resolve(),
                this.sqsPoller ? this.sqsPoller.stop() : Promise.resolve()
            ]
        )
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