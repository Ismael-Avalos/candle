import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

const NOCHE = '#0B1020'

/**
 * Genera todos los íconos desde public/logo.svg con `npm run iconos`.
 * El logo ya es un cuadrado azul noche completo, así que los íconos normales van sin margen.
 * El maskable y el de Apple llevan margen del mismo color: el sistema les recorta las orillas.
 */
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    transparent: { ...minimal2023Preset.transparent, padding: 0 },
    maskable: {
      ...minimal2023Preset.maskable,
      padding: 0.2,
      resizeOptions: { background: NOCHE },
    },
    apple: {
      ...minimal2023Preset.apple,
      padding: 0.1,
      resizeOptions: { background: NOCHE },
    },
  },
  images: ['public/logo.svg'],
})
