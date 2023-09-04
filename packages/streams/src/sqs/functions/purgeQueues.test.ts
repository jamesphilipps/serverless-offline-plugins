import {ListQueuesCommand, PurgeQueueCommand, SQSClient} from "@aws-sdk/client-sqs";
import {mockClient} from "aws-sdk-client-mock";
import purgeQueues from "./purgeQueues";

describe('setupQueues', () => {
    const sqsClientMock = mockClient(SQSClient)
    const sqsClient = sqsClientMock as unknown as SQSClient

    beforeEach(() => {
        sqsClientMock.reset()
    })

    const invoke = async () => purgeQueues(sqsClient)

    it('does nothing if no queues', async () => {
        const QueueUrls :string[]= []
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
