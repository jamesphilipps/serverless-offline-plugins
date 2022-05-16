import {StringKeyObject} from "./types";
import {Secret} from "./Secret";
import * as fs from "fs";


export class SecretStore {
    private secrets: StringKeyObject<Secret> = {}

    constructor(private secretsFilePath: string | undefined) {
    }

    //TODO: binary secret
    add(name: string, value: Secret) {
        this.secrets[name] = value
        this._updateSecretsFile()
    }


    delete(name: string): Secret {
        const secret = this.secrets[name]
        delete this.secrets[name]
        this._updateSecretsFile()
        return secret
    }

    get(name: string): Secret {
        return this.secrets[name]
    }

    all(): StringKeyObject<Secret> {
        return this.secrets
    }

    private _updateSecretsFile() {
        if (this.secretsFilePath) {
            const valueObject =Object.fromEntries(
                Object.entries(this.secrets).map(([key,value])=>[key, value.SecretString] as [string,string])
            )

            fs.writeFileSync(this.secretsFilePath, JSON.stringify(valueObject))
        }
    }
}