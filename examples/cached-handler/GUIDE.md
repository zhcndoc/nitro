该示例演示了如何缓存一个耗时操作（500 毫秒延迟），以及如何通过查询参数有条件地绕过缓存。首次请求时，处理程序执行并缓存结果。随后的请求会立即返回缓存的响应，直到缓存过期或被绕过。

## 工作原理

```ts [server.ts]
import { html } from "nitro/h3";
import { defineCachedHandler } from "nitro/cache";

export default defineCachedHandler(
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return html`
      响应生成时间 ${new Date().toISOString()}（耗时 500ms）
      <br />(<a href="?skipCache=true">跳过缓存</a>)
    `;
  },
  { shouldBypassCache: ({ req }) => req.url.includes("skipCache=true") }
);
```

处理程序通过500毫秒的延迟模拟了一个缓慢操作。由于被 `defineCachedHandler` 包裹，首次执行后响应会被缓存。`shouldBypassCache` 选项会检查 URL 中是否包含 `?skipCache=true`，存在时则跳过缓存，强制处理程序重新执行。