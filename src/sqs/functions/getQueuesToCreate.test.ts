import {getDefaultPluginConfiguration} from "../../PluginConfiguration";
import getQueuesToCreate from "./getQueuesToCreate";
import {QueueDef} from "../QueueDef";

const queueDef = (name: string, handlerFunctions: string[], resourceKey?: string): QueueDef => ({
    resourceKey,
    name,
    handlerFunctions,
    fifo: name.endsWith('.fifo'),
})

const resourceQueueDef = (name: string, resourceKey: string): QueueDef => queueDef(name, [], resourceKey)
const functionQueueDef = (name: string, handlerFunctions: string[]): QueueDef => queueDef(name, handlerFunctions)
const additionalQueueDef = (name: string): QueueDef => queueDef(name, [])

describe('getQueuesToCreate', () => {

    describe('createQueuesFromResources is false', () => {
        const config = getDefaultPluginConfiguration()
        config.sqs.createQueuesFromResources = false
        const func = getQueuesToCreate(config)

        it('uses only function queues if no additional queues specified', () => {
            const resourceQueueDefinitions = [resourceQueueDef('rqueue1', 'rq1'),]
            const functionQueueDefinitions = [functionQueueDef('fqueue1', ['f1']),]

            const queues = func(resourceQueueDefinitions, functionQueueDefinitions, [])
            expect(queues.length).toBe(1)
            expect(queues).toEqual(functionQueueDefinitions)
        })

        it('uses only function queues and additional queues', () => {
            const resourceQueueDefinitions = [resourceQueueDef('rqueue1', 'rq1'),]
            const functionQueueDefinitions = [functionQueueDef('fqueue1', ['f1']),]
            const additionalQueueDefinitions = [additionalQueueDef('aqueue1')]

            const queues = func(resourceQueueDefinitions, functionQueueDefinitions, additionalQueueDefinitions)
            expect(queues.length).toBe(2)
            expect(queues[0]).toEqual(functionQueueDefinitions[0])
            expect(queues[1]).toEqual(additionalQueueDefinitions[0])
        })

        it('merges function queues', () => {
            const resourceQueueDefinitions = [resourceQueueDef('rqueue1', 'rq1'),]
            const functionQueueDefinitions = [
                functionQueueDef('fqueue1', ['f1']),
                functionQueueDef('fqueue1', ['f2']),
                functionQueueDef('fqueue2', ['f2']),
            ]

            const queues = func(resourceQueueDefinitions, functionQueueDefinitions, [])
            expect(queues.length).toBe(2)

            expect(queues[0].name).toEqual('fqueue1')
            expect(queues[0].handlerFunctions).toEqual(['f1', 'f2'])

            expect(queues[1].name).toEqual('fqueue2')
            expect(queues[1].handlerFunctions).toEqual(['f2'])
        })
    })

    describe('createQueuesFromResources is true', () => {
        const config = getDefaultPluginConfiguration()
        config.sqs.createQueuesFromResources = true
        const func = getQueuesToCreate(config)

        it('uses resource and function queues if no additional queues specified', () => {
            const resourceQueueDefinitions = [resourceQueueDef('rqueue1', 'rq1'),]
            const functionQueueDefinitions = [functionQueueDef('fqueue1', ['f1']),]

            const queues = func(resourceQueueDefinitions, functionQueueDefinitions, [])
            expect(queues.length).toBe(2)
            expect(queues[0]).toEqual(functionQueueDefinitions[0])
            expect(queues[1]).toEqual(resourceQueueDefinitions[0])
        })

        it('uses resource, function and additional queues if no additional queues specified', () => {
            const resourceQueueDefinitions = [resourceQueueDef('rqueue1', 'rq1'),]
            const functionQueueDefinitions = [functionQueueDef('fqueue1', ['f1']),]
            const additionalQueueDefinitions = [additionalQueueDef('aqueue1')]

            const queues = func(resourceQueueDefinitions, functionQueueDefinitions, additionalQueueDefinitions)
            expect(queues.length).toBe(3)
            expect(queues[0]).toEqual(functionQueueDefinitions[0])
            expect(queues[1]).toEqual(additionalQueueDefinitions[0])
            expect(queues[2]).toEqual(resourceQueueDefinitions[0])
        })

        it('merges function queues', () => {
            const resourceQueueDefinitions = [resourceQueueDef('rqueue1', 'rq1'),]
            const functionQueueDefinitions = [
                functionQueueDef('fqueue1', ['f1']),
                functionQueueDef('fqueue1', ['f2']),
                functionQueueDef('fqueue2', ['f2']),
            ]

            const queues = func(resourceQueueDefinitions, functionQueueDefinitions, [])
            expect(queues.length).toBe(3)

            expect(queues[0].name).toEqual('fqueue1')
            expect(queues[0].handlerFunctions).toEqual(['f1', 'f2'])

            expect(queues[1].name).toEqual('fqueue2')
            expect(queues[1].handlerFunctions).toEqual(['f2'])

            expect(queues[2].name).toEqual('rqueue1')
            expect(queues[2].handlerFunctions).toEqual([])
        })
    })
})

