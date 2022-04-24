import {StringKeyObject} from "./types";
import {Secret} from "./Secret";


export class SecretStore {
    private secrets: StringKeyObject<Secret> = {}

    //TODO: binary secret
    add(name: string, value: Secret) {
        this.secrets[name] = value
    }

    get(name: string): Secret {
        return this.secrets[name]
    }

    delete(name: string): Secret {
        const secret = this.secrets[name]
        delete this.secrets[name]
        return secret
    }

    all(): Secret[] {
        return Object.values(this.secrets)
    }
}