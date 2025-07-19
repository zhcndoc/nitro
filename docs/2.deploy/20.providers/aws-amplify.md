# AWS Amplify

> 将 Nitro 应用部署到 AWS Amplify Hosting。

**预设:** `aws_amplify`

:read-more{title="AWS Amplify Hosting" to="https://aws.amazon.com/amplify"}

## 部署到 AWS Amplify Hosting

::tip
与该提供商的集成可以通过 [零配置](/deploy/#zero-config-providers) 实现。
::

1. 登录到 [AWS Amplify Hosting 控制台](https://console.aws.amazon.com/amplify/)
2. 点击 "开始使用" > Amplify Hosting (托管你的 web 应用)
3. 选择并授权访问你的 Git 仓库提供商，并选择主分支
4. 为你的应用程序选择一个名称，确保构建设置被自动检测，并在高级部分可选地设置环境变量
5. 可选地选择启用 SSR 日志记录，以便将服务器端日志记录到你的 Amazon CloudWatch 帐户
6. 确认配置并点击 "保存并部署"

## 高级配置

你可以使用 `awsAmplify` 选项配置该预设的高级选项。

::code-group

```ts [nitro.config.ts]
export default defineNitroConfig({
  awsAmplify: {
      // catchAllStaticFallback: true,
      // imageOptimization: { path: "/_image", cacheControl: "public, max-age=3600, immutable" },
      // imageSettings: { ... },
      // runtime: "nodejs18.x", // default: "nodejs18.x" | "nodejs16.x" | "nodejs20.x"
  }
})
```

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  nitro: {
    awsAmplify: {
      // catchAllStaticFallback: true,
      // imageOptimization: { "/_image", cacheControl: "public, max-age=3600, immutable" },
      // imageSettings: { ... },
      // runtime: "nodejs18.x", // default: "nodejs18.x" | "nodejs16.x" | "nodejs20.x"
    }
  }
})
```

::

### `amplify.yml`

你可能需要一个自定义的 `amplify.yml` 文件用于高级配置。以下是两个模板示例：

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

```yml [amplify.yml (单体仓库)]
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