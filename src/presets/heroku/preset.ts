import { defineNitroPreset } from "../_utils/preset";

const heroku = defineNitroPreset(
  {
    extends: "node-server",
    serveStatic: true,
  },
  {
    name: "heroku" as const,
    url: import.meta.url,
  }
);

export default [heroku] as const;
