import type { EventHandler, HTTPError, H3Event, HTTPMethod } from "h3";
import type { PresetName } from "nitro/presets";
import type {
  OperationObject,
  OpenAPI3,
  Extensable,
} from "../types/openapi-ts";

type MaybeArray<T> = T | T[];

/** @exprerimental */
export interface NitroRouteMeta {
  openAPI?: OperationObject & {
    $global?: Pick<OpenAPI3, "components"> & Extensable;
  };
}

export interface NitroEventHandler {
  /**
   * Path prefix or route
   *
   * If an empty string used, will be used as a middleware
   */
  route?: string;

  /**
   * Specifies this is a middleware handler.
   * Middleware are called on every route and should normally return nothing to pass to the next handlers
   */
  middleware?: boolean;

  /**
   * Use lazy loading to import handler
   */
  lazy?: boolean;

  /**
   * Path to event handler
   *
   */
  handler: string;

  /**
   * Router method matcher
   */
  method?: HTTPMethod;

  /**
   * Meta
   */
  meta?: NitroRouteMeta;

  /*
   * Environments to include this handler
   */
  env?: MaybeArray<"dev" | "prod" | "prerender" | PresetName | (string & {})>;
}

export interface NitroDevEventHandler {
  /**
   * Path prefix or route
   */
  route?: string;

  /**
   * Event handler
   *
   */
  handler: EventHandler;
}

type MaybePromise<T> = T | Promise<T>;

export type NitroErrorHandler = (
  error: HTTPError,
  event: H3Event,
  _: {
    defaultHandler: (
      error: HTTPError,
      event: H3Event,
      opts?: { silent?: boolean; json?: boolean }
    ) => MaybePromise<{
      status: number;
      statusText: string | undefined;
      headers: Record<string, string>;
      body: string | Record<string, any>;
    }>;
  }
) => unknown; /* TODO: Response */
