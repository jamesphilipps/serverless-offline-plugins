import {CreateQueueCommand, GetQueueAttributesCommand, ListQueuesCommand, SQSClient} from "@aws-sdk/client-sqs";
import {mockClient} from "aws-sdk-client-mock";
import {SqsPluginConfiguration} from "../../PluginConfiguration";
import createAndActivateQueues, {ExistingQueueDetails} from "./createAndActivateQueues";
import {QueueDef} from "../QueueDef";
import {createQueueUrl, existingQueue, queueDef} from "../testHelpers";
import {CreateSQSClientFunc} from "./createSQSClient";

describe('createAndActivateQueues', () => {
    const sqsClientMock = mockClient(SQSClient)
    const sqsClient = sqsClientMock as unknown as SQSClient

    beforeEach(() => {
        sqsClientMock.reset()
    })

    const createConfig = (createFromResources: boolean): SqsPluginConfiguration => ({
        localQueueManagement: {createFromResources}
    })

    const onListQueuesReturn = (_sqsClientMock: any, QueueUrls: string[]) => {
        _sqsClientMock.on(ListQueuesCommand).resolves({QueueUrls})
    }

    const onGetQueueDetailsReturn = (_sqsClientMock: any, details: ExistingQueueDetails) => {
        _sqsClientMock.on(GetQueueAttributesCommand, {QueueUrl: details.url}).resolves({
            Attributes: {
                QueueName: details.name,
                QueueUrl: details.url,
                QueueArn: details.arn,
            }
        })
    }

    const onCreateQueueReturn = (_sqsClientMock: any, queue: QueueDef) => {
        _sqsClientMock.on(CreateQueueCommand, {
            QueueName: queue.name,
            Attributes: {
                VisibilityTimeout: queue.visibilityTimeout?.toString(),
                DelaySeconds: queue.delaySeconds?.toString(),
                FifoQueue: queue.fifo as any
            }
        }).resolves({QueueUrl: createQueueUrl(queue.name)})
    }

    const noOpCreateSqsClient: CreateSQSClientFunc = (): Promise<SQSClient> => Promise.reject("Attempt to invoke no-op")

    it('does nothing if no defined or existing queues', async () => {
        const config = createConfig(false)
        const definedQueues = []

        onListQueuesReturn(sqsClientMock, [])

        const activeQueues = await createAndActivateQueues(noOpCreateSqsClient, config, sqsClient, definedQueues)

        expect(sqsClientMock.commandCalls(CreateQueueCommand).length).toBe(0)
        expect(activeQueues.length).toBe(0)
    })


    it('does nothing if queues defined, not creating queues and no existing queues', async () => {
        const config = createConfig(false)
        const definedQueues: QueueDef[] = [
            queueDef({name: 'Queue1'})
        ]


        onListQueuesReturn(sqsClientMock, [])

        const activeQueues = await createAndActivateQueues(noOpCreateSqsClient, config, sqsClient, definedQueues)

        expect(sqsClientMock.commandCalls(CreateQueueCommand).length).toBe(0)
        expect(activeQueues.length).toBe(0)
    })

    it('does not create queue if create=false', async () => {
        const config = createConfig(true)
        const definedQueues: QueueDef[] = [
            queueDef({name: 'Queue1', create: false})
        ]


        onListQueuesReturn(sqsClientMock, [])

        const activeQueues = await createAndActivateQueues(noOpCreateSqsClient, config, sqsClient, definedQueues)

        expect(sqsClientMock.commandCalls(CreateQueueCommand).length).toBe(0)
        expect(activeQueues.length).toBe(0)
    })

    it('does not create queue if queue is from resources and createQueueFromResources=false', async () => {
        const config = createConfig(false)
        const definedQueues: QueueDef[] = [
            queueDef({name: 'Queue1', source: 'RESOURCES'})
        ]

        onListQueuesReturn(sqsClientMock, [])

        const activeQueues = await createAndActivateQueues(noOpCreateSqsClient, config, sqsClient, definedQueues)

        expect(sqsClientMock.commandCalls(CreateQueueCommand).length).toBe(0)
        expect(activeQueues.length).toBe(0)
    })

    it('does not create queue if queue exists', async () => {
        const config = createConfig(true)
        const definedQueues: QueueDef[] = [
            queueDef({name: 'Queue1'})
        ]

        const existingQueue1 = existingQueue({name: 'Queue1'});
        onListQueuesReturn(sqsClientMock, [existingQueue1.url])
        onGetQueueDetailsReturn(sqsClientMock, existingQueue1)

        const activeQueues = await createAndActivateQueues(noOpCreateSqsClient, config, sqsClient, definedQueues)

        expect(sqsClientMock.commandCalls(CreateQueueCommand).length).toBe(0)
        expect(activeQueues.length).toBe(1)
        expect(activeQueues[0].name).toEqual(existingQueue1.name)
        expect(activeQueues[0].sqsClient).toBe(sqsClientMock)
        expect(activeQueues[0].url).toEqual(existingQueue1.url)
        expect(activeQueues[0].arn).toEqual(existingQueue1.arn)
    })

    it('creates queue if queue does not  exist', async () => {
        const config = createConfig(true)

        const queueDef1 = queueDef({name: 'Queue1'});
        const definedQueues: QueueDef[] = [queueDef1]

        onListQueuesReturn(sqsClientMock, [])
        onCreateQueueReturn(sqsClientMock, queueDef1)

        const createdQueue = existingQueue({name: queueDef1.name});
        onGetQueueDetailsReturn(sqsClientMock, createdQueue)

        const activeQueues = await createAndActivateQueues(noOpCreateSqsClient, config, sqsClient, definedQueues)

        expect(sqsClientMock.commandCalls(CreateQueueCommand).length).toBe(1)

        expect(activeQueues.length).toBe(1)
        expect(activeQueues[0].name).toEqual(queueDef1.name)
        expect(activeQueues[0].sqsClient).toBe(sqsClientMock)
        expect(activeQueues[0].url).toEqual(createdQueue.url)
        expect(activeQueues[0].arn).toEqual(createdQueue.arn)
    })

    it('creates remote queue if uri specified', async () => {
        const config = createConfig(true)

        const queueDef1 = queueDef({
            name: 'Queue1',
            endpoint: 'https://sqs.eu-west-2.amazonaws.com',
            url: 'https://sqs.eu-west-2.amazonaws.com/4445555666/Queue1',
            source:"CONFIG",
            targetType:"REMOTE"
        });

        const definedQueues: QueueDef[] = [queueDef1]
        onListQueuesReturn(sqsClientMock, [])


        const remoteQueueDef = existingQueue({
            name: 'Queue1',
            url: 'https://sqs.eu-west-2.amazonaws.com/4445555666/Queue1',
            arn: 'arn:aws:sqs:eu-west-2:444455556666:Queue1'
        });
        const remoteQueueClientMock = mockClient(SQSClient)
        const remoteQueueClient = remoteQueueClientMock as unknown as SQSClient
        onGetQueueDetailsReturn(remoteQueueClientMock, remoteQueueDef)

        const createSqsClientMock = jest.fn()
        createSqsClientMock.mockReturnValue(remoteQueueClient)

        const activeQueues = await createAndActivateQueues(createSqsClientMock, config, sqsClient, definedQueues)

        expect(sqsClientMock.commandCalls(CreateQueueCommand).length).toBe(0)
        expect(createSqsClientMock).toBeCalledTimes(1)
        expect(createSqsClientMock).toBeCalledWith("eu-west-2", "https://sqs.eu-west-2.amazonaws.com")

        expect(activeQueues.length).toBe(1)
        expect(activeQueues[0].name).toEqual(queueDef1.name)
        expect(activeQueues[0].sqsClient).toBe(remoteQueueClientMock)
        expect(activeQueues[0].url).toEqual(remoteQueueDef.url)
        expect(activeQueues[0].arn).toEqual(remoteQueueDef.arn)
    })
})

