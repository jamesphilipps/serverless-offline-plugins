import {QueueDef} from "../QueueDef";
import mergeQueueDefinitions from "./mergeQueueDefinitions";
import PluginConfiguration, {ConfigurationQueueDef} from "../../PluginConfiguration";

const getConfigQueueDefinitions = (config: PluginConfiguration): QueueDef[] => {
    const toQueueDef = (v: ConfigurationQueueDef): QueueDef => {
        const {name, visibilityTimeout, delaySeconds} = v
        return ({
            name,
            visibilityTimeout,
            delaySeconds,
            fifo: name.endsWith(".fifo"),
            handlerFunctions: [],
        })
    }

    const configQueues = config.sqs?.queues || [];
    return mergeQueueDefinitions(configQueues.map(toQueueDef))
}

export default getConfigQueueDefinitions