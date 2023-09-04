import {DeleteQueueCommand, ListQueuesCommand, SQSClient} from "@aws-sdk/client-sqs";
import {mockClient} from "aws-sdk-client-mock";
import deleteQueues from "./deleteQueues";

describe('deleteQueues', () => {
    const sqsClientMock = mockClient(SQSClient)
    const sqsClient = sqsClientMock as unknown as SQSClient

    beforeEach(() => {
        sqsClientMock.reset()
    })

    it('does nothing if no queues', async () => {
        const QueueUrls: string[] = []
        sqsClientMock.on(ListQueuesCommand).resolves({QueueUrls})
        await deleteQueues(sqsClient)

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
        await deleteQueues(sqsClient)

        expect(sqsClientMock.calls().length).toBe(3)
        expect(sqsClientMock.commandCalls(ListQueuesCommand).length).toBe(1)

        expect(sqsClientMock.commandCalls(DeleteQueueCommand).length).toBe(2)
        expect(sqsClientMock.commandCalls(DeleteQueueCommand, {QueueUrl: QueueUrls[0]}).length).toBe(1)
        expect(sqsClientMock.commandCalls(DeleteQueueCommand, {QueueUrl: QueueUrls[1]}).length).toBe(1)
    })
})

