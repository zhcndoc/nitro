# Koyeb

> 将 Nitro 应用部署到 Koyeb。

**预设：** `koyeb`

:read-more{to="https://www.koyeb.com"}

## 使用控制面板

1. 在 [Koyeb 控制面板](https://app.koyeb.com/)中，点击 **Create App**。
2. 选择 **GitHub** 作为部署方式。
3. 选择包含应用代码的 GitHub **repository** 和 **branch**。
4. 为服务命名。
5. 如果你没有在 `package.json` 文件中添加 `start` 命令，请在 **Build and deployment settings** 下，切换运行命令字段对应的覆盖开关。在 **Run command** 字段中输入：

   ```bash
   node .output/server/index.mjs
   ```

6. 在 **Advanced**（高级）部分，点击 **Add Variable**（添加变量）并添加一个 `NITRO_PRESET` 变量，设置为 `koyeb`。
7. 命名 App（应用）。
8. 点击 **Deploy**（部署）按钮。

## 使用 Koyeb CLI

1. 根据你的操作系统，按照说明[安装 Koyeb CLI 客户端](https://www.koyeb.com/docs/cli/installation)，或直接从 [GitHub 上的发布页面](https://github.com/koyeb/koyeb-cli/releases)下载。
2. 在 Koyeb 控制面板中访问你所在组织的 [API 设置](https://app.koyeb.com/settings/api)，创建 Koyeb API 访问令牌。
3. 输入以下命令，使用 Koyeb CLI 登录你的账户：

   ```bash
   koyeb login
   ```

   在提示时粘贴你的 API 凭据。
4. 使用以下命令从 GitHub 仓库部署 Nitro 应用。请务必将 `<APPLICATION_NAME>`、`<YOUR_GITHUB_USERNAME>` 和 `<YOUR_REPOSITORY_NAME>` 替换为你自己的值：

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

1. 在项目的根目录创建一个 `.dockerignore` 文件，并添加以下行：

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

2. 在项目的根目录添加一个 `Dockerfile`：

   ```
   FROM node:20-alpine AS base

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

上述 Dockerfile 提供了运行 Nitro 应用所需的最低要求。你可以根据需求轻松扩展它。

接下来，将 Docker 镜像推送到注册表，例如 [Docker Hub](https://hub.docker.com/) 或 [GitHub Container Registry](https://docs.github.com/en/packages/guides/about-github-container-registry)。

在 Koyeb 控制面板中，使用镜像和标签字段指定要部署的镜像。你也可以使用 [Koyeb CLI](https://www.koyeb.com/docs/build-and-deploy/cli/installation)。有关更多信息，请参阅 Koyeb 的 [Docker 文档](https://www.koyeb.com/docs/build-and-deploy/prebuilt-docker-images)。
