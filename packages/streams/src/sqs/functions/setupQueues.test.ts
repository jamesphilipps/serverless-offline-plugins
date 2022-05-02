import {QueueDef} from "../QueueDef";
import {
    CreateQueueCommand,
    DeleteQueueCommand,
    GetQueueAttributesCommand,
    ListQueuesCommand,
    PurgeQueueCommand,
    SQSClient
} from "@aws-sdk/client-sqs";
import {mockClient} from "aws-sdk-client-mock";
import setupQueues, {
    createQueues,
    deleteOrPurgeQueuesIfRequired,
    getAllExistingQueuesDetails,
    getQueuesToCreate,
    getSingleQueueDetails
} from "./setupQueues";
import {getDefaultPluginConfiguration} from "../../PluginConfiguration";

const queueDef = (name: string, handlerFunctions: string[], resourceKey?: string): QueueDef => ({
    resourceKey,
    name,
    aliases: [],
    handlerFunctions,
    fifo: name.endsWith('.fifo'),
})

const existingQueueDef = (name: string) => ({
    name,
    queueUrl: `http://127.0.0.1/${name}`,
    queueArn: `arn:aws:sqs:eu-west-1:444455556666:${name}`
})

const resourceQueueDef = (name: string, resourceKey: string): QueueDef => queueDef(name, [], resourceKey)
const functionQueueDef = (name: string, handlerFunctions: string[]): QueueDef => queueDef(name, handlerFunctions)

describe('setupQueues', () => {
    const sqsClientMock = mockClient(SQSClient)
    const sqsClient = sqsClientMock as unknown as SQSClient

    beforeEach(() => {
        sqsClientMock.reset()
    })

    describe('deleteOrPurgeQueuesIfRequired', () => {
        describe('removeExistingQueuesOnStart and purgeExistingQueuesOnStart false', () => {
            const invoke = async () => deleteOrPurgeQueuesIfRequired(sqsClient, false, false)

            it('does nothing', async () => {
                sqsClientMock.onAnyCommand().rejects({})
                await invoke()
                expect(sqsClientMock.calls().length).toBe(0)
            })
        })

        describe('removeExistingQueuesOnStart true and purgeExistingQueuesOnStart false', () => {
            const invoke = async () => deleteOrPurgeQueuesIfRequired(sqsClient, true, false)

            it('does nothing if no queues', async () => {
                const QueueUrls = []
                sqsClientMock.on(ListQueuesCommand).resolves({QueueUrls})
                await invoke()

                // Only ListQueuesCommand invoked
                expect(sqsClientMock.calls().length).toBe(1)
                expect(sqsClientMock.commandCalls(ListQueuesCommand).length).toBe(1)
            })

            it('invokes delete command for each queue', async () => {
                const QueueUrls = [
                    'http://127.0.0.1/queue1',
                    'http://127.0.0.1/queue2'
                ]
                sqsClientMock.on(ListQueuesCommand).resolves({QueueUrls})
                await invoke()

                expect(sqsClientMock.calls().length).toBe(3)
                expect(sqsClientMock.commandCalls(ListQueuesCommand).length).toBe(1)

                expect(sqsClientMock.commandCalls(DeleteQueueCommand).length).toBe(2)
                expect(sqsClientMock.commandCalls(DeleteQueueCommand, {QueueUrl: QueueUrls[0]}).length).toBe(1)
                expect(sqsClientMock.commandCalls(DeleteQueueCommand, {QueueUrl: QueueUrls[1]}).length).toBe(1)
            })
        })

        describe('removeExistingQueuesOnStart false and purgeExistingQueuesOnStart true', () => {
            const invoke = async () => deleteOrPurgeQueuesIfRequired(sqsClient, false, true)

            it('does nothing if no queues', async () => {
                const QueueUrls = []
                sqsClientMock.on(ListQueuesCommand).resolves({QueueUrls})
                await invoke()

                // Only ListQueuesCommand invoked
                expect(sqsClientMock.calls().length).toBe(1)
                expect(sqsClientMock.commandCalls(ListQueuesCommand).length).toBe(1)
            })

            it('invokes purge command for each queue', async () => {
                const QueueUrls = [
                    'http://127.0.0.1/queue1',
                    'http://127.0.0.1/queue2'
                ]
                sqsClientMock.on(ListQueuesCommand).resolves({QueueUrls})
                await invoke()

                expect(sqsClientMock.calls().length).toBe(3)
                expect(sqsClientMock.commandCalls(ListQueuesCommand).length).toBe(1)

                expect(sqsClientMock.commandCalls(PurgeQueueCommand).length).toBe(2)
                expect(sqsClientMock.commandCalls(PurgeQueueCommand, {QueueUrl: QueueUrls[0]}).length).toBe(1)
                expect(sqsClientMock.commandCalls(PurgeQueueCommand, {QueueUrl: QueueUrls[1]}).length).toBe(1)
            })
        })


        describe('removeExistingQueuesOnStart true and purgeExistingQueuesOnStart true', () => {
            const invoke = async () => deleteOrPurgeQueuesIfRequired(sqsClient, true, false)

            it('does nothing if no queues', async () => {
                const QueueUrls = []
                sqsClientMock.on(ListQueuesCommand).resolves({QueueUrls})
                await invoke()

                // Only ListQueuesCommand invoked
                expect(sqsClientMock.calls().length).toBe(1)
                expect(sqsClientMock.commandCalls(ListQueuesCommand).length).toBe(1)
            })

            it('ignores purge command and invokes delete command for each queue', async () => {
                const QueueUrls = [
                    'http://127.0.0.1/queue1',
                    'http://127.0.0.1/queue2'
                ]
                sqsClientMock.on(ListQueuesCommand).resolves({QueueUrls})
                await invoke()

                expect(sqsClientMock.calls().length).toBe(3)
                expect(sqsClientMock.commandCalls(ListQueuesCommand).length).toBe(1)
                expect(sqsClientMock.commandCalls(PurgeQueueCommand).length).toBe(0)

                expect(sqsClientMock.commandCalls(DeleteQueueCommand).length).toBe(2)
                expect(sqsClientMock.commandCalls(DeleteQueueCommand, {QueueUrl: QueueUrls[0]}).length).toBe(1)
                expect(sqsClientMock.commandCalls(DeleteQueueCommand, {QueueUrl: QueueUrls[1]}).length).toBe(1)
            })
        })
    })

    describe('getSingleQueueDetails', () => {
        const queueUrl = 'http://127.0.0.1/queue1';
        const invoke = async () => getSingleQueueDetails(sqsClient, queueUrl)

        it('maps details correctly', async () => {
            const QueueArn = 'arn:aws:sqs:eu-west-1:444455556666:queue1'
            sqsClientMock.on(GetQueueAttributesCommand).resolves({Attributes: {QueueArn}})
            const details = await invoke()

            expect(sqsClientMock.calls().length).toBe(1)
            expect(details.name).toEqual('queue1')
            expect(details.queueArn).toEqual(QueueArn)
            expect(details.queueUrl).toEqual(queueUrl)
        })
    })

    describe('getAllExistingQueuesDetails', () => {
        const invoke = async () => getAllExistingQueuesDetails(sqsClient)

        it('does nothing if no existing queues', async () => {
            sqsClientMock.on(ListQueuesCommand).resolves({})
            const details = await invoke()

            expect(sqsClientMock.calls().length).toBe(1)
            expect(sqsClientMock.commandCalls(ListQueuesCommand).length).toBe(1)
            expect(details).toEqual({})
        })

        it('maps details correctly', async () => {
            const queueUrl1 = 'http://127.0.0.1/queue1';
            const QueueArn1 = 'arn:aws:sqs:eu-west-1:444455556666:queue1'
            const queueUrl2 = 'http://127.0.0.1/queue2';
            const QueueArn2 = 'arn:aws:sqs:eu-west-1:444455556666:queue2'

            sqsClientMock.on(ListQueuesCommand)
                .resolves({QueueUrls: [queueUrl1, queueUrl2]})
            sqsClientMock.on(GetQueueAttributesCommand, {QueueUrl: queueUrl1})
                .resolves({Attributes: {QueueArn: QueueArn1}})
            sqsClientMock.on(GetQueueAttributesCommand, {QueueUrl: queueUrl2})
                .resolves({Attributes: {QueueArn: QueueArn2}})

            const details = await invoke()

            expect(sqsClientMock.calls().length).toBe(3)
            expect(sqsClientMock.commandCalls(ListQueuesCommand).length).toBe(1)
            expect(sqsClientMock.commandCalls(GetQueueAttributesCommand).length).toBe(2)
            expect(details).toEqual({
                queue1: {name: 'queue1', queueUrl: queueUrl1, queueArn: QueueArn1},
                queue2: {name: 'queue2', queueUrl: queueUrl2, queueArn: QueueArn2},
            })
        })
    })

    describe('getQueuesToCreate', () => {
        it('handles queue definitions empty', async () => {
            const queues = await getQueuesToCreate([], {})
            expect(queues.length).toEqual(0)
        })

        it('returns queue definitions if existing queues empty', async () => {
            const queueDefinitions = [
                queueDef('queue1', [], 'Queue1'),
                queueDef('queue2', [], 'Queue2')
            ]
            const queues = await getQueuesToCreate(queueDefinitions, {})
            expect(queues).toEqual(queueDefinitions)
        })

        it('returns queue definitions if existing queues does not include definitions', async () => {
            const existingQueues = {
                queue3: existingQueueDef('queue3'),
                queue4: existingQueueDef('queue4')
            }
            const queueDefinitions = [
                queueDef('queue1', [], 'Queue1'),
                queueDef('queue2', [], 'Queue2')
            ]
            const queues = await getQueuesToCreate(queueDefinitions, existingQueues)
            expect(queues).toEqual(queueDefinitions)
        })

        it('filters queue definitions that already exist', async () => {
            const existingQueues = {
                queue1: existingQueueDef('queue1'),
                queue4: existingQueueDef('queue3')
            }
            const queueDefinitions = [
                queueDef('queue1', [], 'Queue1'),
                queueDef('queue2', [], 'Queue2')
            ]
            const queues = await getQueuesToCreate(queueDefinitions, existingQueues)
            expect(queues.length).toBe(1)
            expect(queues[0]).toEqual(queueDefinitions[1])
        })
    })

    describe('createQueues', () => {
        const invoke = (queueDefinitions: QueueDef[]) => createQueues(sqsClient, queueDefinitions)

        it('does nothing when queue definitions empty', async () => {
            await invoke([])
            expect(sqsClientMock.calls().length).toEqual(0)
        })

        it('sends CreateQueue for each queue definition', async () => {
            const queueUrl1 = 'http://127.0.0.1/queue1';
            const queueArn1 = 'arn:aws:sqs:eu-west-1:444455556666:queue1'
            const queueUrl2 = 'http://127.0.0.1/queue2';
            const queueArn2 = 'arn:aws:sqs:eu-west-1:444455556666:queue2'
            const queueDefinitions = [
                queueDef('queue1', [], 'Queue1'),
                queueDef('queue2', [], 'Queue2')
            ]

            sqsClientMock.on(CreateQueueCommand, {QueueName: queueDefinitions[0].name})
                .resolves({QueueUrl: queueUrl1})
            sqsClientMock.on(CreateQueueCommand, {QueueName: queueDefinitions[1].name})
                .resolves({QueueUrl: queueUrl2})

            sqsClientMock.on(GetQueueAttributesCommand, {QueueUrl: queueUrl1})
                .resolves({Attributes: {QueueArn: queueArn1}})
            sqsClientMock.on(GetQueueAttributesCommand, {QueueUrl: queueUrl2})
                .resolves({Attributes: {QueueArn: queueArn2}})

            const activeQueues = await invoke(queueDefinitions)
            expect(sqsClientMock.calls().length).toEqual(4)

            expect(sqsClientMock.commandCalls(CreateQueueCommand, {QueueName: queueDefinitions[0].name,}).length).toEqual(1)
            expect(sqsClientMock.commandCalls(GetQueueAttributesCommand, {QueueUrl: queueUrl1,}).length).toEqual(1)

            expect(sqsClientMock.commandCalls(CreateQueueCommand, {QueueName: queueDefinitions[1].name,}).length).toEqual(1)
            expect(sqsClientMock.commandCalls(GetQueueAttributesCommand, {QueueUrl: queueUrl2,}).length).toEqual(1)

            expect(activeQueues.length).toBe(2)
            expect(activeQueues[0]).toEqual({
                fifo: false,
                handlerFunctions: [],
                resourceKey: queueDefinitions[0].resourceKey,
                name: queueDefinitions[0].name,
                queueArn: queueArn1,
                queueUrl: queueUrl1,
            })
            expect(activeQueues[1]).toEqual({
                fifo: false,
                handlerFunctions: [],
                resourceKey: queueDefinitions[1].resourceKey,
                name: queueDefinitions[1].name,
                queueArn: queueArn2,
                queueUrl: queueUrl2,
            })
        })

        it('sets VisibilityTimeout when specified', async () => {
            const queueDefinition = {
                ...queueDef('queue1', [], 'Queue1'),
                visibilityTimeout: 50
            }

            sqsClientMock.on(CreateQueueCommand).resolves({QueueUrl: 'http://127.0.0.1/queue1'})
            sqsClientMock.on(GetQueueAttributesCommand).resolves({Attributes: {QueueArn: 'arn:aws:sqs:eu-west-1:444455556666:queue1'}})

            const activeQueues = await invoke([queueDefinition])
            expect(sqsClientMock.calls().length).toEqual(2)
            expect(sqsClientMock.commandCalls(CreateQueueCommand, {Attributes: {VisibilityTimeout: "50"}}).length).toEqual(1)
            expect(activeQueues[0].visibilityTimeout).toEqual(50)
        })

        it('sets DelaySeconds when specified', async () => {
            const queueDefinition = {
                ...queueDef('queue1', [], 'Queue1'),
                delaySeconds: 50
            }

            sqsClientMock.on(CreateQueueCommand).resolves({QueueUrl: 'http://127.0.0.1/queue1'})
            sqsClientMock.on(GetQueueAttributesCommand).resolves({Attributes: {QueueArn: 'arn:aws:sqs:eu-west-1:444455556666:queue1'}})

            const activeQueues = await invoke([queueDefinition])
            expect(sqsClientMock.calls().length).toEqual(2)
            expect(sqsClientMock.commandCalls(CreateQueueCommand, {Attributes: {DelaySeconds: "50"}}).length).toEqual(1)
            expect(activeQueues[0].delaySeconds).toEqual(50)
        })
    })

    describe('setupQueues', () => {
        const config = getDefaultPluginConfiguration()
        config.sqs.createQueuesFromResources = false
        config.sqs.purgeExistingQueuesOnStart = false
        config.sqs.removeExistingQueuesOnStart = false

        const invoke = (queueDefinitions: QueueDef[]) => setupQueues(config, sqsClient)(queueDefinitions)

        it('sets up queues correctly', async () => {
            const existingQueueUrl = 'http://127.0.0.1/queue1';
            const existingQueueArn = 'arn:aws:sqs:eu-west-1:444455556666:queue1'
            const queueUrl2 = 'http://127.0.0.1/queue2';
            const queueArn2 = 'arn:aws:sqs:eu-west-1:444455556666:queue2'
            const queueUrl3 = 'http://127.0.0.1/queue3';
            const queueArn3 = 'arn:aws:sqs:eu-west-1:444455556666:queue3'

            const queueDefinitions = [
                queueDef('queue1', [], 'Queue1'),
                queueDef('queue2', [], 'Queue2'),
                queueDef('queue3', [], 'Queue3'),
            ]

            // Existing queue 1
            sqsClientMock.on(ListQueuesCommand).resolves({QueueUrls: [existingQueueUrl]})
            sqsClientMock.on(GetQueueAttributesCommand, {QueueUrl: existingQueueUrl})
                .resolves({Attributes: {QueueArn: existingQueueArn}})

            // New queue 2
            sqsClientMock.on(CreateQueueCommand, {QueueName: queueDefinitions[1].name})
                .resolves({QueueUrl: queueUrl2})
            sqsClientMock.on(GetQueueAttributesCommand, {QueueUrl: queueUrl2})
                .resolves({Attributes: {QueueArn: queueArn2}})

            // New queue 3
            sqsClientMock.on(CreateQueueCommand, {QueueName: queueDefinitions[2].name})
                .resolves({QueueUrl: queueUrl3})
            sqsClientMock.on(GetQueueAttributesCommand, {QueueUrl: queueUrl3})
                .resolves({Attributes: {QueueArn: queueArn3}})

            const activeQueues = await invoke(queueDefinitions)
            expect(activeQueues.length).toEqual(3)
        })


    })
})

