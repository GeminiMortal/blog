---
name: macisland
type: macOS · SwiftUI
title: MacIsland
summary: A native macOS Dynamic Island app — the macOS member of the open-source Pyisland ecosystem. Docks at the notch with music control, line-synced lyrics, widgets, system monitoring, a wallpaper community and an AI assistant. Now at v2.5.1.
description: |-
  A native macOS Dynamic Island app built with SwiftUI + AppKit. It docks at the notch and smoothly morphs between states.

  **Core features**: music control with line-synced lyrics, weather, alarms / timers / pomodoro, clipboard link detection, system & CPU monitoring, local and community wallpaper management (upload / download / private, GitHub Device Flow OAuth), plus an AI assistant with voice control. Multi-display and non-notch screens are supported, shipped as a dmg installer.

  **Ecosystem**: MacIsland is part of the cross-platform open-source Dynamic Island ecosystem ([silenthim.top](https://silenthim.top/)), alongside Pyisland (Windows · Python, 250+ stars), Eisland (Windows · Electron + React full edition), Cisland (Windows · lightweight Tauri edition), and tools like Pyisland_sideV, Pyball and Pycapsule. MacIsland focuses on the native macOS notch experience — **the only native Swift implementation in the ecosystem**.
features:
  - 'Multi-state island: smooth morphing between idle / hover / expanded / maxExpand / notification / lyrics / countdown'
  - Music control with line-synced lyrics
  - 'Widgets: weather, alarms, timers, pomodoro, todos, memos'
  - Live system monitoring with per-core CPU usage and temperature
  - Wallpaper community with upload / download / private management via GitHub Device Flow OAuth
  - AI assistant with voice control
tags:
  - Swift
  - SwiftUI
  - AppKit
  - macOS
  - Open Source
coverColor: '#0f1f3d'
accentColor: '#77faea'
visualMark: 🏝
links:
  github: https://github.com/MacIsland/MacIsland
  live: https://silenthim.top/
year: 2026
---
## Why Build This

The Dynamic Island is one of the iPhone's most delightful interactions, but there has never been a native implementation on Mac. The Pyisland ecosystem brought it to Windows — in Python, Electron and Tauri editions — yet macOS remained a blank spot. MacIsland fills that gap: the only native Swift implementation in the entire ecosystem.

## Technical Architecture

- **SwiftUI + AppKit**: SwiftUI drives the island's morph animations; window management and menu-bar residency are handled by AppKit
- **State-machine-driven forms**: seven states dispatched centrally by `IslandStore`, with sizes and corner radii defined in `IslandLayout`
- **Notch detection**: `NotchInfo` locates the notch so docking also works on non-notch and external displays
- **Wallpaper community auth**: GitHub Device Flow OAuth for upload / download / private management

## Ecosystem

| Project | Stack | Platform |
| --- | --- | --- |
| Pyisland | Python | Windows |
| Eisland | Electron + React | Windows |
| Cisland | Tauri | Windows |
| **MacIsland** | **Swift / SwiftUI** | **macOS** |

## Next Steps

- Fix music controls failing with certain players
- Gesture control exploration
- A more complete message aggregation mode
