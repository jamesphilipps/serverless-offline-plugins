import * as Serverless from "serverless";
import {SLS_CUSTOM_OPTION} from "./constants";

export type StringKeyObject<T> = { [key: string]: T }

export const getPluginConfiguration = (serverless: Serverless): PluginConfiguration | undefined => serverless.service.custom[SLS_CUSTOM_OPTION]