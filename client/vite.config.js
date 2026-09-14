import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// All JSX-containing components were renamed from .js to .jsx during the
// CRA -> Vite migration, since neither esbuild's `loader` option nor this
// `include` override reliably caught every .js file (notably the HTML
// entry-point script). `include` is widened anyway as a harmless safety
// net in case a stray .js file with JSX slips back in.
export default defineConfig({
  plugins: [
    react({
      include: '**/*.{js,jsx}',
    }),
  ],
  server: {
    port: 3000,
    // Replaces CRA's package.json "proxy" field.
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
  build: {
    // server.js serves client/build in production — keep that path valid
    // instead of switching to Vite's own "dist" default.
    outDir: 'build',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
})
