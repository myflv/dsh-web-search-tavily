#!/usr/bin/env bash
# dsh-web-search-tavily 一键安装（容器内运行，幂等可重复执行）
# 用法: ./install.sh [profile名]   （默认 web）
# bundle 形态：dsh plugin add 后 reconcile 自动挂载激活，无需手动写 patch
set -euo pipefail

PROFILE="${1:-web}"
REPO="myflv/dsh-web-search-tavily"
TGZ="/tmp/dsh-web-search-tavily.tgz"   # 固定路径：pnpm 锁文件记录 tarball 绝对路径，换路径会 ENOENT

# ── 1. pnpm（dsh plugin 转发器的前置）─────────────────────────────
if command -v pnpm >/dev/null 2>&1; then
  echo "[1/3] pnpm 已存在 ($(pnpm --version))"
else
  echo "[1/3] 安装 pnpm..."
  npm install -g --no-audit --no-fund pnpm
fi

# ── 2. dsh 命令（旧镜像缺 bin 时会缺失，升级镜像后自动修复）─────────
if ! command -v dsh >/dev/null 2>&1; then
  echo "[错误] dsh 不在 PATH —— 升级到修复 bin 漏拷的镜像（/opt/node/bin），或临时:"
  echo "       ln -s /usr/local/lib/node_modules/@deepseek-ai/dsh/lib/bin.js /usr/local/bin/dsh"
  exit 1
fi

# ── 3. 下载 + dsh plugin add（reconcile 自动加进 profile bundles 并激活）──
echo "[2/3] 下载插件 tarball..."
curl -fsSL -o "$TGZ" "https://github.com/${REPO}/releases/latest/download/dsh-web-search-tavily.tgz"

echo "[3/3] 安装插件到 profile '${PROFILE}'（已装则幂等跳过）..."
if ! dsh plugin --profile "$PROFILE" add "$TGZ" 2>&1; then
  echo "[错误] pnpm add 失败。若报 ENOENT 读旧 tarball 路径（锁文件残留），执行:"
  echo "       dsh plugin --profile ${PROFILE} remove dsh-web-search-tavily && $0 ${PROFILE}"
  exit 1
fi

# ── 4. 校验 reconcile 挂载 ───────────────────────────────────────
if ! grep -q "dsh-web-search-tavily" "${HOME}/.dsh/profiles/${PROFILE}/package.json"; then
  echo "[警告] 插件未出现在 profile bundles 列表——检查上方输出，或手动执行:"
  echo "       dsh plugin --profile ${PROFILE} remove dsh-web-search-tavily && $0 ${PROFILE}"
fi

echo ""
echo "安装完成。还需两步："
echo "  1. docker-compose.yml 的 environment 加: TAVILY_API_KEY=你的key"
echo "  2. docker compose up -d 重启（bundle 自动激活，无需手动 patch）"
echo "  验证: dsh --dump-config --profile ${PROFILE} | grep -A4 tavily"
