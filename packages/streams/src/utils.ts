import * as Serverless from "serverless";
import PluginConfiguration from "./PluginConfiguration";
import {SLS_CUSTOM_OPTION} from "./constants";
import type {Lambda as LambdaType} from 'serverless-offline/lambda';

export type StringKeyObject<T> = { [key: string]: T }

export const getPluginConfiguration = (serverless: Serverless): PluginConfiguration | undefined => serverless.service.custom[SLS_CUSTOM_OPTION]

export const getHandlersAsLambdaFunctionDefinitions = (serverless: Serverless): LambdaType[] => {
    const {service} = serverless
    return service.getAllFunctions()
        .map((functionKey: string): LambdaType => ({
            functionKey,
            functionDefinition: service.getFunction(functionKey)
        } as any))
}

export const extractResourceNameFromArn = (
    arnExtract: (parts: string[]) => string,
    getNameFromResources: (key: string) => string,
) => (arn: any) => {
    const getNameFromResourcesOrError = (_arn: any, resourceName: string) => {
        if (!resourceName)
            throw Error(`No resource defined with key: '${_arn}'. Add a resource with this key'`)
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
            const _arn = arn[0];
            const resourceName = getNameFromResources(_arn)
            return getNameFromResourcesOrError(_arn, resourceName)
        }
    } else if (typeof arn === 'object') {
        // A function reference. Use the value as a key to the defined mappings
        const keys = Object.keys(arn);
        if (keys.length === 1) {
            const key = keys[0].trim();
            switch (key) {
                case "Fn::GetAtt":
                    const _arn = arn[key][0];
                    const getAttResourceName = getNameFromResources(_arn)
                    return getNameFromResourcesOrError(_arn, getAttResourceName)
                case "Ref":
                    const _arn2 = arn[key];
                    const refResourceName = getNameFromResources(_arn2)
                    return getNameFromResourcesOrError(_arn2, refResourceName)
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
export const mapBy = <T>(vals: T[], keyFunc: (v: T) => string) => Object.fromEntries(
    vals.map((v) => [keyFunc(v), v] as [string, T])
)
