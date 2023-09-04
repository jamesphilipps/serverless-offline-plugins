import {FilterPatterns} from "./dynamodb/filterPatterns/filterGrammar";
import * as Serverless from "serverless";
import {StringKeyObject} from "./utils";


export interface FunctionDefinition<EventType> {
    handler: string
    events: Array<EventType>
}

type ServerlessFunctionDefinition = FunctionDefinition<StringKeyObject<any>>

export interface ParsedFunctionDefinition extends FunctionDefinition<StreamsEventMapping> {
    functionName: string
}

export interface SqsEventMappingDefinition {
    sqs: {
        arn: string
        batchSize?: number
    }
}

export interface DynamoEventMappingDefinition {
    stream: {
        type: "dynamodb"
        arn: string
        enabled?: boolean
        batchSize?: number
        startingPosition?: 'LATEST' | 'TRIM_HORIZON'
        filterPatterns: FilterPatterns[]
    }
}

type StreamsEventMappingDefinition = SqsEventMappingDefinition | DynamoEventMappingDefinition

type StreamsFunctionType = 'DYNAMO' | 'SQS'

export interface StreamsEventMapping {
    type: StreamsFunctionType
    sourceEvent: StreamsEventMappingDefinition
}

export const getFunctionDefinitionsWithStreamsEvents = (serverless: Serverless, type?: StreamsFunctionType): StringKeyObject<ParsedFunctionDefinition> => {
    const {service} = serverless
    const rawFunctionsConfig = (serverless as unknown as any).configurationInput.functions as StringKeyObject<any>

    const zipWithIndex = <T>(v: T, i: number) => [v, i] as [T, number]

    const parseFilterPatterns = (functionName: string, eventIndex: number) => {
        return rawFunctionsConfig[functionName]?.events[eventIndex]?.stream?.filterPatterns
    };

    const isValidStreamsEvent = (event: any) => (!type && event.sqs || event.stream) ||
        (type === 'DYNAMO' && event?.stream?.type === 'dynamodb') ||
        (type === 'SQS' && event?.sqs)

    const toSqsStreamsEventMapping = (event: StringKeyObject<any>): StreamsEventMapping => ({
        type: 'SQS',
        sourceEvent: event as SqsEventMappingDefinition
    })

    const toDynamoStreamsEventMapping = (functionName: string, event: StringKeyObject<any>, eventIndex: number): StreamsEventMapping => ({
        type: 'DYNAMO',
        sourceEvent: {
            ...event,
            stream: {
                ...event['stream'],
                filterPatterns: event['filterPatterns'] ? parseFilterPatterns(functionName, eventIndex) : undefined
            }
        }
    })

    const toStreamsEventMapping = (functionName: string, event: StringKeyObject<any>, eventIndex: number): StreamsEventMapping => {
        if (event['sqs']) return toSqsStreamsEventMapping(event)
        if (event['stream']) return toDynamoStreamsEventMapping(functionName, event, eventIndex)
        throw Error("Unable to parse streams event mapping")
    }

    const parseFunctionWithStreamsEvents = (functionName: string): ParsedFunctionDefinition => {
        const functionDef = service.getFunction(functionName) as ServerlessFunctionDefinition
        return {
            functionName,
            ...functionDef,
            events: functionDef.events
                .map(zipWithIndex)
                .filter(([e]) => isValidStreamsEvent(e))
                .map(([e, i]) => toStreamsEventMapping(functionName, e, i)),
        }
    }

    const hasStreamsEvents = (functionDef: ParsedFunctionDefinition) => functionDef.events.length > 0
    const zipWithName = (functionDef: ParsedFunctionDefinition) => [functionDef.functionName, functionDef] as [string, ParsedFunctionDefinition]

    return Object.fromEntries(
        service.getAllFunctions()
            .map(parseFunctionWithStreamsEvents)
            .filter(hasStreamsEvents)
            .map(zipWithName)
    )
}


