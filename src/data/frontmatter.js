// Markdown frontmatter 解析：--- 包裹的 YAML 前言，剩余部分为正文
import { load } from 'js-yaml'

export function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) return { data: {}, body: raw.trim() }
  return { data: load(match[1]) || {}, body: raw.slice(match[0].length).trim() }
}

// 读取单文件 md（frontmatter-only），用于 copy/settings 等站点级配置
export function loadFrontmatterOnly(raw) {
  return parseFrontmatter(raw).data
}
