import type { RawConfig } from "@cloudflare/workers-utils";

export type WranglerConfig = Partial<RawConfig>;

/**
 * https://developers.cloudflare.com/pages/platform/functions/routing/#functions-invocation-routes
 */
export interface CloudflarePagesRoutes {
  /** Defines the version of the schema. Currently there is only one version of the schema (version 1), however, we may add more in the future and aim to be backwards compatible. */
  version?: 1;

  /** Defines routes that will be invoked by Functions. Accepts wildcard behavior. */
  include?: string[];

  /** Defines routes that will not be invoked by Functions. Accepts wildcard behavior. `exclude` always take priority over `include`. */
  exclude?: string[];
}

export interface CloudflareOptions {
  /**
   * Configuration for the Cloudflare deployments and local dev.
   *
   */
  wrangler?: WranglerConfig;

  /**
   * Wrangler environment to select when loading the config.
   */
  wranglerEnv?: string;

  /**
   * Automatically generate `.wrangler/deploy/config.json`.
   *
   * Enabled by default.
   *
   * More info: https://developers.cloudflare.com/workers/wrangler/configuration#generated-wrangler-configuration
   */
  deployConfig?: boolean;

  /**
   * Native Node.js compatibility support.
   *
   * Enabled by default.
   *
   * If this option disabled, pure unenv polyfills will be used instead.
   *
   */
  nodeCompat?: boolean;

  pages?: {
    /**
     * Nitro will automatically generate a `_routes.json` that controls which files get served statically and
     * which get served by the Worker. Using this config will override the automatic `_routes.json`. Or, if the
     * `merge` options is set, it will merge the user-set routes with the auto-generated ones, giving priority
     * to the user routes.
     *
     * @see https://developers.cloudflare.com/pages/platform/functions/routing/#functions-invocation-routes
     *
     * There are a maximum of 100 rules, and you must have at least one include rule. Wildcards are accepted.
     *
     * If any fields are unset, they default to:
     *
     * ```json
     * {
     *   "version": 1,
     *   "include": ["/*"],
     *   "exclude": []
     * }
     * ```
     */
    routes?: CloudflarePagesRoutes;
    /**
     * If set to `false`, nitro will disable the automatically generated `_routes.json` and instead use the user-set only ones.
     *
     * @default true
     */
    defaultRoutes?: boolean;
  };

  /**
   * Custom Cloudflare exports additional classes such as WorkflowEntrypoint.
   */
  exports?: string;
}

declare module "nitro/types" {
  export interface NitroRuntimeHooks {
    // https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/
    "cloudflare:scheduled": (_: {
      controller: ScheduledController;
      env: unknown;
      context: ExecutionContext;
    }) => void;
    // https://developers.cloudflare.com/email-routing/email-workers/runtime-api
    "cloudflare:email": (_: {
      message: ForwardableEmailMessage;
      /** @deprecated please use `message` */
      event: ForwardableEmailMessage;
      env: unknown;
      context: ExecutionContext;
    }) => void;
    // https://developers.cloudflare.com/queues/configuration/javascript-apis/#consumer
    "cloudflare:queue": (_: {
      batch: MessageBatch;
      /** @deprecated please use `batch` */
      event: MessageBatch;
      env: unknown;
      context: ExecutionContext;
    }) => void;
    // https://developers.cloudflare.com/workers/runtime-apis/handlers/tail/
    "cloudflare:tail": (_: {
      traces: TraceItem[];
      env: unknown;
      context: ExecutionContext;
    }) => void;
    "cloudflare:trace": (_: {
      traces: TraceItem[];
      env: unknown;
      context: ExecutionContext;
    }) => void;

    "cloudflare:durable:init": (
      durable: DurableObject,
      _: {
        state: DurableObjectState;
        env: unknown;
      }
    ) => void;

    "cloudflare:durable:alarm": (durable: DurableObject) => void;
  }
}

// Subset of `@cloudflare/workers-types` (not a nitro dependency)

interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
  readonly props: unknown;
}

interface ScheduledController {
  readonly scheduledTime: number;
  readonly cron: string;
  noRetry(): void;
}

interface ForwardableEmailMessage {
  readonly from: string;
  readonly to: string;
  readonly raw: ReadableStream<Uint8Array>;
  readonly headers: Headers;
  readonly rawSize: number;
  setReject(reason: string): void;
  forward(rcptTo: string, headers?: Headers): Promise<unknown>;
  reply(message: unknown): Promise<unknown>;
}

interface MessageBatch<Body = unknown> {
  readonly queue: string;
  readonly messages: readonly {
    readonly id: string;
    readonly timestamp: Date;
    readonly body: Body;
    readonly attempts: number;
    retry(options?: { delaySeconds?: number }): void;
    ack(): void;
  }[];
  retryAll(options?: { delaySeconds?: number }): void;
  ackAll(): void;
}

interface TraceItem {
  readonly event: unknown;
  readonly eventTimestamp: number | null;
  readonly logs: { readonly timestamp: number; readonly level: string; readonly message: any }[];
  readonly exceptions: {
    readonly timestamp: number;
    readonly message: string;
    readonly name: string;
    readonly stack?: string;
  }[];
  readonly scriptName: string | null;
  readonly entrypoint?: string;
  readonly outcome: string;
  readonly truncated: boolean;
  readonly cpuTime: number;
  readonly wallTime: number;
}

// Instance of a `DurableObject` class from `cloudflare:workers` (its `ctx` and `env` are protected)
type DurableObject = object & {
  alarm?(alarmInfo?: { retryCount: number; isRetry: boolean }): void | Promise<void>;
};

interface DurableObjectState {
  readonly id: { toString(): string; equals(other: any): boolean; readonly name?: string };
  readonly storage: any;
  waitUntil(promise: Promise<any>): void;
  blockConcurrencyWhile<T>(callback: () => Promise<T>): Promise<T>;
  acceptWebSocket(ws: WebSocket, tags?: string[]): void;
  getWebSockets(tag?: string): WebSocket[];
}
