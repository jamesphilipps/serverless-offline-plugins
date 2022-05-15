import * as Serverless from "serverless";
import PluginConfiguration from "./PluginConfiguration";
import {SLS_CUSTOM_OPTION} from "./constants";
import {logDebug} from "./logging";
import {SlsOfflineLambdaFunctionDefinition} from "./types";

export type StringKeyObject<T> = { [key: string]: T }

export const getPluginConfiguration = (serverless: Serverless): PluginConfiguration | undefined => serverless.service.custom[SLS_CUSTOM_OPTION]

export const getHandlersAsLambdaFunctionDefinitions = (serverless: Serverless) => {
    const {service} = serverless
    return service.getAllFunctions()
        .map((functionKey: string): SlsOfflineLambdaFunctionDefinition => ({
            functionKey,
            functionDefinition: service.getFunction(functionKey)
        }))
}

export const extractResourceNameFromArn = (
    arnExtract: (parts: string[]) => string,
    getNameFromResources: (key: string) => string,
) => (arn: any) => {
    const getNameFromResourcesOrError = (resourceName: string) => {
        if (!resourceName)
            throw Error(`No resource defined with key: '${arn[0]}'. Add a resource with this key'`)
        return resourceName
    }

    const arnStr = typeof arn == 'string' ? arn : JSON.stringify(arn)

    if (typeof arn === 'string') {
        // If arn starts with arn: then this is an AWS Arn and can be parsed. Otherwise, it is probably an output
        // reference and can be used directly
        return arn.startsWith("arn:") ? arnExtract(arn.split(":")) : arn;
    } else if (Array.isArray(arn)) {
        if (arn.length === 2) {
            // An attribute reference to a resource defined within the stack. Check the defined resources
            const resourceName = getNameFromResources(arn[0])
            return getNameFromResourcesOrError(resourceName)
        }
    } else if (typeof arn === 'object') {
        // A function reference. Use the value as a key to the defined mappings
        const keys = Object.keys(arn);
        if (keys.length === 1) {
            const key = keys[0].trim();
            switch (key) {
                case "Fn::GetAtt":
                    const getAttResourceName = getNameFromResources(arn[key][0])
                    return getNameFromResourcesOrError(getAttResourceName)
                case "Ref":
                    const refResourceName = getNameFromResources(arn[key])
                    return getNameFromResourcesOrError(refResourceName)
                case "Fn::ImportValue":
                    return arn[key]
            }
        }
    }

    throw Error(`Cannot resolve arn: '${arnStr}' to a resource name`)
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


// TODO: test
export const mapBy = <T>(vals: T[], keyFunc: (T) => string) => Object.fromEntries(
    vals.map((v) => [keyFunc(v), v] as [string, T])
)
