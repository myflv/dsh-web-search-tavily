/**
 * Build the browser half into a single self-registering classic script.
 *
 * client-modules loads bundles via a classic <script> tag (system.ts
 * defaultLoadBundle), so the artifact must contain NO import statements:
 * externals (react, @deepseek-ai client packages) resolve through the
 * injected require — the loader's module table. iife format turns external
 * imports into require() calls; the registration call lives at the end of
 * the entry, referencing the entry's own bindings.
 */
import { build } from 'esbuild'

await build({
  entryPoints: ['src/client/client.ts'],
  bundle: true,
  format: 'iife',
  outfile: 'lib/client.js',
  packages: 'external', // react / @deepseek-ai/* resolve via the injected require
  platform: 'browser',
  target: 'es2022',
  logLevel: 'info',
})
