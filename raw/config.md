# 配置

> 

<read-more to="/guide/configuration">



</read-more>

<warning>

Nitro v3 Alpha 文档仍在编写中 — 预计会有更新、粗糙之处和偶尔的不准确之处。

</warning>

## 一般设置

### `preset`

使用 `preset` 选项 `NITRO_PRESET` 环境变量来设置自定义的 **生产** 预设。

开发模式下的预设始终为 `nitro_dev`，而生产模式下的默认预设为 `node_server`，用于构建独立的 Node.js 服务器。

当未设置 `preset` 选项并在已知环境中运行时，预设将自动被检测。

### `logLevel`

- 默认: `3` (`1` 当检测到测试环境时)

日志详细级别。有关更多信息，请参见 [consola](https://github.com/unjs/consola?tab=readme-ov-file#log-level)。

### `runtimeConfig`

- 默认: `{ nitro: { ... }, ...yourOptions }`

服务器运行时配置。

**注意:** `nitro` 命名空间是保留的。

### `compatibilityDate`

部署提供商引入了 Nitro 预设可以利用的新功能，但其中一些需要明确选择。

将其设置为最新的测试日期，格式为 `YY-MM-DD`，以利用最新的预设功能。

如果未提供此配置，Nitro 将继续使用当前 (v2.9) 的预设行为并显示警告。

## 特性

### `experimental`

- 默认: `{}`

启用实验性功能。

#### `openAPI`

启用 `/_scalar`、`/_swagger` 和 `/_openapi.json` 端点。

- 默认: `false`

要在路由上定义 OpenAPI 规范，请查看 [defineRouteMeta](/guide/routing#route-meta)。

您可以在根级别传递一个对象来修改您的 OpenAPI 规范：

```js
openAPI: {
  meta: {
    title: '我的精彩项目',
    description: '这可能会成为下一个大热门。',
    version: '1.0'
  }
}
```

这些路由在生产中默认为禁用。要启用它们，请使用 `production` 键。
`"runtime"` 允许使用中间件，而 `"prerender"` 是最有效的，因为 JSON 响应是常量。

```js
openAPI: {
    // 重要: 确保在必要时保护 OpenAPI 路由！
    production: "runtime", // 或 "prerender"
}
```

如果您希望自定义 Scalar 集成，您可以像这样 [传递配置对象](https://github.com/scalar/scalar)：

```js
openAPI: {
  ui: {
    scalar: {
      theme: 'purple'
    }
  }
}
```

或者，如果您想要自定义端点：

```js
openAPI: {
  route: "/_docs/openapi.json",
  ui: {
    scalar: {
      route: "/_docs/scalar"
    },
    swagger: {
      route: "/_docs/swagger"
    }
  }
}
```

#### `wasm`

启用 WASM 支持。

#### `legacyExternals`

启用后，将使用遗留（不稳定）实验性 rollup externals 算法。

### `future`

- 默认: `{}`

待重大版本推出的新特性，以避免破坏性更改。

#### `nativeSWR`

为 Netlify 和 Vercel 预设使用内置的 SWR 功能（使用缓存层和存储），而不是回退到 ISR 行为。

### `storage`

- 默认: `{}`

存储配置，详细信息请参见 [存储层](/guide/storage) 部分。

### `renderer`

主要渲染路径（文件应作为默认导出事件处理程序）。

### `serveStatic`

- 类型: `boolean` | `'node'` | `'deno'`
- 默认: 取决于使用的部署预设。

在生产中提供 `public/` 资产。

**注意:** 强烈建议您的边缘 CDN（Nginx、Apache、Cloud）提供 `.output/public/` 目录，而不是启用压缩和更高层次的缓存。

### `noPublicDir`

- 默认: `false`

如果启用，将禁用 `.output/public` 目录的创建。跳过复制 `public/` 目录，并禁用预渲染。

### `publicAssets`

在开发中提供和在生产中打包的公共资产目录。

如果检测到 `public/` 目录，它将默认添加，但您也可以自己添加更多！

可以使用 `maxAge` 选项为资产设置 Cache-Control 头：

```ts
publicAssets: [
    {
      baseURL: "images",
      dir: "public/images",
      maxAge: 60 * 60 * 24 * 7, // 7 天
    },
  ],
```

上述配置在 `public/images/` 文件夹下的资产中生成以下头部：

`cache-control: public, max-age=604800, immutable`

`dir` 选项是您的文件在文件系统中的位置；`baseURL` 选项是它们在提供/打包时可以从中访问的文件夹。

### `compressPublicAssets`

- 默认: `{ gzip: false, brotli: false, zstd: false }`

如果启用，Nitro 将为公共资产和大于 1024 字节的支持类型的预渲染路由生成预压缩（gzip、brotli 和/或 zstd）版本，输出到 public 目录。使用默认压缩级别。使用此选项，您可以支持零开销资产压缩，无需使用 CDN。

可压缩 MIME 类型列表：

- `application/dash+xml`
- `application/eot`
- `application/font`
- `application/font-sfnt`
- `application/javascript`
- `application/json`
- `application/opentype`
- `application/otf`
- `application/pdf`
- `application/pkcs7-mime`
- `application/protobuf`
- `application/rss+xml`
- `application/truetype`
- `application/ttf`
- `application/vnd.apple.mpegurl`
- `application/vnd.mapbox-vector-tile`
- `application/vnd.ms-fontobject`
- `application/wasm`
- `application/xhtml+xml`
- `application/xml`
- `application/x-font-opentype`
- `application/x-font-truetype`
- `application/x-font-ttf`
- `application/x-httpd-cgi`
- `application/x-javascript`
- `application/x-mpegurl`
- `application/x-opentype`
- `application/x-otf`
- `application/x-perl`
- `application/x-ttf`
- `font/eot`
- `font/opentype`
- `font/otf`
- `font/ttf`
- `image/svg+xml`
- `text/css`
- `text/csv`
- `text/html`
- `text/javascript`
- `text/js`
- `text/plain`
- `text/richtext`
- `text/tab-separated-values`
- `text/xml`
- `text/x-component`
- `text/x-java-source`
- `text/x-script`
- `vnd.apple.mpegurl`

### `serverAssets`

资产可以在服务器逻辑中访问并在生产中打包。 [阅读更多](/guide/assets#server-assets)。

### `devServer`

- 默认: `{ watch: [] }`

开发服务器选项。您可以使用 `watch` 选项使开发服务器在指定路径中的任何文件变化时重新加载。

### `watchOptions`

开发模式的监视选项。有关更多信息，请参见 [chokidar](https://github.com/paulmillr/chokidar)。

### `imports`

自动导入选项。有关更多信息，请参见 [unimport](https://github.com/unjs/unimport)。

### `plugins`

- 默认: `[]`

一个 nitro 插件路径数组。它们将在首次初始化时按顺序执行。

请注意，Nitro 会自动注册 `plugins/` 目录中的插件，[了解更多](/guide/plugins)。

### `virtual`

- 默认: `{}`

从动态虚拟导入名称映射到其内容或返回该内容的（异步）函数。

## 路由

### `baseURL`

默认: `/`（如果提供，则为 `NITRO_APP_BASE_URL` 环境变量）

服务器的主基本 URL。

### `apiBaseURL`

- 默认: `/api`

更改默认 API 基本 URL 前缀。

### `handlers`

服务器处理程序和路由。

如果存在 `server/routes/`、`server/api/` 或 `server/middleware/` 目录，它们将自动添加到处理程序数组中。

### `devHandlers`

常规处理程序指的是要导入和通过 rollup 转换的处理程序路径。

在某些情况下，我们希望直接提供具有编程用途的处理程序实例。

我们可以使用 `devHandlers`，但请注意，它们 **仅在开发模式下可用**，并 **不在生产构建中可用**。

例如：

```ts
import { defineNitroConfig } from "nitro/config";
import { defineHandler } from "nitro/h3";

export default defineNitroConfig({
  devHandlers: [
    {
      route: '/',
      handler: defineHandler((event) => {
        console.log(event);
      }),
    },
  ],
});
```

### `devProxy`

开发服务器的代理配置。

您可以使用此选项覆盖开发服务器路由并代理请求。

```js
{
  devProxy: {
    '/proxy/test': 'http://localhost:3001',
    '/proxy/example': { target: 'https://example.com', changeOrigin: true }
  }
}
```

请参见 [httpxy](https://github.com/unjs/httpxy) 以获取所有可用目标选项。

### `errorHandler`

自定义运行时错误处理程序的路径。替换 nitro 的内置错误页面。
错误处理程序将获得一个 `H3Error` 和 `H3Event`。如果处理程序返回一个 promise，将进行等待。
处理程序需要发送自己的响应。
以下是一个使用 h3 的函数返回纯文本响应的示例。

**示例：**

<CodeGroup>

```js [nitro.config]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  errorHandler: "~/error",
});
```

```js [error.ts]
export default defineNitroErrorHandler((error, event) => {
  setResponseHeader(event, 'Content-Type', 'text/plain')
  return send(event, '[自定义错误处理程序] ' + error.stack)
});
```

</CodeGroup>

### `routeRules`

**🧪 实验性！**

路由选项。它是从路由模式（遵循 [rou3](https://github.com/h3js/rou3)）到路由选项的映射。

当设置 `cache` 选项时，匹配模式的处理程序将自动用 `defineCachedEventHandler` 包装。

有关所有可用缓存选项，请参见 [缓存 API](/guide/cache)。

<note>

`swr: true|number` 是 `cache: { swr: true, maxAge: number }` 的快捷方式。

</note>

**示例：**

```js
routeRules: {
  '/blog/**': { swr: true },
  '/blog/**': { swr: 600 },
  '/blog/**': { static: true },
  '/blog/**': { cache: { /* 缓存选项*/ } },
  '/assets/**': { headers: { 'cache-control': 's-maxage=0' } },
  '/api/v1/**': { cors: true, headers: { 'access-control-allow-methods': 'GET' } },
  '/old-page': { redirect: '/new-page' }, // 使用状态码 307 (临时重定向)
  '/old-page2': { redirect: { to:'/new-page2', statusCode: 301 } },
  '/old-page/**': { redirect: '/new-page/**' },
  '/proxy/example': { proxy: 'https://example.com' },
  '/proxy/**': { proxy: '/api/**' },
}
```

### `prerender`

默认：

```ts
{
  autoSubfolderIndex: true,
  concurrency: 1,
  interval: 0,
  failOnError: false,
  crawlLinks: false,
  ignore: [],
  routes: [],
  retry: 3,
  retryDelay: 500
}
```

预渲染选项。任何指定的路由将在构建期间获取并复制到 `.output/public` 目录作为静态资产。

以 `ignore` 中列出的前缀开头的任何路由（字符串）或匹配正则表达式或函数的路由将被忽略。

如果将 `crawlLinks` 选项设置为 `true`，Nitro 默认会从 `/` 开始（或所有在 `routes` 数组中的路由），并为 HTML 页面提取 `<a>` 标签并进行预渲染。

您可以将 `failOnError` 选项设置为 `true`，以在 Nitro 无法预渲染路由时停止 CI。

`interval` 和 `concurrency` 选项允许您控制预渲染的速度，可以有助于避免在调用外部 API 时 hitting 一些速率限制。

设置 `autoSubfolderIndex` 可以让您控制如何在 `.output/public` 目录中生成文件：

```bash
# autoSubfolderIndex: true (默认)
关于 -> .output/public/about/index.html
# autoSubfolderIndex: false
关于 -> .output/public/about.html
```

当您的托管提供商不提供有关尾随斜杠的选项时，此选项是非常有用的。

预渲染器将尝试渲染页面 3 次，间隔 500 毫秒。使用 `retry` 和 `retryDelay` 来更改此行为。

## 目录

### `workspaceDir`

项目工作区根目录。

当未设置 `workspaceDir` 选项时，工作区（例如 pnpm 工作区）目录会被自动检测。

### `rootDir`

项目主目录.

### `srcDir`

- 默认: （与 `rootDir` 相同）

项目源目录。除非指定，否则与 `rootDir` 相同。
`api`、`routes`、`plugins`、`utils`、`public`、`middleware`、`assets` 和 `tasks` 文件夹的根目录。

### `scanDirs`

- 默认: （源目录为空数组时）

要扫描和自动注册文件的目录列表，例如 API 路由。

### `apiDir`

- 默认: `api`

定义一个不同的目录来扫描 API 路由处理程序。

### `routesDir`

- 默认: `routes`

定义一个不同的目录来扫描路由处理程序。

### `buildDir`

- 默认: `.nitro`

nitro 用于生成构建相关文件的临时工作目录。

### `output`

- 默认: `{ dir: '.output', serverDir: '.output/server', publicDir: '.output/public' }`

生产包的输出目录。

## 高级

### `dev`

- 默认: `true`（开发）和 `false`（生产）。

**⚠️ 注意！这是一个高级配置。如果配置错误，可能会导致问题。**

### `typescript`

默认: `{ generateTsConfig: true }`

### `nodeModulesDirs`

**⚠️ 注意！这是一个高级配置。如果配置错误，可能会导致问题。**

用于解析模块时要搜索的额外 `node_modules`。默认情况下，会添加用户目录。

### `hooks`

**⚠️ 注意！这是一个高级配置。如果配置错误，可能会导致问题。**

nitro 钩子。有关更多信息，请参见 [hookable](https://github.com/unjs/hookable)。

### `commands`

**⚠️ 注意！这是一个高级配置。如果配置错误，可能会导致问题。**

预览和部署命令提示通常由部署预设填充。

### `devErrorHandler`

**⚠️ 注意！这是一个高级配置。如果配置错误，可能会导致问题。**

用于开发错误的自定义错误处理程序函数。

## Rollup

### `rollupConfig`

额外的 rollup 配置。

### `entry`

Rollup 入口。

### `unenv`

[unenv](https://github.com/unjs/unenv/) 预设的选项。

### `alias`

Rollup 别名选项。

### `minify`

- 默认: `false`

压缩包。

### `inlineDynamicImports`

- 默认: `false`

将所有代码捆绑成单个文件，而不是为每个路由创建单独的块。

当为 `false` 时，每个路由处理程序变成单独的块按需加载。当为 `true` 时，所有内容打包在一起。一些预设默认启用此功能。

### `sourceMap`

启用源映射生成。请参见 [选项](https://rollupjs.org/configuration-options/#output-sourcemap)

- 默认: `true`

### `node`

指定构建是否用于 Node.js。如果设置为 `false`，Nitro 会尝试使用 [unenv](https://github.com/unjs/unenv) 模拟 Node.js 依赖，并调整其行为。

### `moduleSideEffects`

默认: `['unenv/polyfill/']`

Rollup 特定选项。指定具有副作用的模块导入。

### `replace`

Rollup 特定选项。

### `commonJS`

Rollup 特定选项。为 rollup CommonJS 插件指定额外配置。

## 预设选项

### `firebase`

Firebase 函数预设的选项。请参见 [预设文档](/deploy/providers/firebase#options)

### `vercel`

Vercel 预设的选项。请参见 [预设文档](/deploy/providers/vercel)

### `cloudflare`

Cloudflare 预设的选项。请参见 [预设文档](/deploy/providers/cloudflare)
