Plugins let you hook into Nitro's runtime lifecycle. This example shows a plugin that modifies the `Content-Type` header on every response. Create files in `server/plugins/` and they're automatically loaded at startup.

## 定义插件

```ts [server/plugins/test.ts]
import { definePlugin } from "nitro";
import { useNitroHooks } from "nitro/app";

export default definePlugin((nitroApp) => {
  const hooks = useNitroHooks();
  hooks.hook("response", (event) => {
    event.headers.set("content-type", "html; charset=utf-8");
  });
});
```

该插件使用 `useNitroHooks()` 访问钩子系统，然后注册一个 `response` 钩子，在每个请求之后运行。这里它将内容类型设置为 HTML，但你也可以记录请求、添加安全头，或以任何方式修改响应。

## 主处理器

```ts [server.ts]
import { eventHandler } from "h3";

export default eventHandler(() => "<h1>Hello Nitro!</h1>");
```

The handler returns HTML without setting a content type. The plugin automatically adds the correct `Content-Type: html; charset=utf-8` header to the response.
