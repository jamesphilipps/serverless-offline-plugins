import {log, logDebug} from "../logging";
import * as Serverless from "serverless";
import {default as Lambda} from 'serverless-offline/dist/lambda'
import {StreamHandler} from "../StreamHandler";
import SQSPoller from "./SQSPoller";
import {getFunctionDefinitionsWithStreamsEvents} from "../StreamFunctionDefinitions";
import {SqsPluginConfiguration} from "../PluginConfiguration";
import {getHandlersAsLambdaFunctionDefinitions, StringKeyObject} from "../utils";
import bindHandlersToQueues from "./functions/bindHandlersToQueues";
import getDefinedQueues from "./functions/getDefinedQueues";
import deleteQueues from "./functions/deleteQueues";
import purgeQueues from "./functions/purgeQueues";
import createAndActivateQueues from "./functions/createAndActivateQueues";
import createSQSClient from "./functions/createSQSClient";


export class SQStreamHandler implements StreamHandler {
    private slsOfflineLambda?: typeof Lambda
    private sqsPoller?: SQSPoller

    constructor(private serverless: Serverless, private options: StringKeyObject<any>, private config: SqsPluginConfiguration) {
    }

    async start() {
        const {endpoint} = this.config
        const {stage, region} = this.options
        const resources = this.serverless.service?.resources?.Resources

        log(`Starting Offline SQS Streams: ${stage}/${region}..`)
        const localSqsClient = await createSQSClient(region, endpoint)

        this.slsOfflineLambda = new Lambda(this.serverless, this.options)
        this.slsOfflineLambda.create(getHandlersAsLambdaFunctionDefinitions(this.serverless))

        // Get defined queues from resources and config
        const definedQueues = getDefinedQueues(this.config, resources)
        logDebug("definedQueues", definedQueues)

        if (this.config.localQueueManagement.removeOnStart) {
            await deleteQueues(localSqsClient)
        } else if (this.config.localQueueManagement.purgeOnStart) {
            await purgeQueues(localSqsClient)
        }

        // if (this.config.localQueueManagement.purgeOnStart) {
        //     // TODO: purge remote queues
        // }

        // Get "Active" definitions for all defined queues by creating them, or retrieving details of existing queues
        // Queue definitions will only be activated if they are not excluded by config flags. An active definition
        // includes the queue's URL and ARN
        const activeQueues = await createAndActivateQueues(createSQSClient, this.config, localSqsClient, definedQueues)
        logDebug("activeQueues", activeQueues)

        // Bind the queues to event handler mappings
        const functionsWithSqsEvents = getFunctionDefinitionsWithStreamsEvents(this.serverless, 'SQS')
        const boundQueues = bindHandlersToQueues(this.config, resources, activeQueues, functionsWithSqsEvents)
        logDebug("boundQueues", boundQueues)

        // Start polling for bound queues
        this.sqsPoller = new SQSPoller(this.options, this.config, boundQueues, this.slsOfflineLambda)
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
}

