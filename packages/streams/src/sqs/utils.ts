import PluginConfiguration from "../PluginConfiguration";
import {extractResourceNameFromArn, StringKeyObject} from "../utils";
import getQueueDefinitionsFromResources from "./functions/getQueueDefinitionsFromResources";

// TODO: test
export const getQueueNameFromArnString = (arn: string) => getQueueNameFromArnParts(arn.split(":"))
export const getQueueNameFromArnParts = (parts: string[]) => parts[5]
export const getQueueNameFromArn = (config: PluginConfiguration, resources: StringKeyObject<any>) => (arn: any) => {
    return extractResourceNameFromArn(
        getQueueNameFromArnParts,
        (key) => getQueueDefinitionsFromResources(resources)
            .filter(queue => queue.resourceKey === key)
            .map(queue => queue.name)
            .find(_ => true),
    )(arn)
}

