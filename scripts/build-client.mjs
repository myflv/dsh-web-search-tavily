// 浏览器半单文件自注册脚本：cjs + banner/footer 闭包工厂（__ModuleLoader__.load
// 契约）；vendor 官方组件与 css-modules 内联，react/platform-seed 走模块表。
import { readFile } from 'node:fs/promises'
import { build } from 'esbuild'
import pkg from '../package.json' with { type: 'json' }

// CSS Modules：类名 → 确定性短哈希，css 文本替换类名并注入 <style>
const cssModulesPlugin = {
  name: 'dsh-css-modules',
  setup(build) {
    build.onLoad({ filter: /\.module\.css$/ }, async (args) => {
      const source = await readFile(args.path, 'utf8')
      // 收集全部类名 token（含 .field + .field / .input:focus 等组合与伪类形态）
      // 选择器类名：标识符开头（非数字）——CSS 值里的 .16s 等数值 token 不误匹配
      const classes = [...new Set([...source.matchAll(/\.([A-Za-z_][A-Za-z0-9_-]*)(?=[\s,.:{])/g)].map(m => m[1]))]
      const map = {}
      let css = source
      for (const cls of classes) {
        const hash = [...cls].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0).toString(36).slice(0, 6)
        const scoped = `tvly-${hash}`
        map[cls] = scoped
        css = css.replace(new RegExp(`\\.${cls}(?=[\\s,.:{])`, 'g'), `.${scoped}`)
      }
      // 多个 module.css 追加进同一个 style（全串去重，幂等）
      return {
        contents: `const __css = ${JSON.stringify(css)};
// factory 执行环境不保证有 DOM（测试/非浏览器），style 注入仅在浏览器发生
if (typeof document !== 'undefined') {
  const el = document.querySelector('style[data-plugin="tavily-css"]') ?? (() => {
    const e = document.createElement('style');
    e.setAttribute('data-plugin', 'tavily-css');
    document.head.append(e);
    return e;
  })();
  if (!el.textContent.includes(__css)) el.textContent += __css;
}
module.exports = ${JSON.stringify(map)};`,
        loader: 'js',
      }
    })
  },
}

await build({
  entryPoints: ['src/client/client.ts'],
  bundle: true,
  format: 'cjs',
  outfile: 'lib/client.js',
  platform: 'browser',
  target: 'es2022',
  // react 与 platform-seed 客户端包走 loader 模块表；其余（vendor PluginCard、
  // clsx、官方 css）默认内联
  external: [
    'react',
    '@deepseek-ai/dsh-client-connection',
    '@deepseek-ai/dsh-client-locale',
    '@deepseek-ai/dsh-client-runtime',
    '@deepseek-ai/dsh-client-ui-settings',
    '@deepseek-ai/dsh-client-ui-slots',
    '@deepseek-ai/dsh-client-ui-primitives',
  ],
  banner: {
    js: `window.__ModuleLoader__.load({ id: ${JSON.stringify(pkg.name)}, factory: (require) => { var module = { exports: {} }; var exports = module.exports;`,
  },
  footer: {
    js: 'return module.exports; } });',
  },
  plugins: [cssModulesPlugin],
  logLevel: 'info',
})
