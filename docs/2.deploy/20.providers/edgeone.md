# EdgeOne Pages

> 将 Nitro 应用部署到 EdgeOne Pages。

**预设：** `edgeone_pages`

:read-more{to="https://pages.edgeone.ai/"}

## 使用控制台

1. 在 [EdgeOne Pages 控制台](https://console.tencentcloud.com/edgeone/pages)中，点击 **创建项目**
2. 选择 **导入 Git 仓库** 作为部署方式。EdgeOne 支持从 GitHub、GitLab、Gitee 和 CNB 进行部署
3. 选择包含应用代码的 **仓库** 和 **分支**
4. 在设置过程中，添加一个值为 `edgeone_pages` 的 `NITRO_PRESET` 环境变量（此步骤为必需步骤）
5. 点击 **部署** 按钮

## 使用 EdgeOne CLI

你也可以使用 [EdgeOne CLI](https://pages.edgeone.ai/document/edgeone-cli) 进行部署（有关安装和使用方法，请参阅其文档）。

配置完成后，运行 `edgeone pages deploy` 以部署项目。CLI 会先自动构建项目，然后上传并发布构建产物。
