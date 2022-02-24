import {QueueDef} from "../QueueDef";
import mergeQueueDefinitions from "./mergeQueueDefinitions";
import PluginConfiguration, {AdditionalQueue} from "../../PluginConfiguration";

const getAdditionalQueueDefinitions = (config: PluginConfiguration): QueueDef[] => {
    const toQueueDef = (v: AdditionalQueue): QueueDef => {
        const {name} = v
        return ({
            name,
            fifo: name.endsWith(".fifo"),
            handlerFunctions: [],
        })
    }

    const additionalQueues = config.sqs?.additionalQueues || [];
    return mergeQueueDefinitions(additionalQueues.map(toQueueDef))
}

export default getAdditionalQueueDefinitions