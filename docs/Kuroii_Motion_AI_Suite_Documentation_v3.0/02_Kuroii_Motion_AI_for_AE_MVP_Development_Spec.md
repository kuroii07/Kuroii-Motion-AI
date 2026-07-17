# Kuroii Motion AI for After Effects MVP 开发规格 v3.0

> Extension ID：`com.kuroii.motionai.ae`

## 1. 兼容

```text
Windows 10 / 11
macOS 12+
Intel / Apple Silicon
After Effects 2018—2026+
主测试 2022—2026+
中文版 / 英文版
```

## 2. 一级导航

```text
Copilot
Tools
Automate
Analyze
Settings
```

Tools：

```text
Copy
Translate
Storyboard
Motion
Expression
Script
Assets
Project
```

## 3. Host Context

当前工程、当前合成、尺寸、帧率、时长、当前时间、选中图层、图层类型、文字、选中属性、锁定/隐藏、表达式状态、项目素材。

## 4. 专业功能

### Copy
广告标题、CTA、卖点、口播、字幕文案、A/B 变体、社媒文案，可写回文字层。

### Translate
批量翻译、术语库、品牌语气、保留换行、字符限制、自动字号、多语言合成副本、合成重命名。

### Storyboard
镜头、时间、旁白、字幕、视觉说明、转场，并可创建合成、预合成、Marker、占位层。

### Motion
关键帧、缓动、错开、入场、强调、出场、路径、循环、音频响应、多层联动、Motion Preset。

### Expression
生成、解释、修复、参数化、应用、移除、保存模板；支持漂浮、弹性、打字机、数字、随机、循环、音频驱动。

### Script
Trusted Action、Generate JSX、Edit JSX、Validate、Preview Plan、Dry Run、Run、Save、Export JSX、History。

### Assets
导入、分类、重命名、替换、查重、缺失、未使用素材、AI 生成素材导入。

### Project
工程结构、Label、命名、预合成、表达式错误、性能、丢失素材、Render Queue、多尺寸、多语言、诊断。

## 5. Trusted Actions 首发

```text
ae.context.getProject
ae.context.getActiveComp
ae.context.getSelection
ae.text.readSelectedLayers
ae.text.replaceSelectedLayers
ae.text.autoFit
ae.layer.batchRename
ae.layer.stagger
ae.layer.alignInPoint
ae.layer.createNull
ae.layer.createText
ae.layer.createShape
ae.layer.precompose
ae.motion.elasticScaleIn
ae.motion.fadeSlideIn
ae.motion.applyEasyEase
ae.expression.apply
ae.expression.remove
ae.expression.scanErrors
ae.comp.duplicate
ae.comp.create
ae.comp.createAspectVariants
ae.comp.addMarkers
ae.project.createFolders
ae.project.organizeItems
ae.project.scanMissingFootage
ae.render.addToQueue
```

## 6. UI

- 可停靠、自适应、窄/中/宽面板。
- Sidebar 可收起/展开；收起只显示图标。
- 所有纯图标支持 Hover / Focus Tooltip。
- Light / Dark / Follow System。
- zh-CN / en-US 即时切换，预留 ja-JP / ko-KR。
- 主题、语言、侧栏状态持久化。
- 品牌 IP 轻量使用，不挤占 AE 工作区。

## 7. 安全

Read-only、Safe Execute、Advanced、Developer。所有修改用 Undo Group；复杂动作可 Snapshot 或 Duplicate Before Execute。

## 8. 验收

兼容代表版本、Win/Mac 安装、中英切换、浅深色、折叠侧栏、Tooltip、Copy/Translate/Motion/Expression/Script 基础闭环、Trusted Actions、日志、Undo、错误码、视觉自检。
