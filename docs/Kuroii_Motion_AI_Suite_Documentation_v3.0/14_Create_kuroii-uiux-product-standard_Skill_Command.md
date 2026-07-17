# 给 Codex：创建 `kuroii-uiux-product-standard` Skill

请创建一个可复用的全局 Skill，名称：

```text
kuroii-uiux-product-standard
```

中文名称：

```text
Kuroii 商业产品 UI/UX 设计与开发规范
```

## 目标

该 Skill 用于以后所有 Desktop、Web、Adobe Extension、Mobile、AI 工具和管理后台项目。它必须在项目开发前建立 UI/UX 基础规范，在开发后执行视觉与可访问性自检。

## 必须创建的目录

```text
kuroii-uiux-product-standard/
├─ SKILL.md
├─ README.md
├─ rules/
│  ├─ theme-system.md
│  ├─ typography.md
│  ├─ spacing-layout.md
│  ├─ density.md
│  ├─ sidebar-navigation.md
│  ├─ tooltip-system.md
│  ├─ icon-system.md
│  ├─ responsive-layout.md
│  ├─ component-states.md
│  ├─ accessibility.md
│  ├─ localization.md
│  ├─ modal-toast-feedback.md
│  ├─ loading-empty-error.md
│  ├─ table-list.md
│  ├─ z-index-scroll.md
│  ├─ dangerous-actions.md
│  └─ visual-regression.md
├─ profiles/
│  ├─ desktop.md
│  ├─ web.md
│  ├─ adobe-extension.md
│  └─ mobile.md
├─ templates/
│  ├─ design-tokens.json
│  ├─ light-theme.json
│  ├─ dark-theme.json
│  ├─ i18n-structure.json
│  ├─ ui-self-check.md
│  ├─ accessibility-check.md
│  ├─ visual-test-matrix.md
│  └─ ui-scorecard.md
├─ prompts/
│  ├─ project-audit.md
│  ├─ new-project-setup.md
│  └─ ui-upgrade.md
└─ examples/
   ├─ sidebar.md
   ├─ tooltip.md
   ├─ theme-switch.md
   └─ responsive-layout.md
```

## SKILL.md 必须包含

1. 自动识别 Desktop / Web / Adobe Extension / Mobile。
2. 默认支持 Light / Dark / Follow System。
3. 默认首发 zh-CN / en-US，预留 ja-JP / ko-KR。
4. Sidebar 展开/收起，收起仅显示图标。
5. 所有纯图标支持 Hover 与 Focus Tooltip。
6. Design Token 与禁止硬编码颜色。
7. i18n 与禁止硬编码文案。
8. Compact / Comfortable / Spacious。
9. XS / SM / MD / LG / XL 响应式断点。
10. 完整组件状态。
11. 键盘、Focus、High Contrast、Reduce Motion。
12. Loading、Empty、Error。
13. Z-Index、Scroll、Table、危险操作。
14. 视觉回归、截图矩阵、自检与 100 分评分。
15. 低于 85 分不能标记 UI 完成。

## 不可妥协规则

```text
不允许只适配深色
不允许图标无 Tooltip
不允许侧栏折叠后失去识别
不允许硬编码颜色
不允许硬编码文案
不允许组件缺状态
不允许窄屏横向溢出
不允许未自检即完成
```

## 输出要求

完成后输出：

```text
Skill 目录树
每个文件用途
SKILL.md 完整内容
如何被 Codex 调用
如何用于新项目
如何用于旧项目升级
自检结果
```

直接创建，不要只给方案。
