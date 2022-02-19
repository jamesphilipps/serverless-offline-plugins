import * as Serverless from "serverless"
import {LogOptions} from "serverless"
import {logDebug, setLog} from "./logging";
import {SLS_CUSTOM_OPTION, SLS_OFFLINE_OPTION} from "./constants";
import {getPluginConfiguration, StringKeyObject} from "./common";
import {StreamHandler} from "./StreamHandler";
import {SQStreamHandler} from "./sqs/SQStreamHandler";
import {DynamoDBStreamHandler} from "./dynamodb/DynamoDBStreamHandler";

export default class ServerlessDynamoStreamsPlugin {
    commands: object = []
    hooks: StringKeyObject<Function>
    options: StringKeyObject<any>

    activeHandlers: StreamHandler[] = []

    constructor(private serverless: Serverless,  cliOptions: StringKeyObject<any>) {
        setLog((...args: [string, string, LogOptions]) => serverless.cli.log(...args))

        this.options = mergeOptions(serverless, cliOptions)
        logDebug('options:', this.options);

        this.hooks = {
            "offline:start:init": this.start.bind(this),
            "offline:start:end": this.end.bind(this),
        }
    }


    async start() {
        const config = getPluginConfiguration(this.serverless)

        if (config?.dynamodb?.enabled) {
            this.activeHandlers.push(new DynamoDBStreamHandler(this.serverless, this.options))
        }
        if (config?.sqs?.enabled) {
            this.activeHandlers.push(new SQStreamHandler(this.serverless, this.options))
        }

        return Promise.all(this.activeHandlers.map(h => h.start()))
    }

    async end() {
        return Promise.all(this.activeHandlers.map(h => h.shutdown()))
    }
}

const mergeOptions = (serverless: Serverless, cliOptions: StringKeyObject<any>) => {
    const {service: {custom = {}}} = serverless;
    const customOptions = custom[SLS_CUSTOM_OPTION];
    const offlineOptions = custom[SLS_OFFLINE_OPTION];

    const extraOptions = {
        region: serverless.service.provider.region
    }

    return {...offlineOptions, ...customOptions, ...extraOptions, ...cliOptions}
}

module.exports = ServerlessDynamoStreamsPlugin
