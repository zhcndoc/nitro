# Koyeb

> 将 Nitro 应用部署到 Koyeb。

**预设:** `koyeb`

:read-more{to="https://www.koyeb.com"}

## 使用控制面板

1. 在 [Koyeb 控制面板](https://app.koyeb.com/) 中，点击 **创建应用**。
2. 选择 **GitHub** 作为您的部署方法。
3. 选择包含应用程序代码的 GitHub **仓库** 和 **分支**。
4. 为您的服务命名。
5. 如果您没有在 `package.json` 文件中添加 `start` 命令，请在 **构建和部署设置** 下，切换与运行命令字段相关的覆盖开关。在 **运行命令** 字段中输入：

   ```bash
   node .output/server/index.mjs
   ```

6. 在 **高级** 部分，点击 **添加变量** 并添加一个 `NITRO_PRESET` 变量，值设置为 `koyeb`。
7. 命名应用。
8. 点击 **部署** 按钮。

## 使用 Koyeb CLI

1. 根据您的操作系统，遵循说明以 [安装 Koyeb CLI 客户端](https://www.koyeb.com/docs/cli/installation)，您可以使用安装程序。或者，访问 [GitHub 上的发布页面](https://github.com/koyeb/koyeb-cli/releases) 直接下载所需文件。
2. 通过访问 Koyeb 控制面板中的 [您组织的 API 设置](https://app.koyeb.com/settings/api) 创建一个 Koyeb API 访问令牌。
3. 使用 Koyeb CLI 登录到您的账户，输入：

   ```bash
   koyeb login
   ```

   当提示时粘贴您的 API 凭证。
4. 使用以下命令从 GitHub 仓库部署您的 Nitro 应用程序。务必将 `<APPLICATION_NAME>`、`<YOUR_GITHUB_USERNAME>` 和 `<YOUR_REPOSITORY_NAME>` 替换为您自己的值：

   ```bash
   koyeb app init <APPLICATION_NAME> \
      --git github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME> \
      --git-branch main \
      --git-run-command "node .output/server/index.mjs" \
      --ports 3000:http \
      --routes /:3000 \
      --env PORT=3000 \
      --env NITRO_PRESET=koyeb
   ```

## 使用 Docker 容器

1. 在项目的根目录中创建一个 `.dockerignore` 文件，并添加以下行：

   ```
   Dockerfile
   .dockerignore
   node_modules
   npm-debug.log
   .nitro
   .output
   .git
   dist
   README.md
   ```

2. 在项目的根目录中添加一个 `Dockerfile`：

   ```
   FROM node:18-alpine AS base

   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   COPY package.json package-lock.json ./
   RUN npm ci

   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npm run build && npm cache clean --force

   FROM base AS runner
   WORKDIR /app
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nitro
   COPY --from=builder /app .
   USER nitro
   EXPOSE 3000
   ENV PORT 3000
   CMD ["npm", "run", "start"]
   ```

上面的 Dockerfile 提供了运行 Nitro 应用程序的最低要求。您可以根据您的需求轻松扩展它。
然后，您需要将 Docker 镜像推送到一个注册表。您可以使用 [Docker Hub](https://hub.docker.com/) 或 [GitHub Container Registry](https://docs.github.com/en/packages/guides/about-github-container-registry) 等。
在 Koyeb 控制面板中，使用镜像和标签字段指定您要部署的镜像。
您还可以使用 [Koyeb CLI](https://www.koyeb.com/docs/build-and-deploy/cli/installation)。
有关更多信息，请参考 Koyeb [Docker 文档](https://www.koyeb.com/docs/build-and-deploy/prebuilt-docker-images)。