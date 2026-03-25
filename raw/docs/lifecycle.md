# 生命周期

> 了解 Nitro 如何运行并为你的应用提供传入请求服务。

## 请求生命周期

请求可以在以下任何层中被拦截和终止（无论是否有响应），按以下顺序：

<steps>

### `request` 钩子

`request` 钩子是为每个传入请求运行的第一段代码。它通过 [服务器插件](/docs/plugins) 注册：

```ts [plugins/request-hook.ts]
import { definePlugin } from "nitro";

export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook("request", (event) => {
    console.log(`Incoming request on ${event.path}`);
  });
});
```

<note>

在 `request` 钩子中抛出的错误会被 [`error` 钩子](#error-handling) 捕获，不会终止请求管道。

</note>

### 静态资源

当启用静态资源服务时（大多数预设的默认设置），Nitro 会在任何其他中间件或路由处理程序运行**之前**检查请求是否匹配 `public/` 目录中的文件。

如果找到匹配项，静态文件将立即通过适当的 `Content-Type`、`ETag`、`Last-Modified` 和 `Cache-Control` 响应头进行提供。请求被终止，不再执行其他中间件或路由。

静态资源还支持通过 `Accept-Encoding` 请求头对预压缩文件（gzip、brotli、zstd）进行内容协商。

### 路由规则

Nitro 配置中定义的匹配路由规则将被执行。路由规则作为中间件运行，因此大多数规则会在不终止请求的情况下修改响应（例如，添加响应头或设置缓存策略）。

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  routeRules: {
    '/**': { headers: { 'x-nitro': 'first' } }
  }
})
```

<read-more to="/docs/routing#route-rules" title="路由 > 路由规则">



</read-more>

### 全局中间件

在 `middleware/` 目录中定义的任何全局中间件都将被运行：

```ts [middleware/info.ts]
import { defineHandler } from "nitro";

export default defineHandler((event) => {
  event.context.info = { name: "Nitro" };
});
```

<warning>

从中间件返回将关闭请求，应尽可能避免。

</warning>

<read-more to="/docs/routing#middleware">

了解有关 Nitro 中间件的更多信息。

</read-more>

### 路由中间件

针对特定路由模式的中间件（在 `middleware/` 中用 `route` 定义）在全局中间件之后、匹配的路由处理程序之前运行。

### 路由

Nitro 将查看 `routes/` 文件夹中定义的路由来匹配传入请求。

```ts [routes/api/hello.ts]
export default (event) => ({ world: true })
```

<read-more to="/docs/routing#filesystem-routing">

了解有关 Nitro 文件系统路由的更多信息。

</read-more>

如果定义了 serverEntry，它将捕获所有不匹配其他任何路由的请求，充当 `/**` 路由处理程序。

```ts [server.ts]
import { defineHandler } from "nitro";

export default defineHandler((event) => {
  if (event.path === "/") {
    return "Home page";
  }
});
```

<read-more to="/docs/server-entry">

了解有关 Nitro 服务器入口的更多信息。

</read-more>

### 渲染器

如果没有匹配的路由，Nitro 将查找渲染器处理程序（已定义或自动检测）来处理请求。

<read-more to="/docs/renderer">

了解有关 Nitro 渲染器的更多信息。

</read-more>

### `response` 钩子

在创建响应后（来自上述任何层），`response` 钩子运行。此钩子接收最终的 `Response` 对象和事件，可用于检查或修改响应头：

```ts [plugins/response-hook.ts]
import { definePlugin } from "nitro";

export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook("response", (res, event) => {
    console.log(`Response ${res.status} for ${event.path}`);
  });
});
```

<note>

`response` 钩子为每个响应运行，包括静态资源、中间件终止的请求和错误响应。

</note>
</steps>

## 错误处理

当在请求生命周期的任何点发生错误时，Nitro：

<steps level="4">

#### 调用 `error` 钩子，传入错误和上下文（包括事件和源标签）。

#### 将错误传递给**错误处理程序**，将其转换为 HTTP 响应。

</steps>

```ts [plugins/errors.ts]
import { definePlugin } from "nitro";

export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook("error", (error, context) => {
    console.error("Captured error:", error);
    // context.event - H3 事件（如果可用）
    // context.tags - 错误源标签，如 "request"、"response"、"plugin"
  });
});
```

错误还会在 `event.req.context.nitro.errors` 中按请求跟踪，以便在后续钩子中检查。

你可以在 Nitro 配置中提供自定义错误处理程序来控制错误响应格式：

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  errorHandler: "~/error",
})
```

此外，进程级别的未处理 Promise 拒绝和未捕获异常会自动捕获到 `error` 钩子中，并带有 `"unhandledRejection"` 和 `"uncaughtException"` 标签。

## 服务器关闭

当 Nitro 服务器关闭时，会调用 `close` 钩子。使用它来清理资源，如数据库连接、定时器或外部服务句柄：

```ts [plugins/cleanup.ts]
import { definePlugin } from "nitro";

export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook("close", async () => {
    // 清理资源
  });
});
```

## 钩子参考

所有运行时钩子都通过 [服务器插件](/docs/plugins) 使用 `nitroApp.hooks.hook()` 注册。

<table>
<thead>
  <tr>
    <th>
      钩子
    </th>
    
    <th>
      签名
    </th>
    
    <th>
      运行时机
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        request
      </code>
    </td>
    
    <td>
      <code>
        (event: HTTPEvent) => void | Promise<void>
      </code>
    </td>
    
    <td>
      每个请求开始时，路由之前。
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        response
      </code>
    </td>
    
    <td>
      <code>
        (res: Response, event: HTTPEvent) => void | Promise<void>
      </code>
    </td>
    
    <td>
      响应创建后、发送前。
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        error
      </code>
    </td>
    
    <td>
      <code>
        (error: Error, context: { event?, tags? }) => void
      </code>
    </td>
    
    <td>
      在生命周期期间捕获到任何错误时。
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        close
      </code>
    </td>
    
    <td>
      <code>
        () => void
      </code>
    </td>
    
    <td>
      当 Nitro 服务器关闭时。
    </td>
  </tr>
</tbody>
</table>

<note>

`NitroRuntimeHooks` 接口是可扩展的。部署预设（如 Cloudflare）可以用平台特定的钩子来扩展它。

</note>

<read-more to="/docs/plugins">

了解有关 Nitro 插件和钩子使用示例的更多信息。

</read-more>
