import {extractResourceNameFromArn, getPluginConfiguration} from "./utils";
import * as Serverless from "serverless";
import {SLS_CUSTOM_OPTION} from "./constants";

describe('utils', () => {
    describe('getPluginConfiguration', () => {
        it('retrieves plugin configuration from serverless', () => {
            const config = {sqs: {enabled: true}};
            const serverless: Serverless = {
                service: {
                    custom: {
                        [SLS_CUSTOM_OPTION]: config
                    }
                }
            } as unknown as Serverless

            expect(getPluginConfiguration(serverless)).toEqual(config)
        })
    })

    describe('extractResourceNameFromArn', () => {
        const mappings = {k1: "MAP1", k2: "MAP2"}
        const resources = {k3: {name: "RES3"}, k4: {name: "RES4"}}
        const func = extractResourceNameFromArn(
            parts => parts[2],
            key => resources[key]?.name,
            'MAPPINGS_PATH',
            key => mappings[key]
        )

        it('extracts name from aws arn using provided function', () => {
            expect(func('arn:aws:MY_RES')).toEqual('MY_RES')
        })
        it('extracts name from output reference using provided function', () => {
            expect(func('k1')).toEqual('MAP1')
            expect(func('k2')).toEqual('MAP2')
        })
        it('extracts name from resources using provided function', () => {
            expect(func(['k3', 'ARN'])).toEqual('RES3')
            expect(func(['k4', 'ARN'])).toEqual('RES4')
        })
        it('throws meaningful error if cannot find resource ARN', () => {
            expect(() => func(['k7', 'ARN'])).toThrow("No resource defined with key: 'k7'. Add a resource with this key")
        })
        it('throws meaningful error if cannot find mapping ARN', () => {
            expect(() => func('k7')).toThrow("No resource name mapping for arn: 'k7'. Add a mapping at 'MAPPINGS_PATH'")
        })
        it('throws error if cannot detect ARN format', () => {
            expect(() => func(['k3'])).toThrow("Cannot resolve arn: 'k3' to a resource name")
        })
    })

})

