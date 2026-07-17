# Kuroii Motion AI for Premiere Pro MVP 开发规格 v3.0

> Extension ID：`com.kuroii.motionai.pr`

## 1. 兼容

```text
Windows 10 / 11
macOS 12+
Intel / Apple Silicon
Premiere Pro 2018—2026+
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
Subtitle
Edit
Script
Audio
Assets
Project
```

## 3. Host Context

当前项目、Sequence、尺寸、帧率、时长、播放头、选中 Clip、轨道、Marker、Caption/SRT 能力。

## 4. 专业功能

- Copy：标题、钩子、CTA、口播、发布文案。
- Translate：字幕、口播、标题、本地化，保持时间码与术语。
- Storyboard：脚本拆分、镜头、Marker、占位结构、粗剪计划。
- Subtitle：SRT 导入/解析/导出、断句、合并、拆分、翻译、行长、时长、能力允许时写回。
- Edit：节奏、空白、重复、前 3 秒、CTA、15/30 秒版本规划、安全粗剪建议。
- Script：可信动作、脚本生成、验证、运行、脚本库。
- Audio：STT、配音文本、TTS、BGM/SFX 建议、节拍 Marker。
- Assets/Project：Bin、分类、重命名、缺失、序列副本、导出准备。

## 5. Capability Detection

公开 API 不可用时必须降级：

```text
Caption 不可写 → SRT
Clip 不可重排 → Edit Plan + Marker
复杂样式不可用 → 文本与样式建议
Desktop 离线 → 本地 SRT、Marker、项目整理
```

QE DOM 不作为核心依赖。

## 6. UI

侧栏收起/展开、收起仅图标、Hover/Focus Tooltip、Light/Dark/Follow System、zh-CN/en-US 即时切换、预留 ja-JP/ko-KR、窄面板优先、品牌 IP 轻量化。

## 7. 验收

PR 代表版本、Win/Mac、Capability Detection、SRT 闭环、中英、浅深色、侧栏、Tooltip、Trusted Actions、日志、错误、降级、视觉自检。
