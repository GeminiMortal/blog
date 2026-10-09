import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import neteasePlaylist from './plugins/netease-playlist.js'
import fs from 'node:fs'
import path from 'node:path'

// /admin → 主站路由 #/admin（自研后台）
function adminRedirect() {
  return {
    name: 'admin-redirect',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/admin' || req.url === '/admin/') {
          res.writeHead(301, { Location: '/#/admin' })
          res.end()
          return
        }
        next()
      })
    }
  }
}

// 自研后台的本地存储接口（仅 dev）：
//   GET  /__local/__index?dir=content/awards   → 目录下 md 文件列表
//   GET  /__local/content/xx.md                → 文件内容
//   PUT  /__local/content/xx.md                → 写文件（自动建目录）
//   DELETE /__local/content/xx.md              → 删文件
// 线上走 GitHub Contents API（src/admin/api.js），不经过这里
function adminLocalFiles() {
  const walk = (dir, base, out) => {
    for (const name of fs.readdirSync(dir)) {
      const abs = path.join(dir, name)
      const rel = base ? `${base}/${name}` : name
      if (fs.statSync(abs).isDirectory()) walk(abs, rel, out)
      else out.push(rel)
    }
    return out
  }

  return {
    name: 'admin-local-files',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url.startsWith('/__local')) return next()
        const url = new URL(req.url, 'http://localhost')
        const pathname = url.pathname

        if (req.method === 'GET' && pathname === '/__local/__index') {
          const dir = url.searchParams.get('dir') || 'content'
          const abs = path.join(process.cwd(), dir)
          if (!fs.existsSync(abs)) {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end('[]')
            return
          }
          const files = walk(abs, dir, []).filter(f => /\.(md|json)$/.test(f)).sort()
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(files))
          return
        }

        if (!pathname.startsWith('/__local/content/')) {
          res.writeHead(404)
          res.end('not found')
          return
        }
        const rel = decodeURIComponent(pathname.slice('/__local/'.length))
        if (rel.includes('..')) {
          res.writeHead(403)
          res.end('forbidden')
          return
        }
        const abs = path.join(process.cwd(), rel)

        if (req.method === 'GET') {
          fs.readFile(abs, 'utf8', (err, data) => {
            if (err) {
              res.writeHead(404)
              res.end('not found')
              return
            }
            res.writeHead(200, { 'Content-Type': 'text/markdown; charset=utf-8' })
            res.end(data)
          })
          return
        }

        if (req.method === 'PUT') {
          let body = ''
          req.on('data', c => { body += c })
          req.on('end', () => {
            fs.mkdir(path.dirname(abs), { recursive: true }, () => {
              fs.writeFile(abs, body, 'utf8', err => {
                res.writeHead(err ? 500 : 200)
                res.end(err ? 'write failed' : 'ok')
              })
            })
          })
          return
        }

        if (req.method === 'DELETE') {
          fs.rm(abs, { force: true }, err => {
            res.writeHead(err ? 500 : 200)
            res.end(err ? 'delete failed' : 'ok')
          })
          return
        }

        next()
      })
    }
  }
}

export default defineConfig({
  // GitHub Pages: geminimortal.github.io/blog/ → base 必须为 '/blog/'
  // 本地开发 / 自定义域名时可改为 '/'
  base: '/blog/',

  plugins: [vue(), adminRedirect(), adminLocalFiles(), neteasePlaylist()],

  server: {
    proxy: {
      '/__tencent': {
        target: 'https://tmt.tencentcloudapi.com',
        changeOrigin: true,
        rewrite: p => p.replace(/^\/__tencent/, '')
      }
    }
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,

    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },

    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000
  }
})
