# dsh-web-search-tavily

Tavily 搜索 provider，接入 DeepSeek Harness 的 web 能力缝（`ctx.web`），取代官方 `@deepseek-ai/dsh-web-search-deepseek`（不需要 DeepSeek 官方 key，用 Tavily key）。

**bundle 形态插件**：自带 `cordis.patch.yml`，`dsh plugin add` 后 reconcile 自动挂载激活（自动覆盖 `web.searchProvider: tavily`、禁用 deepseek），无需手动写 patch。设置页「插件」tab 提供 Tavily 卡片（官方 PluginCard 形态：标题/描述/展开/保存放弃 + API Key 气泡徽标）。**密钥可选**：未配置时自动发送官方 `X-Tavily-Access-Mode: keyless` 头（免费模式）；配置了 key 则走 Bearer。

## 快速开始

```bash
# 容器内（不动共享镜像；profile 在工作区卷，容器重建不丢）
dsh plugin --profile web add @myflv/dsh-web-search-tavily

# 或 GitHub release tarball（无 npm 账号时）
# curl -sL -o /tmp/dsh-web-search-tavily.tgz https://github.com/myflv/dsh-web-search-tavily/releases/latest/download/dsh-web-search-tavily.tgz
# dsh plugin --profile web add /tmp/dsh-web-search-tavily.tgz
```

或一键脚本（含 pnpm 前置检查，幂等）：

```bash
bash <(curl -sL https://raw.githubusercontent.com/myflv/dsh-web-search-tavily/main/install.sh)
```

然后 docker-compose 的 environment 加 `TAVILY_API_KEY=你的key`，`docker compose up -d` 重启即可。

> pnpm 前置：`dsh plugin` 是 pnpm 转发器，容器里没有 pnpm 时先 `npm i -g pnpm`（新镜像已内置 `/opt/node/bin/pnpm`）。

## 验证

- `dsh --dump-config --profile web | grep -A4 tavily` —— 应看到 `web.searchProvider: tavily` 和 web-search-tavily 条目
- 登录后新会话"搜索一下 xxx"——web_search 工具走 Tavily，结果带 web_card

## 构建与发版

**手动发版**（节奏可控）：GitHub Actions → Run workflow → 输入版本号（须与 package.json version 一致）。CI 校验版本 + 打 tag + 重建 release + npm publish（Trusted Publishing OIDC，需先在 npm 包页面配置 GitHub 授权，无长期凭证）。

```bash
# 本机只推送代码；发版在 Actions 页手动触发
git push origin main
```

升级：容器里 `dsh plugin --profile web remove @myflv/dsh-web-search-tavily && dsh plugin --profile web add @myflv/dsh-web-search-tavily`。

## 配置项

| 项 | 默认 | 说明 |
|---|---|---|
| `apiKey` | `$TAVILY_API_KEY` | Tavily key（tavily.com 注册；MCP 端点的 `tvly-dev-` key 对 REST API 同样有效）。组合 config 或设置 UI 直接写明文；空 → 自动走官方 keyless 免费模式 |
| `baseURL` | `https://api.tavily.com` | API 根，自动拼 `/search` |
| `maxResults` | 不设 | 默认结果数（请求级 `maxResults` 优先） |

设置 UI（插件配置页 → 网页搜索卡片）读写与 provider 同一配置域：三个字段均明文可编辑，清空保存即恢复默认/未配置。

组合 config 覆盖示例（profile 的 `cordis.patch.yml`，与 bundle 自带条目同 id）：

```yaml
- id: web-search-tavily
  config:
    maxResults: 5
```

provider id：`tavily`（`TAVILY_PROVIDER_ID`）——bundle 已自动把 `web.searchProvider` 覆盖为它。


## Vendor 说明

`src/vendor/plugin-card/` 与 `src/client/fields.module.css` 从官方 [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)（MIT）`packages/client/ui-settings-plugins` 复制（PluginCard、SecretField 及样式），构建时经 esbuild css-modules 插件内联。同步官方升级时重拷对应文件并核对 import 适配（类型来自 `@deepseek-ai/dsh-client-ui-settings-plugins/client`）。
