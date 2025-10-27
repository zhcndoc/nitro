import type { EnvironmentOptions } from "vite";
import type { NitroPluginContext, ServiceConfig } from "./types";

import { NodeDevWorker } from "../../dev/worker";
import { join, resolve } from "node:path";
import { runtimeDependencies, runtimeDir } from "nitro/runtime/meta";
import { resolveModulePath } from "exsolve";
import { createFetchableDevEnvironment } from "./dev";
import { isAbsolute } from "pathe";

export function createDevWorker(ctx: NitroPluginContext) {
  return new NodeDevWorker({
    name: "nitro-vite",
    entry: resolve(runtimeDir, "internal/vite/dev-worker.mjs"),
    hooks: {},
    data: {
      server: true,
      globals: {
        __NITRO_RUNTIME_CONFIG__: ctx.nitro!.options.runtimeConfig,
      },
    },
  });
}

export function createNitroEnvironment(
  ctx: NitroPluginContext
): EnvironmentOptions {
  return {
    consumer: "server",
    build: {
      rollupOptions: ctx.rollupConfig!.config as any,
      minify: ctx.nitro!.options.minify,
      emptyOutDir: false,
      commonjsOptions: {
        strictRequires: "auto", // TODO: set to true (default) in v3
        esmExternals: (id) => !id.startsWith("unenv/"),
        requireReturnsDefault: "auto",
        ...(ctx.nitro!.options.commonJS as any),
      },
    },
    resolve: {
      noExternal: ctx.nitro!.options.dev
        ? // Workaround for dev: external dependencies are not resolvable with respect to nodeModulePaths
          new RegExp(runtimeDependencies.join("|"))
        : // Workaround for build: externals tracing is unstable
          (ctx.nitro!.options.noExternals === false ? undefined : true), // prettier-ignore
      conditions: ctx.nitro!.options.exportConditions,
      externalConditions: ctx.nitro!.options.exportConditions,
    },
    dev: {
      createEnvironment: (envName, envConfig) =>
        createFetchableDevEnvironment(
          envName,
          envConfig,
          ctx.devWorker!,
          resolve(runtimeDir, "internal/vite/dev-entry.mjs")
        ),
    },
  };
}

export function createServiceEnvironment(
  ctx: NitroPluginContext,
  name: string,
  serviceConfig: ServiceConfig
): EnvironmentOptions {
  return {
    consumer: "server",
    build: {
      rollupOptions: { input: serviceConfig.entry },
      minify: ctx.nitro!.options.minify,
      outDir: join(ctx.nitro!.options.buildDir, "vite", "services", name),
      emptyOutDir: true,
    },
    resolve: {
      conditions: ctx.nitro!.options.exportConditions,
      externalConditions: ctx.nitro!.options.exportConditions,
    },
    dev: {
      createEnvironment: (envName, envConfig) =>
        createFetchableDevEnvironment(
          envName,
          envConfig,
          ctx.devWorker!,
          tryResolve(serviceConfig.entry)
        ),
    },
  };
}

export function createServiceEnvironments(
  ctx: NitroPluginContext
): Record<string, EnvironmentOptions> {
  return Object.fromEntries(
    Object.entries(ctx.pluginConfig.services || {}).map(([name, config]) => [
      name,
      createServiceEnvironment(ctx, name, config),
    ])
  );
}

function tryResolve(id: string) {
  if (/^[~#/\0]/.test(id) || isAbsolute(id)) {
    return id;
  }
  const resolved = resolveModulePath(id, {
    suffixes: ["", "/index"],
    extensions: ["", ".ts", ".mjs", ".cjs", ".js", ".mts", ".cts"],
    try: true,
  });
  return resolved || id;
}
