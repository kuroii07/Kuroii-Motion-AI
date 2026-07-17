# Kuroii Professional Studio 视觉重构设计规范

日期：2026-07-14  
状态：已确认，分阶段实施中  
选定视觉目标：`output/product-design-audit/visual-system-2026-07-14/11-selected-command-workspace.png`  
视觉目标 SHA256：`F4E3BAF01777EB9A36A9C324183A7E569AFDFB38A87C0AD72BB5B2ECA97ECB06`

## 1. 目标

把当前 Kuroii Motion AI Desktop 从功能完整但视觉规则分散的原型，重构为适合 AE / PR 专业用户长期使用的创作工作台。

本轮目标不是增加装饰，而是建立稳定、可复用的视觉系统：

- 当前任务在一秒内可识别。
- 创作内容和命令输入优先于产品功能展示。
- 深色、浅色与跟随系统是分别设计的主题，不做简单反色。
- Kuroii 品牌可识别，但不污染参数区和核心工作区。
- 新功能页可以直接复用 Token 和基础组件，不再逐页追加临时样式。

## 2. 设计定位

- 产品表面：Desktop 专业创作软件，不是营销首页，也不是放大的 AE 插件面板。
- 用户：After Effects、Premiere Pro、动效、视频和 AI 内容创作者。
- 视觉语言：冷中性、内容优先、紧凑有序、稳定克制。
- 设计变化度：`5 / 10`。
- 动效强度：`3 / 10`。
- 信息密度：`7 / 10`。
- 主设计基础：成熟创作软件的工作区原则，叠加 Kuroii 自有品牌层，不照搬 Adobe、Figma 或 Blender 外观。

## 3. 已确认的产品决策

### 3.1 首页采用 Command Workspace

首页负责：

- Motion Command / Motion Brief 命令输入。
- 一个明确的主生成操作。
- 快捷命令。
- 最近任务。
- 推荐工作流。
- AE / PR 宿主、选中内容、模型和项目健康摘要。

首页不负责：

- 放置统一的大型“生成预览”画布。
- 展示所有功能入口的卡片矩阵。
- 承担图片、分镜、动效和视频的通用结果预览。

图片、分镜和动效预览留在对应功能页，避免首页出现功能边界不清的空白画布。

### 3.2 品牌角色使用等级

- 首页命令空状态：Kuroii Cat `L2`，小型状态助手。
- 首页欢迎或首次启动：允许 `L3`。
- Provider Hub：仅在接入引导、认证失败和空状态使用 `L1/L2`。
- 图片、脚本、参数、诊断、模型列表：默认 `L0`。
- Loading、Success、Warning、Error：按状态使用 `L1/L2`，不得常驻遮挡内容。

## 4. 色彩系统

### 4.1 色彩比例

- 中性背景与文字：约 `85%`。
- Kuroii Cyan：约 `10%`，仅用于主操作、当前选中、Focus 和关键链接。
- Kuroii Pink：不超过 `3%`，用于品牌情绪、升级入口和少量角色细节。
- Success / Warning / Error：约 `2%`，只表达语义状态。

同一屏幕不得同时存在三个以上非中性色高强调区域。

### 4.2 深色主题

```css
--color-bg-app: #0E1014;
--color-bg-sidebar: #12151A;
--color-surface-1: #161A20;
--color-surface-2: #1B2027;
--color-surface-3: #222832;
--color-surface-hover: #282F3A;
--color-surface-selected: #17303A;

--color-text-primary: #F2F4F7;
--color-text-secondary: #B8BEC8;
--color-text-muted: #858E9C;
--color-text-disabled: #626B78;

--color-line-subtle: rgba(255, 255, 255, 0.065);
--color-line-control: #3B4451;
--color-line-strong: #536071;

--color-accent: #27C7EB;
--color-accent-hover: #51D4EF;
--color-accent-active: #12A9CD;
--color-accent-soft: rgba(39, 199, 235, 0.13);
--color-on-accent: #071217;

--color-brand-pink: #F47DB4;
--color-success: #42D39A;
--color-warning: #F0C45B;
--color-error: #F06B85;
```

### 4.3 浅色主题

```css
--color-bg-app: #F2F4F7;
--color-bg-sidebar: #F7F8FA;
--color-surface-1: #FFFFFF;
--color-surface-2: #F5F7F9;
--color-surface-3: #EBEFF3;
--color-surface-hover: #E5EBF0;
--color-surface-selected: #DDF3F8;

--color-text-primary: #171B21;
--color-text-secondary: #45505E;
--color-text-muted: #697585;
--color-text-disabled: #929CAA;

--color-line-subtle: rgba(20, 31, 44, 0.075);
--color-line-control: #BBC5D0;
--color-line-strong: #929EAC;

--color-accent: #087D9C;
--color-accent-hover: #056B86;
--color-accent-active: #04566C;
--color-accent-soft: rgba(8, 125, 156, 0.11);
--color-on-accent: #FFFFFF;

--color-brand-pink: #A83B70;
--color-success: #087A58;
--color-warning: #825C08;
--color-error: #B52E50;
```

### 4.4 主题规则

- 深色和浅色均使用五级 Surface，不允许 `surface-2` 与 `surface-3` 相同。
- 工作画布使用主题内的中性工作区色，不在浅色主题中硬编码纯黑。
- 品牌青色不能用于普通标题、普通图标和所有边框。
- 粉色不能作为普通按钮、导航选中或危险操作色。
- Success 绿色不得装饰普通列表项，只用于连接和成功状态。
- 危险操作统一使用 Error 色，不复用品牌粉色。

## 5. 排版系统

### 5.1 字体

```css
--font-ui: "Segoe UI Variable", "Segoe UI", "Microsoft YaHei UI", sans-serif;
--font-code: "Cascadia Mono", "SFMono-Regular", Consolas, monospace;
```

参数、尺寸、时间码、模型 ID、脚本和表达式使用等宽字体。普通文案不使用等宽字体。

### 5.2 字号层级

```css
--text-display: 24px / 1.25 / 650;
--text-h1: 22px / 1.3 / 650;
--text-h2: 18px / 1.35 / 600;
--text-title: 15px / 1.4 / 600;
--text-body: 13px / 1.55 / 400;
--text-body-strong: 13px / 1.55 / 600;
--text-small: 12px / 1.45 / 400;
--text-caption: 11px / 1.4 / 400;
--text-label: 12px / 1.35 / 600;
```

- 工作区禁止使用 `9px` 正文或标签。
- `10px` 仅允许用于极少量固定状态角标，不承载操作信息。
- 中英文双显只用于首次识别、专业名词或需要跨语言对应的区域。
- 标题不使用青、粉、绿轮流着色；标题主要通过字号、字重和位置建立层级。

## 6. 间距、圆角与尺寸

### 6.1 间距

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
```

禁止新增 13、17、19、21、23 等随机布局间距。特殊光学校正必须在组件注释中说明。

### 6.2 圆角

```css
--radius-xs: 4px;
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 10px;
--radius-pill: 999px;
```

- 输入框、按钮、下拉、图标按钮：`6px`。
- 独立面板：`8px`。
- 首页品牌模块：最多 `10px`。
- 状态胶囊：`999px`。
- 大型画布、时间轴和表格区域不使用大圆角。

### 6.3 控件高度

```css
--control-xs: 28px;
--control-sm: 32px;
--control-md: 36px;
--control-lg: 40px;
```

- 专业工作区默认 `32px`。
- 首页主命令和关键表单使用 `36px`。
- 小型工具栏图标按钮使用 `28px`。
- 同一工具栏不得混用多个高度。

## 7. 基础组件

### 7.1 Button

仅保留四种层级：

1. Primary：实心 Cyan，每个任务区最多一个。
2. Secondary：中性 Surface + Control Border。
3. Ghost / Icon：透明背景，Hover 使用 Surface Hover。
4. Danger：中性默认，Hover / Confirm 才进入 Error 语义。

按钮必须覆盖 Default、Hover、Focus、Active、Disabled、Loading。禁用状态取消阴影和 Hover，不只降低透明度。

### 7.2 Input / Textarea

- 默认边框使用 Control Border。
- Hover 提升一档边框明度。
- Focus 使用 `2px` Cyan Focus Ring，但不发光。
- 已填写不额外使用品牌色。
- Error 使用 Error 边框、错误图标和文字原因。
- 帮助文本与错误文本占用稳定布局位置，避免抖动。

### 7.3 Select / Dropdown

- 触发器高度与输入一致。
- 菜单项高度 `32px`，左右内边距 `12px`。
- 当前选项使用 Accent Soft 背景与左侧 `2px` Cyan 标记。
- 菜单使用一个 Surface 层级和轻阴影，不使用发光描边。
- 支持键盘、滚动、视口翻转、Esc 和点击外部关闭。

### 7.4 Tabs / Segmented Control

- 页面主导航使用下划线 Tab。
- 模式切换使用 Segmented Control。
- 激活项只使用一种强调：下划线或 Soft Background，不同时使用高亮边框、文字色和填充色三种强调。

### 7.5 List

- 普通列表是一个分组 Surface，条目之间使用轻分隔线。
- 不把每个模型、任务、历史记录都做成独立卡片。
- 选中行使用 Accent Soft + 左侧标记。
- Hover、Selected 和 Focus 必须视觉可区分。

### 7.6 Empty / Loading / Error

- Empty：简短标题、说明和最多一个主操作；允许 Kuroii Cat `L2`。
- Loading：显示阶段文字和取消入口，不使用无限发光动画。
- Error：错误原因、恢复建议和重试动作必须同屏出现。
- 状态不能只用颜色表达，必须配合文字或图标。

## 8. App Shell

### 8.1 Desktop

- 左侧导航宽度：展开 `208–220px`，收起 `56–60px`。
- 顶部状态栏：`48px`，只保留宿主连接、AE / PR 版本、Local Service、刷新和语言 / 主题入口。
- 主内容独立滚动，侧栏和顶部栏固定。
- 侧栏按“工作区 / 创作工具 / 资源与管理 / 系统”分组。
- 侧栏选中项使用 Accent Soft 和单侧 Cyan 标记，不使用完整 Cyan 描边框。

### 8.2 窄屏

- `< 840px` 不显示横向图标导航带。
- 使用固定顶部栏 + 可打开的导航抽屉。
- 顶部栏始终保留 Logo / 当前页面、主题和语言入口。
- 不依赖 Hover Tooltip 解释触摸端图标。
- 页面只允许一个主滚动容器。

## 9. 首页 Command Workspace

### 9.1 桌面布局

```text
App Shell
├── Top Status Bar
├── Left Navigation
└── Main
    ├── Motion Command Composer
    ├── Recent Activity | Recommended Workflows
    ├── Quick Shortcuts
    └── Host / Selection / Model / Health Summary Band
```

### 9.2 Motion Command Composer

- 页面主标题为 `Motion Command` / `告诉小黑，你想让画面怎么动`。
- 大文本输入是首要视觉焦点。
- 主生成按钮位于输入框右下或右侧，只有一个 Cyan 主操作。
- 快捷命令作为轻量 Chip 行，不使用独立卡片。
- Kuroii Cat 位于输入区域旁的状态位置，占主内容宽度不超过 `15%`。

### 9.3 次级内容

- 最近任务和推荐工作流使用两列列表。
- 快速工作台入口使用统一小尺寸按钮，不展示所有产品功能。
- 宿主、选中内容、模型、项目健康合并为底部摘要带，不拆成多个卡片。
- Pro 升级是低频次要区域，不得与主生成按钮争夺视觉焦点。

## 10. Provider Hub

### 10.1 桌面

- 左侧 Profile 列表 `240–260px`，右侧详情占剩余宽度。
- 顶部只保留配置名称、Provider、复制、粘贴、删除和配置状态。
- `连接与模型 / 能力绑定` 使用下划线 Tab。
- 表单字段按任务分组，取消大面积卡片包裹。
- 模型能力分类使用紧凑过滤条。
- 模型列表使用表格 / 列表行，不使用每条独立卡片。
- 主要操作是“保存配置”；“测试连接”是 Secondary；刷新模型是图标按钮并带 Tooltip。

### 10.2 窄屏

- 不把左侧列表和右侧详情直接上下叠加。
- 默认显示 Profile 列表；选择后进入详情视图。
- 详情顶部提供返回按钮和当前配置名称。
- Profile 列表与详情各自只有一个主滚动容器。
- 底部保存操作可使用 Sticky Action Bar。

## 11. 图片生成工作区

### 11.1 桌面

- 左侧参数栏 `280–300px`。
- 中央画布为视觉主体，占剩余空间。
- 右侧历史 / 诊断使用可切换 Inspector，不默认同时展示两组信息。
- 默认打开“历史”；请求失败或用户主动查看时切换“诊断”。
- 空状态与画布使用同一主题 Surface，不出现亮卡片浮在纯黑画布上的割裂。
- 主操作固定在参数栏底部或命令区域末端。

### 11.2 窄屏

- 首屏顺序：预览 / 结果 → Prompt → 关键参数 → 生成按钮。
- 尺寸、质量、背景放入可折叠“生成设置”。
- 历史和诊断作为底部 Sheet 或独立 Tab。
- 预览不能被完整参数表单推到首屏之后。

## 12. 动效

```css
--motion-fast: 120ms;
--motion-normal: 180ms;
--motion-slow: 240ms;
--ease-standard: cubic-bezier(0.2, 0, 0, 1);
```

- Hover / Focus：`120ms`。
- Dropdown / Popover：`160–180ms` 淡入加 `4px` 位移。
- Panel / Sheet：`200–240ms`。
- 禁止按钮弹跳、持续发光和无意义缩放。
- `prefers-reduced-motion` 下关闭位移与非必要过渡。

## 13. 实施边界

本次视觉重构必须保留：

- 现有页面、导航功能和核心业务流程。
- Provider Profile、API Key Secret Store、能力绑定和模型刷新逻辑。
- 图片生成、历史、下载和再次使用逻辑。
- 当前中英文结构和现有品牌位图资产。

本次视觉重构不包含：

- 新增统一首页预览引擎。
- 新增视频或动效实时渲染能力。
- 修改 Provider 数据协议。
- 修改 API Key 存储边界。
- 新增营销页或重新设计产品功能范围。

## 14. 工程策略

- 不继续在 `styles.css` 末尾追加大段临时覆盖。
- 先建立 Token 层和基础组件层，再迁移页面。
- 允许按职责拆分样式文件，但必须保持现有加载入口兼容。
- 每个阶段必须同时检查 Dark、Light、1440px、390px。
- 每个视觉阶段都需要参考截图与实现截图同尺寸对照。

建议样式结构：

```text
apps/desktop/prototype/styles/
├── tokens.css
├── base.css
├── components.css
├── shell.css
├── home.css
├── provider-hub.css
├── image-workspace.css
└── responsive.css
```

## 15. 验收标准

- UI Scorecard 不低于 `85 / 100`。
- 一个页面最多一个高强调 Primary Action。
- 工作区正文不低于 `12px`，主体正文以 `13–14px` 为主。
- Dark、Light、Follow System 均可即时切换并持久化。
- `1440 × 900` 和 `390 × 844` 无横向溢出、无遮挡和不可达操作。
- Provider Hub 窄屏不出现列表与详情多层嵌套滚动。
- 图片工作区窄屏首屏可看到预览或结果区域。
- Dropdown、Tooltip、Modal、Toast、Scrollbar 在深浅主题中可读。
- Cyan 只用于主操作、当前选中、Focus 和关键链接。
- Pink 不用于普通操作和危险操作。
- 参考图和实现图按同视口逐页对照，明显差异必须修正后再验收。

## 16. 当前环境限制

工作区存在 `.git` 目录，但没有 `.git/HEAD`，当前不能识别为有效 Git 仓库，因此本规范暂时无法提交 Commit。规范文件、审计截图和选定视觉稿均已写入工作区。
