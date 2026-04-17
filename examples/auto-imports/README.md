当启用自动导入时，从 `server/utils/` 导出的函数会自动可用，无需显式导入。只需定义一次工具函数，即可在服务器代码的任何地方使用。

## 配置

通过在配置中设置 `imports` 来启用自动导入：

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  serverDir: true,
  imports: {},
});
```

## 使用自动导入

1. 在 `server/utils/` 中创建实用工具文件：

```ts [server/utils/hello.ts]
export function makeGreeting(name: string) {
  return `Hello, ${name}!`;
}
```

2. 函数无需导入即可使用：

```ts [server.ts]
import { defineHandler } from "nitro";

export default defineHandler(() => `<h1>${makeGreeting("Nitro")}</h1>`);
```

通过这种方式，从 `server/utils/` 导出的任意函数都会自动变为全局可用。Nitro 会扫描该目录并自动生成所需的导入。
