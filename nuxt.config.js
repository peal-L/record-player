export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: '唱片播放器',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0' },
      { hid: 'description', name: 'description', content: '唱片播放器' },
      { hid: 'keywords', name: 'keywords', content: '播放器,音乐播放器,音乐播放,唱片播放器' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-title', content: '唱片播放器' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon16.ico' },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon32.ico' },
			{ rel: 'manifest', href: '/manifest.json' },
			{ rel: 'shortcut icon', sizes: '192x192', href: '/icon-192.png' },
			{ rel: 'shortcut icon', sizes: '512x512', href: '/icon-512.png' },
			{ rel: 'apple-touch-icon', sizes: '192x192', href: '/icon-192.png' },
			{ rel: 'apple-touch-icon', sizes: '512x512', href: '/icon-512.png' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
		'@nuxtjs/axios'
  ],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  },

  // API middleware
  serverMiddleware: [
    '@/server/app.js'
  ],
  
  env: {
    NODE_ENV: process.env.NODE_ENV
  }
}
