# Desktop Command Center Runtime Smoke With Service v0.3.8

## 完成内容

- 新增 `tests/smoke_desktop_runtime_service.py`，在不启动真实 AE/PR 的前提下启动 Local Service mock 并验证 Desktop runtime 所需服务链路。
- Runtime 增加 `commandCenterRuntimeServiceSmoke` 元信息，明确当前 smoke 只覆盖：
  - `refresh()` 对应的 hosts / context / trusted actions / history 拉取链路。
  - `runReadOnlyAction()` 对应的只读 command 执行链路。
- Runtime 增加可注入的 `createCommandId` 与 `nowIso`，为后续 Node / React / Tauri 环境中的确定性测试预留入口。
- Desktop 壳层新增 `runtimeServiceSmoke` 声明，结构校验会检查此 smoke 不被遗漏。
- 根测试脚本新增 `test:desktop-runtime-service`，并纳入总 `test` 顺序。

## 验证范围

`smoke_desktop_runtime_service.py` 会自动完成：

```text
1. 寻找空闲 localhost 端口。
2. 启动 apps/local-service/src/server.py。
3. 注册 after-effects 与 premiere-pro mock Host Agent。
4. 拉取 /hosts 与 /hosts/{host}/context。
5. 拉取 /actions/trusted?host=after-effects。
6. 执行 ae.context.getActiveComp 只读 command。
7. 查询 /commands 与 /commands/{commandId}，确认 Result History 可回读。
```

## 安全边界

当前仍保持只读 mock：

```text
riskLevel = 0
readOnly = true
requiresConfirmation = false
mutationPerformed = false
```

没有真实 CSInterface 调用，没有写入 AE/PR 工程，没有文件系统工程修改。

## 环境说明

当前机器 `node` 不在 PATH，因此本切片使用 Python smoke 启动 Local Service 并验证 runtime 所需 HTTP 合约，同时静态检查 `command-center-runtime.js` 的 service-backed 接线标记。后续进入正式 Node / React / Tauri 环境时，可直接用 `createCommandId` 与 `nowIso` 注入做真正的 ESM runtime 执行测试。

## 验证

```powershell
python tests/smoke_desktop_runtime_service.py
python tests/smoke_desktop_runtime_wiring.py
python tests/validate_v3_structure.py
```

## 未实现

- 还没有正式 React/Tauri 页面消费 runtime。
- 还没有 Node 环境下的 ESM runtime 执行测试。
- 还没有 Result History 过滤、分页、详情抽屉状态机。
- 还没有真实 AE/PR Host Agent 执行链路。

## 下一步

进入 `v0.3.9 Desktop Command Center Detail and Filter State`：补 Result History 过滤、命令详情状态、运行中 / 错误恢复状态和 runtime view model 字段，为正式 Desktop 页面接 runtime 做最后一层交互契约。