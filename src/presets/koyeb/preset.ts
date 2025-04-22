import { defineNitroPreset } from "../_utils/preset";

const koyeb = defineNitroPreset(
  {
    extends: "node-server",
    serveStatic: true,
  },
  {
    name: "koyeb" as const,
    url: import.meta.url,
  }
);

export default [koyeb] as const;
