import type { Nitro } from "nitro/types";
import type { RolldownOptions, RolldownPlugin } from "rolldown";
import { sanitizeFilePath } from "mlly";
import { normalize } from "pathe";
import { resolveModulePath } from "exsolve";
import { runtimeDir } from "nitro/runtime/meta";
import json from "@rollup/plugin-json";
import { baseBuildConfig } from "../config";
import { baseBuildPlugins } from "../plugins";
import { builtinModules } from "node:module";

export const getRolldownConfig = (nitro: Nitro): RolldownOptions => {
  const base = baseBuildConfig(nitro);

  const chunkNamePrefixes = [
    [nitro.options.buildDir, "build"],
    [base.buildServerDir, "app"],
    [runtimeDir, "nitro"],
    [base.presetsDir, "nitro"],
    ["\0raw:", "raw"],
    ["\0nitro-wasm:", "wasm"],
    ["\0", "virtual"],
  ] as const;

  const config = {
    input: nitro.options.entry,
    external: [
      ...base.env.external,
      ...builtinModules,
      ...builtinModules.map((m) => `node:${m}`),
    ],
    plugins: [
      ...(baseBuildPlugins(nitro, base) as RolldownPlugin[]),
      json() as RolldownPlugin,
    ],
    resolve: {
      alias: {
        ...base.aliases,
        "node-mock-http/_polyfill/events": "node-mock-http/_polyfill/events",
        "node-mock-http/_polyfill/buffer": "node-mock-http/_polyfill/buffer",
      },
      extensions: base.extensions,
      mainFields: ["main"], // "module" is intentionally not supported because of externals
      conditionNames: nitro.options.exportConditions,
    },
    // @ts-expect-error (readonly values)
    inject: base.env.inject,
    define: {
      ...Object.fromEntries(
        Object.entries(base.replacements)
          .filter(
            ([key, val]) =>
              val &&
              (key.startsWith("import.meta.env.") ||
                key.startsWith("process.env."))
          )
          .map(([key, value]) => [
            key,
            typeof value === "function" ? value() : value,
          ])
      ),
    },
    jsx: "react-jsx",
    onwarn(warning, warn) {
      if (
        !["CIRCULAR_DEPENDENCY", "EVAL"].includes(warning.code || "") &&
        !warning.message.includes("Unsupported source map comment")
      ) {
        warn(warning);
      }
    },
    treeshake: {
      moduleSideEffects(id) {
        const normalizedId = normalize(id);
        const idWithoutNodeModules = normalizedId.split("node_modules/").pop();
        if (!idWithoutNodeModules) {
          return false;
        }
        if (
          normalizedId.startsWith(runtimeDir) ||
          idWithoutNodeModules.startsWith(runtimeDir)
        ) {
          return true;
        }
        return nitro.options.moduleSideEffects.some(
          (m) =>
            normalizedId.startsWith(m) || idWithoutNodeModules.startsWith(m)
        );
      },
    },
    output: {
      dir: nitro.options.output.serverDir,
      entryFileNames: "index.mjs",
      chunkFileNames(chunk) {
        const id = normalize(chunk.moduleIds.at(-1) || "");
        // Known path prefixes
        for (const [dir, name] of chunkNamePrefixes) {
          if (id.startsWith(dir)) {
            return `chunks/${name}/[name].mjs`;
          }
        }

        // Route handlers
        const routeHandler =
          nitro.options.handlers.find((h) =>
            id.startsWith(h.handler as string)
          ) ||
          nitro.scannedHandlers.find((h) => id.startsWith(h.handler as string));
        if (routeHandler?.route) {
          const path =
            routeHandler.route
              .replace(/:([^/]+)/g, "_$1")
              .replace(/\/[^/]+$/g, "") || "/";
          return `chunks/routes${path}/[name].mjs`;
        }

        // Task handlers
        const taskHandler = Object.entries(nitro.options.tasks).find(
          ([_, task]) => task.handler === id
        );
        if (taskHandler) {
          return `chunks/tasks/[name].mjs`;
        }

        // Unknown path
        return `chunks/_/[name].mjs`;
      },
      inlineDynamicImports: nitro.options.inlineDynamicImports,
      format: "esm",
      exports: "auto",
      intro: "",
      outro: "",
      sanitizeFileName: sanitizeFilePath,
      sourcemap: nitro.options.sourceMap,
      sourcemapIgnoreList(relativePath) {
        return relativePath.includes("node_modules");
      },
    },
  } satisfies RolldownOptions;

  config.plugins.push({
    name: "nitro:rolldown-resolves",
    async resolveId(id, parent, options) {
      if (parent?.startsWith("\0virtual:#nitro-internal-virtual")) {
        const internalRes = await this.resolve(id, import.meta.url, options);
        if (internalRes) {
          return internalRes;
        }
        return resolveModulePath(id, {
          from: [nitro.options.rootDir, import.meta.url],
          try: true,
        });
      }
    },
  });

  return config as RolldownOptions;
};
