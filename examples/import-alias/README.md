Import aliases like `~` and `#` let you reference modules with shorter paths instead of relative imports.

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

该路由通过 `~server/` 导入了 `sum` 函数，通过 `#server/` 导入了 `rand` 函数。两者都解析到同一个 `server/utils/math.ts` 文件。处理函数生成两个随机数并返回它们的和。

## 配置

Aliases can be configured in `package.json` imports field or `nitro.config.ts`.
