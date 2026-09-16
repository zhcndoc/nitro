# Cloudflare

> 将 Nitro 应用部署到 Cloudflare。

## Cloudflare Workers

**预设：** `cloudflare_module`

:read-more{title="Cloudflare Workers" to="https://developers.cloudflare.com/workers/"}

::note
通过与该提供商的集成支持 [workers builds (beta)](https://developers.cloudflare.com/workers/ci-cd/builds/)，可以实现[零配置](/deploy#zero-config-providers)。
::

下面展示了用于将 Nitro 应用部署到 Cloudflare Workers 的示例 `nitro.config.ts` 文件。

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
    preset: "cloudflare_module"
})
```

### 本地预览

你可以使用 [Wrangler](https://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler) 在本地预览你的应用：

:pm-run{script="build"}

:pm-x{command="wrangler dev"}

### 手动部署

构建应用后，你可以使用 Wrangler 手动部署。

首先确保你已登录到你的 Cloudflare 账户：

:pm-x{command="wrangler login"}

然后你可以使用以下命令部署应用：

:pm-x{command="wrangler deploy"}

### 运行时钩子

你可以使用下面的[运行时钩子](/docs/plugins#nitro-runtime-hooks)来扩展 [Worker 处理程序](https://developers.cloudflare.com/workers/runtime-apis/handlers/)。

:read-more{to="/docs/plugins#nitro-runtime-hooks"}

- [`cloudflare:scheduled`](https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/)
- [`cloudflare:email`](https://developers.cloudflare.com/email-routing/email-workers/runtime-api/)
- [`cloudflare:queue`](https://developers.cloudflare.com/queues/configuration/javascript-apis/#consumer)
- [`cloudflare:tail`](https://developers.cloudflare.com/workers/runtime-apis/handlers/tail/)
- `cloudflare:trace`
- `cloudflare:durable:init`（仅适用于 [`cloudflare_durable`](#cloudflare-workers-with-durable-objects) 预设）
- [`cloudflare:durable:alarm`](https://developers.cloudflare.com/durable-objects/api/alarms/)（仅适用于 [`cloudflare_durable`](#cloudflare-workers-with-durable-objects) 预设）

::note
`cloudflare:queue` 钩子会将消息批次作为 `batch` 接收，而 `cloudflare:email` 钩子会将收到的消息作为 `message` 接收。较旧的 `event` 字段已弃用，不再适用于这两个钩子。
::

### 额外导出

你可以将 `exports.cloudflare.ts` 文件添加到项目根目录，以从 Cloudflare Worker 入口点导出其他处理程序或属性。

```ts [exports.cloudflare.ts]
export class MyWorkflow extends WorkflowEntrypoint {
  async run(event: WorkflowEvent, step: WorkflowStep) {
    // ...
  }
}
```

Nitro 将自动检测此文件并将其导出包含在最终构建中。

::warning
`exports.cloudflare.ts` 文件不能包含默认导出。
::

你还可以使用 `nitro.config.ts` 中的 `cloudflare.exports` 选项来自定义入口点文件位置：

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  cloudflare: {
    exports: "custom-exports-entry.ts"
  }
})
```

### 定时任务（Cron 触发器）

当使用带有 `scheduledTasks` 的 [Nitro 任务](/docs/tasks)时，Nitro 会在构建时自动在 wrangler 配置中生成 [Cron 触发器](https://developers.cloudflare.com/workers/configuration/cron-triggers/)。

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  preset: "cloudflare_module",
  experimental: {
    tasks: true,
  },
  scheduledTasks: {
    "* * * * *": ["cms:update"],
    "0 15 1 * *": ["db:cleanup"],
  }
})
```

无需手动配置 Wrangler，Nitro 会为你处理。

## Cloudflare Workers with Durable Objects

**预设：** `cloudflare_durable`

:read-more{title="Durable Objects" to="https://developers.cloudflare.com/durable-objects/"}

此预设扩展了 `cloudflare_module`，并通过 [Durable Object](https://developers.cloudflare.com/durable-objects/) 实例路由请求，从而支持有状态功能，例如 WebSocket 支持（通过 [CrossWS](https://crossws.h3.dev/adapters/cloudflare#durable-objects)）以及可跨请求持久存在的内存状态。

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  preset: "cloudflare_durable"
})
```

该预设入口会导出一个 `$DurableObject` 类。你需要在 wrangler 配置中声明 Durable Object 绑定和迁移：

```json [wrangler.json]
{
  "durable_objects": {
    "bindings": [
      {
        "name": "$DurableObject",
        "class_name": "$DurableObject"
      }
    ]
  },
  "migrations": [
    {
      "tag": "v1",
      "new_classes": ["$DurableObject"]
    }
  ]
}
```

你可以使用 `cloudflare:durable:init` 运行时钩子，在 Durable Object 初始化时运行代码，并使用 `cloudflare:durable:alarm` 钩子处理 [alarms](https://developers.cloudflare.com/durable-objects/api/alarms/)。

### 追踪

**🧪 实验性功能！**

启用实验性的 [`tracingChannel`](/config#tracingchannel) 选项后，Cloudflare 预设会将 Nitro 的追踪通道事件（h3 路由和中间件、srvx、unstorage 操作等）作为[自定义 span](https://developers.cloudflare.com/workers/observability/traces/custom-spans/)进行报告，同时还会报告 Cloudflare 的自动插桩事件（fetch 调用、KV 读取、D1 查询等），无需 OpenTelemetry SDK。

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  preset: "cloudflare_module",
  tracingChannel: true,
});
```

必须在 Worker 上启用追踪，才能记录 span：

```jsonc [wrangler.jsonc]
{
  "observability": {
    "traces": {
      "enabled": true
    }
  }
}
```

## Cloudflare Pages

**预设：** `cloudflare_pages`

:read-more{title="Cloudflare Pages" to="https://pages.cloudflare.com/"}

::note
与该提供商的集成支持[零配置](/deploy#zero-config-providers)。
::

::warning
Cloudflare [Workers](#cloudflare-workers) 是目前推荐用于部署的新预设。如果你需要 Pages 特有的功能，请考虑使用 Cloudflare Pages。
::

以下展示了用于将 Nitro 应用部署到 Cloudflare Pages 的示例 `nitro.config.ts` 文件。

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
    preset: "cloudflare_pages"
})
```

Nitro 自动生成一个 `_routes.json` 文件，用于控制哪些路由由文件提供，哪些由 Worker 脚本提供。自动生成的路由文件可以通过配置选项 `cloudflare.pages.routes` 覆盖（[了解更多](https://developers.cloudflare.com/pages/platform/functions/routing/#functions-invocation-routes)）。

### 本地预览

你可以使用 [Wrangler](https://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler) 在本地预览你的应用：

:pm-run{script="build"}

:pm-x{command="wrangler pages dev"}

### 手动部署

构建应用后，你可以使用 Wrangler 手动部署。

首先确保你已登录到你的 Cloudflare 账户：

:pm-x{command="wrangler login"}

然后你可以使用以下命令部署应用：

:pm-x{command="wrangler pages deploy"}


## 使用 GitHub Actions 在 CI/CD 中部署

无论你使用的是 Cloudflare Pages 还是 Cloudflare Workers，都可以使用 [Wrangler GitHub actions](https://github.com/marketplace/actions/deploy-to-cloudflare-workers-with-wrangler) 来部署应用。

::note
请记得[指示 Nitro 使用正确的预设](/deploy#changing-the-deployment-preset)。所有预设都需要这样做，包括 `cloudflare_pages`。
::

## 环境变量

Nitro 允许你通过 `process.env`、`import.meta.env` 或运行时配置，以统一的方式访问环境变量。

::note
请确保只在**事件生命周期内**访问环境变量，而不要在全局上下文中访问，因为 Cloudflare 只会在请求生命周期内提供这些变量，而不会在此之前提供。
::

**示例：**如果你已设置 `SECRET` 和 `NITRO_HELLO_THERE` 环境变量，可以通过以下方式访问它们：

```ts
import { defineHandler } from "nitro";
import { useRuntimeConfig } from "nitro/runtime-config";

console.log(process.env.SECRET) // 注意：这里位于全局作用域！因此它实际上不会生效，变量会是 undefined！

export default defineHandler((event) => {
  // 注意：下面这些方式都可以访问上面的变量
  useRuntimeConfig().helloThere
  useRuntimeConfig().secret
  process.env.NITRO_HELLO_THERE
  import.meta.env.SECRET
});
```

### 在开发模式中指定变量

对于开发，你可以使用 `.env` 或 `.env.local` 文件来指定环境变量：

```ini
NITRO_HELLO_THERE="captain"
SECRET="top-secret"
```

::note
请确保将 `.env` 和 `.env.local` 添加到 `.gitignore` 文件中，以免提交它们，因为其中可能包含敏感信息。
::

### 为本地预览指定变量

构建完成后，当你使用 `wrangler dev` 或 `wrangler pages dev` 在本地试用项目时，请在项目根目录的 `.dev.vars` 文件中指定环境变量（如 [Pages](https://developers.cloudflare.com/pages/functions/bindings/#interact-with-your-environment-variables-locally) 和 [Workers](https://developers.cloudflare.com/workers/configuration/environment-variables/#interact-with-environment-variables-locally) 文档中所述）。

如果你在开发时使用 `.env` 或 `.env.local` 文件，你的 `.dev.vars` 应该与之一致。

::note
请确保将 `.dev.vars` 添加到 `.gitignore` 文件中，以免提交它，因为其中可能包含敏感信息。
::

### 为生产环境指定变量

对于生产环境，请使用 Cloudflare 仪表板或 [`wrangler secret`](https://developers.cloudflare.com/workers/wrangler/commands/#secret) 命令来设置环境变量和密钥。

### 使用 `wrangler.toml`/`wrangler.json` 指定变量

你可以指定自定义的 `wrangler.toml`/`wrangler.json` 文件并在其中定义变量。

::warning
不建议使用此方式存储密钥等敏感数据。
::

**示例：**

::code-group

```ini [wrangler.toml]
# 共享
[vars]
NITRO_HELLO_THERE="general"
SECRET="secret"

# 为 `--env production` 用法覆盖值
[env.production.vars]
NITRO_HELLO_THERE="captain"
SECRET="top-secret"
```

```json [wrangler.json]
{
  "vars": {
    "NITRO_HELLO_THERE": "general",
    "SECRET": "secret"
  },
  "env": {
    "production": {
      "vars": {
        "NITRO_HELLO_THERE": "captain",
        "SECRET": "top-secret"
      }
    }
  }
}

```

::

## 直接访问 Cloudflare 绑定

绑定允许你与 Cloudflare 平台中的资源进行交互，例如键值数据存储（[KV](https://developers.cloudflare.com/kv/)）和无服务器 SQL 数据库（[D1](https://developers.cloudflare.com/d1/)）。

::read-more
有关绑定及其使用方式的更多详细信息，请参阅 Cloudflare 的 [Pages](https://developers.cloudflare.com/pages/functions/bindings/) 和 [Workers](https://developers.cloudflare.com/workers/configuration/bindings/#bindings) 文档。
::

::tip
Nitro 为 [KV Storage](/docs/storage) 和 [Database](/docs/database) 等基础功能提供了高级 API。为了保持使用稳定性，优先使用这些 API，而不是直接依赖底层平台 API。
::

:read-more{title="数据库层" to="/docs/database"}

:read-more{title="KV 存储" to="/docs/storage"}

在运行时，你可以通过 `event.req.runtime.cloudflare.env` 从请求事件中访问绑定。例如，以下是访问 D1 绑定的方式：

```ts
import { defineHandler } from "nitro";

defineHandler(async (event) => {
  const { env } = event.req.runtime.cloudflare
  const stmt = await env.MY_D1.prepare('SELECT id FROM table')
  const { results } = await stmt.all()
})
```

### 在本地开发中访问绑定

在开发模式下，Nitro 使用 [Miniflare](https://miniflare.dev/) 模拟 Cloudflare 环境（这是 Wrangler 和 Cloudflare Workers 在生产环境中使用的同一个 [`workerd`](https://github.com/cloudflare/workerd) 运行时）。这意味着绑定可以原生地从请求事件中获取，无需单独的代理或安装 `wrangler`。

[`miniflare`](https://www.npmjs.com/package/miniflare) 软件包由你的项目负责管理：Nitro 会从你的 `node_modules` 中解析它，并在首次使用时提供安装选项。

要在开发模式下访问绑定，请先定义它们。你可以在 `wrangler.jsonc`/`wrangler.json`/`wrangler.toml` 文件中完成此操作：

::code-group

```ini [wrangler.toml]
[vars]
MY_VARIABLE="my-value"

[[kv_namespaces]]
binding = "MY_KV"
id = "xxx"
```

```json [wrangler.json]
{
  "vars": {
    "MY_VARIABLE": "my-value",
  },
  "kv_namespaces": [
    {
      "binding": "MY_KV",
      "id": "xxx"
    }
  ]
}
```

::

或者，你也可以在 `nitro.config.ts` 中使用 `cloudflare.wrangler` 选项内联定义绑定（它接受与 `wrangler.json` 相同的结构）：

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  preset: "cloudflare_module",
  cloudflare: {
    wrangler: {
      vars: {
        MY_VARIABLE: "my-value",
      },
      kv_namespaces: [{ binding: "MY_KV", id: "xxx" }],
    },
  },
})
```

从现在开始，运行

:pm-run{script="dev"}

时，你可以按照上面的示例从请求事件中访问 `MY_VARIABLE` 和 `MY_KV`。

#### Wrangler 环境

如果你有多个 Wrangler 环境，你可以使用 `cloudflare.wranglerEnv` 选项指定在本地开发模拟时要使用的环境：

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  preset: 'cloudflare_module',
  cloudflare: {
    wranglerEnv: 'preview'
  }
})
```
