# Kuroii Motion AI Desktop

Desktop 是 Suite 的大脑、中控、工作流、Provider、任务、素材、诊断、安装更新与设置中心，不是放大的 AE/PR 扩展。

## v0.3.7 Desktop Command Center Runtime Wiring

当前已具备 Desktop Command Center 静态 UI 原型与可复用 runtime 状态层：

- `prototype/index.html`：可直接打开的命令中心原型。
- `src/local-service-client.js`：封装 `/hosts`、`/hosts/{host}/context`、`/actions/trusted`、`/commands`。
- `src/command-center.js`：生成 Host Cards、Host Context、Trusted Actions、Result History 的 view model。
- `src/command-center-fixtures.js`：统一 mock 数据。
- `src/command-center-runtime.js`：统一 `snapshot / subscribe / refresh / runReadOnlyAction` 状态流。

打开方式：`apps/desktop/prototype/index.html`。

当前不做最终 UI 精修，不连接真实 AE/PR 工程，只消费 Local Service mock 接口或本地 mock fixture。