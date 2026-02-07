---
category: config
icon: i-lucide-settings
---

# 运行时配置

> 支持运行时访问的环境感知配置。

<!-- automd:ui-code-tree src="." default="nitro.config.ts" ignore="README.md,GUIDE.md" expandAll -->

::code-tree{defaultValue="nitro.config.ts" expandAll}

```text [.env]
# 切勿提交敏感数据。本示例仅供演示用途。
NITRO_API_KEY=secret-api-key
```

```text [.gitignore]
# 本示例仅演示。请勿在实际项目中提交敏感数据
!.env
```

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
import { defineHandler } from "nitro/h3";
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

<!-- automd:file src="GUIDE.md" -->

运行时配置允许你定义可被环境变量在运行时覆盖的配置值。

## 定义配置模式

在 `nitro.config.ts` 中声明带默认值的运行时配置：

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  serverDir: "./",
  runtimeConfig: {
    apiKey: "",
  },
});
```

## 运行时访问

使用 `useRuntimeConfig` 在处理函数中访问配置值：

```ts [server.ts]
import { defineHandler } from "nitro/h3";
import { useRuntimeConfig } from "nitro/runtime-config";

export default defineHandler((event) => {
  const runtimeConfig = useRuntimeConfig();
  return { runtimeConfig };
});
```

## 环境变量

通过以 `NITRO_` 为前缀的环境变量覆盖配置值：

```sh [.env]
# 切勿提交敏感数据。本示例仅供演示用途。
NITRO_API_KEY=secret-api-key
```

<!-- /automd -->

## 了解更多

- [配置](/docs/configuration)