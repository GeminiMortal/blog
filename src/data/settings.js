// 站点设置（联系邮箱、网易云歌单 ID、音乐跳转链接）
// 内容由 Decap CMS 后台「Site settings」维护，实际数据在 content/settings.md
import { loadFrontmatterOnly } from './frontmatter.js'
import raw from '../../content/settings.md?raw'

export const settings = loadFrontmatterOnly(raw)
