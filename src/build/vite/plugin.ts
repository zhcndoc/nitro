import type { PluginOption as VitePlugin } from "vite";
import type { Plugin as RollupPlugin } from "rollup";
import type { NitroPluginConfig, NitroPluginContext } from "./types";
import { join, resolve, relative } from "pathe";
import { createNitro, prepare } from "../..";
import { getViteRollupConfig } from "./rollup";
import { buildEnvironments, prodEntry } from "./prod";
import { createNitroEnvironment, createServiceEnvironments } from "./env";
import { configureViteDevServer } from "./dev";
import { runtimeDependencies, runtimeDir } from "nitro/runtime/meta";

import * as rou3 from "rou3";
import * as rou3Compiler from "rou3/compiler";
import { resolveModulePath } from "exsolve";
import { prettyPath } from "../../utils/fs";

// https://vite.dev/guide/api-environment-plugins
// https://vite.dev/guide/api-environment-frameworks.html

export function nitro(pluginConfig: NitroPluginConfig = {}): VitePlugin {
  const ctx: NitroPluginContext = {
    pluginConfig,
    _entryPoints: {},
    _manifest: {},
    _serviceBundles: {},
  };

  return [mainPlugin(ctx), nitroServicePlugin(ctx)];
}

function mainPlugin(ctx: NitroPluginContext): VitePlugin[] {
  return [
    {
      name: "nitro:main",

      // Opt-in this plugin into the shared plugins pipeline
      sharedDuringBuild: true,

      // Extend vite config before it's resolved
      async config(userConfig, configEnv) {
        // Initialize a new Nitro instance
        ctx.nitro =
          ctx.pluginConfig._nitro ||
          (await createNitro({
            dev: configEnv.mode === "development",
            rootDir: userConfig.root,
            compatibilityDate: "latest",
            imports: false,
            typescript: {
              generateRuntimeConfigTypes: false,
              generateTsConfig: false,
            },
            handlers: [
              {
                route: "/**",
                handler: resolve(runtimeDir, "internal/vite/dispatcher.mjs"),
              },
            ],
            ...ctx.pluginConfig.config,
          }));

        // Auto config default (ssr) service
        if (!ctx.pluginConfig.services?.ssr) {
          ctx.pluginConfig.services ??= {};
          if (userConfig.environments?.ssr === undefined) {
            const serverEntry = resolveModulePath("./server", {
              from: [
                join(ctx.nitro.options.srcDir, "/"),
                join(ctx.nitro.options.rootDir, "src/"),
              ],
              extensions: [".ts", ".js", ".mts", ".mjs", ".tsx", ".jsx"],
              try: true,
            });
            if (serverEntry) {
              ctx.nitro!.logger.info(
                `Using \`${prettyPath(serverEntry)}\` as the server entry.`
              );
              ctx.pluginConfig.services.ssr = { entry: serverEntry };
            }
          } else {
            const input =
              userConfig.environments.ssr.build?.rollupOptions?.input;
            if (typeof input === "string") {
              ctx.pluginConfig.services.ssr = {
                entry: input,
              };
            } else {
              this.error(
                `Invalid input type for SSR entry point. Expected a string.`
              );
            }
          }
        }

        // Determine default Vite dist directory
        const publicDistDir = (ctx._publicDistDir =
          userConfig.build?.outDir ||
          resolve(ctx.nitro.options.buildDir, "vite/public"));
        ctx.nitro.options.publicAssets.push({
          dir: publicDistDir,
          maxAge: 0,
          baseURL: "/",
          fallthrough: true,
        });

        // Nitro Vite Production Runtime
        if (!ctx.nitro.options.dev) {
          ctx.nitro.options.unenv.push({
            meta: { name: "nitro-vite" },
            polyfill: ["#nitro-vite-entry"],
          });
        }

        // Call build:before hook **before resolving rollup config** for compatibility
        await ctx.nitro.hooks.callHook("build:before", ctx.nitro);

        // Resolve common rollup options
        ctx.rollupConfig = await getViteRollupConfig(ctx);

        return {
          // Don't include HTML middlewares
          appType: userConfig.appType || "custom",

          // Add Nitro as a Vite environment
          environments: {
            client: {
              consumer: userConfig.environments?.client?.consumer || "client",
            },
            ...createServiceEnvironments(ctx),
            nitro: createNitroEnvironment(ctx),
          },

          resolve: {
            // TODO: environment specific aliases not working
            // https://github.com/vitejs/vite/pull/17583 (seems not effective)
            alias: ctx.rollupConfig.base.aliases,
          },

          build: {
            // TODO: Support server environment emitted assets
            assetsInlineLimit: 4096 * 4,
          },

          builder: {
            /// Share the config instance among environments to align with the behavior of dev server
            sharedConfigBuild: true,
          },
        };
      },

      buildApp: {
        order: "post",
        handler(builder) {
          return buildEnvironments(ctx, builder);
        },
      },

      generateBundle: {
        handler(_options, bundle) {
          const { root } = this.environment.config;
          const services = ctx.pluginConfig.services || {};
          const serviceNames = Object.keys(services);
          const isRegisteredService = serviceNames.includes(
            this.environment.name
          );

          // find entry point of this service
          let entryFile: string | undefined;
          for (const [_name, file] of Object.entries(bundle)) {
            if (file.type === "chunk") {
              if (isRegisteredService && file.isEntry) {
                if (entryFile !== undefined) {
                  this.error(
                    `Multiple entry points found for service "${this.environment.name}". Only one entry point is allowed.`
                  );
                }
                entryFile = file.fileName;
              }
              const filteredModuleIds = file.moduleIds.filter((id) =>
                id.startsWith(root)
              );
              for (const id of filteredModuleIds) {
                const originalFile = relative(root, id);
                ctx._manifest[originalFile] = { file: file.fileName };
              }
            }
          }
          if (isRegisteredService) {
            if (entryFile === undefined) {
              this.error(
                `No entry point found for service "${this.environment.name}".`
              );
            }
            ctx._entryPoints![this.environment.name] = entryFile!;
            ctx._serviceBundles[this.environment.name] = bundle;
          }
        },
      },

      // Modify environment configs before it's resolved.
      configEnvironment(name, config) {
        if (config.consumer === "client") {
          config.build!.emptyOutDir = false;
          config.build!.outDir = ctx.nitro!.options.output.publicDir;
        }

        const services = ctx.pluginConfig.services || {};
        const serviceNames = Object.keys(services);
        if (serviceNames.includes(name)) {
          // we don't write to the file system
          // instead, the generateBundle hook will capture the output and write it to the virtual file system to be used by the nitro build later
          config.build ??= {};
          config.build.write = config.build.write ?? false;
        }
      },

      // Extend Vite dev server with Nitro middleware
      configureServer: (server) => configureViteDevServer(ctx, server),
    },
    {
      name: "nitro:prepare",
      buildApp: {
        // clean the output directory before any environment is built
        order: "pre",
        async handler() {
          const nitro = ctx.nitro!;
          await prepare(nitro);
        },
      },
    },
  ];
}

function nitroServicePlugin(ctx: NitroPluginContext): VitePlugin {
  return {
    name: "nitro:service",

    // Only apply this plugin to the nitro environment
    applyToEnvironment: (env) => env.name === "nitro",

    resolveId: {
      async handler(id, importer, options) {
        // Virtual modules
        if (id === "#nitro-vite-entry") {
          return { id, moduleSideEffects: true };
        }
        if (id === "#nitro-vite-services") {
          return id;
        }

        // Run rollup resolve hooks in dev (VFS support)
        if (ctx.nitro?.options.dev) {
          for (const plugin of ctx.rollupConfig!.config
            .plugins as RollupPlugin[]) {
            if (typeof plugin.resolveId !== "function") continue;
            // prettier-ignore
            const resolved = await plugin.resolveId.call(this, id, importer, options);
            if (resolved) {
              return resolved;
            }
          }
        }

        // Resolve built-in deps
        if (
          runtimeDependencies.some(
            (dep) => id === dep || id.startsWith(`${dep}/`)
          )
        ) {
          const resolved = await this.resolve(id, importer, {
            ...options,
            skipSelf: true,
          });
          return (
            resolved ||
            resolveModulePath(id, {
              from: ctx.nitro!.options.nodeModulesDirs,
              conditions: ctx.nitro!.options.exportConditions,
              try: true,
            })
          );
        }

        // Resolve relative paths from virtual modules
        if (importer?.startsWith("\0virtual:#nitro-internal-virtual")) {
          const internalRes = await this.resolve(id, import.meta.url, {
            ...options,
            custom: { ...options.custom, skipNoExternals: true },
          });
          if (internalRes) {
            return internalRes;
          }
          return (
            resolveModulePath(id, {
              from: [ctx.nitro!.options.rootDir, import.meta.url],
              try: true,
            }) ||
            resolveModulePath("./" + id, {
              from: [ctx.nitro!.options.rootDir, import.meta.url],
              try: true,
            })
          );
        }
      },
    },

    load: {
      async handler(id) {
        // Virtual modules
        if (id === "#nitro-vite-entry") {
          return prodEntry(ctx);
        }
        if (id === "#nitro-vite-services") {
          const router = rou3.createRouter();
          for (const [name, service] of Object.entries(
            ctx.pluginConfig.services || {}
          )) {
            const route = service.route || (name === "ssr" ? "/**" : undefined);
            if (!route) {
              continue;
            }
            rou3.addRoute(router, "", route, { service: name });
          }
          return `export const findService = ${rou3Compiler.compileRouterToString(router)};`;
        }

        // Run rollup load hooks in dev (VFS support)
        if (ctx.nitro?.options.dev) {
          for (const plugin of ctx.rollupConfig!.config
            .plugins as RollupPlugin[]) {
            if (typeof plugin.load !== "function") continue;
            const resolved = await plugin.load.call(this, id);
            if (resolved) {
              return resolved;
            }
          }
        }
      },
    },
  };
}
