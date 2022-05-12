import * as Serverless from "serverless"
import {LogOptions} from "serverless"
import {StringKeyObject} from "./types"
import {log, logDebug, setLog} from "./logging";
import {createAndStartServer, createRequestListener} from "./server";
import {SecretStore} from "./store";
import Context from "./Context";
import {Server} from "http";
import {createSecret} from "./Secret";

const SLS_CUSTOM_OPTION = 'secrets-manager-simulator';
const DEFAULT_PORT = 8007

interface SecretSeed {
    name: string
    value: string
}

// TODO: support only valid secret name characters

export default class ServerlessSecretsManagerSimulatorPlugin {
    commands: object = []
    hooks: StringKeyObject<Function>
    options: StringKeyObject<any>

    private readonly secretStore: SecretStore
    private server: Server

    constructor(private serverless: Serverless, private cliOptions: StringKeyObject<any>) {
        setLog((...args: [string, string, LogOptions]) => serverless.cli.log(...args))

        this.options = mergeOptions(serverless, cliOptions)
        logDebug('options:', JSON.stringify(this.options || {}, undefined,2));

        this.hooks = {
            "offline:start:init": this.start.bind(this),
            "offline:start:end": this.end.bind(this),
        }

        this.secretStore = this._createSecretStore()
    }


    async start() {
        log('Starting Secrets Manager Simulator..')
        const enableDebugEndpoint = this._getPluginOptions()?.enableDebugEndpoint;
        const context: Context = {
            secretStore: this.secretStore,
            region: this.serverless.service.provider.region,
            enableDebugEndpoint: enableDebugEndpoint !== undefined ? enableDebugEndpoint : true
        }

        const port = this.options[SLS_CUSTOM_OPTION]?.port || DEFAULT_PORT
        this.server = createAndStartServer(port, createRequestListener(context))
        log(`Started Secrets Manager Simulator at http://localhost:${port}`)
    }

    async end() {
        log("Halting Secrets Manager Simulator..")
    }

    _createSecretStore(): SecretStore {
        const region = this.serverless.service.provider.region
        const store = new SecretStore()

        const secrets = this._getPluginOptions()?.secrets as SecretSeed[]
        if (secrets) {
            secrets.forEach(s => store.add(s.name, createSecret(region, s.name, s.value)))
            log(`Seeded ${secrets.length} secrets`)
        }

        return store
    }

    private _getPluginOptions() {
        return this.options[SLS_CUSTOM_OPTION]
    }

}

const mergeOptions = (serverless: Serverless, cliOptions: StringKeyObject<any>) => {
    const {service: {custom = {}}} = serverless;
    const customOptions = custom[SLS_CUSTOM_OPTION];

    const extraOptions = {
        region: serverless.service.provider.region
    }

    return {...{[SLS_CUSTOM_OPTION]: customOptions}, ...extraOptions, ...cliOptions}
}

module.exports = ServerlessSecretsManagerSimulatorPlugin
