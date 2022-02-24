import {DynamoDbStreamsEventDefinition} from "./dynamodb/types";
import {Event} from "./dynamodb/support";

export interface FunctionDefinition {
    name?: string
    handler?: string
    role?: string
    events?: Event[]
}

export interface SlsOfflineLambdaFunctionDefinition {
    functionKey: string
    functionDefinition: FunctionDefinition
}