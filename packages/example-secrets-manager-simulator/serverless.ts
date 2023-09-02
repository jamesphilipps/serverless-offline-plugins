import {AWS} from "@serverless/typescript"

const serverlessConfiguration: () => Promise<AWS> = async () => {
    return {
        service: "ServerlessOfflineSecretsManagerSimulatorPluginExample",
        frameworkVersion: "3",

        provider: {
            name: "aws",
            runtime: "nodejs14.x",
            region: "eu-west-1",
            stage: 'local',
            lambdaHashingVersion: "20201221",
        },
        plugins: [
            "serverless-offline-secrets-manager-simulator",
            "serverless-offline",
        ],
        functions: {
            function1: {
                handler: "src/handler.handler",
            },
        },

        custom: {
            "secrets-manager-simulator": {
                port: 8007,
                enableDebugEndpoint: true,
                secretsFile: "/tmp/secrets.json",
                secrets: [
                    {
                        key: "Secret1",
                        value: "I-Am-A-Secret"
                    },
                    {
                        key: "Secret2",
                        value: "I-Am-Another-Secret"
                    }
                ]
            }
        },
    }
}

module.exports = serverlessConfiguration()
