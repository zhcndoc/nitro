import type { Nitro, NitroEventHandler, NitroRouteRules } from "nitro/types";
import { virtual } from "./virtual";

export const RuntimeRouteRules = [
  "headers",
  "redirect",
  "proxy",
  "cache",
] as string[];

export function routing(nitro: Nitro) {
  return virtual(
    {
      // --- routing (routes, routeRules and middleware) ---
      "#nitro-internal-virtual/routing": () => {
        const allHandlers = uniqueBy(
          [
            ...Object.values(nitro.routing.routes.routes).map((h) => h.data),
            ...Object.values(nitro.routing.routedMiddleware.routes).map(
              (h) => h.data
            ),
            ...nitro.routing.globalMiddleware,
          ],
          "_importHash"
        );

        const h3Imports = [
          (nitro.options.serverEntry || allHandlers.some((h) => !h.lazy)) &&
            "toEventHandler",
          allHandlers.some((h) => h.lazy) && "defineLazyEventHandler",
        ].filter(Boolean) as string[];

        return /* js */ `
import * as __routeRules__ from "nitro/runtime/internal/route-rules";
${nitro.options.serverEntry ? `import __serverEntry__ from ${JSON.stringify(nitro.options.serverEntry)};` : ""}
import {${h3Imports.join(", ")}} from "nitro/deps/h3";

export const hasRouteRules = ${nitro.routing.routeRules.hasRoutes() ? "true" : "false"};
export const findRouteRules = ${nitro.routing.routeRules.compileToString({ serialize: serializeRouteRule, matchAll: true })}

${allHandlers
  .filter((h) => !h.lazy)
  .map((h) => /* js */ `import ${h._importHash} from "${h.handler}";`)
  .join("\n")}

${allHandlers
  .filter((h) => h.lazy)
  .map(
    (h) =>
      /* js */ `const ${h._importHash} = defineLazyEventHandler(() => import("${h.handler}"));`
  )
  .join("\n")}

export const hasRoutes = ${nitro.routing.routes.hasRoutes() ? "true" : "false"};
export const findRoute = ${nitro.routing.routes.compileToString({ serialize: serializeHandler })}

export const hasRoutedMiddleware = ${nitro.routing.routedMiddleware.hasRoutes() ? "true" : "false"};
export const findRoutedMiddleware = ${nitro.routing.routedMiddleware.compileToString({ serialize: serializeHandler, matchAll: true })};

export const hasGlobalMiddleware = ${nitro.routing.globalMiddleware.length > 0 || nitro.options.serverEntry ? "true" : "false"};
export const globalMiddleware = [${nitro.routing.globalMiddleware.map((h) => (h.lazy ? h._importHash : `toEventHandler(${h._importHash})`)).join(",")}];

${nitro.options.serverEntry && /* js */ `const serverEntry = toEventHandler(__serverEntry__);\nif (serverEntry) { globalMiddleware.push(serverEntry) }`}
  `;
      },
      // --- routing-meta ---
      "#nitro-internal-virtual/routing-meta": () => {
        const routeHandlers = uniqueBy(
          Object.values(nitro.routing.routes.routes).map((h) => h.data),
          "_importHash"
        );

        return /* js */ `
  ${routeHandlers
    .map(
      (h) => /* js */ `import ${h._importHash}Meta from "${h.handler}?meta";`
    )
    .join("\n")}
export const handlersMeta = [
  ${routeHandlers
    .map(
      (h) =>
        /* js */ `{ route: ${JSON.stringify(h.route)}, method: ${JSON.stringify(
          h.method?.toLowerCase()
        )}, meta: ${h._importHash}Meta }`
    )
    .join(",\n")}
  ];
        `.trim();
      },
    },
    nitro.vfs
  );
}

function uniqueBy<T>(arr: T[], key: keyof T): T[] {
  return [...new Map(arr.map((item) => [item[key], item])).values()];
}

// --- Serializing ---

function serializeHandler(
  h: NitroEventHandler & { _importHash: string }
): string {
  return `{${[
    `route:${JSON.stringify(h.route)}`,
    h.method && `method:${JSON.stringify(h.method)}`,
    h.meta && `meta:${JSON.stringify(h.meta)}`,
    `handler:${h.lazy ? h._importHash : `toEventHandler(${h._importHash})`}`,
  ]
    .filter(Boolean)
    .join(",")}}`;
}

function serializeRouteRule(h: NitroRouteRules & { _route: string }): string {
  return `[${Object.entries(h)
    .filter(([name, options]) => options !== undefined && name[0] !== "_")
    .map(([name, options]) => {
      return `{${[
        `name:${JSON.stringify(name)}`,
        `route:${JSON.stringify(h._route)}`,
        h._method && `method:${JSON.stringify(h._method)}`,
        RuntimeRouteRules.includes(name) && `handler:__routeRules__.${name}`,
        `options:${JSON.stringify(options)}`,
      ]
        .filter(Boolean)
        .join(",")}}`;
    })
    .join(",")}]`;
}
