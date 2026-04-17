# EdgeOne Pages

> 将 Nitro 应用部署到 EdgeOne Pages。

**预设：** `edgeone-pages`

:read-more{to="https://pages.edgeone.ai/"}

## 使用控制台

1. 在 [EdgeOne Pages 控制台](https://console.tencentcloud.com/edgeone/pages) 中，点击 **Create project**。
2. 选择 **Import Git repository** 作为部署方式。支持从 GitHub、GitLab、Gitee 和 CNB 部署。
3. 选择包含你应用代码的 GitHub **repository** 和 **branch**。
4. 在配置过程中添加环境变量 `NITRO_PRESET`，其值为 `edgeone-pages`（这一步很重要）。
5. 点击 **Deploy** 按钮。

## 使用 EdgeOne CLI

你也可以安装 Pages 脚手架工具。安装和使用的详细说明请参见 [EdgeOne CLI](https://pages.edgeone.ai/document/edgeone-cli)。

完成配置后，使用 `edgeone pages deploy` 命令即可部署项目。部署过程中，CLI 会先自动构建项目，然后上传并发布构建产物。
