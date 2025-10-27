import { defineNitroPreset } from "../_utils/preset";

const bun = defineNitroPreset(
  {
    entry: "./bun/runtime/bun",
    serveStatic: true,
    // https://bun.sh/docs/runtime/modules#resolution
    exportConditions: ["bun", "node", "import", "default"],
    commands: {
      preview: "bun run ./server/index.mjs",
    },
  },
  {
    name: "bun" as const,
  }
);

export default [bun] as const;
