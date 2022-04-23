import * as Serverless from "serverless";
import PluginConfiguration from "./PluginConfiguration";
import {SLS_CUSTOM_OPTION} from "./constants";
import {logDebug} from "./logging";
import {FunctionDefinition, SlsOfflineLambdaFunctionDefinition} from "./types";

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
    resourceNameMappingPath: string,
    getNameFromMappings: (key: string) => string
) => (arn: any) => {
    const getNameFromResourcesOrError = (resourceName: string) => {
        if (!resourceName)
            throw Error(`No resource defined with key: '${arn[0]}'. Add a resource with this key'`)
        return resourceName
    }
    const getNameFromMappingsOrError = (resourceName: string) => {
        if (!resourceName)
            throw Error(`No resource name mapping for arn: '${arnStr}'. Add a mapping at '${resourceNameMappingPath}'`)
        return resourceName
    }


    const arnStr = typeof arn == 'string' ? arn : JSON.stringify(arn)
    logDebug(`extractResourceNameFromArn: '${arnStr}'`)

    if (typeof arn === 'string') {
        if (arn.startsWith("arn:")) {
            // AWS Arn. Parse the resource name from the string
            return arnExtract(arn.split(":"))
        } else {
            // Probably an output reference. Use directly as a key to the defined mappings
            return getNameFromMappingsOrError(getNameFromMappings(arn))
        }
    } else if (Array.isArray(arn)) {
        if (arn.length === 2) {
            // An attribute reference to a resource defined within the stack. Check the defined resources
            const resourceName = getNameFromResources(arn[0])
            return getNameFromResourcesOrError(resourceName)
        }
    } else if (typeof arn === 'object') {
        // A function reference. Use the value as a key to the defined mappings
        const keys = Object.keys(arn);
        if (keys.length === 1 && keys[0].trim() === "Fn::ImportValue") {
            return getNameFromMappingsOrError(getNameFromMappings(arn[keys[0]]))
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


export const head = <T>(v: T[]) => v[0]

export const tail = <T>(v: T[]) => (v.length > 0 ? v.slice(1) : [])

export const foldLeft = <A, B>(initial: A, vals: B[], f: (acc: A, val: B) => A) :A=> {
    const foldInternal = (a: A, b: B, bs: B[]): A => {
        return b //
            ? foldInternal(f(a, b), head(bs), tail(bs))
            : a
    }
    return foldInternal(initial, head(vals), tail(vals))
}
