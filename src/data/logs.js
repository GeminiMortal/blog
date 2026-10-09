// 文章（日志）数据加载器：构建时合并 content/logs/*.zh.md + *.en.md（Decap i18n multiple_files）
// zh 文件承载 title/date/tag + 中文正文，en 文件承载英文 title（正文缺失时回退中文）
import { loadLocalizedPairs } from './localized.js'

const modules = import.meta.glob('/content/logs/*.md', { eager: true, query: '?raw', import: 'default' })

// 'MM.DD.YYYY' 转 'YYYY-MM-DD'，便于直接字符串比较排序
function toSortKey(date) {
  const parts = String(date).split('.')
  if (parts.length !== 3) return ''
  const [mm, dd, yyyy] = parts
  return `${yyyy}-${mm}-${dd}`
}

// 导出文章列表：按日期从新到旧
export const logs = loadLocalizedPairs(modules, ['title'])
  .map(log => ({ date: '', tag: 'NOTES', ...log }))
  .sort((a, b) => (toSortKey(b.date) > toSortKey(a.date) ? 1 : -1))
