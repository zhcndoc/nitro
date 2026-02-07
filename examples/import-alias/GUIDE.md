像 `~` 和 `#` 这样的导入别名让你可以使用更短的路径来引用模块，而不是使用相对导入。

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

该路由通过 `~server/` 导入 `sum` 函数，通过 `#server/` 导入 `rand` 函数。两者都指向同一个 `server/utils/math.ts` 文件。处理函数生成两个随机数并返回它们的和。

## 配置

别名可以在 `package.json` 的 imports 字段或 `nitro.config.ts` 中配置。