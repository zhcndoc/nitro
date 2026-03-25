---
category: config
icon: i-lucide-at-sign
---

# 导入别名

> 用于更简洁模块路径的自定义导入别名。

<!-- automd:ui-code-tree src="../../examples/import-alias" default="server/routes/index.ts" ignore="README.md,GUIDE.md" expandAll -->

::code-tree{defaultValue="server/routes/index.ts" expandAll}

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  serverDir: true,
});
```

```json [package.json]
{
  "type": "module",
  "imports": {
    "#server/*": "./server/*"
  },
  "scripts": {
    "build": "nitro build",
    "dev": "nitro dev",
    "preview": "node .output/server/index.mjs"
  },
  "devDependencies": {
    "nitro": "latest"
  }
}
```

```json [tsconfig.json]
{
  "extends": "nitro/tsconfig",
  "compilerOptions": {
    "paths": {
      "~server/*": ["./server/*"]
    }
  }
}
```

```ts [vite.config.ts]
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";

export default defineConfig({ plugins: [nitro()], resolve: { tsconfigPaths: true } });
```

```ts [server/routes/index.ts]
import { sum } from "~server/utils/math.ts";

import { rand } from "#server/utils/math.ts";

export default () => {
  const [a, b] = [rand(1, 10), rand(1, 10)];
  const result = sum(a, b);
  return `The sum of ${a} + ${b} = ${result}`;
};
```

```ts [server/utils/math.ts]
export function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function sum(a: number, b: number): number {
  return a + b;
}
```

::

<!-- /automd -->

<!-- automd:file src="../../examples/import-alias/README.md" -->

像 `~` 和 `#` 这样的导入别名让你可以使用更短的路径引用模块，而不是使用相对导入。

## 使用别名导入

```ts [server/routes/index.ts]
import { sum } from "~server/utils/math.ts";

import { rand } from "#server/utils/math.ts";

export default () => {
  const [a, b] = [rand(1, 10), rand(1, 10)];
  const result = sum(a, b);
  return `The sum of ${a} + ${b} = ${result}`;
};
```

该路由使用 `~server/` 导入 `sum` 函数，使用 `#server/` 导入 `rand`。两者都解析到同一个 `server/utils/math.ts` 文件。处理器生成两个随机数并返回它们的和。

## 配置

别名可以在 `package.json` 的 imports 字段或 `nitro.config.ts` 中配置。

<!-- /automd -->

## 了解更多

- [配置](/docs/configuration)
