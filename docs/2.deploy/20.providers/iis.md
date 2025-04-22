# IIS

> 将 Nitro 应用部署到 IIS。

## 使用 [IISnode](https://github.com/Azure/iisnode)

**预设:** `iis_node`

1. 在您的 Windows 服务器上安装最新的 LTS 版本的 [Node.js](https://nodejs.org/en/)。
2. 安装 [IISnode](https://github.com/azure/iisnode/releases)
3. 安装 [IIS `URLRewrite` 模块](https://www.iis.net/downloads/microsoft/url-rewrite)。
4. 在 IIS 中，将 `.mjs` 添加为新的 MIME 类型，并将其内容类型设置为 `application/javascript`。
5. 将您的 `.output` 文件夹的内容部署到 IIS 中的网站。

## 使用 IIS 处理程序

**预设:** `iis_handler`

您可以直接使用 IIS HTTP 处理程序。

1. 在您的 Windows 服务器上安装最新的 LTS 版本的 [Node.js](https://nodejs.org/en/)。
2. 安装 [IIS `HttpPlatformHandler` 模块](https://www.iis.net/downloads/microsoft/httpplatformhandler)
3. 将您的 `.output` 目录复制到 Windows 服务器，并在 IIS 上创建一个指向该目录的网站。

## IIS 配置选项

::code-group

```ts [nitro.config.ts]
export default defineNitroConfig({
  // IIS 选项默认
  iis: {
    // 将现有的 web.config 文件合并到 nitro 默认文件中
    mergeConfig: true,
    // 完全覆盖默认的 nitro web.config 文件
    overrideConfig: false,
  },
});
```

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  nitro: {
    // IIS 选项默认
    iis: {
      // 将现有的 web.config 文件合并到 nitro 默认文件中
      mergeConfig: true,
      // 完全覆盖默认的 nitro web.config 文件
      overrideConfig: false,
    },
  },
});
```

::