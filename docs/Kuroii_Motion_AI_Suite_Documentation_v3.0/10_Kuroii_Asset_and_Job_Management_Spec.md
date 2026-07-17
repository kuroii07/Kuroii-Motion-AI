# Kuroii Asset 与 Job Management 规范 v2.0

## 1. Job 类型

LLM、Vision、Image、Video、Voice、STT、Music、SFX、Host Action、Workflow。

## 2. 状态

```text
Queued
Submitting
Generating
Polling
Downloading
Importing
WaitingForHost
Executing
Completed
Failed
Cancelled
Expired
```

## 3. Asset 生命周期

```text
Generated
Downloaded
Imported
Used
Unused
Archived
Deleted
```

## 4. 元数据

Provider、Model、Prompt、Negative Prompt、Seed、参数、时间、路径、项目、宿主对象、版权备注、版本链。

## 5. 缓存

临时缓存、项目素材、收藏素材、可清理素材。提供容量、自动清理、保留规则和移动项目目录。

## 6. 导入

保存、导入 AE、导入 PR、指定文件夹/Bin、插入合成/时间线、替换占位、稍后处理。

## 7. 成本

显示估算和调用统计，但明确以第三方平台账单为准。
