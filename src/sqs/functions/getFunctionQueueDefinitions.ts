import {
    ParsedFunctionDefinition,
    SqsEventMappingDefinition,
    StreamsEventMapping
} from "../../StreamFunctionDefinitions";
import {QueueDef} from "../QueueDef";
import {getQueueNameFromArn} from "../utils";
import mergeQueueDefinitions from "./mergeQueueDefinitions";
import PluginConfiguration from "../../PluginConfiguration";
import {StringKeyObject} from "../../utils";

const getFunctionQueueDefinitions = (config: PluginConfiguration, resources: StringKeyObject<any>) =>
    (functionsWithSqsEvents: StringKeyObject<ParsedFunctionDefinition>): QueueDef[] => {
        const getSqsEvents = (f: ParsedFunctionDefinition) => f.events.filter(e => e.type === 'SQS')

        const toQueueDef = (f: ParsedFunctionDefinition, e: StreamsEventMapping): QueueDef => {
            const sourceEvent = e.sourceEvent as SqsEventMappingDefinition;
            const queueName = getQueueNameFromArn(config, resources)(sourceEvent.sqs.arn);
            return ({
                name: queueName,
                fifo: queueName.endsWith(".fifo"),
                handlerFunctions: [f.functionName],
            })
        }

        return mergeQueueDefinitions(
            Object.entries(functionsWithSqsEvents)
                .flatMap(([_, func]) =>
                    getSqsEvents(func)
                        .map((e) => toQueueDef(func, e))
                )
        )
    }

export default getFunctionQueueDefinitions