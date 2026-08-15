/**
 * Build the browser half into a single self-registering classic script.
 *
 * client-modules loads bundles via a classic <script> tag and injects one
 * `require` (the loader's module table). The artifact mirrors the official
 * tsdown closure-factory form: cjs format, banner opens
 * `__ModuleLoader__.load({id, factory})`, footer closes it.
 *
 * Official UI components (`@deepseek-ai/dsh-client-ui-settings-plugins`
 * PluginCard + its module CSS) are inlined via noExternal; the css-modules
 * plugin compiles .module.css to a class map + injected <style>. React and
 * the platform-seed client packages stay external (module table).
 */
import { readFile } from 'node:fs/promises'
import { build } from 'esbuild'

// CSS Modules：类名 → 确定性短哈希，css 文本替换类名并注入 <style>
const cssModulesPlugin = {
  name: 'dsh-css-modules',
  setup(build) {
    build.onLoad({ filter: /\.module\.css$/ }, async (args) => {
      const source = await readFile(args.path, 'utf8')
      const classes = [...source.matchAll(/\.([A-Za-z0-9_-]+)\s*\{/g)].map(m => m[1])
      const map = {}
      let css = source
      for (const cls of classes) {
        const hash = [...cls].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0).toString(36).slice(0, 6)
        const scoped = `tvly-${hash}`
        map[cls] = scoped
        css = css.replace(new RegExp(`\\.${cls}(?=[\\s,{])`, 'g'), `.${scoped}`)
      }
      return {
        contents: `const __css = ${JSON.stringify(css)};
if (typeof document !== 'undefined' && !document.querySelector('style[data-plugin="tavily-css"]')) {
  const el = document.createElement('style');
  el.setAttribute('data-plugin', 'tavily-css');
  el.textContent = __css;
  document.head.append(el);
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
    js: `window.__ModuleLoader__.load({ id: '@myflv/dsh-web-search-tavily', factory: (require) => { var module = { exports: {} }; var exports = module.exports;`,
  },
  footer: {
    js: 'return module.exports; } });',
  },
  plugins: [cssModulesPlugin],
  logLevel: 'info',
})
