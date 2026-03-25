# AWS Lambda

> 将 Nitro 应用部署到 AWS Lambda。

**预设:** `aws_lambda`

:read-more{title="AWS Lambda" to="https://aws.amazon.com/lambda/"}

Nitro 提供了一个内置预设，用于生成与 [AWS Lambda](https://aws.amazon.com/lambda/) 兼容的输出格式。
`.output/server/index.mjs` 中的输进入点与 [AWS Lambda 格式](https://docs.aws.amazon.com/lex/latest/dg/lambda-input-response-format.html) 兼容。

它可以以编程方式使用，或作为部署的一部分。

```ts
import { handler } from './.output/server'

// 以编程方式使用
const { statusCode, headers, body } = handler({ rawPath: '/' })
```

## 内联代码块

默认情况下，Nitro 输出使用动态代码块，仅在需要时延迟加载代码。然而，这有时可能对性能不太理想。（请参阅 [nitrojs/nitro#650](https://github.com/nitrojs/nitro/pull/650) 中的讨论）。你可以使用 [`inlineDynamicImports`](/config#inlinedynamicimports) 配置来启用代码块内联行为。

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  inlineDynamicImports: true
});
```

## 响应流式传输

:read-more{title="AWS Lambda 响应流式传输简介" to="https://aws.amazon.com/blogs/compute/introducing-aws-lambda-response-streaming/"}

要启用响应流式传输，请启用 `awsLambda.streaming` 标志：

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  awsLambda: {
    streaming: true
  }
});
```
