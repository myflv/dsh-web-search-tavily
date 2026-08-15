# dsh-web-search-tavily

Tavily 搜索 provider，接入 DeepSeek Harness 的 web 搜索缝，取代官方 `@deepseek-ai/dsh-web-search-deepseek`（无需 DeepSeek key）。

## 安装

```bash
# 容器内
dsh plugin --profile web add @myflv/dsh-web-search-tavily

# 或一键脚本（含 pnpm 前置检查，幂等）
bash <(curl -sL https://raw.githubusercontent.com/myflv/dsh-web-search-tavily/main/install.sh)
```

> pnpm 前置：`dsh plugin` 是 pnpm 转发器，容器里没有 pnpm 时先 `npm i -g pnpm`。

装完重启（`docker compose up -d`），设置页「插件」tab 出现「网页搜索」卡片，自动接管 web 搜索。

## 配置

| 项 | 默认 | 说明 |
|---|---|---|
| `apiKey` | `$TAVILY_API_KEY` | Tavily key（tavily.com 注册；MCP 的 `tvly-dev-` key 同样有效）。设置 UI 直接填；空 → 自动走官方 keyless 免费模式 |
| `baseURL` |  `https://api.tavily.com/search` | 完整端点地址（含 /search）；自定义反代填自己的地址 |
| `maxResults` | 不设 | 默认结果数 |

三字段均可在设置页 UI 明文编辑，清空保存即恢复默认。环境变量方式：compose 的 environment 加 `TAVILY_API_KEY=你的key`。

## 验证

- `dsh --dump-config --profile web | grep -A4 tavily` —— 应看到 `web.searchProvider: tavily`
- 新会话"搜索一下 xxx"——web_search 走 Tavily，结果带 web_card
