---
category: config
icon: i-lucide-import
---

# 自动导入

> 实用工具和组合函数的自动导入。

<!-- automd:ui-code-tree src="../../examples/auto-imports" default="nitro.config.ts" ignore="README.md,GUIDE.md" expandAll -->

::code-tree{defaultValue="nitro.config.ts" expandAll}

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  serverDir: true,
  imports: {},
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
import { makeGreeting } from "./server/utils/hello.ts";

export default defineHandler(() => `<h1>${makeGreeting("Nitro")}</h1>`);
```

```json [tsconfig.json]
{
  "include": [".nitro/types/nitro-imports.d.ts", "src"]
}
```

```ts [vite.config.ts]
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";

export default defineConfig({ plugins: [nitro()] });
```

```ts [server/utils/hello.ts]
export function makeGreeting(name: string) {
  return `Hello, ${name}!`;
}
```

::

<!-- /automd -->

<!-- automd:file src="../../examples/auto-imports/README.md" -->

当启用自动导入时，从 `server/utils/` 导出的函数无需显式导入即可使用。只需定义一次实用工具函数，即可在服务器代码的任何位置使用。

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

1. 在 `server/utils/` 中创建一个实用工具文件：

```ts [server/utils/hello.ts]
export function makeGreeting(name: string) {
  return `Hello, ${name}!`;
}
```

2. 函数无需导入即可使用：

```ts [server.ts]
import { defineHandler } from "nitro";
import { makeGreeting } from "./server/utils/hello.ts";

export default defineHandler(() => `<h1>${makeGreeting("Nitro")}</h1>`);
```

通过此配置，`server/utils/` 中导出的任何函数都将全局可用。Nitro 会扫描该目录，并自动生成所需的导入。

<!-- /automd -->

## 了解更多

- [配置](/docs/configuration)
