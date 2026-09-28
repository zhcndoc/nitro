# 文档指南

## 文档系统

`docs/` 是一个独立的 [UnDocs](https://undocs.unjs.io) 站点（拥有自己的 `package.json` / lockfile）。
在 `docs/` 内运行 `pnpm dev` / `pnpm build`。UnDocs 是一个纯 Vue + Vite + Nitro 应用——**不是 Nuxt**。

```
docs/
  .config/docs.yaml   # 站点配置（名称、github、社交链接、themeColor、重定向、版本）
  .docs/              # 自定义主题层（可选）
    components/       # .vue — 可在 markdown 中使用并全局注册
    pages/            # 文件路由，层叠在内置路由之上
    layouts/          # 命名布局，通过 definePageMeta({ layout }) 选择
    utils/            # 普通模块，通过相对路径导入
    public/           # 在站点根目录提供的静态文件
    assets/           # 在组件 <style> 块中引用的文件
  1.docs/ 2.deploy/ 3.config/ 4.examples/ 9.blog/   # 内容
  index.md            # 首页内容
```

数字前缀控制导航顺序；相同前缀的文件按字母顺序排序。

### 主题层规则

- **没有自动导入。** 每个 `.docs/**` 文件都必须显式从 `undocs/src/app/*` 导入 Vue、undocs 组合式函数和组件（例如 `undocs/src/app/components/ui/Button.vue`、`undocs/src/app/composables/useContent`、`undocs/src/app/router`）。完整组件列表请参阅[自定义主题指南](https://undocs.unjs.io/guide/custom-theme)。
- 组件文件的**基本文件名**就是其名称：`FeatureCard.vue` → `<FeatureCard>` 和 `::feature-card`。发生冲突时，内置标签优先。`.client`/`.server` 后缀会被移除且不起作用。
- **样式使用 shadcn 语义令牌**——`text-foreground`、`text-muted-foreground`、`text-primary`、`bg-background`、`bg-card`、`bg-muted`、`border-border`、`ring-ring`。Nuxt UI 名称（`border-default`、`bg-elevated`、`text-dimmed` 等）不会生成 CSS。`dark:` 变体不会连接到 undocs 的 `.dark` 切换（它们跟随操作系统设置）——请使用令牌，或使用原生 `.dark ...` CSS 规则。
- **Tailwind 只扫描 `.docs/**` 和 undocs 自身的源文件，不扫描 docs markdown。** 写在 markdown frontmatter 中的实用类不会生成 CSS——请将类名保留在 `.docs/` 中（例如 `.docs/utils/accents.ts`），并从 markdown 传入普通名称。同样的摇树优化也会移除 `--color-<themeColor>-*` 变量，而 undocs 运行时的 `--primary` 指向这些变量，这会悄无声息地禁用所有 `*-primary` 实用类——`accents.ts` 中的 `themePaletteKeepAlive` 会固定这些变量；请确保它与 `themeColor` 保持同步。
- 通过 `queryPage(path)`、`queryNavigation()`、`queryBlog()`（需用 `useAsyncData` 包装），或注入共享的 `navigation` 树，从 `/api/docs/*` 读取内容。没有 `queryCollection`。
- 导航树只包含页面的 `navigation:` frontmatter 对象——其他 frontmatter 键（例如 `category`）必须放在 `navigation:` 下，才能显示在侧边栏/列表中。
- 在 setup 期间获取数据的区块（`PageSponsors`、`PageContributors`）必须先由本地 `<Suspense>` 包装组件包裹，才能在 markdown 中使用。

## MDC 语法

区块组件使用 `::`，嵌套时增加一个冒号；行内组件使用单个 `:`。

```markdown
::block{inlineProp="value"}
Default slot content

#namedSlot
Slot content
::

:inline-block{to="/docs"}

Hello [World]{.text-primary}
```

多个属性则改用 YAML 区块：

```markdown
::block
---
title: My Title
items:
  - one
  - two
---
::
```

### 内置区块

| 标签 | 说明 |
| --- | --- |
| `::note` `::tip` `::important` `::warning` `::caution` | 提示框 |
| `::code-group` | `:::prose-pre` / 围栏代码块标签页 |
| `::code-tree{defaultValue expandAll}` | 文件树 + 代码预览 |
| `::tabs` / `:::tab{label icon}` | 标签页内容 |
| `::steps` | 编号步骤（或编号列表） |
| `::card{title icon to}` / `::card-group` | 内容卡片 |
| `::page-hero{orientation}` | 首页主视觉区块 — `#top` `#headline` `#title` `#description` `#links` 插槽 |
| `::page-section{title description aura}` | 首页区块 |
| `::page-feature{title description icon}` / `::page-card{title description icon to}` | 首页区块 |
| `:read-more{to title}` | 行内“阅读更多”链接 |
| `:pm-install` `:pm-run` `:pm-x` | 包管理器命令区块 |
| `::mermaid` | 图表 |

Nitro 自带的首页区块位于 `docs/.docs/components/`（`::app-hero-links`、`::hero-features`、`::performance-showcase`、`::landing-features`、`::feature-card`、`::sponsors`、`:hero-background`）。

## 内容规范

### 预设名称

规范的预设名称使用**下划线**（`node_server`、`cloudflare_module`、`digital_ocean`）。两种形式在运行时都能解析，但文档使用带下划线的形式。

### 导入路径

Nitro v3 使用子路径导出，而不是深层运行时导入：

```ts
import { defineConfig } from "nitro"; // nitro config (nitro.config.ts)
import { defineHandler } from "nitro"; // event handlers
import { definePlugin } from "nitro"; // runtime plugin
import { defineRouteMeta } from "nitro"; // route meta macro
import { readBody, getQuery } from "nitro/h3"; // other h3 utilities
import { defineCachedHandler, defineCachedFunction } from "nitro/cache";
import { useKV } from "nitro/kv";
import { useDatabase } from "nitro/database";
import { useRuntimeConfig } from "nitro/runtime-config";
import { defineTask, runTask } from "nitro/task";
```

### H3 v2 API

- **处理器**：`defineHandler()`（不是 `eventHandler` / `defineEventHandler`）
- **错误**：`throw new HTTPError(message, { status })`（不是 `createError()`）
- **路由器**：`new H3()`（不是 `createApp()` / `createRouter()`）
- **响应**：直接返回值；不使用 `send()`
- **标头**：`event.res.headers.set(name, value)`
- **钩子**：`request` 钩子接收 `(event: HTTPEvent)`，而不是 `(req)`

### 代码示例

- 不提供自动导入——务必展示显式导入
- 始终使用来自 `"nitro"` 的 `defineHandler`（不要使用 `eventHandler`）
- Nitro 配置始终使用来自 `"nitro"` 的 `defineConfig`（不要使用 `defineNuxtConfig` 或 Vite 的 `defineConfig`）
- 使用 `"nitro/*"` 导入，绝不使用 `"nitropack/*"`
- 所有部署示例中的 Node.js 版本均为 >= 20
- 预设环境变量为 `NITRO_PRESET`；运行时配置覆盖使用 `NITRO_` 前缀（配置中使用 camelCase，环境变量中使用 UPPER_SNAKE_CASE）

### 常见错误

- `send(event, value)`、`createError()`、`eventHandler()`——这些都已在 h3 v2 中移除
- 从子路径导入 `defineConfig`/`defineHandler`——两者都来自主 `"nitro"` 入口
- 重复导入（例如，从 `nitro/h3` 和 `nitro/cache` 同时导入 `defineHandler`）
- 使用连字符的预设名称、过时的 Node.js 版本、错误的环境变量名称
- 在 `.docs/` 中使用 Nuxt 时代的惯用写法：`U*` 组件、`NuxtLink`、`ContentRenderer`、`queryCollection`、`~/` 别名、将 `definePageMeta` 用作宏、`nuxt.config.ts` / `app.config.ts`
- 文档页面之间使用相对链接——始终使用绝对路径（`/docs/plugins`），且在哈希前不要加尾部斜杠（`/deploy#zero-config-providers`）；失效链接会导致预渲染构建失败
