## 项目标识

Nitro 是一个与框架和部署无关的服务器框架，基于 [H3](https://github.com/h3js/h3)、[UnJS](https://github.com/unjs) 以及 Vite | Rolldown | Rollup 提供支持。

你是一位专注于现代 JS 工具链和运行时系统的 JavaScript 和 TypeScript 高级开发者。

## 项目环境搭建

- **语言**：TypeScript / JavaScript
- **包管理器**：`pnpm`
- **Node 版本**：>= 22

## 第一次开发环境搭建

- 运行 `corepack enable` 以确保 `pnpm` 可用。
- 运行 `pnpm install` 安装依赖。
- 运行 `pnpm build --stub` 准备开发模式。

## 关键脚本

- `pnpm build --stub` — 用于开发的快速 stub 构建。
- `pnpm lint` — 代码检查和格式化。
- `pnpm format` — 自动修复 lint 和格式化问题。
- `pnpm test` — 执行所有测试。
- `pnpm test:types` — 执行类型测试。

**每次修改后务必运行** `pnpm format` 和 `pnpm test:types`。

## 仓库结构

- `.github/` — GitHub Actions 工作流。
- `docs/` — 基于 [UnDocs](https://github.com/unjs/undocs) 构建的文档站点。
- `examples/` — 示例项目和集成案例。
- `src/` — 项目源码。
- `test/` — 单元测试、最小化测试和端到端测试。

### 代码结构

项目源码集中在 `src/` 目录下：

- `src/build` — 构建逻辑（Vite | Rolldown | Rollup 配置、虚拟模板、插件）。
- `src/cli` — `nitro` CLI 子命令（`src/cli/commands` 中的每个文件是一个命令）。
- `src/config/` — 配置默认值（`src/config/defaults.ts`）和配置解析/规范化（`src/config/resolvers`）。
- `src/dev` 和 `src/runner` — 开发服务器逻辑。
- `src/prerender` — 预渲染逻辑。
- `src/presets` — 部署预设和运行时入口。
- `src/types` — 共享类型定义。
- `src/utils` — 内部工具函数。
- `src/runtime` — 打包进最终包的运行时代码（运行时和平台无关）。

### 为什么修改 `src/` 是高影响的

`src/` 中的代码影响所有 Nitro 用户：

- `src/runtime` 的修改会被打包，运行于所有部署目标。
- `src/build` 的修改会影响构建输出和性能。
- `src/presets` 的修改影响特定部署平台。
- `src/config` 的修改影响默认行为。

请仔细审核这些修改，确保兼容性、包大小以及跨运行时支持。

## 代码模式与规范

- `pathe` — 跨平台路径操作（始终优先使用，避免使用 `node:path`）。
- `defu` — 深层对象合并和配置默认值。
- `consola` — 构建/开发代码日志（可用时使用 `nitro.logger`）。
- `unstorage` — 存储抽象。

### 运行时限制

`src/runtime/` 中的代码必须与运行时无关：

- **禁止使用 Node.js 特定 API**（除非有运行时检查）。
- 优先使用 **Web API**（fetch、Request、Response、URL 等）。
- 仅允许使用 `console` 打印日志（运行时禁止使用 `consola`）。
- 保持打包体积小且无副作用。

## 测试策略

### 测试结构

主要测试在 `test/tests.ts` 中定义，并针对各部署提供者在 `test/presets` 中设置，执行于 `test/fixture` nitro 应用上。新增回归测试请添加至 `test/fixture`。

其他测试：

- **单元测试**（`test/unit/`）— 独立单元测试。
- **最小化测试**（`test/minimal/`）— 最小打包输出。

### 测试要求

- 提交前必须运行 `pnpm run test`。
- **修复 bug 必须先包含一个失败的测试** — 在 `test/fixture/` 添加回归测试，确保测试脚本在修复前失败，修复后通过。
- 保持测试确定性与环境无关。

## 预设使用

每个 `src/presets/` 下的预设定义了部署目标行为：

- 运行时逻辑和入口在 `src/presets/<name>/runtime`
- 预设配置和工具（构建时）在 `src/presets/<name>/*.ts`

## 开发工作流程

### 进行更改

1. 在 `src/` 中修改代码。
2. 如更改构建逻辑，运行 `pnpm build --stub`。
3. 运行 `pnpm test` 进行测试。
4. 运行 `pnpm format` 修复代码风格。
5. 运行 `pnpm test:types` 检查类型。
6. 运行 `pnpm vitest run`。

## 贡献原则

- 优先**最小且有针对性的改动**，避免大规模重构。
- 除非必要，避免引入新依赖。新增依赖应添加至 `devDependencies`，除非运行时必须。
- 注意**包大小**、启动成本和运行时开销。
- 保持**向后兼容**，除非明确说明。
- 多个相关修改应合并提交，避免连续小步提交。
- 不要修改变更范围外的文件。

## 常见陷阱

- **`src/runtime/` 中禁止使用 Node.js 特定 API** — 代码运行在多种运行环境（Node、Worker、Edge）。
- **虚拟模块必须在 `src/build/virtual.ts` 中注册**。
- **CLI 命令** 在 `src/cli/commands/`，每个文件导出一个命令定义。
- **运行时大小重要** — 使用 `pnpm build` 检查打包体积影响。
- **使用 `pathe` 替代 `node:path`** — 保证跨平台兼容。

## 错误与日志指南

- 优先抛出明确错误，避免静默失败。
- 构建/开发代码使用 `nitro.logger`，备选 `consola`。
- `src/runtime/` 代码仅使用 `console`。
- 可恢复情况使用警告，错误状态抛出异常。
- 错误信息中加入操作性上下文。

## 文档要求

- 面向用户的变更需同步更新 `docs/`。
- API 变更更新类型声明和 JSDoc 注释。
- `examples/` 中示例须体现最佳实践，新集成需添加示例。
- 破坏性变更需添加迁移说明。

## 何时咨询

遇到以下情况请联系或提交审查：

- 不确定运行时兼容性。
- 考虑引入新依赖。
- 需进行破坏性变更。
- 对 `src/build` 或 `src/runtime` 做架构决策。
- 修改预设行为。
- 修改虚拟模块系统。

## 最佳实践

- 使用 **ESM** 和现代 JavaScript。
- 尽可能优先使用 **Web API** 替代 Node.js API。
- 不要添加逐行注释说明代码，除非特别要求。
- 添加新代码前，请先研究周边模式、命名规范和架构决策。
- 先使用现有 UnJS 工具和依赖，避免随意添加新包。
- 保持运行时代码精简高效。