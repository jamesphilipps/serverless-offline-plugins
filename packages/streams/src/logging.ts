export const LOG_MARKER = '[sls-offline-streams]'

export interface ServerlessLogger {
    debug: (msg: string) => undefined
    info: (msg: string) => undefined
    error: (msg: string) => undefined
}

let LOG: ServerlessLogger = {
    debug: () => undefined,
    info: () => undefined,
    error: () => undefined
}

export const setLog = (logger: ServerlessLogger) => {
    LOG = {
        debug: (msg: string) => logger.debug(LOG_MARKER + " " + msg),
        info: (msg: string) => logger.info(LOG_MARKER + " " + msg),
        error: (msg: string) => logger.error(LOG_MARKER + " " + msg)
    }
}

export const getLogger = (): ServerlessLogger => LOG
