# 配置

> 自定义并扩展 Nitro 默认配置。

<read-more to="/config">

查看 [配置参考](/config) 了解可用选项。

</read-more>

## 配置文件

你可以通过配置文件自定义你的 Nitro 构建器。

<CodeGroup>

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  // Nitro 选项
})
```

```ts [vite.config.ts]
import { defineConfig } from 'vite'
import { nitro } from 'nitro/vite'

export default defineConfig({
  plugins: [
    nitro()
  ],
  nitro: {
    // Nitro 选项
  }
})
```

</CodeGroup>

<tip>

Nitro 使用 [c12](https://github.com/unjs/c12) 加载配置，提供了更多可能性，例如在当前工作目录或用户主目录中使用 `.nitrorc` 文件。

</tip>

### 环境特定配置

使用 [c12](https://github.com/unjs/c12) 约定，你可以使用 `$development` 和 `$production` 键提供特定于环境的覆盖：

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  logLevel: 3,
  $development: {
    // 仅在开发模式下应用的选项
    debug: true,
  },
  $production: {
    // 仅在生产构建中应用的选项
    minify: true,
  },
})
```

环境名称在 `nitro dev` 期间为 `"development"`，在 `nitro build` 期间为 `"production"`。

### 扩展配置

你可以使用 `extends` 键从其他配置或预设进行扩展：

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  extends: "./base.config",
})
```

### 来自 package.json 的配置

你也可以在 `package.json` 文件的 `nitro` 键下提供 Nitro 配置。

## 目录选项

Nitro 提供了多个选项来控制目录结构：

<table>
<thead>
  <tr>
    <th>
      选项
    </th>
    
    <th>
      默认值
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
        rootDir
      </code>
    </td>
    
    <td>
      <code>
        .
      </code>
      
      （当前目录）
    </td>
    
    <td>
      项目的根目录。
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        serverDir
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      服务器源代码目录（设置为 <code>
        "server"
      </code>
      
       或 <code>
        "./"
      </code>
      
       以启用）。
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        buildDir
      </code>
    </td>
    
    <td>
      <code>
        node_modules/.nitro
      </code>
    </td>
    
    <td>
      构建产物的目录。
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        output.dir
      </code>
    </td>
    
    <td>
      <code>
        .output
      </code>
    </td>
    
    <td>
      生产输出目录。
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        output.serverDir
      </code>
    </td>
    
    <td>
      <code>
        .output/server
      </code>
    </td>
    
    <td>
      服务器输出目录。
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        output.publicDir
      </code>
    </td>
    
    <td>
      <code>
        .output/public
      </code>
    </td>
    
    <td>
      公共资源输出目录。
    </td>
  </tr>
</tbody>
</table>

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  serverDir: "server",
  buildDir: "node_modules/.nitro",
  output: {
    dir: ".output",
  },
})
```

<note>

`srcDir` 选项已弃用。请使用 `serverDir` 代替。

</note>

## 环境变量

某些 Nitro 行为可以使用环境变量进行配置：

<table>
<thead>
  <tr>
    <th>
      变量
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
        NITRO_PRESET
      </code>
    </td>
    
    <td>
      覆盖部署预设。
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        NITRO_COMPATIBILITY_DATE
      </code>
    </td>
    
    <td>
      设置兼容日期。
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        NITRO_APP_BASE_URL
      </code>
    </td>
    
    <td>
      覆盖基础 URL（默认：<code>
        /
      </code>
      
      ）。
    </td>
  </tr>
</tbody>
</table>

## 运行时配置

Nitro 提供了一个运行时配置 API，用于在你的应用程序中暴露配置，并能够通过设置环境变量在运行时更新它。当你想要为不同环境（例如开发、预发、生产）暴露不同的配置值时，这非常有用。例如，你可以使用它为不同环境暴露不同的 API 端点，或暴露不同的功能开关。

首先，你需要在配置文件中定义运行时配置。

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  runtimeConfig: {
    apiToken: "dev_token", // `dev_token` 是默认值
  }
});
```

你现在可以使用 `useRuntimeConfig()` 访问运行时配置。

```ts [api/example.get.ts]
import { defineHandler } from "nitro";
import { useRuntimeConfig } from "nitro/runtime-config";

export default defineHandler((event) => {
  return useRuntimeConfig().apiToken; // 返回 `dev_token`
});
```

### 嵌套对象

运行时配置支持嵌套对象。任何深度的键都使用 `NITRO_` 前缀和 `UPPER_SNAKE_CASE` 转换映射到环境变量：

<CodeGroup>

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  runtimeConfig: {
    database: {
      host: "localhost",
      port: 5432,
    },
  },
});
```

```bash [.env]
NITRO_DATABASE_HOST="db.example.com"
NITRO_DATABASE_PORT="5433"
```

</CodeGroup>

<note>

只有在你配置文件的 `runtimeConfig` 中定义的键才会被考虑。你不能仅使用环境变量引入新键。

</note>

### 序列化

运行时配置值必须是可序列化的（字符串、数字、布尔值、普通对象和数组）。不可序列化的值（类实例、函数等）将在构建时触发警告。

配置中值为 `undefined` 或 `null` 的项将作为后备替换为空字符串（`""`）。

### 本地开发

你可以使用环境变量更新运行时配置。你可以在开发生成中使用项目根目录的 `.env` 或 `.env.local` 文件，并在生产环境中使用平台变量（见下文）。

在你的项目根目录创建一个 `.env` 文件：

```bash [.env]
NITRO_API_TOKEN="123"
```

重启开发服务器，请求 `/api/example` 端点，你应该会看到 `123` 作为响应，而不是 `dev_token`。

<note>

`.env` 和 `.env.local` 文件仅在开发时（`nitro dev`）加载。在生产环境中，请使用你平台的原生环境变量机制。

</note>

不要忘记，你仍然可以通用使用 `import.meta.env` 或 `process.env` 访问环境变量，但要避免在全局环境上下文中使用它们，以防止意外行为。

### 生产环境

你可以在生产环境中定义变量以更新运行时配置。

<warning>

所有变量必须以 `NITRO_` 为前缀才能应用到运行时配置。它们将覆盖你在 `nitro.config.ts` 文件中定义的运行时配置变量。

</warning>

```bash [.env]
NITRO_API_TOKEN="123"
```

在运行时配置中，使用 camelCase 定义键。在环境变量中，使用 snake_case 和大写定义键。

```ts
{
  helloWorld: "foo"
}
```

```bash
NITRO_HELLO_WORLD="foo"
```

### 自定义环境前缀

你可以使用 `nitro.envPrefix` 运行时配置键配置次要的环境变量前缀。除了默认的 `NITRO_` 前缀外，还会检查此前缀：

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  runtimeConfig: {
    nitro: {
      envPrefix: "APP_",
    },
    apiToken: "",
  },
});
```

使用此配置，`NITRO_API_TOKEN` 和 `APP_API_TOKEN` 都将被检查作为覆盖值。

### 环境变量扩展

启用后，运行时配置字符串值中使用 `{{VAR_NAME}}` 语法的环境变量引用将在运行时展开：

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  experimental: {
    envExpansion: true,
  },
  runtimeConfig: {
    url: "https://{{APP_DOMAIN}}/api",
  },
});
```

```bash
APP_DOMAIN="example.com"
```

在运行时，`useRuntimeConfig().url` 将解析为 `"https://example.com/api"`。
