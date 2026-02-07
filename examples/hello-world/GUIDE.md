最简单的 Nitro 服务器。导出一个带有 `fetch` 方法的对象，该方法接收一个标准的 `Request` 并返回一个 `Response`。没有框架，没有抽象，只有 Web 平台。

## 服务器入口

```ts [server.ts]
export default {
  fetch(req: Request) {
    return new Response("Nitro Works!");
  },
};
```

`fetch` 方法遵循与 Service Workers 和 Cloudflare Workers 相同的签名。由于它使用了 Web 标准，这种模式适用于所有部署目标。

将 Nitro 插件添加到 Vite，它会处理剩下的部分：开发服务器、热重载和生产构建。