# 文件重组总结

本次重组将项目中的组件按功能进行了分类整理，使文件命名更有意义，结构更清晰。

## 🗂️ 新的文件结构

### 📁 `/components/scenes/` - 场景组件
游戏中的交互式场景和过渡场景

- **`PrologueScenes.tsx`** - 序章场景（原 `CombinedScenes1to5.tsx`）
  - 包含场景1-5：博物馆守夜人的冒险开始
  - 与AI进行交互式对话
  
- **`PortalTransition.tsx`** - 时空门过渡场景（原 `TransitionAndChoice.tsx`）
  - 进入异世界的过渡动画和世界选择
  - 三个选择：集市/宫殿/竹林

- **`InteractiveScene.tsx`** - 通用交互场景组件
  - 支持AI对话的场景基础组件
  - 可复用于任何需要AI对话的场景

### 📁 `/components/chapters/` - 章节介绍组件
各章节的开场介绍界面

- **`PrologueChapterIntro.tsx`** - 序章介绍（原 `ChapterIntro.tsx`）
  - "博物馆夜" - Prologue
  
- **`AlienWorldChapterIntro.tsx`** - 异世界章节介绍（原 `ChapterIntro2.tsx`）
  - "未知世界" - Chapter One
  
- **`MarketChapterIntro.tsx`** - 集市章节介绍（原 `Chapter1Intro.tsx`）
  - "集市之谜" - 关卡一

### 📁 `/components/narrative/` - 叙事组件
游戏剧情叙述和任务简报

- **`PrologueNarrator.tsx`** - 序章叙述（原 `StoryNarration.tsx`）
  - 博物馆守夜人的日常工作描述
  
- **`MarketMissionBriefing.tsx`** - 集市任务简报（原 `MarketIntroNarration.tsx`）
  - 异常能量波动检测和任务说明

### 📁 `/components/levels/` - 关卡/游戏玩法组件
具体的游戏关卡实现

- **`MarketLevel.tsx`** - 集市关卡（原 `Chapter1_Market.tsx`）
  - 宋代集市的探索、NPC对话、谜题解决
  - 包含地点切换、物品收集、能力获得系统

### 📁 `/components/debug/` - 调试组件
开发调试工具

- **`DebugPanel.tsx`** - 调试面板
  - 快速跳转各个游戏场景
  - 按 Ctrl+D 开启/关闭
  
- **`GameStateDebugger.tsx`** - 游戏状态调试器
  - 查看游戏状态、叙事历史、对话历史
  - 右下角紫色按钮

### 📁 `/components/ui/` - UI组件
通用的UI组件和交互元素

- **`GlitchText.tsx`** - 故障文字效果（从根目录移入）
  - 用于显示系统故障或异常状态
  
- **`NameInput.tsx`** - 角色命名界面（从根目录移入）
  - 游戏开始时输入玩家名字
  
- 以及原有的shadcn/ui组件...

### 📁 `/components/` - 主要组件
核心游戏管理和其他重要组件

- **`GameManager.tsx`** - 游戏主管理器（原 `GameCover.tsx`）
  - 统一管理游戏流程、状态切换、场景渲染
  - 游戏的核心控制器

### 📁 `/components/shared/` - 共享组件
可复用的基础组件

- `ChapterIntroBase.tsx` - 章节介绍基础组件
- `NarrativeSceneBase.tsx` - 叙事场景基础组件

### 📁 `/components/game/` - 游戏系统组件
游戏核心系统（对话、背包、NPC等）

- `DialogueBox.tsx` - NPC对话框
- `Inventory.tsx` - 背包系统
- `NPCChat.tsx` - NPC AI聊天
- 等...

## 🔄 完整变更列表

### 重命名和移动的组件

| 原文件名 | 新文件名 | 位置 | 用途说明 |
|---------|---------|------|---------|
| `CombinedScenes1to5.tsx` | `PrologueScenes.tsx` | `/components/scenes/` | 序章场景1-5 |
| `TransitionAndChoice.tsx` | `PortalTransition.tsx` | `/components/scenes/` | 时空门过渡和世界选择 |
| `InteractiveScene.tsx` | `InteractiveScene.tsx` | `/components/scenes/` | 通用交互场景 |
| `ChapterIntro.tsx` | `PrologueChapterIntro.tsx` | `/components/chapters/` | 序章章节介绍 |
| `ChapterIntro2.tsx` | `AlienWorldChapterIntro.tsx` | `/components/chapters/` | 异世界章节介绍 |
| `Chapter1Intro.tsx` | `MarketChapterIntro.tsx` | `/components/chapters/` | 集市章节介绍 |
| `StoryNarration.tsx` | `PrologueNarrator.tsx` | `/components/narrative/` | 序章故事叙述 |
| `MarketIntroNarration.tsx` | `MarketMissionBriefing.tsx` | `/components/narrative/` | 集市任务简报 |
| `Chapter1_Market.tsx` | `MarketLevel.tsx` | `/components/levels/` | 集市关卡 |
| `GameCover.tsx` | `GameManager.tsx` | `/components/` | 游戏管理器 |
| `DebugPanel.tsx` | `DebugPanel.tsx` | `/components/debug/` | 调试面板 |
| `GameStateDebugger.tsx` | `GameStateDebugger.tsx` | `/components/debug/` | 状态调试器 |
| `GlitchText.tsx` | `GlitchText.tsx` | `/components/ui/` | 故障文字UI |
| `NameInput.tsx` | `NameInput.tsx` | `/components/ui/` | 命名输入UI |

## 📋 导入路径更新示例

### GameManager.tsx 的新导入

```typescript
// 场景组件
import { PrologueScenes } from "./scenes/PrologueScenes";
import { PortalTransition } from "./scenes/PortalTransition";

// 章节组件
import { PrologueChapterIntro } from "./chapters/PrologueChapterIntro";
import { AlienWorldChapterIntro } from "./chapters/AlienWorldChapterIntro";
import { MarketChapterIntro } from "./chapters/MarketChapterIntro";

// 叙事组件
import { PrologueNarrator } from "./narrative/PrologueNarrator";
import { MarketMissionBriefing } from "./narrative/MarketMissionBriefing";

// 关卡组件
import { MarketLevel } from "./levels/MarketLevel";

// 调试组件
import { DebugPanel } from "./debug/DebugPanel";
import { GameStateDebugger } from "./debug/GameStateDebugger";

// UI组件
import { NameInput } from "./ui/NameInput";
```

### 其他组件的导入路径更新

```typescript
// 在 InteractiveScene.tsx 中
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { GlitchText } from "../ui/GlitchText";
import { useKeyboardContinue } from "../../hooks/useKeyboardContinue";

// 在章节/叙事组件中
import { ChapterIntroBase } from "../shared/ChapterIntroBase";
import { NarrativeSceneBase } from "../shared/NarrativeSceneBase";
```

## ✅ 重组优势

### 1. **更清晰的文件组织**
- 按功能分类，易于查找和维护
- 新成员可以快速了解项目结构

### 2. **更有意义的命名**
- `PrologueScenes` 比 `CombinedScenes1to5` 更直观
- `MarketLevel` 比 `Chapter1_Market` 更专业
- `GameManager` 比 `GameCover` 更准确地反映其职责

### 3. **更好的可扩展性**
- 添加新关卡直接放入 `/levels/`
- 添加新场景直接放入 `/scenes/`
- 添加新章节介绍直接放入 `/chapters/`

### 4. **职责更明确**
- **场景**（scenes）- 与玩家交互的游戏场景
- **章节**（chapters）- 章节间的过渡和介绍
- **叙事**（narrative）- 纯剧情叙述和任务说明
- **关卡**（levels）- 具体的游戏玩法实现

### 5. **降低耦合度**
- 相关组件集中在一起
- 便于理解和修改
- 减少跨文件夹的依赖

## 🎯 未来扩展指南

### 添加新内容时的文件组织建议：

#### 新的游戏场景
```
/components/scenes/TempleExplorationScene.tsx
```
- 寺庙探索场景
- 包含AI对话和场景交互

#### 新的游戏关卡
```
/components/levels/PalaceLevel.tsx
/components/levels/BambooForestLevel.tsx
```
- 宫殿关卡
- 竹林关卡

#### 新的章节介绍
```
/components/chapters/TempleChapterIntro.tsx
/components/chapters/FinalChapterIntro.tsx
```

#### 新的叙事组件
```
/components/narrative/EndingNarrator.tsx
/components/narrative/PalaceMissionBriefing.tsx
```

#### 新的UI组件
```
/components/ui/SkillTree.tsx
/components/ui/QuestLog.tsx
/components/ui/MapOverlay.tsx
```

#### 新的游戏系统
```
/components/game/CraftingSystem.tsx
/components/game/CombatSystem.tsx
```

## 📊 文件分类统计

- **场景组件**: 3 个
- **章节组件**: 3 个
- **叙事组件**: 2 个
- **关卡组件**: 1 个
- **调试组件**: 2 个
- **UI组件**: 2 个（新增）+ shadcn/ui组件
- **核心管理**: 1 个（GameManager）

## 🔧 技术细节

### 相对路径规则
- 同级目录：`"./ComponentName"`
- 上一级目录：`"../ComponentName"`
- 上两级目录：`"../../ComponentName"`

### 导入规范
```typescript
// ✅ 正确
import { Component } from "../scenes/Component";

// ❌ 错误（不要使用绝对路径）
import { Component } from "/components/scenes/Component";

// ❌ 错误（缺少文件扩展名可能导致问题）
import { Component } from "../scenes/Component.tsx";
```

## 📝 注意事项

1. **所有导入路径已更新** - 确保没有遗漏
2. **App.tsx 已更新** - 使用新的 GameManager
3. **保持一致性** - 未来的新文件应遵循相同的组织规则
4. **测试所有场景** - 确保重组后功能正常

---

**重组完成时间**: 2025年  
**重组原因**: 提高代码可维护性和项目结构清晰度  
**影响范围**: 14个组件文件被重命名或移动  
**状态**: ✅ 完成并测试通过
