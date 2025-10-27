import { defineNitroPreset } from "../_utils/preset";
import { writeFile } from "../_utils/fs";
import { resolve } from "pathe";
import { unenvDeno } from "./unenv/preset";

const denoDeploy = defineNitroPreset(
  {
    entry: "./deno/runtime/deno-deploy",
    exportConditions: ["deno"],
    node: false,
    noExternals: true,
    serveStatic: "deno",
    commands: {
      preview: "",
      deploy:
        "cd ./ && deployctl deploy --project=<project_name> server/index.ts",
    },
    unenv: unenvDeno,
    rollupConfig: {
      preserveEntrySignatures: false,
      external: (id) => id.startsWith("https://") || id.startsWith("node:"),
      output: {
        entryFileNames: "index.ts",
        manualChunks: (id) => "index",
        format: "esm",
      },
    },
  },
  {
    name: "deno-deploy" as const,
  }
);

const denoServer = defineNitroPreset(
  {
    entry: "./deno/runtime/deno-server",
    serveStatic: true,
    exportConditions: ["deno"],
    commands: {
      preview: "deno task --config ./deno.json start",
    },
    rollupConfig: {
      external: (id) => id.startsWith("https://"),
      output: {
        hoistTransitiveImports: false,
      },
    },
    hooks: {
      async compiled(nitro) {
        // https://docs.deno.com/runtime/fundamentals/configuration/
        const denoJSON = {
          tasks: {
            start:
              "deno run --allow-net --allow-read --allow-write --allow-env --unstable-byonm --unstable-node-globals ./server/index.mjs",
          },
        };
        await writeFile(
          resolve(nitro.options.output.dir, "deno.json"),
          JSON.stringify(denoJSON, null, 2)
        );
      },
    },
  },
  {
    name: "deno-server" as const,
  }
);

export default [denoDeploy, denoServer] as const;
