# 游戏全局状态架构文档

## 概述

本文档描述了"时空之门"游戏的全局状态管理系统和SystemPrompt架构。

## 核心理念：游戏上帝视角 🎮

游戏的SystemPrompt现在是一个**全局的"游戏上帝"**，它了解整个游戏世界中已经发生的所有事件，但绝不会泄露未来的剧情。

```
游戏上帝 = 基础设定 + 所有已发生的事件 + 当前场景信息
```

## 架构组件

### 1. GameState 接口

位置：`/utils/gameSystemPrompt.ts`

```typescript
export interface GameState {
  playerName: string;                    // 玩家名字
  currentPhase: string;                  // 当前游戏阶段
  currentScene?: string;                 // 当前场景描述
  narrativeHistory: string[];            // 所有叙事片段历史
  conversationHistory: string[];         // 所有对话历史
  playerChoice?: "market" | "palace" | "bamboo" | null; // 玩家选择
}
```

### 2. 全局SystemPrompt构建函数

**buildGlobalSystemPrompt(gameState: GameState): string**

该函数动态构建SystemPrompt，包含：

1. **基础设定** - 守望者AI的核心身份和性格
   - 职业：博物馆智能监控系统AI
   - 名字：守望者
   - 性格：专业、冷静、理性，但有人性化的一面

2. **当前游戏信息**
   - 玩家名字
   - 当前阶段
   - 当前场景
   - 玩家选择

3. **已发生的故事** (narrativeHistory)
   - 所有叙事片段按顺序排列
   - 每个片段标注为【片段N】

4. **对话历史** (conversationHistory)
   - 所有场景的对话记录
   - 包括玩家和AI的完整对话

### 3. 场景上下文系统

**SCENE_CONTEXTS** - 预定义的场景提示词

每个场景都有特定的上下文提示，包括：
- 当前状态（AI的心理状态）
- 情境描述（发生了什么）
- AI应该做什么
- 语气和风格

目前支持的场景：
- `scene1` - 一成不变的工作
- `scene2` - 失控的监控室
- `scene3` - 不属于此世的光
- `scene4` - 文明的断裂
- `scene5` - 使命的召唤
- `market` - 异世界市场场景

**addSceneContext(basePrompt: string, sceneContext: string): string**

将场景特定的上下文添加到全局SystemPrompt中。

## 数据流

```
GameCover (全局状态管理)
    ↓
    ├─ narrativeHistory[]
    ├─ conversationHistory[]
    └─ currentPhase/Scene
    ↓
CombinedScenes1to5 (场景管理)
    ↓
    ├─ buildGlobalSystemPrompt() ← 获取所有已发生的事件
    ├─ addSceneContext() ← 添加当前场景上下文
    └─ 传递完整的SystemPrompt给AI
    ↓
InteractiveScene (AI对话)
    ↓
    返回对话历史
    ↓
更新 GameState.conversationHistory
```

## 关键特性

### ✅ 叙事连贯性

AI能够在不同场景间保持记忆，引用之前发生的事件和对话。

**示例：**
```
场景2中，AI可以说："刚才您还在巡逻时一切正常，但现在..."
场景3中，AI可以说："青铜鼎的异常刚才我报告过，现在..."
```

### ✅ 无未来剧透

SystemPrompt只包含**已发生**的内容，永远不会包含未来场景的信息。

**实现方式：**
- 每个场景完成后才添加到历史
- 使用`onUpdateGameState`回调实时更新状态
- 动态构建，而不是预先加载所有剧情

### ✅ 灵活扩展

添加新场景只需：
1. 在`SCENE_CONTEXTS`中添加场景上下文
2. 在场景配置中引用该上下文
3. 无需修改核心逻辑

## 使用示例

### 在GameCover中管理全局状态

```typescript
const [gameState, setGameState] = useState<GameState>({
  playerName: "",
  currentPhase: "cover",
  currentScene: undefined,
  narrativeHistory: [],
  conversationHistory: [],
  playerChoice: null,
});

// 当叙事组件完成时，添加叙事到历史
<StoryNarration
  onComplete={(narratives) => {
    setGameState((prev) => ({
      ...prev,
      narrativeHistory: [
        ...prev.narrativeHistory,
        "【博物馆之夜的序章】\n" + narratives.join("\n\n"),
      ],
    }));
    setGamePhase("scenes");
  }}
/>
```

### 在场景组件中使用全局状态

```typescript
<CombinedScenes1to5
  playerName={playerName}
  gameState={gameState}
  onUpdateGameState={setGameState}
  onComplete={() => {
    setGamePhase("chapter2");
  }}
/>
```

### 构建SystemPrompt

```typescript
const buildSystemPrompt = () => {
  // 1. 获取全局基础prompt（包含所有已发生的事件）
  const basePrompt = buildGlobalSystemPrompt({
    ...gameState,
    currentScene: `场景${currentScene}：${title}`,
  });
  
  // 2. 添加当前场景的特定上下文
  const sceneContext = SCENE_CONTEXTS[sceneKey];
  return addSceneContext(basePrompt, sceneContext);
};
```

## SystemPrompt结构示例

```
你是博物馆的智能监控系统AI助手，名叫"守望者"。

【你的核心身份】
- 你是博物馆的高级智能监控系统
- ...

【当前游戏信息】
- 玩家名字：张三
- 当前阶段：scenes
- 当前场景：场景2：失控的监控室

===已发生的故事===

【片段1】
【博物馆之夜的序章】
这是你担任守夜人的第三年...

【片段2】
【场景1：一成不变的工作】
你坐在监控台面前...

===对话历史===

【场景1对话】
守望者：晚上好，张三...
张三：有什么需要注意的吗？
守望者：...

===当前场景指令===

当前状态：震惊、困惑、试图保持冷静但明显慌乱

突发事件：
- 午夜钟声响起的瞬间，主展厅A区的监控出现异常
- ...
```

## 未来优化方向

1. **持久化存储**
   - 将GameState保存到localStorage
   - 实现游戏存档/读档功能

2. **场景回溯**
   - 允许玩家查看之前场景的对话历史
   - 实现"回忆"功能

3. **分支剧情**
   - 根据玩家选择记录不同的故事分支
   - AI根据选择给出不同反应

4. **统计分析**
   - 跟踪玩家的选择和对话风格
   - AI根据玩家行为调整回复

5. **多语言支持**
   - 将叙事和对话历史翻译为其他语言
   - 保持跨语言的连贯性

## 注意事项

⚠️ **重要提醒：**

1. 所有叙事组件完成时都应该调用`onUpdateGameState`
2. 对话完成时必须返回对话历史
3. 永远不要在SystemPrompt中包含未来场景的信息
4. 保持GameState的不可变性，使用函数式更新

## 文件清单

- `/utils/gameSystemPrompt.ts` - 全局SystemPrompt构建器
- `/components/GameCover.tsx` - 全局状态管理
- `/components/CombinedScenes1to5.tsx` - 场景1-5使用全局状态
- `/components/StoryNarration.tsx` - 返回叙事片段
- `/components/InteractiveScene.tsx` - AI对话组件

---

**文档版本**: 1.0  
**最后更新**: 2025-11-07  
**作者**: AI Assistant
