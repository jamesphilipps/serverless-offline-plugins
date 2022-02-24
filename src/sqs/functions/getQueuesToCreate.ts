import {QueueDef} from "../QueueDef";
import mergeQueueDefinitions from "./mergeQueueDefinitions";
import PluginConfiguration from "../../PluginConfiguration";

const getQueuesToCreate = (config: PluginConfiguration) => (
    resourceQueueDefinitions: QueueDef[],
    functionQueueDefinitions: QueueDef [],
    additionalQueueDefinitions: QueueDef[]): QueueDef[] => {
    const alwaysCreatedDefinitions = functionQueueDefinitions.concat(additionalQueueDefinitions)

    const definitionsToCreate = config.sqs.createQueuesFromResources ?
        alwaysCreatedDefinitions.concat(resourceQueueDefinitions) :
        alwaysCreatedDefinitions

    // Merge duplicates
    return mergeQueueDefinitions(definitionsToCreate)
}

export default getQueuesToCreate


