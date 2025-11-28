import { FatalErrorBoundary, RedwoodProvider } from '@redwoodjs/web'
import { RedwoodApolloProvider } from '@redwoodjs/web/apollo'
import { Toaster } from '@redwoodjs/web/toast' // <--- 1. IMPORTAR TOASTER

import FatalErrorPage from 'src/pages/FatalErrorPage'
import Routes from 'src/Routes'

import { AuthProvider, useAuth } from './auth'

import './scaffold.css'
import './index.css'

const App = () => (
  <FatalErrorBoundary page={FatalErrorPage}>
    <RedwoodProvider>
      <AuthProvider>
        <RedwoodApolloProvider useAuth={useAuth}>
          
          {/* 2. AGREGAR EL TOASTER AQUÍ (GLOBAL) */}
          <Toaster toastOptions={{ className: 'rw-toast', duration: 5000 }} />
          
          <Routes />
        </RedwoodApolloProvider>
      </AuthProvider>
    </RedwoodProvider>
  </FatalErrorBoundary>
)

export default App