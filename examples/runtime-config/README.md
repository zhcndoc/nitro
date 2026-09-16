运行时配置允许你定义可在运行时通过环境变量覆盖的配置值。

## 定义配置架构

在 `nitro.config.ts` 中使用默认值声明运行时配置：

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

在处理程序中使用 `useRuntimeConfig` 访问配置值：

```ts [server.ts]
import { defineHandler } from "nitro";
import { useRuntimeConfig } from "nitro/runtime-config";

export default defineHandler((event) => {
  const runtimeConfig = useRuntimeConfig();
  return { runtimeConfig };
});
```

## 环境变量

通过添加 `NITRO_` 前缀的环境变量覆盖配置值：

```sh [.env]
# NEVER COMMIT SENSITIVE DATA. THIS IS ONLY FOR DEMO PURPOSES.
NITRO_API_KEY=secret-api-key
```
