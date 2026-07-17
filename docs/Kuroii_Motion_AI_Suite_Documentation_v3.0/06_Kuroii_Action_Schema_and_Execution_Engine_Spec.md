# Kuroii Action Schema 与 Execution Engine 规范 v2.0

## 1. 原则

AI 生成结构化 Action；Host Adapter 执行可信动作。AI 不直接自由操控宿主。

## 2. Action Schema

```text
actionId
schemaVersion
host
targets
params
riskLevel
requiresConfirmation
supportsUndo
supportsDryRun
```

## 3. Capability Registry

记录：

```text
能力 ID
宿主
宿主版本
所需模型能力
执行类型
风险
Undo
批量
Desktop 依赖
参数 Schema
权限
测试状态
```

## 4. 执行阶段

```text
Parse
Resolve Capability
Validate Context
Validate Parameters
Plan
Safety Check
Dry Run
Confirm
Snapshot
Execute
Verify
Log
Commit / Rollback
```

## 5. Action 类型

```text
Trusted Action
Generated Script
Saved Script
Workflow Action
Read-only Analyzer
```

## 6. 脚本安全

```text
静态扫描
危险 API
文件系统访问
网络调用
循环上限
批量上限
删除 / 覆盖
目标范围
```

## 7. 风险等级

```text
0 只读
1 局部可撤销
2 批量修改
3 工程结构
4 文件 / 渲染
5 删除 / 覆盖 / 外部脚本
```

## 8. 计划预览

显示目标宿主、目标对象、影响数量、步骤、预计耗时、风险、Undo、是否创建副本和依赖。
