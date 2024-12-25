# AWS Lambda

> 将 Nitro 应用程序部署到 AWS Lambda。

**预设:** `aws_lambda`

:read-more{title="AWS Lambda" to="https://aws.amazon.com/lambda/"}

Nitro 提供了一个内置的预设，可以生成与 [AWS Lambda](https://aws.amazon.com/lambda/) 兼容的输出格式。
`.output/server/index.mjs` 中的输出入口点与 [AWS Lambda 格式](https://docs.aws.amazon.com/lex/latest/dg/lambda-input-response-format.html) 兼容。

它可以通过编程方式使用或作为部署的一部分。

```ts
import { handler } from './.output/server'

// 以编程方式使用
const { statusCode, headers, body } = handler({ rawPath: '/' })
```

## 内联块

Nitro 输出默认使用动态块，仅在需要时懒加载代码。然而，这在某些情况下可能不适合性能。（参见 [nitrojs/nitro#650](https://github.com/nitrojs/nitro/pull/650) 的讨论）。您可以通过 [`inlineDynamicImports`](/config#inlinedynamicimports) 配置来启用块内联行为。

::code-group

```ts [nitro.config.ts]
export default defineNitroConfig({
  inlineDynamicImports: true
});
```

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  nitro: {
    inlineDynamicImports: true
  }
})
```

::


## 响应流式处理

:read-more{title="引入 AWS Lambda 响应流式处理" to="https://aws.amazon.com/blogs/compute/introducing-aws-lambda-response-streaming/"}

为了启用响应流式处理，请启用 `awsLambda.streaming` 标志：

```ts [nitro.config.ts]
export default defineNitroConfig({
  awsLambda: {
    streaming: true
  }
});
```
