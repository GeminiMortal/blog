# onlyfront

个人博客前端，基于 Vue 3 + Vite 构建。自带轻量管理后台（`/#/admin`）编辑内容，内置网易云音乐歌单播放器。

## 技术栈

- Vue 3（`<script setup>` SFC）+ vue-router 4（hash 模式）
- Vite 8
- 自研后台（`src/components/admin/`，替代 Decap CMS）+ js-yaml + markdown-it
- 自定义 Vite 插件：网易云歌单数据生成（`plugins/netease-playlist.js`）

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本（输出到 dist/）
npm run build

# 本地预览构建产物
npm run preview
```

## 页面结构

| 路由 | 页面 | 说明 |
| --- | --- | --- |
| `/` | HomePage | 首页（含黑胶播放器） |
| `/projects` | ProjectsPage | 项目列表 |
| `/projects/:id` | ProjectDetailPage | 项目详情 |
| `/awards` | AwardsPage | 奖项 |
| `/logs` | LogsPage | 日志 |
| `/about` | AboutPage | 关于 |
| `/admin` | AdminApp | 管理后台（隐藏前台导航，全屏管理界面） |

## 目录说明

```
├── content/               # 内容数据（全部为 Markdown + YAML frontmatter，中英双语按文件拆分）
├── plugins/               # 自定义 Vite 插件
│   └── netease-playlist.js    # 网易云歌单 → src/data/playlist.json
├── src/
│   ├── admin/                 # 后台数据层（schema.js 集合定义、api.js 存储双后端）
│   ├── components/
│   │   └── admin/             # 后台界面（AdminApp.vue、EntryEditor.vue）
│   ├── components/        # 前台通用组件（Nav、Footer、VinylPlayer 等）
│   ├── data/              # 前台数据加载器（projects、logs、awards、playlist 等）
│   ├── pages/             # 路由页面
│   └── router/            # 路由配置
└── vite.config.js
```

## 内容管理（自研后台）

访问 `/#/admin` 进入后台（编辑内容需 `npm run dev` 运行本地接口；GitHub 线上模式在「存储设置」配置仓库 + token）。

- 集合：日志 / 项目 / 获奖（条目列表 + 缺英文标记）、关于 / 站点文案 / 设置（单文件编辑）
- 双语文件隔离：条目落盘为 `{id}.zh.md`（共享字段 + 中文 + 正文）+ `{id}.en.md`（仅英文译文），编辑器内「中文 / English」Tab 切换；about/copy 为 `about.{zh,en}.md`、`copy.{zh,en}.md`；缺译时前台自动回退中文
- Markdown：正文与 markdown 字段支持编辑 / 预览切换（与前台同款 markdown-it）
- 保存走 js-yaml 序列化（回读无损测试覆盖），前台 glob 加载器自动感知变更热更新

### AI 译英文

编辑器「✨ AI 译英文」把中文可译字段 + 正文发给翻译接口，结果**填入英文表单**（不落盘，校对后保存）。在后台「设置」页配置接口：

- **腾讯云机器翻译 TMT（推荐）**：直连 TextTranslate API，无需中间层（TC3 签名在浏览器原生 Web Crypto 计算），在腾讯云「机器翻译」控制台开通服务后填入 SecretId/SecretKey 即可。dev 模式自动走 `/__tencent` 代理（vite 中转，绕过 CORS），生产环境需同域部署反向代理到 `tmt.tencentcloudapi.com`（如 Cloudflare Worker）。免费额度足够个人使用。
- **自定义网关**：任何实现 `POST {text, source, target} → {text}` 的服务（如 Cloudflare Worker 代理的 OpenAI 兼容接口）。
- 未配置任何接口时，按钮填充 `[AI]` 占位前缀。
- 证书图片等静态资源暂需手动放入 `public/images/` 并在字段填路径（后台未内置上传）
- 仅本地 dev 可写文件（`vite.config.js` 提供 `/__local/content/**` 读写接口，限 dev）；线上需要把网关指向可写仓库的服务（如 GitHub Content API）

## 网易云歌单

- 在后台「站点设置」（或直接编辑 `content/settings.md`）填入网易云歌单 ID（纯数字或完整歌单链接均可）
- 插件会在开发/构建时自动拉取曲目元数据、播放权限和歌词，生成 `src/data/playlist.json`
- VIP/受限歌曲（拿不到外链或仅试听）会在构建期自动过滤
- 歌词缓存在 `node_modules/.cache/netease-lyrics/`，网络失败时沿用旧数据，保证构建不中断
