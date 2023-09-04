import {FunctionDefinition} from "serverless";
import {Event, getFunctionsWithStreamEvents} from "./support";
import {StringKeyObject} from "../utils";

describe("getFunctionsWithStreamEvents", () => {
    it("filters events correctly", () => {
        const createFunction = (name: string, events: Event[]) => ({name, events})
        const createApiEvent = () => ({http: {path: '/hello', method: 'post'}})
        const createStreamEvent = () => ({stream: {type: 'kinesis', arn: 'arn:aws:kinesis:region:XXXX'}})
        const createDynamoStreamEvent = (arn: string) => ({stream: {type: 'dynamodb', arn}})

        const functions: StringKeyObject<FunctionDefinition> = {
            f1: createFunction("f1", [
                createApiEvent()
            ]),
            f2: createFunction("f2", [
                createStreamEvent()
            ]),
            f3: createFunction("f3", [
                createDynamoStreamEvent("dynamo1")
            ]),
            f4: createFunction("f4", [
                createApiEvent(),
                createDynamoStreamEvent("dynamo2")
            ]),
            f5: createFunction("f6", [
                createStreamEvent(),
                createDynamoStreamEvent("dynamo3")
            ]),
            f6: createFunction("f6", [
                createDynamoStreamEvent("dynamo4"),
                createDynamoStreamEvent("dynamo5")
            ]),
        }
        const getFunction = (key: string) => functions[key]

        const result = getFunctionsWithStreamEvents(getFunction)(Object.keys(functions))
        expect(result.length).toEqual(4)

        const r0 = result[0] as any
        expect(r0.functionKey).toEqual("f3")
        expect(r0.functionDefinition).toEqual(functions['f3'])
        expect(r0.events.length).toEqual(1)
        expect(r0.events[0]).toEqual(functions['f3'].events[0])

        const r1 = result[1] as any
        expect(r1.functionKey).toEqual("f4")
        expect(r1.functionDefinition).toEqual(functions['f4'])
        expect(r1.events.length).toEqual(1)
        expect(r1.events[0]).toEqual(functions['f4'].events[1])

        const r2 = result[2] as any
        expect(r2.functionKey).toEqual("f5")
        expect(r2.functionDefinition).toEqual(functions['f5'])
        expect(r2.events.length).toEqual(1)
        expect(r2.events[0]).toEqual(functions['f5'].events[1])

        const r3 = result[3] as any
        expect(r3.functionKey).toEqual("f6")
        expect(r3.functionDefinition).toEqual(functions['f6'])
        expect(r3.events.length).toEqual(2)
        expect(r3.events[0]).toEqual(functions['f6'].events[0])
        expect(r3.events[1]).toEqual(functions['f6'].events[1])
    })
})