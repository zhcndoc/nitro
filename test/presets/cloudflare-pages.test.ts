import { promises as fsp } from "node:fs";
import { Miniflare } from "miniflare";
import { resolve } from "pathe";
import { Response as _Response } from "undici";
import { describe, expect, it } from "vitest";

import { isWindows } from "std-env";
import { setupTest, testNitro } from "../tests";

describe.skipIf(isWindows)("nitro:preset:cloudflare-pages", async () => {
  const ctx = await setupTest("cloudflare-pages");

  testNitro(ctx, () => {
    const mf = new Miniflare({
      modules: true,
      scriptPath: resolve(ctx.outDir, "_worker.js", "index.js"),
      modulesRules: [{ type: "CompiledWasm", include: ["**/*.wasm"] }],
      compatibilityFlags: ["streams_enable_constructors"],
      sitePath: "",
      bindings: { ...ctx.env },
    });

    return async ({ url, headers, method, body }) => {
      const res = await mf.dispatchFetch("http://localhost" + url, {
        headers: headers || {},
        method: method || "GET",
        redirect: "manual",
        body,
      });
      return res as unknown as Response;
    };
  });

  it("should generate a _routes.json", async () => {
    const config = await fsp
      .readFile(resolve(ctx.outDir, "_routes.json"), "utf8")
      .then((r) => JSON.parse(r));
    expect(config).toMatchInlineSnapshot(`
      {
        "exclude": [
          "/blog/static/*",
          "/cf-pages-exclude/*",
          "/build/*",
          "/_openapi.json",
          "/_openapi.json.br",
          "/_openapi.json.gz",
          "/_scalar",
          "/_swagger",
          "/_unignored.txt",
          "/favicon.ico",
          "/foo.css",
          "/foo.js",
          "/json-string",
          "/prerender",
          "/prerender-custom",
          "/_swagger/index.html.br",
          "/_swagger/index.html.gz",
          "/api/hello",
          "/api/hey",
          "/prerender/index.html.br",
          "/prerender/index.html.gz",
          "/api/param/foo.json",
          "/api/param/hidden",
          "/api/param/prerender1",
          "/api/param/prerender3",
          "/api/param/prerender4",
        ],
        "include": [
          "/*",
        ],
        "version": 1,
      }
    `);
  });
});
