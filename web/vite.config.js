import dns from 'dns'

import { defineConfig } from 'vite'

import redwood from '@redwoodjs/vite'

// So that Vite will load on localhost instead of `127.0.0.1`.
// See: https://vitejs.dev/config/server-options.html#server-host.
dns.setDefaultResultOrder('verbatim')

const viteConfig = {

  plugins: [redwood()],
  server: {
    host: true, // permite accesos externos
    allowedHosts: ['datainfra-uit.agetic.gob.bo'], // permite tu dominio
    port: 8910,
  },
}

export default defineConfig(viteConfig)
