import {customAlphabet} from "nanoid"

export interface Secret {
    ARN: string,
    CreatedDate: number,
    Name: string,
    SecretBinary?: Uint8Array,
    SecretString?: string,
    VersionId: string,
    VersionStages: string[ ]
}


export const createSecret = (region: string, Name: string, SecretString: string) => {
    const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 6)
    return ({
        ARN: `arn:aws:secretsmanager:${region}:111222333:secret:local/aes256-${nanoid()}`,
        CreatedDate: new Date().getTime(),
        Name,
        SecretString,
        VersionId: "AWSCURRENT",
        VersionStages: []
    })
}