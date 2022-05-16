export {default as log, setLog} from "serverless-offline/dist/serverlessLog"

export const LOG_MARKER = '[sls-offline-sms]'

export const logDebug = process.env.SLS_DEBUG !== undefined || process.env.SLS_SMS_DEBUG !== undefined ?
    console.log.bind(null, LOG_MARKER) :
    () => null;
