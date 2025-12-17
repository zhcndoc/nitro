import { defineBuildConfig } from "obuild/config";

import { resolveModulePath } from "exsolve";
import { traceNodeModules } from "nf3";
import { readFile, writeFile, rm } from "node:fs/promises";

const isStub = process.argv.includes("--stub");

const pkg = await import("./package.json", { with: { type: "json" } }).then(
  (r) => r.default || r
);

const tracePkgs = [
  "cookie-es", // used by azure runtime
  "croner", // used by internal/task
  "defu", // used by open-api runtime
  "destr", // used by node-server and deno-server
  "get-port-please", // used by dev server
  "hookable", // used by app.ts
  "rendu", // used by HTML renderer template
  "scule", // used by runtime config
  "source-map", // used by dev error runtime
  "ufo", // used by presets and runtime
  "unctx", // used by internal/context
  "youch", // used by error handler
  "youch-core", // used by error handler
];

export default defineBuildConfig({
  entries: [
    {
      type: "bundle",
      input: [
        "src/builder.ts",
        "src/vite.ts",
        "src/cli/index.ts",
        "src/types/index.ts",
      ],
    },
    {
      type: "transform",
      input: "src/runtime/",
      outDir: "dist/runtime",
    },
    {
      type: "transform",
      input: "src/presets/",
      outDir: "dist/presets",
      filter: (id) => id.includes("runtime/"),
    },
  ],
  hooks: {
    rolldownConfig(config) {
      config.platform = "node";

      config.external ??= [];
      (config.external as string[]).push(
        "nitro",
        ...Object.keys(pkg.exports || {}).map((key) =>
          key.replace(/^./, "nitro")
        ),
        ...Object.keys(pkg.dependencies),
        ...Object.keys(pkg.peerDependencies),
        ...tracePkgs,
        "typescript",
        "firebase-functions",
        "@scalar/api-reference",
        "get-port-please",
        "cloudflare:workers",
        "@cloudflare/workers-types",
        // unplugin deps
        "@rspack/core",
        "@farmfe/core",
        "webpack",
        "unloader"
      );
    },
    rolldownOutput(config) {
      config.chunkFileNames = (chunk) => {
        if (chunk.name.startsWith("_")) {
          return `[name].mjs`;
        }
        if (chunk.name === "rolldown-runtime") {
          return `_rolldown.mjs`;
        }
        if (chunk.name.startsWith("libs/")) {
          return `_[name].mjs`;
        }
        if (chunk.moduleIds.every((id) => /src\/cli\//.test(id))) {
          return `cli/_chunks/[name].mjs`;
        }
        if (chunk.moduleIds.every((id) => /build\/vite\//.test(id))) {
          return `_build/vite.[name].mjs`;
        }
        if (chunk.moduleIds.every((id) => /build\/rolldown\//.test(id))) {
          return `_build/rolldown.mjs`;
        }
        if (
          chunk.moduleIds.every((id) =>
            /build\/rollup\/|build\/plugins/.test(id)
          )
        ) {
          return `_build/rollup.mjs`;
        }
        if (chunk.moduleIds.every((id) => /src\/dev\/|src\/runtime/.test(id))) {
          return `_dev.mjs`;
        }
        if (chunk.moduleIds.every((id) => /src\/presets/.test(id))) {
          return `_presets.mjs`;
        }
        if (
          chunk.moduleIds.every((id) =>
            /src\/build\/|src\/presets|src\/utils/.test(id)
          )
        ) {
          return `_build/shared.mjs`;
        }
        if (
          chunk.moduleIds.every((id) => /src\/(runner|dev|runtime)/.test(id))
        ) {
          return `_dev.mjs`;
        }
        return "_nitro.mjs";
      };
    },
    async end() {
      if (isStub) {
        return;
      }
      // Trace included dependencies
      await traceNodeModules(
        tracePkgs.map((pkg) => resolveModulePath(pkg)),
        {
          hooks: {
            tracedPackages(packages) {
              // Avoid tracing direct dependencies
              const deps = new Set([
                ...Object.keys(pkg.dependencies),
                ...Object.keys(pkg.peerDependencies),
              ]);
              for (const dep of deps) {
                delete packages[dep];
              }
            },
          },
        }
      );

      // Generate type hints
      const nitroImports = Object.keys(pkg.exports || {}).map((key) =>
        key.replace(/^./, "nitro")
      );
      const nitroTypes = nitroImports
        .map((imp) => `import "${imp}";`)
        .join("\n");

      const types = await readFile("dist/types/index.d.mts", "utf8");
      await writeFile(
        "dist/types/index.d.mts",
        `${nitroTypes}\n${types}`,
        "utf8"
      );
      await rm("dist/types/index.mjs");
    },
  },
});
