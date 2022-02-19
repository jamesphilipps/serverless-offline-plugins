import {StringKeyObject} from "../common";
import * as Serverless from "serverless";
import {SLS_CUSTOM_OPTION} from "../constants";
import {QueueDef} from "./QueueDef";


// TODO: move to top level utils
const extractResourceNameFromArn = (
    arnExtract: (parts: string[]) => string,
    getNameFromResources: (key: string) => string,
    resourceNameMappingPath: string,
    getNameFromMappings: (key: string) => string
) => (arn: any) => {
    if (typeof arn === 'string') {
        if (arn.startsWith("arn:")) {
            // AWS Arn. Parse the resource name from the string
            return arnExtract(arn.split(":"))
        } else {
            // Probably an output reference. Use directly as a key to the defined resources
            const resourceName = getNameFromMappings(arn)
            if (!resourceName)
                throw Error(`No resource defined with key: '${arn}'. Add a resource with this key'`)
        }
    } else if (Array.isArray(arn) && arn.length === 2) {
        // An attribute reference to a resource defined within the stack. Check the defined resources
        const resourceName = getNameFromResources(arn[0])
        if (!resourceName)
            throw Error(`No resource name mapping for arn: '${arn}'. Add a mapping at '${resourceNameMappingPath}'`)
        return resourceName
    }
    throw Error(`Cannot resolve arn: ${arn} to a resource name`)
}

export const getQueueNameFromArn = (serverless: Serverless, arn: any) => {
    return extractResourceNameFromArn(
        (parts) => parts[5],
        (key) => getQueueDefinitionsFromResources(serverless)
            .filter(queue => queue.resourceKey === key)
            .map(queue => queue.name)
            .find(_ => true),
        `custom.${SLS_CUSTOM_OPTION}.sqs.queueNames.${arn}`,
        (key) => serverless.service?.custom?.[SLS_CUSTOM_OPTION]?.sqs?.queueNames?.[arn]
    )(arn)
}

// TODO: move to top level utils
export const keyMerge = <T>(
    getKey: (v: T) => string,
    merge: (acc: StringKeyObject<T>, val: T) => StringKeyObject<T>
) => (data: T[]): T[] => {
    return Object.entries(
        data
            .map(v => Object.fromEntries([[getKey(v), v] as [string, T]]))
            .reduce((acc, entry) => {
                const v = Object.entries(entry)[0][1];
                return merge(acc, v)
            }, {})
    ).map(entry => entry[1])
}

export const getQueueDefinitionsFromResources = (serverless: Serverless): QueueDef[] => {
    const resources = serverless.service.resources?.Resources as StringKeyObject<any>;
    if (!resources) {
        return []
    }

    return Object.entries(resources)
        .filter(([_, v]) => v?.Type === 'AWS::SQS::Queue')
        .map(([resourceKey, v]) => ({
            resourceKey,
            name: v?.Properties?.QueueName,
            fifo: v?.Properties?.FifoQueue,
            visibilityTimeout: v?.Properties?.VisibilityTimeout,
            delaySeconds: v?.Properties?.DelaySeconds,
            handlerFunctions: []
        }))
}