插件可以让你接入 Nitro 的运行时生命周期。此示例展示了一个会修改每个响应的 `Content-Type` 标头的插件。在 `server/plugins/` 中创建文件后，它们会在启动时自动加载。

## 定义插件

```ts [server/plugins/test.ts]
import { definePlugin } from "nitro";
import { useNitroHooks } from "nitro/app";

export default definePlugin(() => {
  const hooks = useNitroHooks();
  hooks.hook("response", (res) => {
    res.headers.set("content-type", "html; charset=utf-8");
  });
});
```

该插件使用 `useNitroHooks()` 访问钩子系统，然后注册一个 `response` 钩子。该钩子会在每个请求之后运行，并接收传出的 `Response`。这里将内容类型设置为 HTML，但你也可以记录请求、添加安全标头，或以任何方式修改响应。

## 主处理程序

```ts [server.ts]
import { defineHandler } from "nitro";

export default defineHandler(() => "<h1>Hello Nitro!</h1>");
```

该处理程序返回 HTML，但没有设置内容类型。插件会自动将正确的 `Content-Type: html; charset=utf-8` 标头添加到响应中。
