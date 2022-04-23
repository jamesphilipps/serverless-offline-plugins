import {QueueDef} from "../QueueDef";
import {keyMerge, StringKeyObject} from "../../utils";

const mergeQueueDefinitions = <T extends QueueDef>(queueDefinitions: T[]): T[] => {
    const mergeHandlerFunctions = (hf1: string[], hf2: string[]) => Array.from(new Set(hf1.concat(hf2)))
    const applyMerge = (acc: StringKeyObject<T>, v: T): StringKeyObject<T> => {
        const k = v.name
        return {
            ...acc,
            [k]: acc[k] ?
                {...acc[k], handlerFunctions: mergeHandlerFunctions(acc[k].handlerFunctions, v.handlerFunctions)} :
                v
        }
    }
    return keyMerge<T>((q) => q.name, applyMerge)(queueDefinitions)
}

export default mergeQueueDefinitions