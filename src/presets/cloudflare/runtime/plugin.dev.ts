import type { NitroAppPlugin } from "nitro/types";
import type { GetPlatformProxyOptions, PlatformProxy } from "wrangler";
// @ts-ignore
import { useRuntimeConfig, getRequestURL } from "#imports";

const _proxy = _getPlatformProxy()
  .catch((error) => {
    console.error("Failed to initialize wrangler bindings proxy", error);
    return _createStubProxy();
  })
  // eslint-disable-next-line unicorn/prefer-top-level-await
  .then((proxy) => {
    (globalThis as any).__env__ = proxy.env;
    return proxy;
  });

// eslint-disable-next-line unicorn/prefer-top-level-await
(globalThis as any).__env__ = _proxy.then((proxy) => proxy.env);

export default <NitroAppPlugin>function (nitroApp) {
  nitroApp.hooks.hook("request", async (event) => {
    event.req.context ??= {};

    const proxy = await _proxy;

    // Inject the various cf values from the proxy in event and event.context
    event.req.context.cf = proxy.cf;
    event.req.context.waitUntil = proxy.ctx.waitUntil.bind(proxy.ctx);

    const request = new Request(event.req.url) as Request & {
      cf: typeof proxy.cf;
    };
    request.cf = proxy.cf;

    event.req.context.cloudflare = {
      ...event.req.context.cloudflare!,
      request,
      env: proxy.env,
      context: proxy.ctx,
    };

    // Replicate Nitro production behavior
    // https://github.com/unjs/nitro/blob/main/src/runtime/entries/cloudflare-pages.ts#L55
    // https://github.com/unjs/nitro/blob/main/src/runtime/app.ts#L120
    // TODO: Update for v3
    // (event.node.req as any).__unenv__ = {
    //   ...(event.node.req as any).__unenv__,
    //   waitUntil: event.context.waitUntil,
    // };
  });

  // https://github.com/pi0/nitro-cloudflare-dev/issues/5
  // https://github.com/unjs/hookable/issues/98
  // @ts-expect-error
  nitroApp.hooks._hooks.request.unshift(nitroApp.hooks._hooks.request.pop());

  // Dispose proxy when Nitro is closed
  nitroApp.hooks.hook("close", () => {
    return _proxy?.then((proxy) => proxy.dispose);
  });
};

async function _getPlatformProxy() {
  const _pkg = "wrangler"; // Bypass bundling!
  const { getPlatformProxy } = (await import(_pkg).catch(() => {
    throw new Error(
      "Package `wrangler` not found, please install it with: `npx nypm@latest add -D wrangler`"
    );
  })) as typeof import("wrangler");

  const runtimeConfig: {
    wrangler: {
      configPath: string;
      persistDir: string;
      environment?: string;
    };
  } = useRuntimeConfig();

  const proxyOptions: GetPlatformProxyOptions = {
    configPath: runtimeConfig.wrangler.configPath,
    persist: { path: runtimeConfig.wrangler.persistDir },
  };
  // TODO: investigate why
  // https://github.com/pi0/nitro-cloudflare-dev/issues/51
  if (runtimeConfig.wrangler.environment) {
    proxyOptions.environment = runtimeConfig.wrangler.environment;
  }
  const proxy = await getPlatformProxy(proxyOptions);

  return proxy;
}

function _createStubProxy(): PlatformProxy {
  return {
    env: {},
    cf: {} as any,
    ctx: {
      waitUntil() {},
      passThroughOnException() {},
      props: {},
    },
    caches: {
      open(): Promise<_CacheStub> {
        const result = Promise.resolve(new _CacheStub());
        return result;
      },
      get default(): _CacheStub {
        return new _CacheStub();
      },
    },
    dispose: () => Promise.resolve(),
  };
}

class _CacheStub {
  delete(): Promise<boolean> {
    const result = Promise.resolve(false);
    return result;
  }

  match() {
    const result = Promise.resolve(undefined);
    return result;
  }

  put(): Promise<void> {
    const result = Promise.resolve();
    return result;
  }
}
