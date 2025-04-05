// Service Worker para SkyCheck
const CACHE_NAME = 'skycheck-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/weather-icon.svg',
  '/icons/tomorrow/1000.svg',
  '/icons/tomorrow/1001.svg',
  '/icons/tomorrow/4001.svg',
  '/icons/tomorrow/5000.svg',
  '/icons/tomorrow/8000.svg'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activación y limpieza de caches antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return cacheName !== CACHE_NAME;
        }).map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de caché: Network first, falling back to cache
self.addEventListener('fetch', (event) => {
  // No interceptar peticiones a APIs externas
  if (event.request.url.includes('api.openweathermap.org') || 
      event.request.url.includes('api.weatherapi.com') || 
      event.request.url.includes('api.tomorrow.io')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clonar la respuesta para guardarla en caché
        const responseClone = response.clone();
        
        caches.open(CACHE_NAME)
          .then((cache) => {
            // Solo almacenar en caché respuestas válidas
            if (response.status === 200) {
              cache.put(event.request, responseClone);
            }
          });
          
        return response;
      })
      .catch(() => {
        // Si la red falla, intentar servir desde caché
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Para peticiones de navegación, devolver la página offline
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            
            // Para imágenes, devolver una imagen placeholder
            if (event.request.destination === 'image') {
              return caches.match('/images/placeholder.png');
            }
            
            return new Response('No hay conexión a Internet', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Sincronización en segundo plano
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-weather-data') {
    event.waitUntil(syncWeatherData());
  }
});

// Función para sincronizar datos del clima
async function syncWeatherData() {
  const dbPromise = indexedDB.open('skycheck-db', 1);
  
  dbPromise.onupgradeneeded = function(event) {
    const db = event.target.result;
    if (!db.objectStoreNames.contains('pending-requests')) {
      db.createObjectStore('pending-requests', { keyPath: 'id' });
    }
  };
  
  try {
    const db = await new Promise((resolve, reject) => {
      dbPromise.onsuccess = e => resolve(e.target.result);
      dbPromise.onerror = reject;
    });
    
    const tx = db.transaction('pending-requests', 'readwrite');
    const store = tx.objectStore('pending-requests');
    
    const requests = await new Promise((resolve) => {
      const getAll = store.getAll();
      getAll.onsuccess = () => resolve(getAll.result);
    });
    
    for (const request of requests) {
      try {
        await fetch(request.url, request.options);
        await store.delete(request.id);
      } catch (error) {
        console.error('Error syncing request:', error);
      }
    }
    
    await tx.complete;
  } catch (error) {
    console.error('Error in syncWeatherData:', error);
  }
}

// Notificaciones push
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Acción al hacer clic en la notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Si ya hay una ventana abierta, enfocarla
        for (const client of clientList) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
  );
});
