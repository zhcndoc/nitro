import type { NitroConfig, NitroOptions } from "./config";
import type { NitroModule } from "./module";

export interface NitroStaticBuildFlags {
  _asyncContext?: boolean;
  _websocket?: boolean;
  _tasks?: boolean;
  dev?: boolean;
  client?: boolean;
  nitro?: boolean;
  baseURL?: string;
  prerender?: boolean;
  preset?: NitroOptions["preset"];
  server?: boolean;
  versions?: {
    nitro?: string;
  };
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Process extends NitroStaticBuildFlags {}
  }

  interface ImportMeta extends NitroStaticBuildFlags {}
}

declare global {
  const defineNitroConfig: (config: NitroConfig) => NitroConfig;
  const defineNitroModule: (definition: NitroModule) => NitroModule;
}

export type {};
