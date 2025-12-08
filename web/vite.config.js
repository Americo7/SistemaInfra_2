import dns from 'dns'
import { defineConfig } from 'vite'
import redwood from '@redwoodjs/vite'

dns.setDefaultResultOrder('verbatim')

const viteConfig = {
  plugins: [redwood()],
  
  optimizeDeps: {
    // IMPORTANTE: Eliminamos el bloque 'exclude' que causó el error de react-is.
    // Usamos 'include' para asegurar que estas librerías se conviertan bien a ESM.
    include: [
      'react-is', 
      'material-react-table', 
      '@mui/material/Tooltip' // A veces da problemas específicos
    ],
  },
}

export default defineConfig(viteConfig)