import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Root base is correct because the app is served from its own staging subdomain.
  base: '/',
})
