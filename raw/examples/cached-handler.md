# 缓存处理器

> 缓存路由响应，支持可配置的绕过逻辑。

<code-tree :expand-all="true" default-value="server.ts">

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
import { html } from "nitro";
import { defineCachedHandler } from "nitro/cache";

export default defineCachedHandler(
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return html`
      响应生成于 ${new Date().toISOString()}（耗时 500ms）
      <br />(<a href="?skipCache=true">跳过缓存</a>)
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

</code-tree>

本示例展示如何缓存一个耗时操作（500 毫秒延迟），以及如何通过查询参数条件性地绕过缓存。首次请求时，处理器执行并缓存结果。后续请求会立即返回缓存的响应，直到缓存过期或被绕过。

## 工作原理

```ts [server.ts]
import { html } from "nitro";
import { defineCachedHandler } from "nitro/cache";

export default defineCachedHandler(
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return html`
      响应生成于 ${new Date().toISOString()}（耗时 500ms）
      <br />(<a href="?skipCache=true">跳过缓存</a>)
    `;
  },
  { shouldBypassCache: ({ req }) => req.url.includes("skipCache=true") }
);
```

该处理器模拟一个耗时操作，延迟 500 毫秒。由于 `defineCachedHandler` 对其进行了包装，首次执行后响应会被缓存。`shouldBypassCache` 选项会检查 URL 中是否包含 `?skipCache=true`，当存在时，缓存被跳过，处理器将重新运行。

## 了解更多

- [缓存](/docs/cache)
- [存储](/docs/storage)
