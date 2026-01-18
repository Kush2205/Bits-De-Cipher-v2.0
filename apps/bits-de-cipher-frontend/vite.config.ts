import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  preview: {
    allowedHosts: [
      "bits-de-cipher-dev.gfgrgipt.site",
      "bits-de-cipher.gfgrgipt.site"
    ]
  }
})
