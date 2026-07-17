# Desktop Command Center First Slice v0.3.5

## 完成内容

- 新增 `apps/desktop/src/local-service-client.js`，封装 Desktop 到 Local Service 的 HTTP 客户端。
- 新增 `apps/desktop/src/command-center.js`，提供 Command Center 的安全策略、Host Context 摘要、Trusted Actions 列表和 Result History view model。
- Desktop 壳层新增 Local Service 依赖声明：
  - `/hosts`
  - `/hosts/{host}/context`
  - `/actions/trusted`
  - `/commands`
- Desktop 导航新增 `command-center`，中英文 i18n 新增命令中心相关文案。
- 新增 `tests/smoke_desktop_command_center.py`，同时验证 Desktop 静态契约与 Local Service 真实端点。

## 当前边界

本切片只做 Desktop 功能骨架，不做视觉精修，不进入真实 AE/PR 宿主测试。

Command Center 当前只允许：

```text
riskLevel = 0
readOnly = true
requiresConfirmation = false
```

非只读动作仍由 Local Service 返回 `ACTION_OUT_OF_SCOPE` 或 `WAITING_FOR_CONFIRMATION`。

## Desktop 页面骨架

```text
Host Cards
Host Context
Trusted Actions
Result History
Command Detail
Safety Notice
```

品牌使用级别：

```text
Header / host status: L1
Empty state: L2
Trusted Actions / Result History data area: L0
```

## 验证

```powershell
python tests/smoke_desktop_command_center.py
python tests/smoke_action_execution.py
python tests/smoke_host_connection.py
python tests/smoke_local_service.py
python tests/smoke_provider_hub.py
python tests/validate_v3_structure.py
```

## 未实现

- 还没有真实 React/Tauri/Desktop UI 页面。
- 还没有真实按钮触发和页面状态持久化。
- 还没有命令详情弹窗、过滤器、分页和错误恢复 UI。
- 还没有连接真实 AE/PR CSInterface。

## 下一步

进入 `v0.3.6 Desktop Command Center UI Prototype`：在 Desktop 壳里做可视化原型页面，展示 Host Cards、Context、Trusted Actions、Result History 与 Safety Notice，仍保持只读 mock。
