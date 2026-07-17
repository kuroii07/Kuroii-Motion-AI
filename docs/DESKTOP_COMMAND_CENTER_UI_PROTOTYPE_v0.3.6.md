# Desktop Command Center UI Prototype v0.3.6

## 完成内容

- 新增静态 UI 原型目录：`apps/desktop/prototype/`。
- 新增原型文件：
  - `index.html`
  - `styles.css`
  - `prototype.js`
  - `README.md`
- 原型覆盖 Desktop Command Center 首屏：
  - Host Cards
  - Host Context
  - Read-only Trusted Actions
  - Result History
  - Command Detail
  - Safety Notice
- 支持 Light / Dark 主题切换。
- 支持 zh-CN / en-US 图标按钮切换。
- 支持侧边栏展开 / 收起。
- 默认使用本地 mock 数据；Local Service 运行时可刷新 `/hosts`、`/hosts/{host}/context`、`/actions/trusted`、`/commands`。

## 打开方式

直接用浏览器打开：

```text
apps/desktop/prototype/index.html
```

不需要 npm，不需要启动开发服务器。

## UI 边界

本阶段只做可视化原型与交互状态，不做最终视觉精修，不连接真实 AE/PR 工程。

安全边界保持：

```text
riskLevel = 0
readOnly = true
requiresConfirmation = false
mutationPerformed = false
```

## 品牌与 UI 自检

- 基础 UI/UX：包含主题、语言、侧栏、Tooltip、组件状态、响应式断点。
- Kuroii Motion AI 品牌：Header / Host 状态使用 L1；空状态和轻提示使用 L2；动作列表与历史表格保持 L0。
- 未绘制临时 Kuroii Cat 或假 Logo。
- Provider Hub 与 Settings 仍保持独立，没有把模型配置塞进 Command Center。

## 验证

```powershell
python tests/smoke_desktop_ui_prototype.py
python tests/smoke_desktop_command_center.py
python tests/validate_v3_structure.py
```

## 未实现

- 还没有 React/Tauri 正式页面。
- 还没有真实 Desktop 窗口。
- 还没有真实 Host Agent 执行链路。
- 还没有命令详情弹窗、分页、过滤器和持久化布局。
- 还没有做最终 UI 视觉美化。

## 下一步

进入 `v0.3.7 Desktop Command Center Runtime Wiring`：把静态原型中的页面结构拆成可复用 Desktop runtime 模块，准备后续接 React/Tauri 或 WebView 壳。
