import {DynamoDbStreamsEventDefinition} from "./types";
import {StringKeyObject} from "../utils";
import {FunctionDefinition, SlsOfflineLambdaFunctionDefinition} from "../types";
import {getLogger} from "../logging";

export type Event = DynamoDbStreamsEventDefinition | any

export interface FunctionWithStreamEvents extends SlsOfflineLambdaFunctionDefinition {
    events: DynamoDbStreamsEventDefinition[]
}

export const getFunctionsWithStreamEvents = (
    getFunction: (functionKey: string) => FunctionDefinition
) => (functions: string[]): FunctionWithStreamEvents[] => functions
    .map((functionKey) => {
        const functionDefinition = getFunction(functionKey)
        return {functionKey, functionDefinition, events: getStreamEvents(functionDefinition)}
    })
    .filter(({events}) => events.length > 0)

const getStreamEvents = (functionDef: FunctionDefinition): DynamoDbStreamsEventDefinition[] => functionDef.events
    .filter(event => event?.stream?.type === 'dynamodb')
    .map(event => event as DynamoDbStreamsEventDefinition)

export const getTableName = (resources: StringKeyObject<any>) => (resourceKey: string) => {
    getLogger(). info(JSON.stringify(resources))
    const tableName = resources[resourceKey]?.Properties?.TableName
    if (!tableName) throw Error(`Could not find table name at '${resourceKey}.Properties.TableName'`)
    return tableName
}