# 

> 

<u-page-hero orientation="horizontal">
<code-group>
<prose-pre filename="vite.config.ts">

```ts
import { defineConfig } from 'vite'
import { nitro } from 'nitro/vite'

export default defineConfig({
  plugins: [nitro()],
  nitro: {
    serverDir: "./server"
  }
})
```

</prose-pre>

<prose-pre filename="nitro.config.ts">

```ts
import { defineConfig } from 'nitro'

export default defineConfig({
  preset: "node",
  serverDir: "./server",
  routeRules: {
    "/api/**": { cache: true }
  }
})
```

</prose-pre>
</code-group>

<hero-background>



</hero-background>

<template v-slot:title="">

Build <span className="text-primary">

/Servers

</span>
</template>

<template v-slot:description="">

Nitro extends your Vite application with a production-ready server, compatible with any runtime. Add server routes to your application and deploy many hosting platform with a zero-config experience.

</template>

<template v-slot:links="">
<app-hero-links>



</app-hero-links>
</template>
</u-page-hero>

<hero-features :features="[{"title":"Fast","description":"Enjoy the fast Vite 8 (rolldown powered) development experience with HMR on the server and optimized for production.","icon":"i-lucide-zap","color":"text-amber-500","bgColor":"bg-amber-500/10","borderColor":"group-hover:border-amber-500/30"},{"title":"Agnostic","description":"Deploy the same codebase to any deployment provider with zero config and locked-in.","icon":"i-lucide-globe","color":"text-sky-500","bgColor":"bg-sky-500/10","borderColor":"group-hover:border-sky-500/30"},{"title":"Minimal","description":"Nitro adds no overhead to runtime. Build your servers with any modern tool you like.","icon":"i-lucide-feather","color":"text-emerald-500","bgColor":"bg-emerald-500/10","borderColor":"group-hover:border-emerald-500/30"}]">



</hero-features>

<performance-showcase :metrics="[{"label":"Bare metal perf","value":"~Native","unit":"RPS","description":"Using compile router, and fast paths for request handling.","icon":"i-lucide-gauge","color":"text-emerald-500","bgColor":"bg-emerald-500/10","barWidth":"95%","barColor":"bg-emerald-500"},{"label":"Minimum install Size","value":"Tiny","unit":"deps","description":"Minimal dependencies. No bloated node_modules.","icon":"i-lucide-package","color":"text-sky-500","bgColor":"bg-sky-500/10","barWidth":"15%","barColor":"bg-sky-500"},{"label":"Small and portable output","value":"‹ 10","unit":"kB","description":"Standard server builds produce ultra-small output bundles.","icon":"i-lucide-file-output","color":"text-violet-500","bgColor":"bg-violet-500/10","barWidth":"10%","barColor":"bg-violet-500"},{"label":"FAST builds","value":"‹ 1","unit":"sec","description":"Cold production builds complete in seconds, not minutes.","icon":"i-lucide-timer","color":"text-amber-500","bgColor":"bg-amber-500/10","barWidth":"12%","barColor":"bg-amber-500"}]">



</performance-showcase>

<landing-features>
<template v-slot:body="">
<feature-card headline="Routing" link="/docs/routing" link-label="Routing docs">
<template v-slot:title="">

File-system routing

</template>

<template v-slot:description="">

Create server routes in the routes/ folder and they are automatically registered. Or bring your own framework — H3, Hono, Elysia, Express — via a server.ts entry.

</template>
</feature-card>

<feature-card headline="Versatile" link="/deploy" link-label="Explore deploy targets">
<template v-slot:title="">

Deploy everywhere

</template>

<template v-slot:description="">

The same codebase deploys to Node.js, Cloudflare Workers, Deno, Bun, AWS Lambda, Vercel, Netlify, and more — zero config, no vendor lock-in.

</template>
</feature-card>

<feature-card headline="Storage" link="/docs/storage" link-label="Storage docs">
<template v-slot:title="">

Universal storage

</template>

<template v-slot:description="">

Built-in key-value storage abstraction powered by unstorage. Works with filesystem, Redis, Cloudflare KV, and more — same API everywhere.

</template>
</feature-card>

<feature-card headline="Caching" link="/docs/cache" link-label="Caching docs">
<template v-slot:title="">

Built-in caching

</template>

<template v-slot:description="">

Cache route handlers and arbitrary functions with a simple API. Supports multiple storage backends and stale-while-revalidate patterns.

</template>
</feature-card>

<feature-card headline="Server Entry" link="/docs/server-entry" link-label="Server entry docs">
<template v-slot:title="">

Web standard server

</template>

<template v-slot:description="">

Go full Web standard and pick the library of your choice. Use H3, Hono, Elysia, Express, or the raw fetch API — Nitro handles the rest.

</template>
</feature-card>

<feature-card headline="Renderer" link="/docs/renderer" link-label="Renderer docs">
<template v-slot:title="">

Universal renderer

</template>

<template v-slot:description="">

Use any frontend framework as your renderer. Nitro provides the server layer while your framework handles the UI.

</template>
</feature-card>

<feature-card headline="Plugins" link="/docs/plugins" link-label="Plugins docs">
<template v-slot:title="">

Server plugins

</template>

<template v-slot:description="">

Extend Nitro's runtime behavior with plugins. Hook into lifecycle events, register custom logic, and auto-load from the plugins/ directory.

</template>
</feature-card>

<feature-card headline="Database" link="/docs/database" link-label="Database docs">
<template v-slot:title="">

Built-in database

</template>

<template v-slot:description="">

Lightweight SQL database layer powered by db0. Pre-configured with SQLite out of the box, with support for PostgreSQL, MySQL, and Cloudflare D1.

</template>
</feature-card>

<feature-card headline="Assets" link="/docs/assets" link-label="Assets docs">
<template v-slot:title="">

Static & server assets

</template>

<template v-slot:description="">

Serve public assets directly to clients or bundle server assets for programmatic access. Works seamlessly across all deployment targets.

</template>
</feature-card>
</template>
</landing-features>

<page-sponsors>



</page-sponsors>
