此示例展示了如何缓存一个开销较大的操作（延迟 500 ms），并使用查询参数有条件地绕过缓存。首次请求时，处理程序会执行并缓存结果。后续请求会立即返回缓存的响应，直到缓存过期或被绕过。

## 工作原理

```ts [server.ts]
import { html } from "nitro";
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

该处理程序通过 500ms 的延迟模拟一个缓慢的操作。由于 `defineCachedHandler` 对其进行了封装，响应会在首次执行后被缓存。`shouldBypassCache` 选项会检查 URL 中是否包含 `?skipCache=true`，如果存在，则跳过缓存并直接重新执行处理程序。
