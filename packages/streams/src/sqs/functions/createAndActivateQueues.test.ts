import {CreateQueueCommand, GetQueueAttributesCommand, ListQueuesCommand, SQSClient} from "@aws-sdk/client-sqs";
import {mockClient} from "aws-sdk-client-mock";
import {SqsPluginConfiguration} from "../../PluginConfiguration";
import createAndActivateQueues, {ExistingQueueDetails} from "./createAndActivateQueues";
import {QueueDef} from "../QueueDef";
import {createQueueUrl, existingQueue, queueDef} from "../testHelpers";

describe('createAndActivateQueues', () => {
    const sqsClientMock = mockClient(SQSClient)
    const sqsClient = sqsClientMock as unknown as SQSClient

    beforeEach(() => {
        sqsClientMock.reset()
    })

    const createConfig = (createQueuesFromResources: boolean): SqsPluginConfiguration => ({
        createQueuesFromResources
    })

    const onListQueuesReturn = (QueueUrls: string[]) => {
        sqsClientMock.on(ListQueuesCommand).resolves({QueueUrls})
    }

    const onGetQueueDetailsReturn = (details: ExistingQueueDetails) => {
        sqsClientMock.on(GetQueueAttributesCommand, {QueueUrl: details.queueUrl}).resolves({
            Attributes: {
                QueueName: details.name,
                QueueUrl: details.queueUrl,
                QueueArn: details.queueArn,
            }
        })
    }

    const onCreateQueueReturn = (queue: QueueDef) => {
        sqsClientMock.on(CreateQueueCommand, {
            QueueName: queue.name,
            Attributes: {
                VisibilityTimeout: queue.visibilityTimeout?.toString(),
                DelaySeconds: queue.delaySeconds?.toString(),
                FifoQueue: queue.fifo.toString()
            }
        }).resolves({QueueUrl: createQueueUrl(queue.name)})
    }

    it('does nothing if no defined or existing queues', async () => {
        const config = createConfig(false)
        const definedQueues = []

        onListQueuesReturn([])

        const activeQueues = await createAndActivateQueues(config, sqsClient, definedQueues)

        expect(sqsClientMock.commandCalls(CreateQueueCommand).length).toBe(0)
        expect(activeQueues.length).toBe(0)
    })


    it('does nothing if queues defined, not creating queues and no existing queues', async () => {
        const config = createConfig(false)
        const definedQueues: QueueDef[] = [
            queueDef({name: 'Queue1'})
        ]


        onListQueuesReturn([])

        const activeQueues = await createAndActivateQueues(config, sqsClient, definedQueues)

        expect(sqsClientMock.commandCalls(CreateQueueCommand).length).toBe(0)
        expect(activeQueues.length).toBe(0)
    })

    it('does not create queue if create=false', async () => {
        const config = createConfig(true)
        const definedQueues: QueueDef[] = [
            queueDef({name: 'Queue1', create: false})
        ]


        onListQueuesReturn([])

        const activeQueues = await createAndActivateQueues(config, sqsClient, definedQueues)

        expect(sqsClientMock.commandCalls(CreateQueueCommand).length).toBe(0)
        expect(activeQueues.length).toBe(0)
    })

    it('does not create queue if queue is from resources and createQueueFromResources=false', async () => {
        const config = createConfig(false)
        const definedQueues: QueueDef[] = [
            queueDef({name: 'Queue1', source: 'RESOURCES'})
        ]

        onListQueuesReturn([])

        const activeQueues = await createAndActivateQueues(config, sqsClient, definedQueues)

        expect(sqsClientMock.commandCalls(CreateQueueCommand).length).toBe(0)
        expect(activeQueues.length).toBe(0)
    })

    it('does not create queue if queue exists', async () => {
        const config = createConfig(true)
        const definedQueues: QueueDef[] = [
            queueDef({name: 'Queue1'})
        ]

        const existingQueue1 = existingQueue({name: 'Queue1'});
        onListQueuesReturn([existingQueue1.queueUrl])
        onGetQueueDetailsReturn(existingQueue1)

        const activeQueues = await createAndActivateQueues(config, sqsClient, definedQueues)

        expect(sqsClientMock.commandCalls(CreateQueueCommand).length).toBe(0)
        expect(activeQueues.length).toBe(1)
        expect(activeQueues[0].name).toEqual(existingQueue1.name)
        expect(activeQueues[0].queueUrl).toEqual(existingQueue1.queueUrl)
        expect(activeQueues[0].queueArn).toEqual(existingQueue1.queueArn)
    })

    it('creates queue if queue does not  exist', async () => {
        const config = createConfig(true)

        const queueDef1 = queueDef({name: 'Queue1'});
        const definedQueues: QueueDef[] = [queueDef1]

        onListQueuesReturn([])
        onCreateQueueReturn(queueDef1)

        const createdQueue = existingQueue({name: queueDef1.name});
        onGetQueueDetailsReturn(createdQueue)

        const activeQueues = await createAndActivateQueues(config, sqsClient, definedQueues)

        expect(sqsClientMock.commandCalls(CreateQueueCommand).length).toBe(1)

        expect(activeQueues.length).toBe(1)
        expect(activeQueues[0].name).toEqual(queueDef1.name)
        expect(activeQueues[0].queueUrl).toEqual(createdQueue.queueUrl)
        expect(activeQueues[0].queueArn).toEqual(createdQueue.queueArn)
    })
})

