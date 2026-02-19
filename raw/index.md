# 

> 

<u-page-hero orientation="horizontal">
<code-group>
<prose-pre filename="vite.config.ts">

```ts
import { defineConfig } from 'vite'
import { nitro } from 'nitro/vite'

export default defineConfig({
  plugins: [
    nitro()
  ],
  nitro: {
    preset: 'standard'
  }
})
```

</prose-pre>
</code-group>

<hero-background>



</hero-background>

<template v-slot:title="">

发布 <span className="text-primary">

全栈

</span>

 Vite 应用

</template>

<template v-slot:description="">

Nitro 为您的 Vite 应用扩展了一个生产就绪的服务器，兼容任何运行时。向应用添加服务器路由，并以零配置体验部署到多种托管平台。

</template>

<template v-slot:links="">
<u-button size="xl" to="/docs/quick-start" trailing-icon="i-lucide-arrow-right">

快速开始

</u-button>

<u-button size="xl" to="https://github.com/nitrojs/nitro" color="neutral" icon="i-simple-icons-github" target="_blank" variant="outline">

GitHub

</u-button>
</template>
</u-page-hero>

<div className="bg-neutral-50,dark:bg-neutral-950/30,py-10,border-y,border-default">
<u-container>
<u-page-grid>
<u-page-feature>
<template v-slot:title="">

快速

</template>

<template v-slot:description="">

享受带有服务器端 HMR 的 Vite 开发体验，并针对生产环境进行优化。

</template>
</u-page-feature>

<u-page-feature>
<template v-slot:title="">

多样

</template>

<template v-slot:description="">

使用零配置将相同代码库部署到任何部署提供商，无供应商锁定。

</template>
</u-page-feature>

<u-page-feature>
<template v-slot:title="">

极简

</template>

<template v-slot:description="">

极简设计，适配任何解决方案，开销最低。

</template>
</u-page-feature>
</u-page-grid>
</u-container>
</div>

<u-page-section :features="[{"title":"routes/","description":"在 routes/ 目录中创建服务器路由，它们将自动注册。","icon":"i-lucide-folder-tree"},{"title":"server.ts","description":"完全遵循 Web 标准，使用您选择的标准库，在 server.ts 文件中创建服务器路由。","icon":"i-lucide-file-code"}]" orientation="horizontal">
<template v-slot:title="">

创建服务器路由

</template>

<template v-slot:description="">

在 routes/ 目录中开始创建 API 路由，或使用您喜欢的后端框架，在 `server.ts` 文件中开始。

</template>

<div className="min-h-[506px]">
<tabs>
<tabs-item icon="i-lucide-folder" label="文件系统路由">
<code-tree :expand-all="true" default-value="routes/hello.ts" expand-all="">
<prose-pre filename="vite.config.ts">

```ts
import { defineConfig } from 'vite'
import { nitro } from 'nitro/vite'

export default defineConfig({
  plugins: [
    nitro()
  ],
});
```

</prose-pre>

<prose-pre filename="routes/hello.ts">

```ts
import { defineHandler } from 'nitro/h3'

export default defineHandler(({ req }) => {
  return { api: 'works!' }
})
```

</prose-pre>

<prose-pre filename="index.html">

```html
<html>
  <head>
    <title>Nitro + Vite</title>
  </head>
  <body>
    <h1>Hey, there!</h1>
  </body>
  </html>
```

</prose-pre>
</code-tree>
</tabs-item>

<tabs-item icon="i-lucide-globe" label="Web 标准">
<prose-pre filename="server.ts">

```ts
export default {
  async fetch(req: Request): Promise<Response> {
    return new Response(`Hello world! (${req.url})`);
  },
};
```

</prose-pre>
</tabs-item>

<tabs-item icon="i-undocs-h3" label="H3">
<prose-pre filename="server.ts">

```ts
import { H3 } from 'h3'

const app = new H3()

app.get("/", () => '⚡️ Hello from H3!')

export default app
```

</prose-pre>
</tabs-item>

<tabs-item icon="i-undocs-hono" label="Hono">
<prose-pre filename="server.ts">

```ts
import { Hono } from 'hono'

const app = new Hono()

app.get("/", (c) => c.text('🔥 Hello from Hono!'))

export default app
```

</prose-pre>
</tabs-item>

<tabs-item icon="i-undocs-elysia" label="Elysia">
<prose-pre filename="server.ts">

```ts
import { Elysia } from 'elysia'

const app = new Elysia()

app.get("/", (c) => '🦊 Hello from Elysia!')

export default app
```

</prose-pre>
</tabs-item>
</tabs>
</div>
</u-page-section>

<page-sponsors>



</page-sponsors>

<page-contributors>



</page-contributors>
