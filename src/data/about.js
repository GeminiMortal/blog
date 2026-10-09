// 个人介绍数据：content/about.zh.md + about.en.md 双语文件（后台 About 集合分条目维护）
import { loadFrontmatterOnly } from './frontmatter.js'
import zhRaw from '../../content/about.zh.md?raw'
import enRaw from '../../content/about.en.md?raw'

export const about = { zh: loadFrontmatterOnly(zhRaw), en: loadFrontmatterOnly(enRaw) }
