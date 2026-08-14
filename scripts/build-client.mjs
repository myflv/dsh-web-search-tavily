/**
 * Build the browser half into a single self-registering classic script.
 *
 * client-modules loads bundles via a classic <script> tag and injects one
 * `require` (the loader's module table). The artifact mirrors the official
 * tsdown closure-factory form: cjs format (no import statements; externals
 * become require() calls), banner opens `__ModuleLoader__.load({id,
 * factory: (require) => {` with a CJS module/exports skeleton, footer closes
 * the factory returning module.exports.
 */
import { build } from 'esbuild'

await build({
  entryPoints: ['src/client/client.ts'],
  bundle: true,
  format: 'cjs',
  outfile: 'lib/client.js',
  packages: 'external', // react / @deepseek-ai/* resolve via the injected require
  platform: 'browser',
  target: 'es2022',
  banner: {
    js: `window.__ModuleLoader__.load({ id: 'web-search-tavily', factory: (require) => { var module = { exports: {} }; var exports = module.exports;`,
  },
  footer: {
    js: 'return module.exports; } });',
  },
  logLevel: 'info',
})
