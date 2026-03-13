Runtime config lets you define configuration values that can be overridden by environment variables at runtime.

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
import { defineHandler } from "nitro";
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
