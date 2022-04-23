import {FilterPatterns} from "./filterPatterns/filterGrammar";

export interface DynamoDbStreamsEventDefinition {
    stream: {
        type: "dynamodb"
        arn: string
        enabled?: boolean
        batchSize?:number
        startingPosition?: 'LATEST' | 'TRIM_HORIZON'
        filterPatterns: FilterPatterns[]
    }
}
