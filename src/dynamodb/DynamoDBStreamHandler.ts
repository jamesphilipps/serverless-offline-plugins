import {log} from "../logging";
import DynamoDBStreamsController from "./DynamoDBStreamsController";
import { getFunctionsWithStreamEvents} from "./support";
import * as Serverless from "serverless";
import {default as Lambda} from 'serverless-offline/dist/lambda'
import {StreamHandler} from "../StreamHandler";
import {StringKeyObject} from "../utils";
import {FunctionDefinition} from "../types";


export class DynamoDBStreamHandler implements StreamHandler {
    private slsOfflineLambda?: typeof Lambda
    private streamsController?: DynamoDBStreamsController

    constructor(private serverless: Serverless, private options: StringKeyObject<any>) {
    }

    async start() {
        const {service} = this.serverless

        log(`Starting Offline Dynamodb Streams: ${this.options.stage}/${this.options.region}..`)
        this.slsOfflineLambda = new Lambda(this.serverless, this.options)
        this.streamsController = new DynamoDBStreamsController(this.serverless, this.slsOfflineLambda, this.options)

        const functions = this._getFunctionsWithRawFilterPatterns()
        const functionsWithStreamEvents = getFunctionsWithStreamEvents((functionKey: string) => functions[functionKey])(service.getAllFunctions())

        // Create lambdas
        this.slsOfflineLambda.create(functionsWithStreamEvents)
        await this.streamsController.start(functionsWithStreamEvents)
        log(`Started Offline Dynamodb Streams. Created ${this.streamsController.count()} streams`)
    }

    async shutdown() {
        log("Halting Offline Dynamodb Streams..")

        const cleanupPromises = []

        if (this.slsOfflineLambda) {
            cleanupPromises.push(this.slsOfflineLambda.cleanup())
        }

        if (this.streamsController) {
            cleanupPromises.push(this.streamsController.stop())
        }

        return Promise.all(cleanupPromises)
    }


    /**
     * For some reason, serverless messes about with event definitions in its functions property and removes the
     * dynamo typings from all event filters. This makes it impossible to properly match the filters. Luckily, the
     * raw configuration has the original structure, so we need to load in the ordinary functions and overwrite any
     * filter pattern fields with the original, unmodified version from the raw config.. why!?
     * @private
     */
    private _getFunctionsWithRawFilterPatterns() {
        const {service} = this.serverless
        const rawFunctionsConfig = (this.serverless as unknown as any).configurationInput.functions as StringKeyObject<any>

        return Object.fromEntries(service.getAllFunctions().map((functionName) => {
            const f = service.getFunction(functionName)
            const events = f.events.map((event, i) => {
                const eventStreamBlock = (event as unknown as any).stream;
                return ({
                    ...event,
                    stream: eventStreamBlock ? {
                        ...eventStreamBlock,
                        filterPatterns: rawFunctionsConfig[functionName]?.events[i]?.stream?.filterPatterns
                    } : undefined
                })
            })
            return [functionName, {...f, events} as FunctionDefinition] as [string, FunctionDefinition]
        }))
    }
}