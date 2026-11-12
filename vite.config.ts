import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    // La lógica de fechas es pura, así que las pruebas corren en Node sin navegador.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
