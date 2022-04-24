import {AWS} from "@serverless/typescript"

const serverlessConfiguration: () => Promise<AWS> = async () => {
    return {
        service: "ServerlessOfflineStreamsPluginExample",
        frameworkVersion: "2",

        provider: {
            name: "aws",
            runtime: "nodejs14.x",
            region: "eu-west-1",
            stage: 'local',
            lambdaHashingVersion: "20201221",
        },
        plugins: [
            "serverless-offline-streams",
            "serverless-offline",
        ],
        functions: {
            function1: {
                handler: "./handler.handler",
                events: [
                    {
                        sqs: {arn: 'arn:aws:sqs:eu-west-1:444455556666:ConfigQueue'},
                    },
                    {
                        sqs: {arn: { Ref: 'ResourceQueue' }},
                    },
                    {
                        sqs: {arn: { 'Fn::ImportValue': 'CrossStackQueue' }},
                    },
                ],
            },
        },
        resources: {
            Resources: {
                ResourceQueue: {
                    Type: "AWS::SQS::Queue",
                    Properties: {
                        QueueName: "ResourceQueue"
                    }
                }
            }
        },
        custom: {
            "serverless-offline": {
                location: ".esbuild/.build",
            },

            "serverless-offline-streams": {
                sqs: {
                    enabled: true,
                    host: "http://127.0.0.1:9324",
                    createQueuesFromResources: true,
                    removeExistingQueuesOnStart: true,
                    purgeExistingQueuesOnStart: true,
                    queues: [
                        {
                            name: 'ConfigQueue',
                            visibilityTimeout: 5,
                            delaySeconds: 5
                        },
                        {
                            name: 'CrossStackQueue',
                            visibilityTimeout: 5,
                            delaySeconds: 5
                        },
                    ],
                },
            },
        },
    }
}

module.exports = serverlessConfiguration()
