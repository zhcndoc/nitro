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

Nitro 输出默认使用动态块，仅在需要时懒加载代码。然而，这在某些情况下可能不适合性能。（参见 [unjs/nitro#650](https://github.com/unjs/nitro/pull/650) 的讨论）。您可以通过 [`inlineDynamicImports`](/config#inlinedynamicimports) 配置来启用块内联行为。

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


## 流式支持（实验性）

**预设:** `aws_lambda_streaming`

Nitro 支持一个实验性的预设，以生成与 [AWS Lambda](https://aws.amazon.com/lambda/) 兼容的输出格式，并启用流式调用。

:read-more{title="引入 AWS Lambda 响应流式处理" to="https://aws.amazon.com/blogs/compute/introducing-aws-lambda-response-streaming/"}

> [!NOTE]
> 此预设可通过 [nightly channel](https://nitro.unjs.io/guide/nightly) 进行尝试。

> [!IMPORTANT]
> 此预设尚未准备好投入生产，可能会重命名！请不要建议用户或文档间接使用它。

