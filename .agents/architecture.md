# Nitro 架构深度解析

## 核心实例（`src/nitro.ts`）

`createNitro(config, opts)` 创建主要上下文，包含：
- `options: NitroOptions` — 解析后的配置
- `hooks: Hookable<NitroHooks>` — 构建生命周期钩子
- `vfs: Map<string, { render }>` — 虚拟文件系统
- `routing: { routes, routeRules, globalMiddleware, routedMiddleware }`
- `scannedHandlers: NitroEventHandler[]`
- `unimport?: Unimport` — 自动导入（可选）
- `logger: ConsolaInstance`
- `updateConfig(config)` — 热重载配置
- `close()` — 清理

**设置流程：**
1. 通过 `loadOptions()` 加载选项
2. 通过 `installModules()` 安装模块
3. 通过 `initNitroRouting()` 初始化路由
4. 通过 `scanAndSyncOptions()` 扫描处理器/插件/任务
5. 准备 unimport 用于自动导入
6. 设置钩子

## 入口点

- `src/builder.ts` — 主要公共 API：`createNitro()`, `build()`, `createDevServer()`, `prerender()`, `copyPublicAssets()`, `prepare()`, `writeTypes()`, `runTask()`, `listTasks()`
- `src/vite.ts` — 来自 `src/build/vite/plugin.ts` 的 Vite 插件导出

## 构建系统（`src/build/`）

**构建器调度**（`build/build.ts`）：根据 `nitro.options.builder` 委派给 `rollup`, `rolldown`, 或 `vite`。

**构建器选择**（在 `config/resolvers/builder.ts` 中解析）：
- 检查环境变量 `NITRO_BUILDER` / `NITRO_VITE_BUILDER`
- 自动检测可用包
- 回退顺序：rolldown → vite → rollup

**基础配置**（`build/config.ts`）：
- 支持扩展名：`.ts`, `.mjs`, `.js`, `.json`, `.node`, `.tsx`, `.jsx`
- `import.meta` 替换（如 `import.meta.dev`, `import.meta.preset` 等）
- Unenv 别名用于 polyfill
- 外部依赖匹配规则

**插件**（`build/plugins.ts`）：
1. 虚拟模块 — 渲染自 `build/virtual/`
2. 自动导入 — Unimport 插件
3. WASM 加载器 — unwasm
4. 服务器主入口注入 — `globalThis.__server_main__`
5. 原始导入 — `?raw` 后缀
6. 路由元信息 — OpenAPI 元数据
7. 替换插件 — 变量替换
8. 外部插件 — Node.js 原生解析
9. Sourcemap 压缩（可选）

**虚拟模块**（`build/virtual/`，14 个模板）：
均以 `#nitro/virtual/<name>` 为前缀：
- `routing.ts` — 编译后的路由匹配器
- `plugins.ts` — 插件注册表
- `error-handler.ts` — 错误处理器
- `public-assets.ts` — 公开资源元数据
- `server-assets.ts` — 服务器资源元数据
- `runtime-config.ts` — 运行时配置对象
- `database.ts` — 数据库设置
- `storage.ts` — 存储后端
- `tasks.ts` — 任务注册表
- `polyfills.ts` — 环境 polyfill
- `feature-flags.ts` — 功能检测
- `routing-meta.ts` — 路由元数据（OpenAPI）
- `renderer-template.ts` — SSR 渲染器
- `_all.ts` — 聚合文件

## 配置系统（`src/config/`）

**加载器**（`config/loader.ts`）：`loadOptions(config, opts)`
1. 与默认值合并（`NitroDefaults`）
2. 加载 c12 配置文件（`nitro.config.ts`、`package.json.nitro` 等）
3. 解析预设（preset）
4. 顺序执行配置解析器

**解析器**（`config/resolvers/`）：
`compatibility`、`tsconfig`、`paths`、`imports`、`route-rules`、`database`、`export-conditions`、`runtime-config`、`open-api`、`url`、`assets`、`storage`、`error`、`unenv`、`builder`

**默认值**（`config/defaults.ts`）：所有 NitroConfig 默认值。

## 运行时（`src/runtime/`）

**内部**（`runtime/internal/`）：
- `app.ts` — NitroApp 创建，H3 应用设置
- `cache.ts` — 响应缓存
- `context.ts` — 异步上下文
- `route-rules.ts` — 路由规则中间件（头部、重定向、代理、缓存、跨域）
- `static.ts` — 静态文件服务
- `task.ts` — 任务执行
- `plugin.ts` — 插件辅助
- `runtime-config.ts` — 配置获取器

**公共导出**：`runtime/app.ts`（`defineConfig()`）、`runtime/nitro.ts`（`serverFetch()`）、`runtime/cache.ts`、`runtime/task.ts`、`runtime/storage.ts` 等。

## 开发服务器（`src/dev/`）

- `dev/server.ts` — `NitroDevServer`: 通过 `env-runner` 管理 Worker，失败重启（最多 3 次重试），支持 WebSocket，VFS 调试端点（`/_vfs/**`）
- `dev/app.ts` — `NitroDevApp`: 基于 H3 的应用，带错误处理、压缩的静态服务、开发代理

## 预渲染（`src/prerender/`）

- `prerender/prerender.ts` — 主流程：解析路由 → 构建预渲染器（预设：`nitro-prerender`）→ 并行执行 → 链接爬取 → 写入磁盘 → 压缩
- `prerender/utils.ts` — `extractLinks()`、`matchesIgnorePattern()`、`formatPrerenderRoute()`

## 路由与扫描（`src/routing.ts`，`src/scan.ts`）

**扫描**：从文件系统中发现路由、中间件、插件、任务、模块。

路由文件命名规范：
- `routes/index.ts` → `GET /`
- `routes/users/[id].ts` → `GET /users/:id`
- `routes/users/[...slug].ts` → `GET /users/**:slug`
- `api/users.post.ts` → `POST /api/users`
- `.dev` / `.prod` / `.prerender` 后缀用于环境过滤

**路由器**（`Router` 类）：基于 `rou3`，编译成优化的字符串匹配器，支持方法路由 + 环境条件。

## 预设（`src/presets/`）

共有 31 个预设。每个预设结构如下：
```
presets/<name>/
├── preset.ts        # defineNitroPreset()
├── runtime/         # 运行时代码入口（打包）
├── types.ts         # 类型定义（可选）
├── utils.ts         # 构建时工具（可选）
└── unenv/           # 环境覆盖（可选）
```

主要预设：`standard`，`node`（服务器/中间件/集群），`cloudflare`（pages/workers），`vercel`，`netlify`，`aws-lambda`，`deno`，`firebase`，`azure`，`bun`，`winterjs`

解析逻辑：`presets/_resolve.ts` 处理别名、开发/生产、兼容日期、静态托管。

## CLI（`src/cli/`）

使用 `citty`，命令按需加载：`dev`、`build`、`deploy`、`preview`、`prepare`、`task`、`docs`。

## 关键库

| 库名         | 作用             |
|--------------|------------------|
| `h3`         | HTTP 框架        |
| `rou3`       | 路由匹配          |
| `c12`        | 配置加载          |
| `citty`      | CLI 框架          |
| `hookable`   | 钩子系统          |
| `unimport`   | 自动导入          |
| `unstorage`  | 存储抽象          |
| `unenv`      | 运行时 polyfill   |
| `defu`       | 配置合并          |
| `pathe`      | 路径操作          |
| `consola`    | 日志              |
| `env-runner` | Worker 管理       |
