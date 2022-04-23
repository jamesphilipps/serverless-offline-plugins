import {getDefaultPluginConfiguration} from "../../PluginConfiguration";
import getQueuesToCreate from "./getQueuesToCreate";
import {QueueDef} from "../QueueDef";

const queueDef = (name: string, handlerFunctions: string[], resourceKey?: string, create?:boolean): QueueDef => ({
    resourceKey,
    name,
    handlerFunctions,
    create,
    fifo: name.endsWith('.fifo'),
})

const resourceQueueDef = (name: string, resourceKey: string): QueueDef => queueDef(name, [], resourceKey)
const functionQueueDef = (name: string, handlerFunctions: string[]): QueueDef => queueDef(name, handlerFunctions)
const configQueueDef = (name: string, create?:boolean): QueueDef => queueDef(name, [], undefined,create)

describe('getQueuesToCreate', () => {

    describe('createQueuesFromResources is false', () => {
        const config = getDefaultPluginConfiguration()
        config.sqs.createQueuesFromResources = false
        const func = getQueuesToCreate(config)

        it('uses only config queues', () => {
            const resourceQueueDefinitions = [resourceQueueDef('rqueue1', 'rq1'),]
            const configQueueDefinitions = [configQueueDef('cqueue1')]

            const queues = func(resourceQueueDefinitions,   configQueueDefinitions)
            expect(queues.length).toBe(1)
            expect(queues[0]).toEqual(configQueueDefinitions[0])
        })

        it('does not create queues where create=false', () => {
            const configQueueDefinitions = [
                configQueueDef('cqueue1'),
                {...configQueueDef('cqueue3'), create: false},
            ]

            const queues = func([],   configQueueDefinitions)
            expect(queues.length).toBe(1)
            expect(queues[0].name).toEqual('cqueue1')
        })
    })

    describe('createQueuesFromResources is true', () => {
        const config = getDefaultPluginConfiguration()
        config.sqs.createQueuesFromResources = true
        const func = getQueuesToCreate(config)

        it('uses resource and config queues', () => {
            const resourceQueueDefinitions = [resourceQueueDef('rqueue1', 'rq1'),]
            const configQueueDefinitions = [configQueueDef('cqueue1')]

            const queues = func(resourceQueueDefinitions, configQueueDefinitions)
            expect(queues.length).toBe(2)
            expect(queues[0]).toEqual(configQueueDefinitions[0])
            expect(queues[1]).toEqual(resourceQueueDefinitions[0])
        })

        it('does not create queues where create=false', () => {
            const configQueueDefinitions = [
                configQueueDef('cqueue1'),
                {...configQueueDef('cqueue3'), create: false},
            ]

            const queues = func([],   configQueueDefinitions)
            expect(queues.length).toBe(1)
            expect(queues[0].name).toEqual('cqueue1')
        })
    })
})

