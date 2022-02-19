import {QueueDef} from "../QueueDef";
import mergeQueueDefinitions from "./mergeQueueDefinitions";
import PluginConfiguration from "../../PluginConfiguration";

const getQueuesToCreate = (config: PluginConfiguration) => (resourceQueueDefinitions: QueueDef[], functionQueueDefinitions: QueueDef []): QueueDef[] => {
    const definitionsToCreate = config.sqs.createQueuesFromResources ?
        functionQueueDefinitions.concat(resourceQueueDefinitions) :
        functionQueueDefinitions

    // Merge duplicates
    return mergeQueueDefinitions(definitionsToCreate)
}

export default getQueuesToCreate


