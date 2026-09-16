---
category: features
icon: i-lucide-activity
---

# 追踪

> 使用诊断通道和内置追踪日志记录请求生命周期

<!-- automd:ui-code-tree src="../../examples/tracing" default="nitro.config.ts" ignore="README.md,GUIDE.md" expandAll -->

::code-tree{defaultValue="nitro.config.ts" expandAll}

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  serverDir: true,

  // Instrument the h3, srvx and unstorage tracing channels.
  tracingChannel: true,

  experimental: {
    // Log every completed span to the console (built-in, dependency-free sink).
    tracingLogger: true,
  },
});
```

```json [package.json]
{
  "type": "module",
  "scripts": {
    "build": "nitro build",
    "dev": "nitro dev",
    "preview": "node .output/server/index.mjs"
  },
  "devDependencies": {
    "nitro": "latest"
  }
}
```

```json [tsconfig.json]
{
  "extends": "nitro/tsconfig"
}
```

```ts [server/middleware/timing.ts]
import { defineMiddleware } from "nitro";

// A trivial middleware — each request produces its own `middleware` span.
export default defineMiddleware((event) => {
  event.context.requestedAt = Date.now();
});
```

```ts [server/routes/index.ts]
import { defineHandler } from "nitro";
import { useStorage } from "nitro/storage";

// Reads and writes storage so the request emits `unstorage.*` spans (CLIENT)
// alongside the `srvx.request`, `middleware` and route (`h3.request`) spans.
export default defineHandler(async () => {
  const storage = useStorage();
  const hits = ((await storage.getItem<number>("hits")) ?? 0) + 1;
  await storage.setItem("hits", hits);
  return { message: "Hello from the Nitro tracing demo", hits };
});
```

```ts [server/routes/users/[id].ts]
import { defineHandler } from "nitro";

// A dynamic route — spans are named by the matched route template
// (`GET /users/:id`), not the concrete path, to keep cardinality low.
export default defineHandler((event) => ({
  user: { id: event.context.params!.id },
}));
```

::

<!-- /automd -->

<!-- automd:file src="../../examples/tracing/README.md" -->

Nitro 可以通过 Node [诊断通道](https://nodejs.org/api/diagnostics_channel.html)记录其请求生命周期，无需 OpenTelemetry SDK。此示例会开启插桩并启用内置控制台日志记录器，将每个 h3、srvx 和 unstorage span 按请求分组为时间线（瀑布图）。

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

`tracingChannel: true` 会连接生产者（传入 `{ h3, srvx, unstorage }` 可仅追踪其中一部分）。`experimental.tracingLogger` 会添加一个内置接收器，通过 `console.log` 记录每个已完成的 span，是一种无需依赖的供应商导出器替代方案，适用于本地开发。

## 试用

```sh
npm run dev
# then, in another terminal:
curl http://localhost:3000/
curl http://localhost:3000/users/42
```

每个请求都会在控制台输出其 span 时间线——包括中间件、匹配的路由以及每个存储操作，并根据它们的执行时间和耗时确定位置与长度：

```
▶ GET /  4.10ms  (4 spans)
  middleware GET /             █·······················   0.12ms h3.handler_type=middleware http.route=/
  GET /                        ·███████████████████·····   2.49ms h3.handler_type=route http.route=/
  getItem                      ···██····················   0.18ms db.operation=getItem db.system=memory unstorage.keys_count=1
  setItem                      ·····██··················   0.16ms db.operation=setItem db.system=memory unstorage.keys_count=1
```

标题行（`▶`）表示请求本身——包括其方法、路径和总耗时；下面的各行则是请求中运行的 span。请注意，动态路由使用其匹配的模板命名——`GET /users/:id`，而不是 `/users/42`——根据 OpenTelemetry HTTP 约定保持 span 名称的低基数。

请求边界来自 Nitro 的 `request`／`response` 运行时钩子，因此在 `vite dev` 和生产构建中，分组方式完全一致。Span 通过异步上下文按请求分组，因此并发请求的时间线仍彼此独立；失败的 span 会以 `✖` 标记，并显示其错误消息。

## 追踪内容

| 通道 | Span | 发出方 |
| --- | --- | --- |
| `h3.request` | 每个匹配的路由和中间件 | `server/routes/*`、`server/middleware/*` |
| `unstorage.*` | 每个存储操作（`getItem`、`setItem`、…） | `server/routes/index.ts` 中的 `useStorage()` |
| `srvx.request` | 整个请求及响应状态（生产服务器） | srvx 服务器层 |

<!-- /automd -->
