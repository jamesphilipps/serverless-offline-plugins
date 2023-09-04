export { log, setLog} from "serverless-offline"

export const LOG_MARKER = '[sls-offline-streams]'

export const logDebug = process.env.SLS_DEBUG !== undefined || process.env.SLS_STREAMS_DEBUG !== undefined ?
    console.log.bind(null, LOG_MARKER) :
    () => null;
