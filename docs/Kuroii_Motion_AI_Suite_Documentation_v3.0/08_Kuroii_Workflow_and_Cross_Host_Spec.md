# Kuroii Workflow 与 Cross-Host 规范 v2.0

## 1. 节点类型

```text
Input
AI Task
Host Action
Condition
Transform
Asset
Wait
Approval
Output
```

## 2. 依赖

```text
宿主
版本
能力
Provider
模型能力
字体
插件
素材
动作版本
```

## 3. 典型流程

```text
多语言 AE
多尺寸 AE
PR 字幕本地化
30 秒转 15 秒
PR 粗剪 → AE 包装 → PR 回填
图像生成 → AE
视频生成 → PR
配音 → PR
```

## 4. Cross-Host Orchestrator

每一步包含：

```text
sourceHost
targetHost
dependency
inputArtifact
outputArtifact
timeout
retry
rollbackPolicy
approval
```

## 5. 执行策略

串行、并行、条件、人工确认、失败停止、失败继续、重试、回滚。

## 6. 第一阶段

先实现线性工作流与人工确认；复杂节点图后置。
