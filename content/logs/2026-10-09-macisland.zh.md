---
title: MacIsland 开发日志：把灵动岛带回 macOS
date: 10.09.2026
tag: BUILD LOG
---
## 为什么做 MacIsland

灵动岛是 iPhone 上最讨喜的交互之一，但 Mac 上一直没有一个原生实现。Pyisland 生态把这件事在 Windows 上做了起来——Python 版、Electron 版、Tauri 版都有——唯独 macOS 端是空白。于是有了 **MacIsland**：一个用 Swift 原生写的灵动岛应用，现在是这个系列里唯一的原生实现。

## 技术选择

- **SwiftUI + AppKit**：岛本体用 SwiftUI 做形态动画，窗口管理和菜单栏常驻交给 AppKit 的 `MenuBarExtra`
- **状态机驱动形态**：`idle / hover / expanded / maxExpand / notification / lyrics / countdown` 七种形态由 `IslandStore` 统一调度，尺寸、圆角都定义在 `IslandLayout` 里
- **刘海信息**：通过 `NotchInfo` 探测刘海位置，非刘海屏和扩展显示器也能停靠

```swift
// 形态切换的入口都收敛在 IslandStore
case .expanded: IslandLayout.expandedSize
case .lyrics:   IslandLayout.lyricsSize
```

## 功能一览

经过 `v2.5.1` 的迭代，目前包含：

1. **音乐控制 + 逐行歌词**——歌词形态下实时滚动
2. **小组件全家桶**——和风天气、闹钟、计时器、番茄钟、待办、便签、书签、股票
3. **系统监控**——CPU 每核占用 + 温度
4. **社区壁纸**——上传 / 下载 / 私有管理，用 GitHub Device Flow 做 OAuth
5. **AI 助手与语音控制**

> 壁纸缓存路径支持自定义，详情弹窗点击即可预览。

## 生态里的位置

MacIsland 不是孤立的玩具，它是跨平台灵动岛生态的 macOS 一环：

| 项目 | 技术栈 | 平台 |
| --- | --- | --- |
| Pyisland | Python | Windows |
| Eisland | Electron + React | Windows |
| Cisland | Tauri | Windows |
| **MacIsland** | **Swift / SwiftUI** | **macOS** |

生态官网在 [silenthim.top](https://silenthim.top/)，主仓库见 [MacIsland/MacIsland](https://github.com/MacIsland/MacIsland)。

## 下一步

- 修复音乐模块在部分播放器下的控制失效问题
- 手势控制的打磨
- 更完整的消息聚合形态

安装包（DMG）在 GitHub Releases，欢迎试用与反馈。
