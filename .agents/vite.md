# Nitro Vite 构建系统

## 概览

`src/build/vite/` 是 Nitro 基于 Vite 的构建系统，使用了 Vite 6+ 的多环境 API。它以 Vite 插件（`nitro()`）的形式集成，负责管理服务器构建、服务环境、开发服务器和生产输出。

## 文件映射

| 文件 | 作用 |
|------|---------|
| `plugin.ts` | 主插件 — 由 6 个子插件协调构建 |
| `env.ts` | Vite 环境创建（nitro、services、env-runner） |
| `dev.ts` | 开发服务器集成，`FetchableDevEnvironment`，中间件 |
| `prod.ts` | 生产多环境构建，资源管理，虚拟设置模块 |
| `bundler.ts` | Rollup / Rolldown 配置生成 |
| `build.ts` | `nitro build` 的 CLI 构建入口（`viteBuild()`） |
| `preview.ts` | 预览服务器插件 |
| `types.ts` | 类型定义（`NitroPluginConfig`，`NitroPluginContext`） |

## 插件架构（`plugin.ts`）

`nitro(config?)` 返回由 6 个子插件组成的数组：

### 1. `nitroInit` — 上下文设置
- 在第一次 `config` 钩子中调用 `setupNitroContext()`
- 通过 `createNitro()` 创建 Nitro 实例
- 检测 Rolldown 与 Rollup（`_isRolldown`）
- 通过 `getBundlerConfig()` 解析打包器配置
- 在开发模式下初始化 env-runner
- 附加用于开发环境的 Rollup 插件

### 2. `nitroEnv` — 环境注册
- 注册 Vite 环境：`client`、`nitro` 及用户服务
- 自动检测 SSR 的 `entry-server`
- 配置每个环境的构建选项（消费者类型、外部依赖等）

### 3. `nitroMain` — 构建协调
- 设置应用类型为 `"custom"`
- 配置模块解析别名、服务器端口
- `buildApp` 钩子 → 调用 `buildEnvironments()`（生产）
- `generateBundle` 钩子 → 跟踪入口点
- `configureServer` → 调用 `configureViteDevServer()`（开发）
- `hotUpdate` → 仅服务器模块重新加载

### 4. `nitroPrepare` — 输出清理
- 在构建开始前清理构建目录

### 5. `nitroService` — 虚拟模块处理
- 解析 `#nitro-vite-setup` 虚拟模块
- 提供服务环境的生产设置代码

### 6. `nitroPreviewPlugin` — 预览服务器
- 所有预览请求通过 Nitro 路由
- 支持 WebSocket 升级

## `setupNitroContext()` 流程

1. 合并插件配置与用户配置
2. 加载 dotenv 文件
3. 检测 SSR 入口（查找 `entry-server.{ts,js,tsx,jsx,mjs}`）
4. 创建 Nitro 实例（`createNitro()`）
5. 解析打包器配置（`getBundlerConfig()`）
6. 初始化开发环境的 env-runner（`initEnvRunner()`）

## 环境（`env.ts`）

Nitro 使用 Vite 6+ 的环境 API 支持多包构建：

| 环境 | 消费者 | 目的 |
|-------------|----------|---------|
| `client` | `"client"` | 浏览器端 HTML/CSS/JS |
| `nitro` | `"server"` | 主服务器包 |
| `ssr` | `"server"` | 可选的 SSR 服务 |
| 自定义 | `"server"` | 用户定义的服务 |

### `createNitroEnvironment()`
- 消费者：`"server"`
- 使用打包器配置（Rollup/Rolldown）
- 开发：创建带热重载功能的 `FetchableDevEnvironment`
- 生产：标准环境，支持压缩、sourcemap、CommonJS 选项
- 解析：`noExternal` 在开发与生产中不同
- 特殊条件：`"workerd"` 用于 miniflare，排除 `"node"`

### `initEnvRunner()` / `getEnvRunner()`
- 使用 `env-runner` 包管理 worker
- 支持 Node Worker 或 Miniflare 运行时
- 失败自动重启（最多 3 次重试）
- 为 workerd 提供自定义求值器（不支持 `AsyncFunction`）
- 通过 Vite 的转换管道路由模块导入

### `reloadEnvRunner()`
- 触发 env-runner worker 的完全重载

## 开发服务器（`dev.ts`）

### `FetchableDevEnvironment`（继承自 `DevEnvironment`）
- 重写 `fetchModule()` 用于 CJS/ESM 解析
- 对 workerd：防止外部化裸露导入
- `dispatchFetch()` — 将请求路由到开发服务器 worker
- 初始化时发送包含环境信息的自定义消息

### `configureViteDevServer()`
- 监听 Nitro 配置文件变化（触发完整重启）
- WebSocket 升级处理
- 监听路由 / API / 中间件目录的文件变化（防抖重载）
- RPC 用于 `transformHTML` 消息

### 开发中间件（`nitroDevMiddleware`）
两阶段请求路由：

1. **预处理器** — 判断请求是否应由 Nitro 处理：
   - 跳过 Vite 内部请求（`/@`、`/__`）
   - 跳过有文件扩展名的请求（`.js`、`.css` 等）
   - 通过 `sec-fetch-dest` 头部检测浏览器
   - 优先路由到 `NitroDevApp`（静态、代理、开发处理器）
2. **主处理器** — 其他请求回退到 env-runner worker 处理服务端路由

### 请求流程（开发）
```
浏览器 → Vite 开发服务器
  → nitroDevMiddleware（预处理器）
    → NitroDevApp（静态资源、开发代理、/_vfs）
    → env-runner worker（主服务器逻辑）
  → Vite 静态资源 / HMR（若未处理）
```

## 生产构建（`prod.ts`）

### `buildEnvironments()` — 5 个阶段

**阶段 1：构建非 Nitro 环境**
- 客户端环境（浏览器包）
- 服务环境（SSR、API、自定义）
- 每个环境详细日志

**阶段 2：渲染器模板处理**
- 若客户端输入为渲染器模板，替换 SSR 出口
- 内联 `globalThis.__nitro_vite_envs__?.["ssr"]?.fetch($REQUEST)`
- 将处理后的模板移动到构建目录

**阶段 3：资源管理**
- 调用 `builder.writeAssetsManifest?.()`
- 用 `max-age=31536000, immutable` 注册资源目录

**阶段 4：构建 Nitro 环境**
- 执行 `prepare()` → 清理输出
- 构建主服务器包
- 关闭 Nitro 实例
- 触发 `compiled` 钩子
- 写入构建信息

**阶段 5：预览**
- 启动预览服务器，记录成功日志

### `prodSetup()` 虚拟模块
生成 `#nitro-vite-setup` 内容：
```js
// 对每个服务环境
globalThis.__nitro_vite_envs__ = {
  "ssr": { fetch: (...args) => import("entry").then(m => m.default.fetch(...args)) }
}
```

## 打包器配置（`bundler.ts`）

`getBundlerConfig()` 返回：
```ts
{
  base: BaseBuildConfig,
  rollupConfig?: RollupConfig,   // 使用 Rollup 时
  rolldownConfig?: RolldownConfig // 使用 Rolldown 时
}
```

通用配置：ESM 输出、树摇、代码拆分、sourcemap。

**Rolldown 特定**：转码注入、库拆分、支持 `inlineDynamicImports` 和 `iife`。

**Rollup 特定**：`@rollup/plugin-inject`，`@rollup/plugin-alias`，手动命名代码块。

## HMR（仅开发）

**仅服务器模块重载**：
1. `hotUpdate` 钩子检测文件变化
2. 判断模块是仅服务器还是共享
3. 服务器专用 → 向 nitro 环境发送 `full-reload`
4. 共享模块 → 返回，进行普通 Vite 客户端 HMR
5. 可选浏览器重载（`experimental.vite.serverReload`）

**目录监听**（防抖）：
- 路由、API、中间件、插件、模块目录
- 文件新增/删除 → 完整路由重建 + 重载

## 运行时集成

### Worker 入口（`src/runtime/internal/vite/`）

| 文件 | 作用 |
|------|---------|
| `dev-entry.mjs` | 开发入口：polyfills，WebSocket 适配器，调度器 |
| `dev-worker.mjs` | worker 进程：`ViteEnvRunner` 类，RPC 层，环境管理 |
| `ssr-renderer.mjs` | SSR 服务：调用 `fetchViteEnv("ssr", req)` |

### `ViteEnvRunner`（在 `dev-worker.mjs`）
- 管理每个环境的 Vite `ModuleRunner`
- 通过 `runner.import()` 加载环境入口
- 路由 fetch 请求到已加载条目
- 暴露 `__VITE_ENVIRONMENT_RUNNER_IMPORT__` 支持 RSC

### 运行时 API（`src/runtime/vite.ts`）
- `fetchViteEnv(name, input, init)` — 路由 fetch 到指定 Vite 环境
- 访问 `globalThis.__nitro_vite_envs__` 注册表

## 开发与生产对比

| 方面 | 开发 | 生产 |
|--------|-----|-----------|
| 运行器 | env-runner（node-worker / miniflare） | 打包的 ESM |
| HMR | 文件变化时完全重载 | 无 |
| 错误 | 交互式错误页（Youch） | JSON 或简化 HTML |
| 服务 | 通过 env-runner 懒加载 | 通过 `prodSetup()` 预打包 |
| 模板 | 动态（vite-env 路由） | 静态（内联 SSR 出口） |
| Sourcemaps | 启用 | 可选 |

## 实验性功能

`experimental.vite` 选项：
- `assetsImport`（默认值：true）— 使用 `@hiogawa/vite-plugin-fullstack` 的 `?assets` 导入
- `serverReload`（默认值：true）— 服务器模块变更时重载
- `services` — 注册自定义服务环境

## 关键关联

- `src/vite.ts` — 公共导出（`nitro` 插件）
- `src/build/build.ts` — 调度调用 `viteBuild()`
- `src/build/config.ts` — 基础构建配置
- `src/build/plugins.ts` — 基础构建插件（虚拟模块、自动导入等）
- `src/build/virtual/` — 14 个虚拟模块模板
- `src/dev/app.ts` — 专用于开发的 `NitroDevApp` 处理器
- `src/dev/server.ts` — 带 `RunnerManager` 的 `NitroDevServer`
- `src/runtime/internal/vite/` — 运行时 worker 和入口点
