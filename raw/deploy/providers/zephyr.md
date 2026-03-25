# Zephyr Cloud

> 将 Nitro 应用部署到 Zephyr Cloud。

**预设：** `zephyr`

<read-more title="Zephyr Cloud 文档" to="https://docs.zephyr-cloud.io">



</read-more>

Zephyr 支持通过 `zephyr` 预设内置于 Nitro 中。

对于大多数 Zephyr 特定的主题，例如 BYOC、云集成、环境和 CI/CD 认证，请参阅 [Zephyr Cloud 文档](https://docs.zephyr-cloud.io)。

<note>

Zephyr 与大多数 Nitro 部署提供商有所不同。它不是直接面向单一托管供应商，而是作为部署控制平面，运行在 Zephyr 管理的基础设施或你自己的云集成之上。

</note>

## BYOC 模式

Zephyr 支持 BYOC（自带云）模式。在 Zephyr 的架构中，控制平面由 Zephyr 管理，而数据平面（工作进程和存储）则运行在你的云账户中。

这使你可以在使用任何受支持的 Zephyr 云集成的服务的同时，保持 Zephyr 的部署工作流程。有关当前支持的提供商列表，请参阅 [Zephyr BYOC 文档](https://docs.zephyr-cloud.io/features/byoc)。

## 使用 Nitro CLI 部署

使用 Nitro 的部署命令，一键完成构建并上传应用到 Zephyr：

```bash
npx nitro deploy --preset zephyr
```

Nitro 将使用 `zephyr-agent` 上传生成的输出。如果缺少 `zephyr-agent`，Nitro 将提示在本地安装，并会在 CI 环境中自动安装。

## 构建时部署

在这一方面，Zephyr 与大多数 Nitro 提供商有所不同：我们建议启用 `nitro build` 期间的部署，并将构建视为主要的部署步骤。

如果你的 CI 流水线已经运行 `nitro build`，请在构建步骤期间启用部署：

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  preset: "zephyr",
  zephyr: {
    deployOnBuild: true,
  },
});
```

这样你正常的构建命令就足够了：

<pm-run script="build">



</pm-run>

构建完成后，Nitro 会将生成的输出上传到 Zephyr，部署到边缘节点，并打印部署 URL：

```txt
◐ Building [Nitro] (preset: zephyr, compatibility: YYYY-MM-DD)
...
ZEPHYR   Uploaded local snapshot in 110ms
ZEPHYR   Deployed to Zephyr's edge in 700ms.
ZEPHYR
ZEPHYR   https://my-app.zephyrcloud.app
```

## CI 认证

Zephyr 需要 API 令牌才能进行非交互式部署。以下示例使用更简单的个人令牌样式设置，使用 `ZE_SECRET_TOKEN` 并结合 `zephyr.deployOnBuild`。

```yaml [.github/workflows/deploy.yml]
name: Deploy with Zephyr

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      ZE_SECRET_TOKEN: ${{ secrets.ZEPHYR_AUTH_TOKEN }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
```

对于更高级的 CI/CD 设置，Zephyr 还记录了使用 `ZE_SERVER_TOKEN` 的组织级服务器令牌认证。请参阅 [Zephyr CI/CD 服务器令牌文档](https://docs.zephyr-cloud.io/features/ci-cd-server-token)。

## 选项

### `zephyr.deployOnBuild`

在使用 `zephyr` 预设时，在 `nitro build` 期间部署到 Zephyr。

- 默认值：`false`
