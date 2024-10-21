# Edgio

> 将 Nitro 应用部署到 Edgio。

**预设:** `edgio`

:read-more{title="edgio.io" to="https://edg.io/"}

Edgio（前身为 Layer0）扩展了传统 CDN 的功能，不仅托管您的静态内容，还为渐进式 Web 应用提供服务器端渲染，以及在网络边缘缓存您的 API 和 HTML，以便为用户提供最快的浏览体验。

如果您第一次部署到 Edgio，`deploy` 命令的一部分交互式 CLI 将提示您使用浏览器进行身份验证。您也可以在部署之前 [注册](https://app.layer0.co/signup)。

## 安装 Edgio CLI

```bash
npm i -g @edgio/cli
```

## 使用 Edgio 本地测试生产构建

您可以使用 Nitropack 在本地测试应用的开发体验：

```bash
NITRO_PRESET=edgio npx nitropack build
```

要在本地模拟应用在 Edgio 中的生产运行方式，请运行以下命令：

```bash
edgio build && edgio run --production
```

## 从本地机器部署

测试完本地应用后，您可以使用以下命令进行部署：

```bash
edgio deploy
```

## 使用 CI/CD 部署

如果您从非交互式环境进行部署，您需要先在 [Edgio 开发者控制台](https://app.layer0.co) 创建一个帐户，并设置一个 [部署令牌](https://docs.edg.io/guides/basics/deployments#deploy-from-ci)。创建部署令牌后，将其作为机密保存到您的环境中。您可以通过运行以下命令开始部署：

```bash
edgio deploy --token=XXX
```
