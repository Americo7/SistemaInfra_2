import { createGraphQLHandler } from '@redwoodjs/graphql-server'

import directives from 'src/directives/**/*.{js,ts}'
import sdls from 'src/graphql/**/*.sdl.{js,ts}'
import services from 'src/services/**/*.{js,ts}'

import { authDecoder, getCurrentUser } from 'src/lib/auth'
import { db } from 'src/lib/db'
import { logger } from 'src/lib/logger'

export const handler = createGraphQLHandler({
  authDecoder,          // ← IMPORTANTE
  getCurrentUser,       // ← Devuelve usuario + roles
  loggerConfig: { logger, options: {} },
  directives,
  sdls,
  services,
  armorConfig: { maxDepth: { n: 7 } },
  onException: () => {
    db.$disconnect()
  },
})
