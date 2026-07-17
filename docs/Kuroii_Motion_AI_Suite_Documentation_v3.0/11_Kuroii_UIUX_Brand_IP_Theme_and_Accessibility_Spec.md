# Kuroii UI/UX、Brand IP、Theme 与 Accessibility 规范 v1.0

## 1. 设计系统分层

```text
Base UI System
- Color
- Typography
- Spacing
- Radius
- Shadow
- Component
- Theme
- Responsive
- Accessibility

Brand Layer
- Logo
- Icon
- Kuroii Cat
- Hero
- Illustration
- Motion
- Brand Tone
```

## 2. 主题

支持：

```text
Light
Dark
Follow System
```

要求：

- 一键切换
- 无需重启
- Desktop / AE / PR 即时生效
- 可同步或各端独立
- 设置持久化
- 所有按钮、文字、输入、下拉、Tooltip、Popover、Dialog、Toast、Table、Code Editor、Workflow Node、Scrollbar、Loading、Empty、Error 全量适配
- 禁止简单反色
- 禁止业务组件硬编码颜色

## 3. Design Tokens

至少：

```text
bg.app
bg.panel
bg.card
bg.elevated
bg.hover
bg.selected

text.primary
text.secondary
text.tertiary
text.disabled
text.inverse

border.default
border.subtle
border.focus
border.error

accent.primary
accent.hover
accent.pressed
accent.soft

state.success
state.warning
state.error
state.info

shadow.*
radius.*
spacing.*
tooltip.*
scrollbar.*
```

## 4. 语言

首发：

```text
zh-CN
en-US
```

后续：

```text
ja-JP
ko-KR
```

要求：

- 运行时一键切换
- 无需重启
- 持久化
- Follow System
- 缺失翻译回退 en-US
- 禁止硬编码文案
- 中英文长度测试
- 日文禁则与韩文换行
- 窄面板溢出检查
- 字体回退

## 5. 侧边栏

展开状态显示图标、名称、选中态、分组。收起状态只显示图标、选中态和状态角标。

要求：

- 展开/收起按钮始终可见
- 点击区域足够大
- 支持键盘
- 状态持久化
- Desktop 展开约 220–260px，收起约 56–72px
- 扩展窄屏可转底部或图标导航
- 禁止横向溢出

## 6. Tooltip

所有纯图标或语义不明确的操作必须有 Hover / Focus Tooltip。

覆盖：

```text
侧栏
顶部工具栏
返回
刷新
复制
删除
运行
验证
预览
帮助
主题
语言
Provider
Host
弹窗关闭
列表 / 表格操作
工作流节点工具
```

要求：

- 300–500ms 延迟
- 离开快速消失
- 支持键盘 Focus
- 屏幕边缘翻转
- Light / Dark 适配
- 可显示快捷键、状态或风险

## 7. 信息密度

```text
Compact
Comfortable
Spacious
```

AE/PR 默认 Compact，Desktop 专业模式 Compact/Comfortable，普通设置 Comfortable。

## 8. Typography

层级：

```text
Display
H1
H2
H3
Title
Body
Body Small
Caption
Label
Code
```

中文、英文、日文、韩文与代码字体分别配置回退。时间码、参数、代码用等宽字体。

## 9. 响应式断点

```text
XS < 280px
SM 280–360px
MD 360–520px
LG 520–800px
XL > 800px
```

定义侧栏、底部导航、卡片列数、Inspector、按钮文字、表格转卡片等行为。

## 10. 图标系统

```text
16 / 20 / 24 / 32
统一线宽
统一圆角
线性 / 实心使用规则
Light / Dark
Hover
Selected
Disabled
High Contrast
```

禁止混用图标风格或 Emoji 代替功能图标。

## 11. 组件状态

所有组件必须有：

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

## 12. 键盘与无障碍

支持 Tab、Shift+Tab、Enter、Space、Esc、方向键。Focus Ring 清晰。颜色不得是唯一信息来源。

预留：

```text
High Contrast
Reduce Transparency
Reduce Motion
```

## 13. Loading

```text
短时：Spinner / Button Loading
中时：Skeleton / Progress
长时：Job 状态 / 阶段 / 取消 / 后台运行
```

Kuroii Cat 可以辅助反馈，但必须同时提供正式文本与进度。

## 14. Empty / Error

每个列表、表格、Provider、项目、任务、素材页都必须有 Empty / Error。

错误细分：

```text
Network
Permission
Provider
Host Offline
Incompatible
Cancelled
Unknown
```

不得统一显示“操作失败”。

## 15. Z-Index

```text
Base
Sticky Header
Sidebar
Dropdown
Popover
Tooltip
Toast
Modal
Critical Modal
System Overlay
```

禁止临时写 9999。

## 16. Scroll

明确 Sidebar、Header、Footer Action Bar、Inspector、Modal 的滚动和固定行为。扩展中主操作按钮不得滚出视野。

## 17. Table / List

统一列宽、排序、筛选、固定列、批量、分页、虚拟滚动、Hover、Selected、Disabled。窄屏转卡片。

## 18. 危险操作视觉

```text
低风险：普通确认
中风险：黄色
高风险：红色
不可逆：二次确认或输入确认词
```

## 19. 品牌 IP 分级

```text
L0 不出现：代码、数据密集区
L1 图标级：Header、状态
L2 小插画：空状态、帮助、成功
L3 完整角色：首页、首次启动、品牌宣传、更新
```

状态：

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

动作与表情要克制、专业、不儿童化。

## 20. 品牌资产

```text
横版 Logo
竖版 Logo
纯图标
单色版
深色版
浅色版
小尺寸版
Desktop Icon
AE Icon
PR Icon
Tray Icon
Hero
Empty States
Dialog States
Status Expressions
Motion States
```

## 21. 不可妥协规则

1. 不允许只适配深色。
2. 不允许纯图标无 Tooltip。
3. 不允许侧栏收起后失去识别。
4. 不允许硬编码颜色。
5. 不允许硬编码文案。
6. 不允许缺少 Hover / Focus / Disabled / Error。
7. 不允许 Dropdown / Tooltip / Modal 主题失配。
8. 不允许窄窗口横向溢出。
9. 不允许品牌 IP 干扰专业效率。
10. 不允许未经自检标记完成。
