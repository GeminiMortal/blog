// 获奖数据加载器：构建时合并 content/awards/*.zh.md + *.en.md（Decap i18n multiple_files）
// 按年份、月份从新到旧排序；未上传证书图片时 image 归一为 null
import { loadLocalizedPairs } from './localized.js'

const modules = import.meta.glob('/content/awards/*.md', { eager: true, query: '?raw', import: 'default' })

export const awards = loadLocalizedPairs(modules, ['title', 'issuer', 'description'])
  .map(award => ({ ...award, image: award.image || null }))
  .sort((a, b) => b.year - a.year || b.month - a.month)
