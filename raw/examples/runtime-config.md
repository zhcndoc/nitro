# 运行时配置

> 支持运行时访问的环境感知配置。

<code-tree :expand-all="true" default-value="nitro.config.ts" expand-all="">

```text [.env]
# NEVER COMMIT SENSITIVE DATA. THIS IS ONLY FOR DEMO PURPOSES.
NITRO_API_KEY=secret-api-key
```

```text [.gitignore]
# THIS IS ONLY FOR DEMO. DO NOT COMMIT SENSITIVE DATA IN REAL PROJECTS
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

</code-tree>

Runtime 配置允许你定义可以在运行时通过环境变量覆盖的配置值。

## 定义配置 Schema

在 `nitro.config.ts` 中声明你的运行时配置及默认值：

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

在你的处理器中使用 `useRuntimeConfig` 来访问配置值：

```ts [server.ts]
import { defineHandler } from "nitro/h3";
import { useRuntimeConfig } from "nitro/runtime-config";

export default defineHandler((event) => {
  const runtimeConfig = useRuntimeConfig();
  return { runtimeConfig };
});
```

## 环境变量

通过带有前缀 `NITRO_` 的环境变量来覆盖配置值：

```sh [.env]
# 切勿提交敏感数据。本示例仅用于演示。
NITRO_API_KEY=secret-api-key
```

## 了解更多

- [配置](/docs/configuration)
