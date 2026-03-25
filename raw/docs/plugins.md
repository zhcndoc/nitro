# 插件

> 使用插件来扩展 Nitro 的运行时行为。

Nitro 插件在服务器启动期间**执行一次**，以允许扩展 Nitro 的运行时行为。
它们接收 `nitroApp` 上下文，可用于挂载到生命周期事件。

插件从 `plugins/` 目录自动注册，并在第一次 Nitro 初始化时按文件名顺序同步运行。插件函数本身必须是同步的（返回 `void`），但它们注册的钩子可以是异步的。

**示例：**

```ts [plugins/test.ts]
import { definePlugin } from "nitro";

export default definePlugin((nitroApp) => {
  console.log('Nitro plugin', nitroApp)
})
```

如果你有其他目录中的插件，可以使用 `plugins` 选项：

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  plugins: ['my-plugins/hello.ts']
})
```

## `nitroApp` 上下文

插件函数接收一个具有以下属性的 `nitroApp` 对象：

<table>
<thead>
  <tr>
    <th>
      属性
    </th>
    
    <th>
      类型
    </th>
    
    <th>
      描述
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        hooks
      </code>
    </td>
    
    <td>
      <a href="https://github.com/unjs/hookable" rel="nofollow">
        <code>
          HookableCore
        </code>
      </a>
    </td>
    
    <td>
      用于注册生命周期回调的钩子系统。
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        h3
      </code>
    </td>
    
    <td>
      <code>
        H3Core
      </code>
    </td>
    
    <td>
      底层的 <a href="https://github.com/h3js/h3" rel="nofollow">
        H3
      </a>
      
       应用实例。
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        fetch
      </code>
    </td>
    
    <td>
      <code>
        (req: Request) => Response | Promise<Response>
      </code>
    </td>
    
    <td>
      应用的内部 fetch 处理器。
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        captureError
      </code>
    </td>
    
    <td>
      <code>
        (error: Error, context) => void
      </code>
    </td>
    
    <td>
      以编程方式将错误捕获到错误钩子管道中。
    </td>
  </tr>
</tbody>
</table>

## Nitro 运行时钩子

你可以使用 Nitro [钩子](https://github.com/unjs/hookable) 在插件中将自定义函数注册到生命周期事件，以扩展 Nitro 的默认运行时行为。

**示例：**

```ts
import { definePlugin } from "nitro";

export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook("close", async () => {
    // 当 nitro 关闭时运行
  });
})
```

### 可用的钩子

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
      描述
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
      在每个请求开始时调用。
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
      在响应创建后调用。
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
        (error: Error, context: { event?: HTTPEvent, tags?: string[] }) => void
      </code>
    </td>
    
    <td>
      当错误被捕获时调用。
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
      当 Nitro 服务器关闭时调用。
    </td>
  </tr>
</tbody>
</table>

<note>

`NitroRuntimeHooks` 接口是可扩展的。部署预设（如 Cloudflare）可以使用平台特定的钩子（如 `cloudflare:scheduled` 和 `cloudflare:email`）来扩展它。

</note>

### 注销钩子

`hook()` 方法返回一个注销函数，可以调用该函数来移除钩子：

```ts
import { definePlugin } from "nitro";

export default definePlugin((nitroApp) => {
  const unregister = nitroApp.hooks.hook("request", (event) => {
    // ......
  });

  // 稍后，移除该钩子
  unregister();
});
```

## 示例

### 捕获错误

你可以使用插件来捕获所有应用错误。

```ts
import { definePlugin } from "nitro";

export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook("error", async (error, { event }) => {
    console.error(`${event?.path} Application error:`, error)
  });
})
```

`context` 对象包含一个可选的 `tags` 数组，用于标识错误来源（例如 `"request"`、`"response"`、`"cache"`、`"plugin"`、`"unhandledRejection"`、`"uncaughtException"`）。

### 以编程方式捕获错误

你可以使用 `captureError` 手动将错误送入错误钩子管道：

```ts
import { definePlugin } from "nitro";

export default definePlugin((nitroApp) => {
  nitroApp.captureError(new Error("something went wrong"), {
    tags: ["startup"],
  });
});
```

### 优雅关闭

服务器将优雅地关闭，并等待由 `event.waitUntil` 发起的任何后台待处理任务。

```ts
import { definePlugin } from "nitro";

export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook("close", async () => {
    // 清理资源、关闭连接等。
  });
});
```

### 请求和响应生命周期

你可以使用插件来注册在请求生命周期中运行的钩子：

```ts
import { definePlugin } from "nitro";

export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook("request", (event) => {
    console.log("on request", event.path);
  });

  nitroApp.hooks.hook("response", (res, event) => {
    // 修改或检查响应
    console.log("on response", res.status);
  });
});
```

### 修改响应头

```ts
import { definePlugin } from "nitro";

export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook("response", (res, event) => {
    const { pathname } = new URL(event.req.url);
    if (pathname.endsWith(".css") || pathname.endsWith(".js")) {
      res.headers.append("Vary", "Origin");
    }
  });
});
```
