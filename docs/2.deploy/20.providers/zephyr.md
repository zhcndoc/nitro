# Zephyr Cloud

> 将 Nitro 应用部署到 [Zephyr Cloud](https://zephyr-cloud.io)。

**预设：** `zephyr`

:read-more{title="Zephyr Cloud 文档" to="https://docs.zephyr-cloud.io"}

Zephyr 支持已内建于 Nitro 的 `zephyr` 预设中。

有关 BYOC、云集成、环境和 CI/CD 认证等大多数 Zephyr 相关主题，请参阅 [Zephyr Cloud 文档](https://docs.zephyr-cloud.io)。

::note
Zephyr 与大多数 Nitro 部署提供商略有不同。它不是直接针对单一托管服务商，而是作为部署控制平面，运行于 Zephyr 管理的基础设施或您自己的云集成之上。
::

## BYOC 模式

Zephyr 支持 BYOC（自带云）模式。在 Zephyr 的架构中，控制平面由 Zephyr 管理，而数据平面（工作节点和存储）运行在您的云账户中。

这让您在继续使用 Zephyr 部署流程的同时，可以使用任何受支持的 Zephyr 云集成。当前支持的供应商列表，请参见 [Zephyr BYOC 文档](https://docs.zephyr-cloud.io/features/byoc)。

## 使用 Nitro CLI 部署

使用 Nitro 的 deploy 命令一步构建并上传应用到 Zephyr：

```bash
npx nitro deploy --preset zephyr
```

Nitro 会通过 `zephyr-agent` 上传生成的输出文件。如果缺少 `zephyr-agent`，Nitro 会提示进行本地安装，并在 CI 环境中自动安装。

## 构建时部署

Zephyr 在这方面与大多数 Nitro 提供商略有不同：我们建议在 `nitro build` 执行时启用部署，并将构建视为主要的部署步骤。

如果您的 CI 流程已经运行 `nitro build`，请在构建步骤中启用部署：

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  preset: "zephyr",
  zephyr: {
    deployOnBuild: true,
  },
});
```

然后，使用您常规的构建命令即可：

:pm-run{script="build"}

构建完成后，Nitro 会上传生成的输出到 Zephyr，将其部署到边缘，并打印部署 URL：

```txt
◐ Building [Nitro] (preset: zephyr, compatibility: YYYY-MM-DD)
...
ZEPHYR   已在 110ms 内上传本地快照
ZEPHYR   已在 700ms 内部署至 Zephyr 边缘。
ZEPHYR
ZEPHYR   https://my-app.zephyrcloud.app
```

## CI 认证

Zephyr 需要非交互式部署时使用 API 令牌。下面的示例使用更简单的个人令牌风格设置，通过 `ZE_SECRET_TOKEN` 配合 `zephyr.deployOnBuild`。

```yaml [.github/workflows/deploy.yml]
name: 使用 Zephyr 部署

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

对于更高级的 CI/CD 配置，Zephyr 还支持通过 `ZE_SERVER_TOKEN` 进行组织级别的服务端令牌认证。详见 [Zephyr CI/CD 服务端令牌文档](https://docs.zephyr-cloud.io/features/ci-cd-server-token)。

## 选项

### `zephyr.deployOnBuild`

使用 `zephyr` 预设时，在 `nitro build` 期间部署到 Zephyr。

- 默认值：`false`
