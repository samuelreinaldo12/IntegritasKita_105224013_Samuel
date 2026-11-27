import { randomUUID } from 'node:crypto'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const sessionCookieName = 'sesi'
const sessionLifetimeSeconds = 30 * 60

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'development-session',
      configureServer(server) {
        const sessions = new Map<string, number>()

        server.middlewares.use((request, response, next) => {
          const route = request.url?.split('?')[0]
          if (route !== '/api/masuk' && route !== '/api/logout' && route !== '/api/session') {
            next()
            return
          }

          const expectedMethod = route === '/api/session' ? 'GET' : 'POST'
          if (request.method !== expectedMethod) {
            response.writeHead(405, { Allow: expectedMethod })
            response.end()
            return
          }

          const cookieHeader = request.headers.cookie ?? ''
          const sessionId = cookieHeader
            .split(';')
            .map((cookie) => cookie.trim())
            .find((cookie) => cookie.startsWith(`${sessionCookieName}=`))
            ?.slice(sessionCookieName.length + 1)
          const now = Date.now()

          if (route === '/api/masuk') {
            const newSessionId = randomUUID()
            sessions.set(newSessionId, now + sessionLifetimeSeconds * 1000)
            const secureAttribute = request.socket.encrypted ? '; Secure' : ''
            response.writeHead(200, {
              'Cache-Control': 'no-store',
              'Content-Type': 'application/json; charset=utf-8',
              'Set-Cookie': `${sessionCookieName}=${newSessionId}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${sessionLifetimeSeconds}${secureAttribute}`,
            })
            response.end(JSON.stringify({ active: true }))
            return
          }

          if (route === '/api/logout') {
            if (sessionId) sessions.delete(sessionId)

            const secureAttribute = request.socket.encrypted ? '; Secure' : ''
            response.writeHead(200, {
              'Cache-Control': 'no-store',
              'Content-Type': 'application/json; charset=utf-8',
              'Set-Cookie': `${sessionCookieName}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secureAttribute}`,
            })
            response.end(JSON.stringify({ active: false }))
            return
          }

          if (!sessionId || (sessions.get(sessionId) ?? 0) <= now) {
            if (sessionId) sessions.delete(sessionId)
            response.writeHead(401, {
              'Cache-Control': 'no-store',
              'Content-Type': 'application/json; charset=utf-8',
            })
            response.end(JSON.stringify({ error: 'Sesi tidak valid' }))
            return
          }

          response.writeHead(200, {
            'Cache-Control': 'no-store',
            'Content-Type': 'application/json; charset=utf-8',
          })
          response.end(JSON.stringify({ active: true }))
        })
      },
    },
  ],
})