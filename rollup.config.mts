import fs from 'node:fs/promises'
import { defineConfig } from 'rollup'
import commonjs from '@rollup/plugin-commonjs'
import esbuild from 'rollup-plugin-esbuild'

const pkg = JSON.parse(await fs.readFile(new URL('./package.json', import.meta.url), 'utf-8'))

const input = [
  'src/index.ts',
]

export default defineConfig([
  {
    input,
    output: [
      {
        dir: 'dist',
        format: 'cjs',
        manualChunks(id) {
          if (id.includes('/util/'))
            return 'util'
        },
        chunkFileNames: '[name].js',
      },
    ],
    plugins: [
      esbuild(),
      commonjs(),
    ],
    external: [
      ...Object.keys(pkg.dependencies || []),
      ...Object.keys(pkg.peerDependencies || []),
      'eslint/package.json',
      '@typescript-eslint/utils',
    ],
  },
])
