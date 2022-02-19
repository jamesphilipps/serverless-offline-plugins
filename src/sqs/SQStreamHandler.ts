import {log, logDebug} from "../logging";
import * as Serverless from "serverless";
import {default as Lambda} from 'serverless-offline/dist/lambda'
import {StreamHandler} from "../StreamHandler";
import SQSPoller from "./SQSPoller";
import {getPluginConfiguration, StringKeyObject} from "../common";
import {
    CreateQueueCommand,
    DeleteQueueCommand,
    GetQueueAttributesCommand,
    ListQueuesCommand,
    PurgeQueueCommand,
    SQSClient
} from "@aws-sdk/client-sqs";
import {ActiveQueueDef, QueueDef} from "./QueueDef";
import {DEFAULT_SQS_POLL_INTERVAL_MS} from "../constants";
import {
    getFunctionDefinitionsWithStreamsEvents,
    ParsedFunctionDefinition,
    SqsEventMappingDefinition,
    StreamsEventMapping
} from "../StreamFunctionDefinitions";
import {getQueueDefinitionsFromResources, getQueueNameFromArn, keyMerge} from "./utils";
import objectMerge = require('lodash.merge');

interface ExistingQueueDetails {
    name: string,
    queueUrl: string,
    queueArn: string
}


const defaultConfig: PluginConfiguration = {
    dynamodb: {
        enabled: false
    },
    sqs: {
        enabled: false,
        createQueuesFromResources: true,
        removeExistingQueuesOnStart: true,
        purgeExistingQueuesOnStart: false,
        pollInterval: DEFAULT_SQS_POLL_INTERVAL_MS
    }
}

export class SQStreamHandler implements StreamHandler {
    private readonly config: PluginConfiguration
    private slsOfflineLambda?: typeof Lambda
    private sqsClient: SQSClient
    private sqsPoller?: SQSPoller

    constructor(private serverless: Serverless, private options: StringKeyObject<any>) {
        this.config = objectMerge(defaultConfig, getPluginConfiguration(this.serverless))
    }

    async start() {
        log(`Starting Offline SQS Streams: ${this.options.stage}/${this.options.region}..`)
        this.sqsClient = await this._createSQSClient()
        this.slsOfflineLambda = new Lambda(this.serverless, this.options)

        const functionsWithSqsEvents = getFunctionDefinitionsWithStreamsEvents(this.serverless, 'SQS')

        const resourceQueueDefinitions = getQueueDefinitionsFromResources(this.serverless)
        const functionQueueDefinitions = this._getFunctionQueueDefinitions(functionsWithSqsEvents)

        const queuesToCreate = this._getQueuesToCreate(resourceQueueDefinitions, functionQueueDefinitions)
        const activeQueueDefinitions = await this._setupQueues(queuesToCreate)

        const queuesWithFunctionEventHandler = new Set(functionQueueDefinitions.map((queue) => queue.name))
        const queuesToPoll = activeQueueDefinitions.filter((queue) => queuesWithFunctionEventHandler.has(queue.name))

        logDebug("resourceQueueDefinitions", resourceQueueDefinitions)
        logDebug("functionQueueDefinitions", functionQueueDefinitions)
        logDebug("queuesToCreate", queuesToCreate)
        logDebug("activeQueueDefinitions", activeQueueDefinitions)
        logDebug("queuesToPoll", queuesToPoll)

        this.sqsPoller = new SQSPoller(this.options, this.config, queuesToPoll, this.sqsClient, this.slsOfflineLambda)
        this.sqsPoller.start()

        log(`Started Offline SQS Streams. `)
    }

    private _getQueuesToCreate(resourceQueueDefinitions: QueueDef[], functionQueueDefinitions: QueueDef []): QueueDef[] {
        const definitionsToCreate = this.config.sqs.createQueuesFromResources ?
            functionQueueDefinitions.concat(resourceQueueDefinitions) :
            functionQueueDefinitions

        // Merge duplicates
        return this._mergeQueueDefinitions(definitionsToCreate)
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


    private async _setupQueues(queueDefinitions: QueueDef[]): Promise<ActiveQueueDef[]> {
        const {removeExistingQueuesOnStart, purgeExistingQueuesOnStart} = this.config.sqs

        const deleteOrPurgeQueuesIfRequired = async () => {
            const existingQueues = await this.sqsClient.send(new ListQueuesCommand({}))
            const existingQueueCount = existingQueues.QueueUrls?.length || 0;
            if (removeExistingQueuesOnStart && existingQueueCount > 0) {
                logDebug("Removing existing queues..")
                await Promise.all(
                    existingQueues.QueueUrls.map((QueueUrl) => this.sqsClient.send(new DeleteQueueCommand({QueueUrl})))
                )
            } else if (purgeExistingQueuesOnStart && existingQueueCount > 0) {
                logDebug("Purging existing queues..")
                await Promise.all(
                    existingQueues.QueueUrls.map((QueueUrl) => this.sqsClient.send(new PurgeQueueCommand({QueueUrl})))
                )
            }
        }

        const getSingleQueueDetails = async (QueueUrl: string): Promise<ExistingQueueDetails> => {
            const response = await this.sqsClient.send(new GetQueueAttributesCommand({
                QueueUrl,
                AttributeNames: ['QueueArn']
            }))
            const queueArn = response.Attributes.QueueArn;
            const queueName = queueArn.split(':')[5];
            return {
                name: queueName,
                queueUrl: QueueUrl,
                queueArn
            }
        }

        const getAllExistingQueuesDetails = async () => {
            const existingQueues = await this.sqsClient.send(new ListQueuesCommand({}))
            return Object.fromEntries(await Promise.all(
                (existingQueues?.QueueUrls || []).map(async (QueueUrl) => {
                    const details = await getSingleQueueDetails(QueueUrl)
                    return [details.name, details] as [string, ExistingQueueDetails]
                })
            ))
        }

        const getQueuesToCreate = async (existingQueues: StringKeyObject<ExistingQueueDetails>): Promise<QueueDef[]> => {
            const existingQueueNames = new Set(Object.keys(existingQueues))
            if (existingQueueNames.size === 0) {
                return queueDefinitions
            }
            return queueDefinitions.filter((queue) => !existingQueueNames.has(queue.name))
        }

        const createQueues = async (queueDefinitions: QueueDef[]): Promise<ActiveQueueDef[]> => {
            return Promise.all(
                queueDefinitions.map(async (queue) => {
                    // TODO: support RedrivePolicy
                    const createResult = await this.sqsClient.send(new CreateQueueCommand({
                        QueueName: queue.name,
                        Attributes: {
                            VisibilityTimeout: queue.visibilityTimeout?.toString(),
                            DelaySeconds: queue.delaySeconds?.toString()
                        }
                    }))
                    const details = await getSingleQueueDetails(createResult.QueueUrl)
                    return {...queue, ...details}
                })
            )
        }

        const getActiveQueueDefs = (existingQueues: StringKeyObject<ExistingQueueDetails>): ActiveQueueDef[] => {
            const queueDefMap = Object.fromEntries(
                queueDefinitions.map((queue) => [queue.name, queue] as [string, QueueDef])
            )
            return Object.entries(existingQueues)
                .map(([queueName, existingQueue]) => {
                    const queueDef = queueDefMap[queueName]
                    if (queueDef) {
                        return {...queueDef, ...existingQueue} as ActiveQueueDef
                    }
                })
                .filter(v => !!v)
        }


        await deleteOrPurgeQueuesIfRequired()
        const existingQueues: StringKeyObject<ExistingQueueDetails> = await getAllExistingQueuesDetails()
        const createdQueues = await createQueues(await getQueuesToCreate(existingQueues))
        return getActiveQueueDefs(existingQueues).concat(createdQueues)
    }

    // private _getResourcesQueueDefinitions = (): QueueDef[] => {
    //     const resources = this.serverless.service.resources?.Resources as StringKeyObject<any>;
    //     if (!resources) {
    //         return []
    //     }
    //
    //     const toQueueDef = (v: StringKeyObject<any>): QueueDef => ({
    //         name: v?.Properties?.QueueName,
    //         fifo: v?.Properties?.FifoQueue,
    //         visibilityTimeout: v?.Properties?.VisibilityTimeout,
    //         delaySeconds: v?.Properties?.DelaySeconds,
    //         handlerFunctions: []
    //     })
    //
    //     return Object.values(resources)
    //         .filter((v) => v?.Type === 'AWS::SQS::Queue')
    //         .map(toQueueDef)
    // }


    private _getFunctionQueueDefinitions = (functionsWithSqsEvents: StringKeyObject<ParsedFunctionDefinition>): QueueDef[] => {
        const getSqsEvents = (f: ParsedFunctionDefinition) => f.events.filter(e => e.type === 'SQS')

        const toQueueDef = (f: ParsedFunctionDefinition, e: StreamsEventMapping): QueueDef => {
            const sourceEvent = e.sourceEvent as SqsEventMappingDefinition;
            const queueName = getQueueNameFromArn(this.serverless,sourceEvent.sqs.arn);
            return ({
                name: queueName,
                fifo: queueName.endsWith(".fifo"),
                handlerFunctions: [f.functionName],
            })
        }

        return this._mergeQueueDefinitions(
            Object.entries(functionsWithSqsEvents)
                .flatMap(([_, func]) =>
                    getSqsEvents(func)
                        .map((e) => toQueueDef(func, e))
                )
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

    private _mergeQueueDefinitions = (queueDefinitions: QueueDef[]): QueueDef[] => {
        const applyMerge = (acc: StringKeyObject<QueueDef>, v: QueueDef): StringKeyObject<QueueDef> => {
            const k = v.name
            return {
                ...acc,
                [k]: acc[k] ? {...acc[k], handlerFunctions: acc[k].handlerFunctions.concat(v.handlerFunctions)} : v
            }
        }
        return keyMerge<QueueDef>((q) => q.name, applyMerge)(queueDefinitions)
    }
}