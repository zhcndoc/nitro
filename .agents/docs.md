# 文档指南

## 结构

文档存放在 `docs/` 目录，使用 [UnDocs](https://github.com/unjs/undocs) 构建。

```
docs/
  .docs/          # UnDocs Nuxt 应用（组件、页面、布局、工具）
  .config/        # docs.yaml（站点配置）、automd.config.ts
  1.docs/         # 核心文档（入门、路由、缓存等）
  2.deploy/       # 部署文档（运行时、提供者）
  3.config/       # 配置参考
  4.examples/     # 示例索引
  index.md        # 主页
```

数字前缀控制导航顺序。相同前缀的文件按字母序排序。

## 约定

### 预设名称

规范预设名称使用 **下划线**（例如 `node_server`、`cloudflare_module`、`digital_ocean`）。运行时支持下划线和连字符（通过 `kebabCase` 解析），但文档应使用下划线形式。

### 导入路径

Nitro v3 使用子路径导出——而非深层运行时导入：

```ts
import { defineHandler, readBody, getQuery } from "nitro/h3";
import { defineCachedHandler, defineCachedFunction } from "nitro/cache";
import { useStorage } from "nitro/storage";
import { useDatabase } from "nitro/database";
import { useRuntimeConfig } from "nitro/runtime-config";
import { defineNitroConfig } from "nitro/config";
import { definePlugin } from "nitro";        // 运行时插件
import { defineRouteMeta } from "nitro";      // 路由元宏
```

### H3 v2 API

Nitro v3 使用 H3 v2。与 v1 关键区别：

- **Handler**：`defineHandler()`（非 `eventHandler` / `defineEventHandler`）
- **错误**：`throw new HTTPError(message, { status })`（非 `createError()`）
- **路由器**：`new H3()`（非 `createApp()` / `createRouter()`）
- **响应**：直接返回值；无 `send()` 函数
- **头部**：`event.res.headers.set(name, value)`（非 `setResponseHeader(event, name, value)`）
- **钩子**：`request` 钩子接收 `(event: HTTPEvent)`，非 `(req)`

### 代码示例

- **不支持自动导入** — 示例中始终显示显式导入
- 始终使用来自 `"nitro/h3"` 的 `defineHandler`（非 `eventHandler`）
- 始终使用来自 `"nitro/config"` 的 `defineNitroConfig`（非 `defineConfig`）
- 代码示例中包含导入语句
- 使用 `"nitro/*"` 导入，绝不使用 `"nitropack/*"`

### Node.js 版本

Nitro v3 要求 Node.js >=20。所有部署文档应引用 Node.js 20+（非 16 或 18）。

### 环境变量

预设环境变量为 `NITRO_PRESET`（非 `SERVER_PRESET` 或其他名称）。

### 运行时配置

- 前缀：环境变量覆盖使用 `NITRO_`
- 配置里使用 camelCase，环境变量用 UPPER_SNAKE_CASE

## 常见错误避免

- 使用 `send(event, value)` — h3 v2 移除此方法，直接返回值
- 使用 `createError()` — 请使用 `new HTTPError()` 或 `HTTPError.status()`
- 使用 `eventHandler()` — 请使用 `defineHandler()`
- 使用 `defineConfig()` 来定义 nitro 配置 — 请使用 `defineNitroConfig()`
- 重复导入（例如同时从 `nitro/h3` 和 `nitro/cache` 导入 `defineHandler`）
- 错误的环境变量名（如 `NITR_PRESET`、`SERVER_PRESET`）
- 部署示例中使用过期的 Node.js 版本
- 文档里使用预设名连字符（应使用下划线）

## MDC 语法参考

文档使用 [MDC](https://content.nuxt.com/)（Markdown Components）语法在 markdown 中嵌入 Vue 组件。

### 块组件

使用 `::` 表示块组件。嵌套级数通过冒号数量递增：

```markdown
::component-name
内容
::

::component{prop="value" boolProp}
内容
::
```

嵌套示例（每一级加一个 `:`）：

```markdown
::parent
  :::child
  内容
  :::
::
```

### Props

**内联格式：** `::alert{type="warning" icon="i-lucide-alert"}`

**YAML 块格式**（用于多个属性）：

```markdown
::component
---
title: 我的标题
icon: i-lucide-rocket
---
内容
::
```

### 插槽

命名插槽使用 `#`：

```markdown
::hero
默认插槽内容

#title
标题插槽内容

#description
描述插槽内容

#links
  :::u-button{to="/docs"}
  开始使用
  :::
::
```

### 内联组件与属性

```markdown
:inline-component{prop="value"}

Hello [World]{.text-primary style="color: green;"}
```

### 变量

```markdown
---
title: 我的页面
---
# {{ $doc.title }}
```

## 排版组件

这些组件可用于文档内容的 markdown 文件。由 [Nuxt UI](https://ui.nuxt.com/) 提供。

### 提示框

```markdown
::note
附加信息提示。
::

::tip
有用建议或最佳实践。
::

::warning
警惕潜在的意外结果。
::

::caution
警告不可逆或危险操作。
::
```

带属性的通用提示框：

```markdown
::callout{icon="i-lucide-info" color="primary"}
自定义提示内容，支持 **markdown**。
::
```

颜色：`primary`、`secondary`、`success`、`info`、`warning`、`error`、`neutral`。

### 标签页

```markdown
::tabs
  :::tabs-item{label="npm" icon="i-lucide-package"}
  ```bash
  npm install nitro
  ```
  :::
  :::tabs-item{label="pnpm"}
  ```bash
  pnpm add nitro
  ```
  :::
::
```

属性：`orientation`（`horizontal`|`vertical`）、`defaultValue`、`content`、`unmountOnHide`。

### 步骤条

```markdown
::steps{level="3"}
### 安装
安装包。

### 配置
添加到配置中。

### 部署
部署你的应用。
::
```

`level` 属性支持 `"2"`、`"3"`（默认）、`"4"`，决定哪一级标题编号为步骤。

### 代码组

```markdown
::code-group
```ts [nuxt.config.ts]
export default defineNuxtConfig({})
```
```ts [nitro.config.ts]
export default defineNitroConfig({})
```
::
```

属性：`defaultValue`、`sync`（同步选择到 localStorage）。

### 代码树

交互式文件树与代码预览：

```markdown
::code-tree{defaultValue="routes/hello.ts" expand-all}
  ::prose-pre{filename="routes/hello.ts"}
  ```ts
  export default defineHandler(() => 'Hello!')
  ```
  ::
  ::prose-pre{filename="vite.config.ts"}
  ```ts
  import { nitro } from 'nitro/vite'
  export default defineConfig({ plugins: [nitro()] })
  ```
  ::
::
```

属性：`defaultValue`、`expandAll`、`items`。

### 卡片

```markdown
::card{title="Storage" icon="i-lucide-database" to="/docs/storage"}
在你的处理器中访问键值存储。
::
```

属性：`title`、`icon`、`color`、`to`、`target`、`variant`（`solid`|`outline`|`soft`|`subtle`）。

### 字段

文档 API 参数：

```markdown
::field{name="preset" type="string" required}
要使用的部署预设。
::
```

属性：`name`、`type`、`description`、`required`。

### 折叠面板

```markdown
::collapsible{name="高级选项"}
展开时显示的隐藏内容。
::
```

属性：`name`、`size`、`color`、`defaultOpen`、`unmountOnHide`。

### Kbd（键盘）

`:kbd[Ctrl]` + `:kbd[C]` 用于行内显示键盘快捷键。

### 图标

`:icon{name="i-lucide-rocket"}` 用于渲染行内图标。

### 排版预格式化块（代码块）

显示带文件名的代码块：

```markdown
::prose-pre{filename="server.ts"}
```ts
export default { fetch: () => new Response('ok') }
```
::
```

## 首页组件

这些是 Nuxt UI 的 `Page*` 组件，用于 `docs/index.md` 主页。MDC 语法中前缀为 `u-`。

### PageHero（`::u-page-hero`）

```markdown
::u-page-hero
---
orientation: horizontal
---
#title
发布 [全栈]{.text-primary} Vite 应用

#description
构建生产就绪的服务器应用。

#links
  :::u-button{size="xl" to="/docs"}
  开始使用
  :::

#default
  :::some-illustration
  :::
::
```

属性：`title`、`description`、`headline`、`orientation`（`vertical`|`horizontal`）、`reverse`、`links`（ButtonProps 数组）。
插槽：`top`、`header`、`headline`、`title`、`description`、`body`、`footer`、`links`、`default`、`bottom`。

### PageSection（`::u-page-section`）

```markdown
::u-page-section
---
orientation: horizontal
features:
  - title: 功能一
    description: 这里是描述
    icon: i-lucide-zap
---
#title
章节标题

#description
章节描述文本。
::
```

属性：`headline`、`icon`、`title`、`description`、`orientation`、`reverse`、`links`（ButtonProps数组）、`features`（PageFeatureProps数组）。
插槽：`top`、`header`、`leading`、`headline`、`title`、`description`、`body`、`features`、`footer`、`links`、`default`、`bottom`。

### PageFeature（`::u-page-feature`）

```markdown
:::::u-page-feature
#title
功能名称

#description
功能描述文本。
:::::
```

属性：`icon`、`title`、`description`、`orientation`（`horizontal`|`vertical`）、`to`、`target`。
插槽：`leading`、`title`、`description`、`default`。

### PageGrid（`::u-page-grid`）

响应式网格（1 → 2 → 3 列）。包装 `PageCard` 或 `PageFeature` 子组件：

```markdown
::::u-page-grid
  :::::u-page-card{title="卡片" icon="i-lucide-box"}
  卡片内容
  :::::
::::
```

### PageCard（`::u-page-card`）

```markdown
::u-page-card{title="标题" icon="i-lucide-box" to="/link"}
卡片主体内容。
::
```

属性：`icon`、`title`、`description`、`orientation`、`reverse`、`highlight`、`highlightColor`、`spotlight`、`spotlightColor`、`variant`、`to`、`target`。
插槽：`header`、`leading`、`title`、`description`、`body`、`footer`、`default`。

### PageCTA（`::u-page-cta`）

行动号召块：

```markdown
::u-page-cta
---
variant: solid
links:
  - label: 开始使用
    to: /docs
    color: neutral
---
#title
准备好开始了吗？

#description
分钟内部署你的应用。
::
```

属性：`title`、`description`、`orientation`、`reverse`、`variant`（`outline`|`solid`|`soft`|`subtle`|`naked`）、`links`。

### PageLogos（`::u-page-logos`）

```markdown
::u-page-logos
---
title: 受信赖的
marquee: true
items:
  - i-simple-icons-github
  - i-simple-icons-vercel
---
::
```

属性：`title`、`items`（图标字符串或 `{src, alt}` 对象）、`marquee`（布尔或 MarqueeProps）。

### PageLinks（`::u-page-links`）

```markdown
::u-page-links
---
title: 社区
links:
  - label: GitHub
    icon: i-simple-icons-github
    to: https://github.com/nitrojs/nitro
---
::
```

### 其他页面组件

- **PageHeader** — 页面标题/描述标题
- **PageBody** — 主要内容容器
- **PageColumns** — 多栏布局
- **PageList** — 垂直列表项
- **PageAnchors** — 锚点导航
- **PageAside** — 侧边栏内容

## Nuxt Content 查询（用于自定义组件）

```ts
// 按路径查询单个页面
const page = await queryCollection('docs').path('/hello').first()

// 过滤列表
const posts = await queryCollection('blog')
  .where('draft', '=', false)
  .order('date', 'DESC')
  .all()

// 导航树
const nav = await queryCollectionNavigation('docs')

// 上一页/下一页
const [prev, next] = await queryCollectionItemSurroundings('docs', '/current')
```

## 自定义组件

项目特定组件位于 `docs/.docs/components/`，可在 markdown 中用 `:component-name` 或 `::component-name` 语法引用（例如 `:page-sponsors`、`:hero-background`，见 `index.md`）。
