import {log, logDebug} from "../logging";
import * as Serverless from "serverless";
import {default as Lambda} from 'serverless-offline/dist/lambda'
import {StreamHandler} from "../StreamHandler";
import SQSPoller from "./SQSPoller";
import {ListQueuesCommand, SQSClient} from "@aws-sdk/client-sqs";
import {getFunctionDefinitionsWithStreamsEvents} from "../StreamFunctionDefinitions";
import {SqsPluginConfiguration} from "../PluginConfiguration";
import {getHandlersAsLambdaFunctionDefinitions, StringKeyObject} from "../utils";
import bindHandlersToQueues from "./functions/bindHandlersToQueues";
import getDefinedQueues from "./functions/getDefinedQueues";
import deleteQueues from "./functions/deleteQueues";
import purgeQueues from "./functions/purgeQueues";
import createAndActivateQueues from "./functions/createAndActivateQueues";


export class SQStreamHandler implements StreamHandler {
    private slsOfflineLambda?: typeof Lambda
    private sqsClient: SQSClient
    private sqsPoller?: SQSPoller

    constructor(private serverless: Serverless, private options: StringKeyObject<any>, private config: SqsPluginConfiguration) {
    }

    async start() {
        const resources = this.serverless.service?.resources?.Resources

        log(`Starting Offline SQS Streams: ${this.options.stage}/${this.options.region}..`)
        this.sqsClient = await this._createSQSClient()

        this.slsOfflineLambda = new Lambda(this.serverless, this.options)
        this.slsOfflineLambda.create(getHandlersAsLambdaFunctionDefinitions(this.serverless))

        // Get defined queues from resources and config
        const definedQueues = getDefinedQueues(this.config, resources)
        logDebug("definedQueues", definedQueues)

        if (this.config.removeExistingQueuesOnStart) {
            await deleteQueues(this.sqsClient)
        } else if (this.config.purgeExistingQueuesOnStart) {
            await purgeQueues(this.sqsClient)
            // TODO: purge remote queues
        }

        // Get "Active" definitions for all defined queues by creating them, or retrieving details of existing queues
        // Queue definitions will only be activated if they are not excluded by config flags. An active definition
        // includes the queue's URL and ARN
        const activeQueues = await createAndActivateQueues(this.config, this.sqsClient, definedQueues)
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
        const endpoint = this.config.host;
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