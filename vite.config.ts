import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'

// One id per build: baked into the bundle (import.meta.env.VITE_BUILD_ID) and
// written to dist/version.json, so open tabs notice a new deploy
// (see src/utils/appUpdate.ts) instead of running stale cached code.
const BUILD_ID = process.env.VITE_BUILD_ID || Date.now().toString(36)
process.env.VITE_BUILD_ID = BUILD_ID

const versionFile = (): Plugin => ({
  name: 'ebizearn-version-file',
  apply: 'build',
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ build: BUILD_ID }) })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    versionFile(),
  ],
  server: {
    host: '0.0.0.0',
  },
  build: {
    rolldownOptions: {
      output: {
        /**
         * Role-based route chunks: group every lazy page (see src/routes/lazy.tsx)
         * into one chunk per portal so visitors never download code they can't
         * reach. Blog index + post share one chunk; public/auth pages stay in
         * small per-page chunks so the first visit stays light.
         */
        manualChunks(id) {
          if (id.includes('/src/pages/admin') || id.includes('/src/layouts/AdminLayout')) {
            return 'admin';
          }
          if (id.includes('/src/pages/contributor') || id.includes('/src/layouts/ContributorLayout')) {
            return 'contributor-app';
          }
          if (id.includes('/src/pages/business') || id.includes('/src/layouts/BusinessLayout')) {
            return 'business-app';
          }
          // All sign-in / sign-up pages share one chunk, so switching between
          // them never shows the route loader.
          if (id.includes('/src/pages/auth/') || id.includes('/src/components/auth/')) {
            return 'auth';
          }
          if (id.includes('/src/pages/public/BlogIndexPage') || id.includes('/src/pages/public/BlogPostPage')) {
            return 'blog';
          }
          return undefined;
        },
      },
    },
  },
})
