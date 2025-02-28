import type { Preset } from "unenv";

export const common: Preset = {
  alias: {
    "node-mock-http/_polyfill/events": "node:events",
    "node-mock-http/_polyfill/buffer": "node:buffer",
    "buffer/": "node:buffer",
    "buffer/index": "node:buffer",
    "buffer/index.js": "node:buffer",
  },
};

export const node: Preset = {};

export const nodeless: Preset = {
  inject: {
    global: "unenv/polyfill/globalthis",
    process: "node:process",
    Buffer: ["node:buffer", "Buffer"],
    clearImmediate: ["node:timers", "clearImmediate"],
    setImmediate: ["node:timers", "setImmediate"],
    performance: "unenv/polyfill/performance",
    PerformanceObserver: ["node:perf_hooks", "PerformanceObserver"],
    BroadcastChannel: "node:node:worker_threads",
  },
  polyfill: [
    "unenv/polyfill/globalthis-global",
    "unenv/polyfill/process",
    "unenv/polyfill/buffer",
    "unenv/polyfill/timers",
  ],
};
