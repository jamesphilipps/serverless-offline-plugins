import {QueueDef} from "../QueueDef";
import mergeQueueDefinitions from "./mergeQueueDefinitions";
import PluginConfiguration from "../../PluginConfiguration";

const getQueuesToCreate = (config: PluginConfiguration) =>
    (resourceQueueDefinitions: QueueDef[], configQueueDefinitions: QueueDef[]): QueueDef[] => {
        const createdConfigDefinitions = configQueueDefinitions.filter(queue => queue.create !== false)

        const definitionsToCreate = config.sqs.createQueuesFromResources ?
            createdConfigDefinitions.concat(resourceQueueDefinitions) :
            createdConfigDefinitions

        // Merge duplicates
        return mergeQueueDefinitions(definitionsToCreate)
    }

export default getQueuesToCreate


