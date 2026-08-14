/**
 * Build the browser half into a single self-registering bundle.
 *
 * The client-modules loader requires one artifact per plugin: the bundle
 * executes `window.__ModuleLoader__.load({id, factory})` and resolves bare
 * imports through the injected require (the loader's module table). esbuild
 * externals every package import (react and the @deepseek-ai client packages
 * arrive through the module table, never bundled) and the footer performs the
 * registration with the bundle's own exports.
 */
import { build } from 'esbuild'

await build({
  entryPoints: ['src/client/client.ts'],
  bundle: true,
  format: 'esm',
  outfile: 'lib/client.js',
  packages: 'external', // react / @deepseek-ai/* resolve via the module table
  platform: 'browser',
  target: 'es2022',
  footer: {
    js: `window.__ModuleLoader__.load({ id: 'web-search-tavily', factory: (require) => ({ name, inject, apply }) })`,
  },
  logLevel: 'info',
})
