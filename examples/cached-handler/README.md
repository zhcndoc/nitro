---
category: features
icon: i-lucide-clock
---

# 缓存处理器

> 使用可配置的绕过逻辑缓存路由响应。

<!-- automd:ui-code-tree src="." default="server.ts" ignore="README.md,GUIDE.md" expandAll -->

::code-tree{defaultValue="server.ts" expandAll}

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({});
```

```json [package.json]
{
  "type": "module",
  "scripts": {
    "dev": "nitro dev",
    "build": "nitro build"
  },
  "devDependencies": {
    "nitro": "latest"
  }
}
```

```ts [server.ts]
import { html } from "nitro/h3";
import { defineCachedHandler } from "nitro/cache";

export default defineCachedHandler(
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return html`
      Response generated at ${new Date().toISOString()} (took 500ms)
      <br />(<a href="?skipCache=true">skip cache</a>)
    `;
  },
  { shouldBypassCache: ({ req }) => req.url.includes("skipCache=true") }
);
```

```json [tsconfig.json]
{
  "extends": "nitro/tsconfig"
}
```

```ts [vite.config.ts]
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";

export default defineConfig({ plugins: [nitro()] });
```

::

<!-- /automd -->

<!-- automd:file src="GUIDE.md" -->

此示例展示了如何缓存一个耗时操作（500 毫秒延迟），并使用查询参数有条件地绕过缓存。首次请求时，处理器执行并缓存结果。后续请求则直接返回缓存的响应，直到缓存过期或被绕过。

## 工作原理

```ts [server.ts]
import { html } from "nitro/h3";
import { defineCachedHandler } from "nitro/cache";

export default defineCachedHandler(
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return html`
      Response generated at ${new Date().toISOString()} (took 500ms)
      <br />(<a href="?skipCache=true">skip cache</a>)
    `;
  },
  { shouldBypassCache: ({ req }) => req.url.includes("skipCache=true") }
);
```

处理器通过一个 500ms 的延迟模拟了一个慢操作。由于使用了 `defineCachedHandler` 包裹，首次执行后响应会被缓存。`shouldBypassCache` 选项检查 URL 中是否包含 `?skipCache=true`，如果存在，则跳过缓存，重新执行处理器。

<!-- /automd -->

## 了解更多

- [缓存](/docs/cache)
- [存储](/docs/storage)