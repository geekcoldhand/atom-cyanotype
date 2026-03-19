import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set base to your GitHub repo name for gh-pages deployment.
// Change '/atom-cyanotype/' to match your repo name, e.g. '/my-repo/'
export default defineConfig({
  plugins: [react()],
  base: '/atom-cyanotype/',
})
