# Platform.sh

> 将 Nitro 应用程序部署到 platform.sh

**预设:** `platform_sh`

:read-more{to="https://platform.sh"}

## 设置

首先，在 platform.sh 上创建一个新项目，并将其链接到您希望自动部署的代码库。

然后在代码库中创建 `.platform.app.yaml` 文件：

```yaml [.platform.app.yaml]
name: nitro-app
type: 'nodejs:18'
disk: 128
web:
  commands:
    start: "node .output/server/index.mjs"
build:
  flavor: none
hooks:
  build: |
    corepack enable
    npx nypm install
    NITR_PRESET=platform_sh npm run build
mounts:
    '.data':
        source: local
        source_path: .data
```

:read-more{title="所有可用属性的完整列表" to="https://docs.platform.sh/create-apps/app-reference.html"}

:read-more{title="所有可用属性的完整列表" to="https://unjs.io/blog/2023-08-25-nitro-2.6#default-persistent-data-storage"}
