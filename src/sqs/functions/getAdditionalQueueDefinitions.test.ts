import PluginConfiguration, {AdditionalQueue} from "../../PluginConfiguration";
import getAdditionalQueueDefinitions from "./getAdditionalQueueDefinitions";


describe('getAdditionalQueueDefinitions', () => {
    const func = getAdditionalQueueDefinitions

    it('parses queues correctly from additional queues', () => {
        const additionalQueues: AdditionalQueue[] = [
            {name: 'queue1'},
            {name: 'queue2'},
            {name: 'queue2'},
            {name: 'queue3.fifo'},
        ]

        const config: PluginConfiguration = {sqs: {additionalQueues}}
        const queueDefs = func(config)
        expect(queueDefs.length).toBe(3)

        expect(queueDefs[0].name).toBe('queue1')
        expect(queueDefs[0].fifo).toBeFalsy()
        expect(queueDefs[0].handlerFunctions).toEqual([])
        expect(queueDefs[0].resourceKey).toBeUndefined()
        expect(queueDefs[0].delaySeconds).toBeUndefined()
        expect(queueDefs[0].visibilityTimeout).toBeUndefined()

        expect(queueDefs[1].name).toBe('queue2')
        expect(queueDefs[1].fifo).toBeFalsy()
        expect(queueDefs[1].handlerFunctions).toEqual([])
        expect(queueDefs[1].resourceKey).toBeUndefined()
        expect(queueDefs[1].delaySeconds).toBeUndefined()
        expect(queueDefs[1].visibilityTimeout).toBeUndefined()

        expect(queueDefs[2].name).toBe('queue3.fifo')
        expect(queueDefs[2].fifo).toBeTruthy()
        expect(queueDefs[2].handlerFunctions).toEqual([])
        expect(queueDefs[2].resourceKey).toBeUndefined()
        expect(queueDefs[2].delaySeconds).toBeUndefined()
        expect(queueDefs[2].visibilityTimeout).toBeUndefined()
    })
})

