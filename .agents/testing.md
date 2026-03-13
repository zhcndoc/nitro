# Nitro 测试指南

## 测试结构

```
test/
├── tests.ts            # 主测试定义（各预设共享）
├── fixture/            # 测试夹具 Nitro 应用
│   ├── nitro.config.ts
│   ├── routes/         # 测试路由处理器
│   ├── api/            # 测试 API 处理器
│   ├── middleware/      # 测试中间件
│   ├── plugins/        # 测试插件
│   └── public/         # 测试静态资源
├── presets/            # 每个预设的测试配置
│   ├── node.test.ts
│   ├── cloudflare.test.ts
│   ├── vercel.test.ts
│   └── ...
├── unit/               # 独立单元测试
└── minimal/            # 最小包输出测试
```

## 测试原理

1. `test/tests.ts` 使用 vitest 定义共享测试用例  
2. 每个 `test/presets/<name>.test.ts` 引入共享测试并对特定预设执行  
3. `test/fixture/` 中的测试夹具是完整的 Nitro 应用，用作测试目标  
4. 预设测试将使用该预设构建夹具，然后运行 HTTP 断言

## 添加回归测试

1. 在 `test/fixture/` 添加测试路由/处理器（例如 `test/fixture/routes/new-feature.ts`）  
2. 在 `test/tests.ts` 添加测试用例  
3. 运行 `pnpm vitest run test/presets/node.test.ts` 进行验证

## 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定预设测试
pnpm vitest run test/presets/node.test.ts

# 运行单元测试
pnpm vitest run test/unit/

# 运行最小包测试
pnpm vitest run test/minimal/
```

## Bug 修复流程

1. 在 `test/fixture/` 和 `test/tests.ts` 编写回归测试  
2. 确认测试**失败**（`pnpm vitest run test/presets/node.test.ts`）  
3. 修复实现  
4. 确认测试**通过**  
5. 运行全部测试套件（`pnpm test`）
