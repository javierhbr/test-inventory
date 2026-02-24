import { build } from 'esbuild';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

// Auto-discover all handler files
function getEntryPoints(dir) {
  const entries = {};
  const files = readdirSync(dir);
  for (const file of files) {
    const fullPath = join(dir, file);
    if (statSync(fullPath).isFile() && file.endsWith('.ts')) {
      const name = file.replace('.ts', '');
      entries[`handlers/${name}`] = fullPath;
    }
  }
  return entries;
}

await build({
  entryPoints: getEntryPoints('src/handlers'),
  bundle: true,
  minify: true,
  sourcemap: true,
  platform: 'node',
  target: 'node20',
  outdir: 'dist',
  format: 'esm',
  outExtension: { '.js': '.mjs' },
  external: ['@aws-sdk/*'],
  banner: {
    js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);',
  },
});

console.log('Build complete');
