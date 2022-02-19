import {QueueDef} from "../QueueDef";
import {keyMerge, StringKeyObject} from "../../utils";

const mergeQueueDefinitions = (queueDefinitions: QueueDef[]): QueueDef[] => {
    const mergeHandlerFunctions = (hf1: string[], hf2: string[]) => Array.from(new Set(hf1.concat(hf2)))
    const applyMerge = (acc: StringKeyObject<QueueDef>, v: QueueDef): StringKeyObject<QueueDef> => {

        const k = v.name

        return {
            ...acc,
            [k]: acc[k] ?
                {...acc[k], handlerFunctions: mergeHandlerFunctions(acc[k].handlerFunctions, v.handlerFunctions)} :
                v
        }
    }
    return keyMerge<QueueDef>((q) => q.name, applyMerge)(queueDefinitions)
}

export default mergeQueueDefinitions