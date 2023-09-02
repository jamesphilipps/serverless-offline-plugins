import {AWS} from "@serverless/typescript"

const serverlessConfiguration: () => Promise<AWS> = async () => {
    return {
        service: "ServerlessOfflineStreamsPluginExample",
        frameworkVersion: "3",

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
                handler: "src/handler.handler",
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
                    {
                        sqs: {arn: { 'Fn::ImportValue': 'CrossStackQueueAlias' }},
                    },
                    {
                        sqs: {arn: 'arn:aws:sqs:eu-west-1:4445555666:my-test-queue'}
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
            "serverless-offline-streams": {
                sqs: {
                    enabled: true,
                    endpoint: "http://127.0.0.1:9324",

                    localQueueManagement: {
                        createFromResources: false,
                        removeOnStart: true,
                        purgeOnStart: true,
                    },

                    remoteQueueManagement: {
                        purgeOnStart: false
                    },

                    queues: [
                        {
                            name: 'ConfigQueue',
                            visibilityTimeout: 5,
                            delaySeconds: 5
                        },
                        {
                            name: 'CrossStackQueue',
                            aliases: ['CrossStackQueueAlias'],
                            visibilityTimeout: 5,
                            delaySeconds: 5
                        },
                        {
                            name: 'RemoteQueue',
                            aliases: ['my-test-queue'],
                            remote: {
                                queueUrl: 'https://sqs.eu-west-1.amazonaws.com/4445555666/my-test-queue'
                            }
                        },
                    ],
                },
            },
        },
    }
}

module.exports = serverlessConfiguration()
