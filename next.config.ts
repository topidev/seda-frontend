import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa"

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        // dominio de las fotos de perfil de Google
      },
    ],
  },
};

export default withPWA({
  dest: 'public',
  register: true,
  disable: process.env.NODE_ENV === 'development', // solo activo en producción
  fallbacks: {
    document: '/offline.html',
    // image: '/offline.html',
    // audio: '/offline.html',
    // video: '/offline.html',
    // font: '/offline.html',
  },
  workboxOptions: {
    skipWaiting: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/seda-backend-production\.up\.railway\.app\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24, // 24 horas
          },
          networkTimeoutSeconds: 10,
        },
      },
      {
        urlPattern: /\/_next\/static\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-cache',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
          },
        },
      },
      {
        urlPattern: /\/_next\/image\?.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'image-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 7, // 7 días
          },
        },
      },
    ],
  },
})(nextConfig)


