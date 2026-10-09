---
name: macisland
type: macOS · SwiftUI
title: MacIsland 灵动岛
summary: macOS 平台的灵动岛桌面应用，Pyisland 开源生态的 macOS 原生实现。常驻刘海区域，集音乐控制、逐行歌词、小组件、系统监控、社区壁纸与 AI 助手于一体，现发布 v2.5.1。
description: |-
  使用 SwiftUI + AppKit 构建的原生 macOS 灵动岛应用，停靠在屏幕顶部刘海区域，根据交互在多种形态间平滑切换。

  **核心能力**：音乐播放控制与逐行歌词、和风天气、闹钟 / 计时 / 番茄钟、剪贴板链接检测、系统与 CPU 监控、本地及社区壁纸管理（上传 / 下载 / 私有管理，支持 GitHub Device Flow OAuth 登录）、AI 助手与语音控制；支持多显示器与非刘海屏幕，提供 dmg 安装包。

  **生态位置**：MacIsland 属于跨平台开源「灵动岛」生态（官网 [silenthim.top](https://silenthim.top/)），同系列还包括 Pyisland（Windows · Python，250+ Stars）、Eisland（Windows · Electron + React 全功能版）、Cisland（Windows · Tauri 轻量版），以及 Pyisland_sideV 侧边栏、Pyball 悬浮球、Pycapsule 等效率工具。MacIsland 专注 macOS 刘海屏原生体验，**是生态中唯一的原生 Swift 实现**。
features:
  - 多形态灵动岛：idle / hover / expanded / maxExpand / 通知 / 歌词 / 倒计时平滑切换
  - 音乐控制 + 逐行同步歌词
  - 天气、闹钟、计时器、番茄钟、待办、便签等小组件
  - 系统监控：CPU 核心数与温度实时显示
  - 社区壁纸：上传 / 下载 / 私有管理，GitHub Device Flow OAuth 授权
  - AI 助手与语音控制
tags:
  - Swift
  - SwiftUI
  - AppKit
  - macOS
  - 开源项目
coverColor: '#0f1f3d'
accentColor: '#77faea'
visualMark: 🏝
links:
  github: https://github.com/MacIsland/MacIsland
  live: https://silenthim.top/
year: 2026
---
## 为什么要做

灵动岛是 iPhone 上最讨喜的交互之一，但 Mac 上一直没有原生实现。Pyisland 生态把这件事在 Windows 上做了起来——Python、Electron、Tauri 三个版本都有——唯独 macOS 端是空白。MacIsland 就是来补上这块拼图的：整个生态里唯一的原生 Swift 实现。

## 技术架构

- **SwiftUI + AppKit**：岛本体用 SwiftUI 做形态动画，窗口管理与菜单栏常驻交给 AppKit
- **状态机驱动形态**：七种形态由 `IslandStore` 统一调度，尺寸与圆角定义在 `IslandLayout`
- **刘海探测**：`NotchInfo` 获取刘海位置，非刘海屏与扩展显示器也能停靠
- **社区壁纸鉴权**：GitHub Device Flow OAuth，支持上传 / 下载 / 私有管理

## 生态坐标

| 项目 | 技术栈 | 平台 |
| --- | --- | --- |
| Pyisland | Python | Windows |
| Eisland | Electron + React | Windows |
| Cisland | Tauri | Windows |
| **MacIsland** | **Swift / SwiftUI** | **macOS** |

## 下一步

- 修复音乐模块在部分播放器下的控制失效问题
- 手势控制的打磨
- 更完整的消息聚合形态
