# Kuroii QA、Visual Regression 与 Acceptance 规范 v1.0

## 1. 测试矩阵

```text
Windows / macOS
Intel / Apple Silicon
AE / PR 2018—2026+ 代表版本
zh-CN / en-US
预留 ja-JP / ko-KR
Light / Dark / Follow System
Sidebar Expanded / Collapsed
XS / SM / MD / LG / XL
100% / 125% / 150% / 200% DPI
```

## 2. 组件状态测试

每个组件验证：

```text
Default
Hover
Focus
Active
Selected
Disabled
Loading
Success
Warning
Error
Empty
Read-only
```

## 3. 视觉自检

```text
文字对比度
按钮对比度
图标可见性
输入框
Dropdown
Tooltip
Popover
Context Menu
Dialog
Toast
Table
Code Editor
Workflow Node
Scrollbar
Empty
Error
Loading
```

## 4. 截图矩阵

至少：

```text
Dark + zh-CN + Expanded
Dark + en-US + Collapsed
Light + zh-CN + Expanded
Light + en-US + Collapsed
```

AE/PR 增加窄、中、宽面板截图。

## 5. 自动化建议

```text
Storybook
Playwright
视觉回归截图
主题 Token 静态检查
硬编码颜色扫描
硬编码文案扫描
Tooltip 定位测试
响应式快照
```

## 6. UI 自检清单

```text
[ ] Light 全页
[ ] Dark 全页
[ ] 按钮状态
[ ] 文字对比
[ ] Dropdown
[ ] Tooltip
[ ] Dialog
[ ] Sidebar Expanded / Collapsed
[ ] 状态持久化
[ ] AE 窄面板
[ ] PR 窄面板
[ ] 高 DPI
[ ] 中英切换
[ ] 键盘 Focus
[ ] Reduce Motion
[ ] Empty / Error / Loading
```

## 7. 评分

| 类别 | 分值 |
|---|---:|
| 主题完整性 | 15 |
| 多语言 | 10 |
| 响应式 | 10 |
| 组件状态 | 15 |
| 图标与 Tooltip | 10 |
| 可访问性 | 10 |
| 品牌一致性 | 10 |
| Loading / Error / Empty | 10 |
| 视觉回归与自检 | 10 |

低于 85 分不得标记 UI 完成。

## 8. 开发完成报告

每轮必须输出目录树、文件变更、已实现、未实现、测试结果、兼容情况、视觉自检、已知风险、下一轮和安装运行方法。
