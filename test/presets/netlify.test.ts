import { promises as fsp } from "node:fs";
import type { Context } from "@netlify/functions";
import { resolve } from "pathe";
import { describe, expect, it } from "vitest";
import { getPresetTmpDir, setupTest, testNitro } from "../tests";

describe("nitro:preset:netlify", async () => {
  const ctx = await setupTest("netlify", {
    config: {
      output: {
        publicDir: resolve(getPresetTmpDir("netlify"), "dist"),
      },
      netlify: {
        images: {
          remote_images: ["https://example.com/.*"],
        },
      },
    },
  });
  testNitro(
    ctx,
    async () => {
      const { default: handler } = (await import(
        resolve(ctx.outDir, "server/main.mjs")
      )) as { default: (req: Request, ctx: Context) => Promise<Response> };
      return async ({ url: rawRelativeUrl, headers, method, body }) => {
        // creating new URL object to parse query easier
        const url = new URL(`https://example.com${rawRelativeUrl}`);
        const req = new Request(url, {
          headers: headers ?? {},
          method,
          body,
        });
        const res = await handler(req, {} as Context);
        return res;
      };
    },
    (_ctx, callHandler) => {
      it("adds route rules - redirects", async () => {
        const redirects = await fsp.readFile(
          resolve(ctx.outDir, "../dist/_redirects"),
          "utf8"
        );

        expect(redirects).toMatchInlineSnapshot(`
        "/rules/nested/override	/other	302
        /rules/redirect/wildcard/*	https://nitro.unjs.io/:splat	302
        /rules/redirect/obj	https://nitro.unjs.io/	301
        /rules/nested/*	/base	302
        /rules/redirect	/base	302
        "
        `);
      });
      it("adds route rules - headers", async () => {
        const headers = await fsp.readFile(
          resolve(ctx.outDir, "../dist/_headers"),
          "utf8"
        );

        expect(headers).toMatchInlineSnapshot(`
        "/rules/headers
          cache-control: s-maxage=60
        /rules/cors
          access-control-allow-origin: *
          access-control-allow-methods: GET
          access-control-allow-headers: *
          access-control-max-age: 0
        /rules/nested/*
          x-test: test
        /build/*
          cache-control: public, max-age=3600, immutable
        "
      `);
      });
      it("writes config.json", async () => {
        const config = await fsp
          .readFile(resolve(ctx.outDir, "../deploy/v1/config.json"), "utf8")
          .then((r) => JSON.parse(r));
        expect(config).toMatchInlineSnapshot(`
          {
            "images": {
              "remote_images": [
                "https://example.com/.*",
              ],
            },
          }
        `);
      });
      describe("matching ISR route rule with no max-age", () => {
        it("sets Netlify-CDN-Cache-Control header with revalidation after 1 year and durable directive", async () => {
          const { headers } = await callHandler({ url: "/rules/isr" });
          expect(
            (headers as Record<string, string>)["netlify-cdn-cache-control"]
          ).toBe("public, max-age=31536000, must-revalidate, durable");
        });
        it("sets Cache-Control header with immediate revalidation", async () => {
          const { headers } = await callHandler({ url: "/rules/isr" });
          expect((headers as Record<string, string>)["cache-control"]).toBe(
            "public, max-age=0, must-revalidate"
          );
        });
      });
      describe("matching ISR route rule with a max-age", () => {
        it("sets Netlify-CDN-Cache-Control header with SWC=1yr, given max-age, and durable directive", async () => {
          const { headers } = await callHandler({ url: "/rules/isr-ttl" });
          expect(
            (headers as Record<string, string>)["netlify-cdn-cache-control"]
          ).toBe(
            "public, max-age=60, stale-while-revalidate=31536000, durable"
          );
        });
        it("sets Cache-Control header with immediate revalidation", async () => {
          const { headers } = await callHandler({ url: "/rules/isr-ttl" });
          expect((headers as Record<string, string>)["cache-control"]).toBe(
            "public, max-age=0, must-revalidate"
          );
        });
      });
      it("does not overwrite Cache-Control headers given a matching non-ISR route rule", async () => {
        const { headers } = await callHandler({ url: "/rules/dynamic" });
        expect(
          (headers as Record<string, string>)["cache-control"]
        ).not.toBeDefined();
        expect(
          (headers as Record<string, string>)["netlify-cdn-cache-control"]
        ).not.toBeDefined();
      });
      // Regression test for https://github.com/unjs/nitro/issues/2431
      it("matches paths with a query string", async () => {
        const { headers } = await callHandler({
          url: "/rules/isr-ttl?foo=bar",
        });
        expect(
          (headers as Record<string, string>)["netlify-cdn-cache-control"]
        ).toBe("public, max-age=60, stale-while-revalidate=31536000, durable");
      });
    }
  );
});
