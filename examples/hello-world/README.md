The simplest Nitro server. Export an object with a `fetch` method that receives a standard `Request` and returns a `Response`. No frameworks, no abstractions, just the web platform.

## 服务器入口

```ts [server.ts]
export default {
  fetch(req: Request) {
    return new Response("Nitro Works!");
  },
};
```

`fetch` 方法遵循与 Service Workers 和 Cloudflare Workers 相同的签名。此模式适用于所有部署目标，因为它使用了 Web 标准。

Add the Nitro plugin to Vite and it handles the rest: dev server, hot reloading, and production builds.
