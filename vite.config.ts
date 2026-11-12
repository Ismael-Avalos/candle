import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // 'injectManifest': el service worker lo escribimos nosotros (src/sw.ts) porque
      // tiene que recibir los avisos push; el plugin solo le añade la lista de archivos a guardar.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      injectRegister: false,
      manifest: {
        id: '/',
        name: 'Candle: cumpleaños que no se olvidan',
        short_name: 'Candle',
        description: 'Guarda un cumpleaños una sola vez y recibe el aviso cada año.',
        lang: 'es',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#0B1020',
        background_color: '#0B1020',
      },
      injectManifest: {
        // De las tipografías solo se guarda el subconjunto latino, que es el que usa la app.
        globPatterns: ['**/*.{js,css,html,png,svg,ico}', '**/*-latin-wght-normal-*.woff2'],
      },
      // También en desarrollo, para poder probar los avisos en localhost.
      devOptions: { enabled: true, type: 'module' },
    }),
  ],
  test: {
    // La lógica de fechas y de avisos es pura, así que las pruebas corren en Node sin navegador.
    environment: 'node',
    include: ['src/**/*.test.ts', 'supabase/**/*.test.ts'],
  },
})
