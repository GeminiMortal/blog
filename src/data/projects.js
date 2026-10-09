// 项目数据加载器：构建时合并 content/projects/*.zh.md + *.en.md（Decap i18n multiple_files）
// no（01/02/03 序号）按「年份新→旧、同 年份按中文标题排序」自动生成，无需手动维护
import { loadLocalizedPairs } from './localized.js'

const modules = import.meta.glob('/content/projects/*.md', { eager: true, query: '?raw', import: 'default' })

export const projects = loadLocalizedPairs(modules, ['title', 'summary', 'description', 'features'])
  .sort((a, b) => b.year - a.year || (a.title.zh > b.title.zh ? 1 : -1))
  .map((project, index) => ({ ...project, no: String(index + 1).padStart(2, '0') }))
