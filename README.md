# dsh-web-search-tavily

Tavily 搜索 provider，接入 DeepSeek Harness 的 web 能力缝（`ctx.web`），取代官方 `@deepseek-ai/dsh-web-search-deepseek`（不需要 DeepSeek 官方 key，用 Tavily key）。

结构照官方 `web-search-exa`：注册 `WebSearchProvider` 进 `ctx.web`，模型侧搜索行为不变（同一个 web 工具、web_card 呈现），只是底层换 Tavily。

## 构建

```bash
npm install
npm run build    # tsc → lib/（ESM + 类型声明）
npm pack         # 或直接打包，得到 dsh-web-search-tavily-0.1.0.tgz
```

## 构建与发版

CI（`.github/workflows/release.yml`）负责构建：打 tag 即出 GitHub Release（tarball 自动构建，asset 名固定为 `dsh-web-search-tavily.tgz`）：

```bash
# 本机只做两件事：改版本号 + 打 tag
git tag v0.1.0 && git push origin v0.1.0
```

（不想走 CI 时本机构建：`npm install && npm pack`）

## 安装

### 用户侧（推荐，不动共享镜像）

插件是个人私货、镜像由团队共享时用这条。dsh 原生支持 profile 插件管理（`dsh plugin` 转发 pnpm 在 profile 目录执行，`autoInstallPeers: false` 保证 peer 走安装树单实例），tarball 直接拉 GitHub Release：

```bash
# 容器内一次（工作区卷持久，容器重建后重跑 pnpm 安装行即可）
npm i -g pnpm

# 安装：下载 Release tarball + 官方命令 add（profile 目录名用 ls 确认）
PROFILE=$(ls /root/profiles | head -1)
curl -sL -o /tmp/dsh-web-search-tavily.tgz \
    https://github.com/myflv/dsh-web-search-tavily/releases/latest/download/dsh-web-search-tavily.tgz
dsh plugin --profile "$PROFILE" add /tmp/dsh-web-search-tavily.tgz
```

> 别用 `npm install --prefix ...` 装——npm 11 的 `auto-install-peers` 已失效，会把 cordis 等 peer 重复装进 profile，双实例风险。

### 镜像级（可选，你能改 Dockerfile 时）

```bash
npm install -g --prefix /usr/local /path/to/dsh-web-search-tavily-0.1.0.tgz
```

## 启用（profile patch）

在 profile 补丁层 `~/profiles/<profile名>/cordis.patch.yml` 末尾追加：

```yaml
- insert:
    - id: web-search-tavily
      name: dsh-web-search-tavily
      config:
        apiKey: !!js process.env.TAVILY_API_KEY
- id: web-search-deepseek
  config:
    apiKey: ''   # 留空让官方 provider 不可用
```

然后把 `TAVILY_API_KEY` 加进 docker-compose 的 environment，重启 dsh web。

> 多个 provider 并存时，`ctx.web` 按 `searchProviderId` 配置选 provider；不配则取第一个可用的（`available()`）。上面把 deepseek 的 apiKey 置空即等价于只留 Tavily。

## 验证

登录后新会话让模型"搜索一下 xxx"——工具应走 `web_search`（原 seam），结果卡片带 Tavily 来源；dsh 日志无 deepseek API 报错。

## 配置项

| 项 | 默认 | 说明 |
|---|---|---|
| `apiKey` | `$TAVILY_API_KEY` | Tavily key（tavily.com 注册，免费额度） |
| `baseURL` | `https://api.tavily.com` | API 根，自动拼 `/search` |
| `maxResults` | 不设 | 默认结果数（请求级 `maxResults` 优先） |

provider id：`tavily`（`TAVILY_PROVIDER_ID`）——若要显式指定 `searchProviderId` 用这个值。
