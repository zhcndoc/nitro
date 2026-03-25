# AWS Amplify

> 将 Nitro 应用部署到 AWS Amplify Hosting。

**预设:** `aws_amplify`

:read-more{title="AWS Amplify 托管服务" to="https://aws.amazon.com/amplify"}

## 部署到 AWS Amplify Hosting

::tip
使用[零配置](/deploy/#zero-config-providers)即可与提供程序集成。
::

1. 登录到 [AWS Amplify Hosting 控制台](https://console.aws.amazon.com/amplify/)
2. 点击"开始使用" > Amplify Hosting（托管您的 Web 应用）
3. 选择并授权访问您的 Git 仓库提供程序，然后选择主分支
4. 为您的应用选择一个名称，确保构建设置是自动检测的，并在高级部分下可选地设置所需的环境变量
5. （可选）选择启用 SSR 日志记录，以将服务端日志记录到您的 Amazon CloudWatch 账户
6. 确认配置，然后点击"保存并部署"

## 高级配置

您可以使用 `awsAmplify` 选项配置此预设的高级选项。

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  awsAmplify: {
      // catchAllStaticFallback: true,
      // imageOptimization: { path: "/_image", cacheControl: "public, max-age=3600, immutable" },
      // imageSettings: { ... },
      // runtime: "nodejs18.x", // 默认值: "nodejs18.x" | "nodejs16.x" | "nodejs20.x"
  }
})
```

### `amplify.yml`

对于高级配置，您可能需要自定义的 `amplify.yml` 文件。以下是两个模板示例：

::code-group

```yml [amplify.yml]
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - nvm use 18 && node --version
        - corepack enable && npx --yes nypm install
    build:
      commands:
        - pnpm build
  artifacts:
    baseDirectory: .amplify-hosting
    files:
      - "**/*"
```

```yml [amplify.yml (monorepo)]
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
          - nvm use 18 && node --version
          - corepack enable && npx --yes nypm install
        build:
          commands:
            - pnpm --filter website1 build
      artifacts:
        baseDirectory: apps/website1/.amplify-hosting
        files:
          - '**/*'
      buildPath: /
    appRoot: apps/website1
```

::
