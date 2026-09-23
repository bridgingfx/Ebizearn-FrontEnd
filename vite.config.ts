import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
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
          if (id.includes('/src/pages/public/BlogIndexPage') || id.includes('/src/pages/public/BlogPostPage')) {
            return 'blog';
          }
          return undefined;
        },
      },
    },
  },
})
