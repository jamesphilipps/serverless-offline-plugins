import {DynamoDbStreamsEventDefinition} from "./types";
import {StringKeyObject} from "../utils";
import {FunctionDefinition} from "../types";
import {getLogger} from "../logging";
import {Lambda as LambdaType} from 'serverless-offline/lambda'

export type Event = DynamoDbStreamsEventDefinition | any

export interface FunctionWithStreamEvents {
    functionKey: string
    functionDefinition: any
    events: DynamoDbStreamsEventDefinition[]
}

export const getFunctionsWithStreamEvents = (
    getFunction: (functionKey: string) => FunctionDefinition
) => (functions: string[]): LambdaType[] => functions
    .map((functionKey) => {
        const functionDefinition = getFunction(functionKey)
        return {functionKey, functionDefinition, events: getStreamEvents(functionDefinition)} as any
    })
    .filter(({events}) => events.length > 0) as LambdaType []

const getStreamEvents = (functionDef: FunctionDefinition): DynamoDbStreamsEventDefinition[] => functionDef.events!
    .filter(event => event?.stream?.type === 'dynamodb')
    .map(event => event as DynamoDbStreamsEventDefinition)

export const getTableName = (resources: StringKeyObject<any>) => (resourceKey: string) => {
    getLogger().info(JSON.stringify(resources))
    const tableName = resources[resourceKey]?.Properties?.TableName
    if (!tableName) throw Error(`Could not find table name at '${resourceKey}.Properties.TableName'`)
    return tableName
}