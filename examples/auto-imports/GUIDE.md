从 `server/utils/` 导出的函数在启用自动导入时，无需显式导入即可直接使用。在服务器代码中定义一次实用函数后，就可以在任何地方使用它。

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

1. 在 `server/utils/` 中创建一个实用函数文件：

```ts [server/utils/hello.ts]
export function makeGreeting(name: string) {
  return `Hello, ${name}!`;
}
```

2. 函数可以直接使用，无需导入：

```ts [server.ts]
import { defineHandler } from "nitro/h3";
import { makeGreeting } from "./server/utils/hello.ts";

export default defineHandler(() => `<h1>${makeGreeting("Nitro")}</h1>`);
```

通过此设置，`server/utils/` 中导出的任何函数都会自动变为全局可用。Nitro 会扫描该目录并自动生成所需的导入语句。