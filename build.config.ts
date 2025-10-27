import { glob, rm, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "pathe";
import { normalize } from "pathe";
import { defineBuildConfig } from "unbuild";

import { resolveModulePath } from "exsolve";
import { traceNodeModules } from "nf3";

const srcDir = fileURLToPath(new URL("src", import.meta.url));
const libDir = fileURLToPath(new URL("lib", import.meta.url));

export const distSubpaths = ["presets", "runtime", "types", "vite"];
export const libSubpaths = [
  "config",
  "meta",
  "h3",
  "runtime/meta",
  "deps/h3",
  "deps/ofetch",
];

const tracePkgs = [
  "youch",
  "youch-core",
  "unctx",
  "croner",
  "defu",
  "destr",
  "hookable",
  "klona",
  "klona/full",
  "scule",
  "source-map",
  "ufo",
  "std-env",
  "get-port-please",
];

export const stubAlias = {
  nitro: resolve(srcDir, "index.ts"),
  ...Object.fromEntries(
    distSubpaths.map((subpath) => [
      `nitro/${subpath}`,
      resolve(srcDir, `${subpath}/index.ts`),
    ])
  ),
  ...Object.fromEntries(
    libSubpaths.map((subpath) => [
      `nitro/${subpath}`,
      resolve(libDir, `${subpath}.mjs`),
    ])
  ),
};

export default defineBuildConfig({
  declaration: true,
  name: "nitro",
  entries: [
    { input: "src/cli/index.ts" },
    { input: "src/index.ts" },
    { input: "src/vite.ts" },
    { input: "src/types/index.ts" },
    { input: "src/runtime/", outDir: "dist/runtime", format: "esm" },
    {
      input: "src/presets/",
      outDir: "dist/presets",
      format: "esm",
      pattern: "**/runtime/**",
    },
  ],
  hooks: {
    async "build:done"(ctx) {
      // Trace bundled dependencies
      await traceNodeModules(
        tracePkgs.map((pkg) => resolveModulePath(pkg)),
        {}
      );
      await rm("dist/node_modules/ofetch", { recursive: true, force: true });

      // Remove extra d.ts files
      for await (const file of glob(resolve(ctx.options.outDir, "**/*.d.ts"))) {
        if (file.includes("runtime") || file.includes("presets")) {
          const dtsContents = (await readFile(file, "utf8")).replaceAll(
            / from "\.\/(.+)";$/gm,
            (_, relativePath) => ` from "./${relativePath}.mjs";`
          );
          await writeFile(file.replace(/\.d.ts$/, ".d.mts"), dtsContents);
        }
        await rm(file);
      }
    },
  },
  externals: [
    "typescript",
    "nitro",
    ...[...distSubpaths, ...libSubpaths].map((subpath) => `nitro/${subpath}`),
    ...tracePkgs,
    "firebase-functions",
    "@scalar/api-reference",
    "get-port-please", // internal type only
    "@cloudflare/workers-types", // issues with rollup-plugin-dts
  ],
  stubOptions: {
    jiti: {
      alias: stubAlias,
    },
  },
  rollup: {
    inlineDependencies: true,
    output: {
      chunkFileNames(chunk: any) {
        const id = normalize(chunk.moduleIds.at(-1));
        if (id.includes("/src/cli/")) {
          return "cli/[name].mjs";
        }
        if (id.includes("/src/presets")) {
          return "presets.mjs";
        }
        return "_chunks/[name].mjs";
      },
    },
  },
});
