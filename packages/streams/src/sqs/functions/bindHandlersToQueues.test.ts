import PluginConfiguration from "../../PluginConfiguration";
import {StringKeyObject} from "../../utils";
import {ParsedFunctionDefinition} from "../../StreamFunctionDefinitions";
import bindHandlersToQueues from "./bindHandlersToQueues";
import {ActiveQueueDef} from "../QueueDef";


describe('bindHandlersToQueues', () => {

    const createFunction = (functionName: string, handler: string, queueArns: string[]): StringKeyObject<ParsedFunctionDefinition> => ({
        [functionName]: {
            functionName,
            handler,
            events: queueArns.map(arn => ({
                type: "SQS",
                sourceEvent: {sqs: {arn}}
            }))
        }
    })

    const arn = (queueName: string) => `arn:aws:sqs:eu-west-1:444455556666:${queueName}`

    const queueDef = (name: string): ActiveQueueDef => ({
        name,
        fifo: false,
        handlerFunctions: [],
        aliases: [],
        queueUrl: 'http://localhost',
        queueArn: arn(name)
    })

    it('binds and merges handlers', () => {
        const functions: StringKeyObject<ParsedFunctionDefinition> = {
            ...createFunction('func1', 'handler1', [arn('queue1'), arn('queue2')]),
            ...createFunction('func2', 'handler2', [arn('queue2'), arn('queue3')]),
        }

        const queues: ActiveQueueDef[] = [
            queueDef('queue1'),
            queueDef('queue2'),
            queueDef('queue3'),
        ]

        const config: PluginConfiguration = {sqs: {errorOnMissingQueueDefinition: true}}

        const boundQueues = bindHandlersToQueues(config, {}, queues, functions)

        expect(boundQueues.length).toBe(3)
        expect(boundQueues[0]).toEqual({...queues[0], handlerFunctions: ['func1']})
        expect(boundQueues[1]).toEqual({...queues[1], handlerFunctions: ['func1', 'func2']})
        expect(boundQueues[2]).toEqual({...queues[2], handlerFunctions: ['func2']})
    })

    it('throws error if errorOnMissingQueueDefinition=true and queue missing', () => {
        const functions: StringKeyObject<ParsedFunctionDefinition> = {
            ...createFunction('func1', 'handler1', [arn('queue2')]),
        }

        const queues: ActiveQueueDef[] = [
            queueDef('queue1'),
        ]

        const config: PluginConfiguration = {sqs: {errorOnMissingQueueDefinition: true}}
        expect(() => bindHandlersToQueues(config, {}, queues, functions))
            .toThrow(`No queue definition with arn: '${arn('queue2')}' found, but it was referenced by an event mapping in function: 'func1'`)
    })

    it('does not error if errorOnMissingQueueDefinition=false and queue missing', () => {
        const functions: StringKeyObject<ParsedFunctionDefinition> = {
            ...createFunction('func1', 'handler1', [arn('queue2')]),
        }

        const queues: ActiveQueueDef[] = [
            queueDef('queue1'),
        ]

        const config: PluginConfiguration = {sqs: {errorOnMissingQueueDefinition: false}}
        const boundQueues = bindHandlersToQueues(config, {}, queues, functions)
        expect(boundQueues.length).toBe(0)
    })

    it('scans resources for Ref arn', () => {
        const functions: StringKeyObject<ParsedFunctionDefinition> = {
            ...createFunction('func1', 'handler1', [arn('queue2')]),
        }

        const resources = {
            k3: {name: "RES3"},
            k4: {name: "RES4"}
        }


        const queues: ActiveQueueDef[] = [
            queueDef('queue1'),
        ]

        const config: PluginConfiguration = {sqs: {errorOnMissingQueueDefinition: false}}
        const boundQueues = bindHandlersToQueues(config, {}, queues, functions)
        expect(boundQueues.length).toBe(0)
    })
})

