import { defineNitroPreset } from "../_utils/preset";

const flightControl = defineNitroPreset(
  {
    extends: "node-server",
    serveStatic: true,
  },
  {
    name: "flight-control" as const,
    url: import.meta.url,
  }
);

export default [flightControl] as const;
