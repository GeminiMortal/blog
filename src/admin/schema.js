// 自研后台的集合定义：每个集合的字段布局 + 双语文件规则
// - folder: content 下的目录；localized: 是否双语（.zh.md + .en.md 成对）
// - fields: 编辑表单字段；shared=true 的字段只存 zh 文件；mark=true 为可翻译字段
// - sharedKeys 与 buildEntryId 与 src/data/localized.js 的合并规则保持一致

export const collections = [
  {
    name: 'logs',
    label: '日志',
    folder: 'content/logs',
    localized: true,
    newSlugPrefix: () => {
      const d = new Date()
      const p = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-`
    },
    sortKey: e => e.date,
    fields: [
      { key: 'title', label: '标题', type: 'string', mark: true, required: true },
      { key: 'date', label: '日期 (MM.DD.YYYY)', type: 'string', shared: true, required: true },
      { key: 'tag', label: '标签', type: 'select', options: ['THOUGHTS', 'BUILD LOG', 'NOTES'], shared: true, default: 'THOUGHTS' },
      { key: 'body', label: '正文', type: 'markdown', mark: true }
    ]
  },
  {
    name: 'projects',
    label: '项目',
    folder: 'content/projects',
    localized: true,
    sortKey: e => `${e.year} ${e.title}`,
    fields: [
      { key: 'name', label: '标识 (文件名)', type: 'string', shared: true, required: true },
      { key: 'type', label: '类型', type: 'string', shared: true },
      { key: 'title', label: '标题', type: 'string', mark: true, required: true },
      { key: 'summary', label: '摘要', type: 'text', mark: true },
      { key: 'description', label: '详细描述', type: 'markdown', mark: true },
      { key: 'features', label: '特性列表', type: 'list', mark: true },
      { key: 'tags', label: '技术标签', type: 'list', shared: true },
      { key: 'coverColor', label: '封面背景色', type: 'string', shared: true, default: '#15204c' },
      { key: 'accentColor', label: '强调色', type: 'string', shared: true, default: '#77faea' },
      { key: 'visualMark', label: '视觉符号', type: 'string', shared: true, default: '◌' },
      { key: 'links', label: '链接 (github, live)', type: 'object', shared: true, sub: ['github', 'live'] },
      { key: 'year', label: '年份', type: 'number', shared: true, default: 2026 },
      { key: 'body', label: '正文', type: 'markdown', mark: true }
    ]
  },
  {
    name: 'awards',
    label: '获奖',
    folder: 'content/awards',
    localized: true,
    sortKey: e => `${e.year}.${String(e.month).padStart(2, '0')}`,
    fields: [
      { key: 'name', label: '标识 (文件名)', type: 'string', shared: true, required: true },
      { key: 'year', label: '年份', type: 'number', shared: true, default: 2026 },
      { key: 'month', label: '月份', type: 'number', shared: true, default: 1 },
      { key: 'title', label: '奖项名称', type: 'string', mark: true, required: true },
      { key: 'issuer', label: '颁发机构', type: 'string', mark: true },
      { key: 'project', label: '关联项目', type: 'string', shared: true },
      { key: 'description', label: '获奖描述', type: 'markdown', mark: true },
      { key: 'image', label: '证书图片路径', type: 'string', shared: true },
      { key: 'body', label: '正文', type: 'markdown', mark: true }
    ]
  },
  {
    name: 'about',
    label: '关于',
    folder: 'content',
    localized: true,
    fixedId: 'about',
    fields: [
      { key: 'tagline', label: '标语', type: 'text', mark: true },
      { key: 'bio', label: '简介段落', type: 'list', mark: true },
      { key: 'skills', label: '技能分组', type: 'skills' },
      { key: 'timeline', label: '经历时间线', type: 'timeline' },
      { key: 'facts', label: '基本信息', type: 'facts' }
    ]
  },
  {
    name: 'copy',
    label: '站点文案',
    folder: 'content',
    localized: true,
    fixedId: 'copy',
    fields: [
      { key: 'nav', label: '导航', type: 'object', sub: ['home', 'projects', 'awards', 'logs', 'about', 'contact'], mark: true },
      { key: 'availability', label: '可用状态', type: 'string', mark: true },
      { key: 'role', label: '个人角色', type: 'string', mark: true },
      { key: 'hero', label: '首页大标题 (3 段)', type: 'list', mark: true },
      { key: 'intro', label: '个人简介', type: 'text', mark: true },
      { key: 'explore', label: '查看项目按钮', type: 'string', mark: true },
      { key: 'contactBtn', label: '联系按钮', type: 'string', mark: true },
      { key: 'status', label: '系统状态文案', type: 'string', mark: true },
      { key: 'stack', label: '技术栈标签', type: 'string', mark: true },
      { key: 'now', label: '正在构建标题', type: 'string', mark: true },
      { key: 'nowTitle', label: '正在构建卡片标题', type: 'string', mark: true },
      { key: 'nowText', label: '正在构建描述', type: 'text', mark: true },
      { key: 'nowItems', label: '正在构建列表', type: 'list', mark: true },
      { key: 'projects', label: '精选项目标题', type: 'string', mark: true },
      { key: 'allProjects', label: '全部项目按钮', type: 'string', mark: true },
      { key: 'logs', label: '日志标题', type: 'string', mark: true },
      { key: 'logsMore', label: '查看全部按钮', type: 'string', mark: true },
      { key: 'music', label: '音乐标题', type: 'string', mark: true },
      { key: 'musicTitle', label: '音乐卡片标题', type: 'string', mark: true },
      { key: 'musicText', label: '音乐描述', type: 'text', mark: true },
      { key: 'configure', label: '等待配置标题', type: 'string', mark: true },
      { key: 'configureText', label: '等待配置描述', type: 'text', mark: true },
      { key: 'musicLink', label: '网易云链接文案', type: 'string', mark: true },
      { key: 'contact', label: '联系标题', type: 'string', mark: true },
      { key: 'contactTitle', label: '联系区大标题 (2 段)', type: 'list', mark: true },
      { key: 'contactText', label: '联系描述', type: 'text', mark: true },
      { key: 'email', label: '邮件按钮', type: 'string', mark: true },
      { key: 'footer', label: '页脚文案', type: 'string', mark: true },
      { key: 'location', label: '位置文案', type: 'string', mark: true },
      { key: 'awards', label: '获奖标题', type: 'string', mark: true },
      { key: 'awardsIntro', label: '获奖介绍', type: 'text', mark: true },
      { key: 'projectDetail', label: '项目详情页', type: 'object', sub: ['back', 'features', 'techStack', 'links', 'prevProject', 'nextProject'], mark: true }
    ]
  },
  {
    name: 'settings',
    label: '站点设置',
    folder: 'content',
    localized: false,
    fixedId: 'settings',
    fields: [
      { key: 'email', label: '联系邮箱', type: 'string', required: true },
      { key: 'playlistId', label: '网易云歌单 ID', type: 'string' },
      { key: 'musicUrl', label: '音乐跳转链接', type: 'string' }
    ]
  }
]

export function getCollection(name) {
  return collections.find(c => c.name === name)
}

// 目录内条目 id：文件名去掉扩展名与 .zh/.en 后缀（listDir 返回的是含目录的相对路径，须取 basename）
export function entryIdFromFile(folder, file) {
  const base = file.split('/').pop().replace(/\.md$/, '')
  const m = base.match(/^(.+)\.(zh|en)$/)
  return m ? m[1] : base
}

export function filePathsFor(col, id) {
  if (col.localized) {
    return { zh: `${col.folder}/${id}.zh.md`, en: `${col.folder}/${id}.en.md` }
  }
  return { zh: `${col.folder}/${id}.md` }
}
