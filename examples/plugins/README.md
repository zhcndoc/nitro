插件可以让你接入 Nitro 的运行时生命周期。这个示例展示了一个会在每次响应时修改 `Content-Type` 响应头的插件。将文件创建在 `server/plugins/` 中后，它们会在启动时自动加载。

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
import { defineHandler } from "nitro";

export default defineHandler(() => "<h1>Hello Nitro!</h1>");
```

这个处理器返回的是 HTML，但没有显式设置内容类型。插件会自动为响应补上正确的 `Content-Type: html; charset=utf-8` 响应头。
