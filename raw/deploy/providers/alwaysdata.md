# Alwaysdata

> 将 Nitro 应用部署到 alwaysdata。

**预设：** `alwaysdata`

<read-more to="https://alwaysdata.com">



</read-more>

## 设置应用

### 前置条件

<steps level="4">

#### 如果你还没有账号，请在 alwaysdata 平台上[注册一个新账户](https://www.alwaysdata.com/en/register/)。

#### 获取免费的 100MB 套餐来托管你的应用。

</steps>

<note>

请记住，你的*账户名称*将被用于提供默认 URL，格式为 `account_name.alwaysdata.net`，因此请明智选择。你也可以稍后将现有域名链接到你的账户，或根据需要在你的资料下注册任意数量的账户。

</note>

### 本地部署

<steps level="4">

#### 使用 `npm run build -- preset alwaysdata` 在本地构建你的项目

#### 将[你的应用上传](https://help.alwaysdata.com/en/remote-access/)到你账户中的独立目录（例如 `$HOME/www/my-app`）。你可以使用任何你喜欢的协议（SSH/FTP/WebDAV…）来完成此操作。

#### 在管理面板中，为你的应用[创建一个新站点](https://admin.alwaysdata.com/site/add/)，并配置以下参数：- *地址*：`[account_name].alwaysdata.net`
- *类型*：Node.js
- *命令*：`node .output/server/index.mjs`
- *工作目录*：`www/my-app`（根据你的部署路径进行调整）
- *环境*：```ini
NITRO_PRESET=alwaysdata
```
- *Node.js 版本*：`默认版本`即可；建议选择不低于 `20.0.0` 的版本（你也可以[全局设置你的 Node.js 版本](https://help.alwaysdata.com/en/languages/nodejs/configuration/#supported-versions)）
- *热重启*：`SIGHUP`

<read-more to="https://help.alwaysdata.com/en/languages/nodejs" title="获取有关 alwaysdata Node.js 站点类型的更多信息"></read-more>

#### 你的应用现在已在 `http(s)://[account_name].alwaysdata.net` 上线。

</steps>
