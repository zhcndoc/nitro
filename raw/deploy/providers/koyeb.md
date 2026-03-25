# Koyeb

> 将 Nitro 应用部署到 Koyeb。

**预设：** `koyeb`

<read-more to="https://www.koyeb.com">



</read-more>

## 使用控制面板

<steps level="4">

#### 在 [Koyeb 控制面板](https://app.koyeb.com/) 中，点击 **Create App**（创建应用）。

#### 选择 **GitHub** 作为部署方式。

#### 选择包含应用代码的 GitHub **仓库**和**分支**。

#### 命名您的 Service（服务）。

#### 如果您未在 `package.json` 文件中添加 `start` 命令，请在 **Build and deployment settings**（构建和部署设置）下，切换与 run command（运行命令）字段关联的覆盖开关。在 **Run command**（运行命令）字段中，输入：```bash
node .output/server/index.mjs`
```



#### 在 **Advanced**（高级）部分，点击 **Add Variable**（添加变量）并添加一个 `NITRO_PRESET` 变量，设置为 `koyeb`。

#### 命名 App（应用）。

#### 点击 **Deploy**（部署）按钮。

</steps>

## 使用 Koyeb CLI

<steps level="4">

#### 根据您操作系统的说明，使用安装程序[安装 Koyeb CLI 客户端](https://www.koyeb.com/docs/cli/installation)。或者，访问 GitHub 上的 [releases 页面](https://github.com/koyeb/koyeb-cli/releases)直接下载所需文件。

#### 通过在 Koyeb 控制面板中访问您组织的 [API 设置](https://app.koyeb.com/settings/api)来创建 Koyeb API 访问令牌。

#### 通过输入以下命令使用 Koyeb CLI 登录您的账户：```bash
koyeb login
```

<br />在提示时粘贴您的 API 凭据。

#### 使用以下命令从 GitHub 仓库部署您的 Nitro 应用。请务必为 `<APPLICATION_NAME>`、`<YOUR_GITHUB_USERNAME>` 和 `<YOUR_REPOSITORY_NAME>` 替换为您自己的值：```bash
koyeb app init <APPLICATION_NAME> \
   --git github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME> \
   --git-branch main \
   --git-run-command "node .output/server/index.mjs" \
   --ports 3000:http \
   --routes /:3000 \
   --env PORT=3000 \
   --env NITRO_PRESET=koyeb
```

</steps>

## 使用 Docker 容器

<steps level="4">

#### 在项目的根目录创建一个 `.dockerignore` 文件，并添加以下行：```text
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



#### 在项目的根目录添加一个 `Dockerfile`：```text
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

</steps>

上面的 Dockerfile 提供了运行 Nitro 应用的最低要求。您可以根据自己的需要轻松扩展它。
然后您需要将 Docker 镜像推送到镜像仓库。例如，您可以使用 [Docker Hub](https://hub.docker.com/) 或 [GitHub Container Registry](https://docs.github.com/en/packages/guides/about-github-container-registry)。
在 Koyeb 控制面板中，使用 image 和 tag 字段来指定要部署的镜像。
您也可以使用 [Koyeb CLI](https://www.koyeb.com/docs/build-and-deploy/cli/installation)
有关更多信息，请参阅 Koyeb 的 [Docker 文档](https://www.koyeb.com/docs/build-and-deploy/prebuilt-docker-images)。
