export {default as log, setLog} from "serverless-offline/dist/serverlessLog"

// export const logDebug =console.log.bind(null, '[sls-offline-streams]')

export const logDebug = process.env.SLS_DEBUG !== undefined || process.env.SLS_STREAMS_DEBUG !== undefined ?
    console.log.bind(null, '[sls-offline-streams]') :
    () => null;