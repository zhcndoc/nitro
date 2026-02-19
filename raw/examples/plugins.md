# 插件（Plugins）

> 使用自定义插件扩展 Nitro，用于钩子和生命周期事件。

<code-tree :expand-all="true" default-value="server/plugins/test.ts" expand-all="">

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  serverDir: true,
});
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
import { eventHandler } from "h3";

export default eventHandler(() => "<h1>Hello Nitro!</h1>");
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

</code-tree>

插件让你可以挂载到 Nitro 的运行时生命周期中。此示例展示了一个修改每个响应的 `Content-Type` 头的插件。在 `server/plugins/` 中创建文件，插件会在启动时自动加载。

## 定义一个插件

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

该插件使用 `useNitroHooks()` 访问钩子系统，然后注册了一个 `response` 钩子，会在每次请求后执行。这里它将内容类型设置为 HTML，但你也可以记录请求、添加安全头，或以任何方式修改响应。

## 主处理器

```ts [server.ts]
import { eventHandler } from "h3";

export default eventHandler(() => "<h1>Hello Nitro!</h1>");
```

处理器返回 HTML，但没有设置内容类型。插件会自动给响应添加正确的 `Content-Type: html; charset=utf-8` 头。

## 了解更多

- [插件](/docs/plugins)
- [生命周期](/docs/lifecycle)
