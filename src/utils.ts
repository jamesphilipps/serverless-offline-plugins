import * as Serverless from "serverless";
import PluginConfiguration from "./PluginConfiguration";
import {SLS_CUSTOM_OPTION} from "./constants";

export type StringKeyObject<T> = { [key: string]: T }

export const getPluginConfiguration = (serverless: Serverless): PluginConfiguration | undefined => serverless.service.custom[SLS_CUSTOM_OPTION]

export const extractResourceNameFromArn = (
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
            // Probably an output reference. Use directly as a key to the defined mappings
            const resourceName = getNameFromMappings(arn)
            if (!resourceName)
                throw Error(`No resource name mapping for arn: '${arn}'. Add a mapping at '${resourceNameMappingPath}'`)
            return resourceName
        }
    } else if (Array.isArray(arn) && arn.length === 2) {
        // An attribute reference to a resource defined within the stack. Check the defined resources
        const resourceName = getNameFromResources(arn[0])
        if (!resourceName)
            throw Error(`No resource defined with key: '${arn[0]}'. Add a resource with this key'`)
        return resourceName
    }
    throw Error(`Cannot resolve arn: '${arn}' to a resource name`)
}

// TODO: test
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