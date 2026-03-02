# Alwaysdata

> 将 Nitro 应用部署到 alwaysdata。

**预设:** `alwaysdata`

<read-more to="https://alwaysdata.com">



</read-more>

## 设置应用程序

### 前提条件

<steps level="4">

#### 如果您还没有， [在 alwaysdata 平台上注册一个新账户](https://www.alwaysdata.com/en/register/)。

#### 获取一个免费的 100Mb 计划来托管您的应用。

</steps>

<note>

请记住，您的 *账户名* 将用于为您提供一个默认 URL，其形式为 `account_name.alwaysdata.net`，因此请明智地选择。您也可以稍后将您现有的域名与您的账户链接，或者根据需要在您的个人资料下注册多个账户。

</note>

### 本地部署

<steps level="4">

#### 使用 `npm run build -- preset alwaysdata` 在本地构建您的项目。

#### [将您的应用上传](https://help.alwaysdata.com/en/remote-access/)到您的账户的独立目录中（例如 `$HOME/www/my-app`）。您可以使用任何您偏好的协议（SSH/FTP/WebDAV 等）来做到这一点。

#### 在您的管理面板上，为您的应用 [创建一个新站点](https://admin.alwaysdata.com/site/add/) ，并设置以下特性:- *地址*: `[account_name].alwaysdata.net`
- *类型*: Node.js
- *命令*: `node ./output/server/index.mjs`
- *工作目录*: `www/my-app` （请根据您的部署路径进行调整）
- *环境*:```ini
NITRO_PRESET=alwaysdata
```
- *Node.js 版本*: `默认版本` 即可；选择不低于 `20.0.0`（您也可以[全局设置您的 Node.js 版本](https://help.alwaysdata.com/en/languages/nodejs/configuration/#supported-versions)）
- *热重启*: `SIGHUP`

<read-more to="https://help.alwaysdata.com/en/languages/nodejs" title="获取有关 alwaysdata Node.js 站点类型的更多信息"></read-more>

#### 您的应用现在已上线，地址为 `http(s)://[account_name].alwaysdata.net`。

</steps>
