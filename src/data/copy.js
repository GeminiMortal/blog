// 站点文案（中英文，含个人简介、导航、各区块标题按钮）
// content/copy.zh.md + copy.en.md 双语文件（后台 Site copy 集合分条目维护）
import { loadFrontmatterOnly } from './frontmatter.js'
import zhRaw from '../../content/copy.zh.md?raw'
import enRaw from '../../content/copy.en.md?raw'

export const copy = { zh: loadFrontmatterOnly(zhRaw), en: loadFrontmatterOnly(enRaw) }
