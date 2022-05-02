import {QueueDef} from "../QueueDef";
import {keyMerge, StringKeyObject} from "../../utils";

const mergeQueueDefinitions = <T extends QueueDef>(queueDefinitions: T[]): T[] => {
    const mergeDistinct = (v1: string[], v2: string[]) => Array.from(new Set(v1.concat(v2)))
    const applyMerge = (acc: StringKeyObject<T>, v: T): StringKeyObject<T> => {
        const k = v.name
        return {
            ...acc,
            [k]: acc[k] ?
                {
                    ...acc[k],
                    handlerFunctions: mergeDistinct(acc[k].handlerFunctions, v.handlerFunctions),
                    aliases: mergeDistinct(acc[k].aliases, v.aliases)
                } :
                v
        }
    }
    return keyMerge<T>((q) => q.name, applyMerge)(queueDefinitions)
}

export default mergeQueueDefinitions