---
category: config
icon: i-lucide-settings
---

# 运行时配置

> 支持环境感知的配置，可在运行时访问。

<!-- automd:ui-code-tree src="../../examples/runtime-config" default="nitro.config.ts" ignore="README.md,GUIDE.md" expandAll -->

::code-tree{defaultValue="nitro.config.ts" expandAll}

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  serverDir: "./",
  runtimeConfig: {
    apiKey: "",
  },
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
import { defineHandler } from "nitro";
import { useRuntimeConfig } from "nitro/runtime-config";

export default defineHandler((event) => {
  const runtimeConfig = useRuntimeConfig();
  return { runtimeConfig };
});
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

<!-- automd:file src="../../examples/runtime-config/README.md" -->

运行时配置允许你定义可在运行时被环境变量覆盖的配置值。

## 定义配置模式

在 `nitro.config.ts` 中声明带有默认值的运行时配置：

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  serverDir: "./",
  runtimeConfig: {
    apiKey: "",
  },
});
```

## 在运行时访问

使用 `useRuntimeConfig` 在你的处理程序中访问配置值：

```ts [server.ts]
import { defineHandler } from "nitro";
import { useRuntimeConfig } from "nitro/runtime-config";

export default defineHandler((event) => {
  const runtimeConfig = useRuntimeConfig();
  return { runtimeConfig };
});
```

## 环境变量

通过带有 `NITRO_` 前缀的环境变量覆盖配置值：

```sh [.env]
# 切勿提交敏感数据。这仅用于演示目的。
NITRO_API_KEY=secret-api-key
```

<!-- /automd -->

## 了解更多

- [配置](/docs/configuration)
