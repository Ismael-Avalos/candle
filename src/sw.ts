/// <reference lib="webworker" />
// Service worker: un programa que el navegador mantiene aparte de la página.
// Sigue disponible con la app cerrada, y por eso es quien recibe y muestra los avisos.
import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope

// Una versión nueva toma el control enseguida, sin esperar a que se cierren las pestañas.
void self.skipWaiting()
clientsClaim()

// Guarda los archivos de la app para que abra sin conexión. La lista la inyecta el build.
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

interface Carga {
  titulo?: string
  cuerpo?: string
  etiqueta?: string
}

self.addEventListener('push', (evento) => {
  const carga = (evento.data?.json() ?? {}) as Carga
  // waitUntil mantiene vivo el service worker hasta que la notificación está en pantalla.
  evento.waitUntil(
    self.registration.showNotification(carga.titulo ?? 'Candle', {
      body: carga.cuerpo,
      // Dos avisos con la misma etiqueta no se apilan: el segundo sustituye al primero.
      tag: carga.etiqueta,
      icon: '/pwa-192x192.png',
      badge: '/pwa-64x64.png',
    }),
  )
})

self.addEventListener('notificationclick', (evento) => {
  evento.notification.close()
  // Al tocar el aviso se trae al frente la app si ya estaba abierta; si no, se abre.
  evento.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((ventanas) => {
      const abierta = ventanas.find((v) => 'focus' in v)
      return abierta ? abierta.focus() : self.clients.openWindow('/')
    }),
  )
})
