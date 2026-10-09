// 双语文件对加载器：合并 content/**/{id}.zh.md 与 {id}.en.md
// - zh 文件（默认语言）承载共享字段（name/year/tags/links 等）与中文译文
// - en 文件只承载英文译文字段（Decap i18n multiple_files 结构，共享字段不重复存储）
// - localizedFields 列出的字段会被组装回 { zh, en } 嵌套结构，保持组件取值方式不变
// - 正文（markdown body）输出为 content: { zh, en }，en 缺失时回退 zh，避免中英混排
import { parseFrontmatter } from './frontmatter.js'

export function loadLocalizedPairs(modules, localizedFields) {
  const byId = new Map()

  for (const [path, raw] of Object.entries(modules)) {
    const m = path.split('/').pop().replace(/\.md$/, '').match(/^(.+)\.(zh|en)$/)
    if (!m) continue
    const [, id, locale] = m
    const { data, body } = parseFrontmatter(raw)

    if (!byId.has(id)) byId.set(id, { id, shared: {}, localized: {}, bodies: { zh: '', en: '' } })
    const entry = byId.get(id)

    for (const [k, v] of Object.entries(data)) {
      if (localizedFields.includes(k)) {
        entry.localized[k] = { ...(entry.localized[k] || {}), [locale]: v }
      } else if (locale === 'zh') {
        entry.shared[k] = v
      }
    }
    entry.bodies[locale] = body
  }

  return [...byId.values()].map(e => {
    const localized = {}
    for (const [k, v] of Object.entries(e.localized)) {
      localized[k] = { zh: v.zh ?? v.en, en: v.en ?? v.zh }
    }
    return {
      id: e.id,
      ...e.shared,
      ...localized,
      content: { zh: e.bodies.zh, en: e.bodies.en || e.bodies.zh }
    }
  })
}
