# AWS Amplify

> 将 Nitro 应用部署到 AWS Amplify Hosting。

**预设:** `aws_amplify`

:read-more{title="AWS Amplify 托管服务" to="https://aws.amazon.com/amplify"}

## 部署到 AWS Amplify Hosting

::tip
与此提供商集成时无需进行[零配置](/deploy#zero-config-providers)
::

1. 登录 [AWS Amplify Hosting 控制台](https://console.aws.amazon.com/amplify/)
2. 点击“Get Started” > Amplify Hosting（Host your web app）
3. 选择并授权访问您的 Git 仓库提供商，然后选择主分支
4. 为您的应用选择名称，确保自动检测构建设置，并可选地在高级部分设置所需的环境变量
5. 可选地，选择 Enable SSR logging，以启用将服务器端日志记录到您的 Amazon CloudWatch 账户
6. 确认配置并点击“Save and Deploy”

## 高级配置

You can configure advanced options of this preset using the `awsAmplify` option.

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  awsAmplify: {
      // 捕获所有静态回退：true,
      // 图片优化：{ path: "/_image", cacheControl: "public, max-age=3600, immutable" },
      // 图片设置：{ ... },
      // 运行时: "nodejs24.x", // 默认值: "nodejs20.x" | "nodejs22.x" | "nodejs24.x"
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
        - nvm use 24 && node --version
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
          - nvm use 24 && node --version
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
