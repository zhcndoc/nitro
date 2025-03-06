import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "pathe";
import { normalize } from "pathe";
import { defineBuildConfig } from "unbuild";
import { build } from "esbuild";
import { cp } from "node:fs/promises";
import { readPackageJSON } from "pkg-types";

const srcDir = fileURLToPath(new URL("src", import.meta.url));

const ver = (id: string) => readPackageJSON(id).then((m) => m.version);

export const subpaths = [
  "cli",
  "config",
  "core",
  "kit",
  "presets",
  "rollup",
  "runtime",
  "meta",
  "types",
];

export default defineBuildConfig({
  declaration: true,
  name: "nitro",
  entries: [
    // CLI
    { input: "src/cli/index.ts" },
    // Config
    { input: "src/config/index.ts" },
    // Core
    { input: "src/core/index.ts" },
    // Runtime
    { input: "src/runtime/", outDir: "dist/runtime", format: "esm" },
    // Kit
    { input: "src/kit/index.ts" },
    // Meta
    { input: "src/meta/index.ts" },
    // Presets
    { input: "src/presets/", outDir: "dist/presets", format: "esm" },
    // Rollup
    { input: "src/rollup/index.ts" },
    // Types
    { input: "src/types/index.ts" },
  ],
  hooks: {
    async "build:prepare"(ctx) {
      for (const subpath of subpaths) {
        await writeFile(
          `./${subpath}.d.ts`,
          `export * from "./dist/${subpath}/index";`
        );
      }
    },
    async "rollup:done"(ctx) {
      await buildYouch();
    },
  },
  externals: [
    "nitro",
    "nitropack",
    "nitropack/runtime/meta",
    ...subpaths.map((subpath) => `nitropack/${subpath}`),
    "firebase-functions",
    "@scalar/api-reference",
  ],
  stubOptions: {
    jiti: {
      alias: {
        nitropack: "nitropack",
        "nitropack/meta": resolve(srcDir, "../meta.ts"),
        "nitropack/runtime/meta": resolve(srcDir, "../runtime-meta.mjs"),
        ...Object.fromEntries(
          subpaths.map((subpath) => [
            `nitropack/${subpath}`,
            resolve(srcDir, `${subpath}/index.ts`),
          ])
        ),
      },
    },
  },
  rollup: {
    output: {
      chunkFileNames(chunk: any) {
        const id = normalize(chunk.moduleIds.at(-1));
        if (id.includes("/src/cli/")) {
          return "cli/[name].mjs";
        }
        return "_chunks/[name].mjs";
      },
    },
  },
});

async function buildYouch() {
  await build({
    stdin: {
      contents: /* js */ `export { Youch } from "youch"; export { ErrorParser } from "youch-core";`,
      resolveDir: process.cwd(),
    },
    banner: {
      js: [
        "Copyright (c) virk.officials@gmail.com",
        `Bundled https://github.com/poppinss/youch ${await ver("youch")} (MIT)`,
        `Bundled https://github.com/poppinss/youch-core ${await ver("youch-core")} (MIT)`,
      ]
        .map((line) => `// ${line}`)
        .join("\n"),
    },
    bundle: true,
    outfile: "dist/deps/youch/youch.mjs",
    platform: "node",
    target: "esnext",
    format: "esm",
    legalComments: "inline",
    minifyWhitespace: true,
  });

  const youchDir = new URL("public", import.meta.resolve("youch"));
  await cp(youchDir, "dist/deps/youch/public", { recursive: true });
}
