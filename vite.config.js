import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
plugins: [react()],
server: {
port: 3001,
open: true, // Auto-open browser
},
build: {
outDir: 'dist',
sourcemap: true,
},
define: {
// Fix potential global variable issues
global: 'globalThis',
},
})
