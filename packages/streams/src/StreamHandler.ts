export interface StreamHandler {
    start(): Promise<any>

    shutdown(): Promise<any>
}