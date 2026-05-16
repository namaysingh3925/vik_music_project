import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// The Spotify redirect URI in .env is registered as http://127.0.0.1:3000/
// so we lock the dev server to that host + port.
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    host: '127.0.0.1',
    port: 3000,
    strictPort: true,
  },
})
