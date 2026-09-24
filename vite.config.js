import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Source maps let a stack trace from a tester's phone be mapped back to the real code.
  build: { sourcemap: true },
})
