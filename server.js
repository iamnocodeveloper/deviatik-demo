import { createServer } from 'node:http'
import { stat } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'

const port = Number.parseInt(process.env.PORT ?? '3000', 10)
const host = process.env.HOST ?? '0.0.0.0'
const publicDir = resolve(process.cwd(), 'dist')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.txt':  'text/plain; charset=utf-8',
  '.map':  'application/json; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
    let pathname = decodeURIComponent(url.pathname)
    if (pathname.endsWith('/')) pathname += 'index.html'

    const safePath = normalize(pathname).replace(/^([\\/])+/, '')
    const candidate = join(publicDir, safePath)

    if (!candidate.startsWith(publicDir)) {
      res.writeHead(403)
      res.end('Forbidden')
      return
    }

    let servedFile = false
    try {
      const stats = await stat(candidate)
      if (stats.isFile()) {
        const data = await import('node:fs/promises').then((m) => m.readFile(candidate))
        const type = MIME[extname(candidate).toLowerCase()] ?? 'application/octet-stream'
        res.writeHead(200, {
          'Content-Type': type,
          'Cache-Control': candidate.includes('/assets/')
            ? 'public, max-age=31536000, immutable'
            : 'no-cache',
        })
        res.end(data)
        servedFile = true
      }
    } catch {
      // file not found, will fall back below
    }

    if (servedFile) return

    const hasExtension = extname(safePath) !== ''
    if (hasExtension) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('Not found')
      return
    }

    const indexHtml = await import('node:fs/promises').then((m) => m.readFile(join(publicDir, 'index.html')))
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
    })
    res.end(indexHtml)
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end(`Server error: ${e instanceof Error ? e.message : String(e)}`)
  }
})

server.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(`habit-tracker listening on http://${host}:${port}`)
})