Nitro 可以通过 Node [diagnostics channels](https://nodejs.org/api/diagnostics_channel.html) 对其请求生命周期进行检测——无需 OpenTelemetry SDK。此示例开启检测功能并启用内置控制台日志记录器，将每个 h3、srvx 和 unstorage span 按请求分组到时间线（瀑布图）中。

## 启用追踪

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  // Instrument the h3, srvx and unstorage tracing channels.
  tracingChannel: true,

  experimental: {
    // Log every completed span to the console (built-in, dependency-free sink).
    tracingLogger: true,
  },
});
```

`tracingChannel: true` 会连接生产者（它接受 `{ h3, srvx, unstorage }` 以追踪其中一部分）。`experimental.tracingLogger` 会添加一个内置接收器，将每个已完成的 span 通过 `console.log` 输出——这是无需依赖供应商导出器的替代方案，适合本地开发。

## 试用

```sh
npm run dev
# then, in another terminal:
curl http://localhost:3000/
curl http://localhost:3000/users/42
```

每个请求都会在控制台打印其 span 的时间线——包括中间件、匹配的路由以及每个存储操作，并根据它们的执行时间和持续时长确定位置和大小：

```
▶ GET /  4.10ms  (4 spans)
  middleware GET /             █·······················   0.12ms h3.handler_type=middleware http.route=/
  GET /                        ·███████████████████·····   2.49ms h3.handler_type=route http.route=/
  getItem                      ···██····················   0.18ms db.operation=getItem db.system=memory unstorage.keys_count=1
  setItem                      ·····██··················   0.16ms db.operation=setItem db.system=memory unstorage.keys_count=1
```

标题行（`▶`）表示请求本身——包括其方法、路径和总耗时；下面的行则是其中运行的 span。请注意，动态路由使用其匹配的模板命名——`GET /users/:id`，而不是 `/users/42`——根据 OpenTelemetry HTTP conventions 保持较低基数的 span 名称。

请求边界来自 Nitro 的 `request`/`response` 运行时钩子，因此在 `vite dev` 和生产构建中，分组方式完全相同。Span 通过异步上下文按请求分组，因此并发请求的时间线会彼此分离，失败的 span 会以 `✖` 标记，并显示其错误消息。

## 追踪的内容

| Channel | Span | Emitted by |
| --- | --- | --- |
| `h3.request` | 每个匹配的路由和中间件 | `server/routes/*`、`server/middleware/*` |
| `unstorage.*` | 每个存储操作（`getItem`、`setItem`、…） | `server/routes/index.ts` 中的 `useStorage()` |
| `srvx.request` | 整个请求，以及响应状态（生产服务器） | srvx 服务器层 |
