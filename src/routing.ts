import type { Nitro, NitroEventHandler, NitroRouteRules } from "nitro/types";
import type { RouterContext } from "rou3";
import type { RouterCompilerOptions } from "rou3/compiler";

import { join } from "pathe";
import { runtimeDir } from "nitro/runtime/meta";
import { addRoute, createRouter, findRoute, findAllRoutes } from "rou3";
import { compileRouterToString } from "rou3/compiler";
import { hash } from "ohash";

export function initNitroRouting(nitro: Nitro) {
  const envConditions = new Set(
    [
      nitro.options.dev ? "dev" : "prod",
      nitro.options.preset,
      nitro.options.preset === "nitro-prerender" ? "prerender" : undefined,
    ].filter(Boolean) as string[]
  );
  const matchesEnv = (h: NitroEventHandler) => {
    const hEnv = Array.isArray(h.env) ? h.env : [h.env];
    const envs = hEnv.filter(Boolean) as string[];
    return envs.length === 0 || envs.some((env) => envConditions.has(env));
  };

  const routes = new Router<NitroEventHandler & { _importHash: string }>();
  const routeRules = new Router<NitroRouteRules & { _route: string }>(
    true /* matchAll */
  );
  const middleware: (NitroEventHandler & { _importHash: string })[] = [];

  const sync = () => {
    // Update route rules
    routeRules._update(
      Object.entries(nitro.options.routeRules).map(([route, data]) => ({
        route,
        method: "",
        data: {
          ...data,
          _route: route,
        },
      }))
    );

    // Update midleware
    const _middleware = [
      ...nitro.scannedHandlers,
      ...nitro.options.handlers,
    ].filter((h) => h && h.middleware && matchesEnv(h));
    if (nitro.options.serveStatic) {
      _middleware.unshift({
        route: "/**",
        middleware: true,
        handler: join(runtimeDir, "internal/static"),
      });
    }
    middleware.splice(
      0,
      middleware.length,
      ..._middleware.map((m) => handlerWithImportHash(m))
    );

    // Update routes
    const _routes = [
      ...nitro.scannedHandlers,
      ...nitro.options.handlers,
    ].filter((h) => h && !h.middleware && matchesEnv(h));

    if (nitro.options.renderer) {
      _routes.push({
        route: "/**",
        lazy: true,
        handler: nitro.options.renderer,
      });
    }
    routes._update(
      _routes.map((h) => ({
        ...h,
        method: h.method || "",
        data: handlerWithImportHash(h),
      }))
    );
  };

  nitro.routing = Object.freeze({
    sync,
    routes,
    routeRules,
    middleware,
  });
}

function handlerWithImportHash(h: NitroEventHandler) {
  const id =
    (h.lazy ? "_lazy_" : "_") + hash(h.handler).replace(/-/g, "").slice(0, 6);
  return { ...h, _importHash: id };
}

// --- Router ---

export interface Route<T = unknown> {
  route: string;
  method: string;
  data: T;
}

export class Router<T> {
  #routes?: Route<T>[];
  #router?: RouterContext<T>;
  #compiled?: string;

  constructor(matchAll?: boolean) {
    this._update([]);
  }

  get routes() {
    return this.#routes!;
  }

  _update(routes: Route<T>[]) {
    this.#routes = routes;
    this.#router = createRouter<T>();
    this.#compiled = undefined;
    for (const route of routes) {
      addRoute(this.#router, route.method, route.route, route.data);
    }
  }

  compileToString(opts?: RouterCompilerOptions) {
    return (
      this.#compiled ||
      (this.#compiled = compileRouterToString(this.#router!, undefined, opts))
    );
  }

  match(method: string, path: string): undefined | T {
    return findRoute(this.#router!, method, path)?.data;
  }

  matchAll(method: string, path: string): T[] {
    // Returns from less specific to more specific matches
    return findAllRoutes(this.#router!, method, path).map(
      (route) => route.data
    );
  }
}
