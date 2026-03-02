# KV 存储

> Nitro 提供了一个内置存储层，可以抽象文件系统、数据库或任何其他数据源。

<warning>

Nitro v3 Alpha 文档仍在完善中 — 可能会有更新、不完善之处和偶尔的不准确。

</warning>

Nitro 内置集成了 [unstorage](https://unstorage.unjs.io)，以提供与运行时无关的持久层。

## 用法

要使用存储层，可以使用 `useStorage()` 并调用 `get(key)` 来检索项，并使用 `set(key, value)` 来设置项。

```ts
import { useStorage } from "nitro/storage";

// 默认存储在内存中
await useStorage().set("test:foo", { hello: "world" })
await useStorage().get("test:foo")

// 你可以使用数据存储将数据写入默认的 .data/kv 目录
const dataStorage = useStorage("data")
await dataStorage.set("test", "works")
await dataStorage.get("data:test") // 值持久化

// 你也可以在 useStorage(base) 中指定基数
await useStorage("test").set("foo", { hello: "world" })

// 你可以使用泛型来定义类型
await useStorage<{ hello: string }>("test").get("foo")
await useStorage("test").get<{ hello: string }>("foo")
```

<read-more to="https://unstorage.unjs.io">



</read-more>

## 配置

你可以使用 `storage` 配置挂载一个或多个自定义存储驱动程序。<br />


键是挂载点名称，值是驱动程序名称和配置。

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  storage: {
    redis: {
      driver: "redis",
      /* redis 连接器选项 */
    }
  }
})
```

然后，你可以使用 `useStorage("redis")` 函数访问 redis 存储。

你可以在 [unstorage 文档](https://unstorage.unjs.io/) 中找到驱动程序列表及其配置。

## 仅限开发的挂载点

默认情况下，Nitro 将在开发时使用文件系统驱动程序挂载项目目录和一些其他目录。

```js
// 访问项目根目录
const rootStorage = useStorage('root')

// 访问项目 src 目录（默认与根目录相同）
const srcStorage = useStorage('src')

// 访问服务器缓存目录
const cacheStorage = useStorage('cache')

// 访问临时构建目录
const buildStorage = useStorage('build')
```

<tip>

你还可以使用 `devStorage` 键在开发期间覆盖存储配置。当你在生产中使用数据库并希望在开发中使用文件系统时，这非常有用。

</tip>

为了使用 `devStorage` 键，你需要使用 `nitro dev` 命令，并且 `storage` 选项中的键必须与生产的相同。

<CodeGroup>

```ts [nitro.config.ts]
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  // 生产
  storage: {
    default: {
      driver: 'redis',
      /* redis 连接器选项 */
    }
  },
  // 开发
  devStorage: {
    default: {
      driver: 'fs',
      base: './data/kv'
    }
  }
})
```

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  nitro: {
    // 生产
    storage: {
      db: {
        driver: 'redis',
        /* redis 连接器选项 */
      }
    },
    // 开发
    devStorage: {
      db: {
        driver: 'fs',
        base: './data/db'
      }
    }
  }
})
```

</CodeGroup>

## 运行时配置

在挂载点配置在运行时不确定的场景下，Nitro 可以在启动时动态添加挂载点，使用 [插件](/docs/plugins)。

```ts [plugins/storage.ts]
import { useStorage } from "nitro/storage";
import { definePlugin } from "nitro";
import redisDriver from "unstorage/drivers/redis";

export default definePlugin(() => {
  const storage = useStorage()

  // 动态传入运行时配置或其他来源的凭证
  const driver = redisDriver({
    base: "redis",
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    /* 其他 redis 连接器选项 */
  })

  // 挂载驱动程序
  storage.mount("redis", driver)
})
```

<warning>

这是一个临时解决方案，未来会有更好的解决方案！请关注 GitHub 问题 [这里](https://github.com/nitrojs/nitro/issues/1161#issuecomment-1511444675)。

</warning>
