import {ActiveQueueDef} from "../QueueDef";
import mergeQueueDefinitions from "./mergeQueueDefinitions";
import {SqsPluginConfiguration} from "../../PluginConfiguration";
import {StringKeyObject} from "../../utils";
import {
    ParsedFunctionDefinition,
    SqsEventMappingDefinition,
    StreamsEventMapping
} from "../../StreamFunctionDefinitions";
import {getLogger,} from "../../logging";
import {getQueueNameFromArn} from "../utils";

const bindHandlersToQueues = (
    config: SqsPluginConfiguration,
    resources: StringKeyObject<any>,
    queues: ActiveQueueDef[],
    functionsWithSqsEvents: StringKeyObject<ParsedFunctionDefinition>
): ActiveQueueDef[] => {
    const getSqsEvents = (f: ParsedFunctionDefinition) => f.events.filter(e => e.type === 'SQS')

    const queueMap = Object.fromEntries(
        queues.flatMap(queue => //
            [queue.name, ...queue.aliases].map(alias => [alias, queue] as [string, ActiveQueueDef]) //
        )
    )

    const eventMappings = Object.entries(functionsWithSqsEvents)
        .map(([_, func]) => [func.functionName, getSqsEvents(func)] as [string, StreamsEventMapping[]])

    // Create a new queue definition for each eventMapping, cloned from the active queue definition, then merge
    // the duplicate definitions together to combine the handlers
    return mergeQueueDefinitions(
        eventMappings.flatMap(([functionName, eventMappings]) => {
            return eventMappings.map(e => {
                const sourceEvent = e.sourceEvent as SqsEventMappingDefinition;
                const arn = sourceEvent.sqs.arn;
                const arnStr = typeof arn === 'object' ? JSON.stringify(arn) : arn


                const targetQueueName = getQueueNameFromArn(config.endpoint, resources)(sourceEvent.sqs.arn)
                const originalQueueDef = queueMap[targetQueueName]

                if (originalQueueDef) {
                    return {...originalQueueDef, handlerFunctions: [functionName]} as ActiveQueueDef
                } else {
                    // Warn the user or error if there isn't an active queue definition for this event binding
                    const message = `No queue definition with arn: '${arnStr}' found, but it was referenced by an event mapping in function: '${functionName}'`
                    if (config.errorOnMissingQueueDefinition) throw Error(message)
                    else getLogger().info(`WARNING: ${message}`)
                    return undefined
                }
            }).filter(v => !!v)
        })
    )

}

export default bindHandlersToQueues