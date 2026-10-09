---
title: 'MacIsland build log: bringing the Dynamic Island back to macOS'
date: 10.09.2026
tag: BUILD LOG
---
## Why MacIsland

The Dynamic Island is one of the iPhone's most delightful interactions, but there has never been a native Mac implementation. The Pyisland ecosystem brought it to Windows — Python, Electron and Tauri editions all exist — yet macOS was blank. Hence **MacIsland**: a Dynamic Island app written natively in Swift, now the only native implementation in the series.

## Technical Choices

- **SwiftUI + AppKit**: SwiftUI drives the island's morph animations; window management and menu-bar residency go to AppKit's `MenuBarExtra`
- **State-machine-driven forms**: seven states — `idle / hover / expanded / maxExpand / notification / lyrics / countdown` — dispatched centrally by `IslandStore`, with sizes and corner radii defined in `IslandLayout`
- **Notch info**: `NotchInfo` detects the notch position, so docking also works on non-notch and external displays

```swift
// All state-transition entry points converge in IslandStore
case .expanded: IslandLayout.expandedSize
case .lyrics:   IslandLayout.lyricsSize
```

## Feature Overview

As of `v2.5.1`:

1. **Music control + line-synced lyrics** — real-time scrolling in lyrics mode
2. **Widget suite** — weather, alarms, timers, pomodoro, todos, memos, bookmarks, stocks
3. **System monitoring** — per-core CPU usage + temperature
4. **Wallpaper community** — upload / download / private management, GitHub Device Flow OAuth
5. **AI assistant with voice control**

> The wallpaper cache path is customisable; click the detail popup to preview.

## Where It Fits

MacIsland isn't an isolated toy — it's the macOS pillar of a cross-platform Dynamic Island ecosystem:

| Project | Stack | Platform |
| --- | --- | --- |
| Pyisland | Python | Windows |
| Eisland | Electron + React | Windows |
| Cisland | Tauri | Windows |
| **MacIsland** | **Swift / SwiftUI** | **macOS** |

Ecosystem site: [silenthim.top](https://silenthim.top/), main repo: [MacIsland/MacIsland](https://github.com/MacIsland/MacIsland).

## Next Steps

- Fix music controls failing with certain players
- Gesture control exploration
- A more complete message aggregation mode

Installer (DMG) is on GitHub Releases — feedback welcome.
