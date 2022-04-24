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
        const resources = {k3: {name: "RES3"}, k4: {name: "RES4"}}
        const func = extractResourceNameFromArn(
            parts => parts[2],
            key => resources[key]?.name,
        )

        it('extracts name from aws arn using provided function', () => {
            expect(func('arn:aws:MY_RES')).toEqual('MY_RES')
        })
        it('uses non arn string as direct reference', () => {
            expect(func('k1')).toEqual('k1')
            expect(func('k2')).toEqual('k2')
        })
        it('extracts name from "Fn::ImportValue" reference using provided function', () => {
            expect(func({"Fn::ImportValue": 'k1'})).toEqual('k1')
        })
        it('extracts name from resources using provided function', () => {
            expect(func(['k3', 'ARN'])).toEqual('RES3')
            expect(func(['k4', 'ARN'])).toEqual('RES4')
        })
        it('extracts name from Fn::GetAtt reference using provided function', () => {
            expect(func({'Fn::GetAtt': ['k3', 'ARN']})).toEqual('RES3')
            expect(func({'Fn::GetAtt': ['k4', 'ARN']})).toEqual('RES4')
        })
        it('extracts name from Fn::Ref reference using provided function', () => {
            expect(func({'Ref': 'k3'})).toEqual('RES3')
            expect(func({'Ref': 'k4'})).toEqual('RES4')
        })
        it('throws meaningful error if cannot find resource ARN', () => {
            expect(() => func(['k7', 'ARN'])).toThrow("No resource defined with key: 'k7'. Add a resource with this key")
        })
        it('throws meaningful error if cannot detect ARN format from list', () => {
            expect(() => func(['k3'])).toThrow(`Cannot resolve arn: '["k3"]' to a resource name`)
        })
        it('throws meaningful error if cannot detect ARN format from object', () => {
            expect(() => func({Unknown: "K1"})).toThrow(`Cannot resolve arn: '{"Unknown":"K1"}' to a resource name`)
        })
    })

})

