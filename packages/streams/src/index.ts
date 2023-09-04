import * as Serverless from "serverless"
import {SLS_CUSTOM_OPTION, SLS_OFFLINE_OPTION} from "./constants";
import {StreamHandler} from "./StreamHandler";
import {SQStreamHandler} from "./sqs/SQStreamHandler";
import {DynamoDBStreamHandler} from "./dynamodb/DynamoDBStreamHandler";
import {getDefaultPluginConfiguration, validateConfig} from "./PluginConfiguration";
import {getPluginConfiguration, StringKeyObject} from "./utils";
import {getLogger, setLog} from "./logging";
import objectMerge = require('lodash.merge');

export default class ServerlessOfflineStreamsPlugin {
    commands: object = []
    hooks: StringKeyObject<Function>
    options: StringKeyObject<any>

    activeHandlers: StreamHandler[] = []

    constructor(private serverless: Serverless, cliOptions: StringKeyObject<any>, {log}: { log: any }) {
        setLog(log)

        this.options = mergeOptions(serverless, cliOptions)
        getLogger().debug('options:' + JSON.stringify(this.options || {}, undefined, 2));

        this.hooks = {
            "offline:start:init": this.start.bind(this),
            "offline:start:end": this.end.bind(this),
        }
    }


    async start() {
        const config = validateConfig(
            objectMerge(getDefaultPluginConfiguration(), getPluginConfiguration(this.serverless))
        )
        getLogger().debug("Plugin Config" + JSON.stringify(config, undefined, 2))


        if (config.dynamodb.enabled) {
            getLogger().debug("DynamoDB handler is enabled")
            this.activeHandlers.push(new DynamoDBStreamHandler(this.serverless, this.options))
        }
        if (config.sqs.enabled) {
            getLogger().debug("SQS handler is enabled")
            this.activeHandlers.push(new SQStreamHandler(this.serverless, this.options, config.sqs))
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

module.exports = ServerlessOfflineStreamsPlugin
