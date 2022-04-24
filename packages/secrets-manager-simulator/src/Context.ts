import {SecretStore} from "./store";

export default interface Context {
    secretStore: SecretStore
    region: string
    enableDebugEndpoint: boolean
}