# 给 Codex：创建 `kuroii-motion-ai-brand-system` Skill

请创建项目品牌覆盖 Skill，名称：

```text
kuroii-motion-ai-brand-system
```

它必须建立在 `kuroii-uiux-product-standard` 之上，不能重复或替代基础 UI/UX Skill。

## 目标

为 Kuroii Motion AI Desktop、AE 扩展、PR 扩展提供统一品牌资产、Kuroii Cat 状态、Logo、Icon、Hero、插画、弹窗、空状态和动效规范。

## 必须创建的目录

```text
kuroii-motion-ai-brand-system/
├─ SKILL.md
├─ README.md
├─ brand/
│  ├─ positioning.md
│  ├─ visual-language.md
│  ├─ color.md
│  ├─ typography.md
│  ├─ logo-usage.md
│  ├─ icon-usage.md
│  ├─ hero-usage.md
│  ├─ illustration.md
│  ├─ motion-language.md
│  └─ tone-of-voice.md
├─ mascot/
│  ├─ kuroii-cat-overview.md
│  ├─ state-enum.md
│  ├─ expression-system.md
│  ├─ action-system.md
│  ├─ usage-levels.md
│  └─ do-dont.md
├─ surfaces/
│  ├─ desktop.md
│  ├─ after-effects.md
│  ├─ premiere-pro.md
│  ├─ dialogs.md
│  ├─ empty-states.md
│  ├─ onboarding.md
│  ├─ provider-hub.md
│  └─ update-pages.md
├─ templates/
│  ├─ brand-tokens.json
│  ├─ mascot-state-map.json
│  ├─ dialog-state-map.json
│  ├─ asset-inventory.md
│  ├─ brand-self-check.md
│  └─ theme-asset-map.md
└─ prompts/
   ├─ apply-brand-to-new-project.md
   ├─ apply-brand-to-existing-ui.md
   └─ audit-brand-consistency.md
```

## 状态枚举

```text
Idle
Listening
Thinking
Generating
Connecting
Executing
Success
Warning
Error
Offline
Waiting
Cancelled
Updating
Completed
```

## 使用级别

```text
L0 不出现：代码、数据密集区
L1 图标级：Header、状态
L2 小插画：空状态、帮助、成功
L3 完整角色：首页、首次启动、宣传、更新
```

## 必须定义

1. Logo 深浅色版、横版、竖版、纯图标、小尺寸版。
2. Desktop / AE / PR / Tray Icon。
3. Hero、首图、空状态、弹窗、更新页。
4. Kuroii Cat 表情与动作。
5. 深浅色主题资产映射。
6. 专业模式中降低角色占比。
7. 不儿童化、不频繁打断、不遮挡专业内容。
8. Provider Hub 可使用小猫做接入向导，但不替代正式说明。
9. 成功、失败、警告、离线、更新等状态映射。
10. 品牌资产只能从统一目录调用，禁止临时绘制替代。

## Skill 依赖

SKILL.md 必须声明：

```text
requires: kuroii-uiux-product-standard
```

## 输出要求

完成后输出：

```text
Skill 目录树
SKILL.md 完整内容
品牌资产清单
Kuroii Cat 状态表
主题资产映射
Desktop / AE / PR 使用差异
Codex 调用方式
自检结果
```

直接创建，不要只给方案。
