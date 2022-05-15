import {QueueDef} from "../QueueDef";
import mergeQueueDefinitions from "./mergeQueueDefinitions";
import PluginConfiguration, {ConfigurationQueueDef} from "../../PluginConfiguration";

const getQueueDefinitionsFromConfig = (config: PluginConfiguration): QueueDef[] => {
    const configQueues = config.sqs?.queues || [];
    return mergeQueueDefinitions(configQueues.map((v) => {
        const {name, aliases, visibilityTimeout, delaySeconds} = v
        return {
            name,
            aliases: aliases || [],
            visibilityTimeout,
            delaySeconds,
            fifo: name.endsWith(".fifo"),
            handlerFunctions: [],
        }
    }))
}

export default getQueueDefinitionsFromConfig