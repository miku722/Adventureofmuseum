# 时空之门 - 系统架构文档

## 概述

《时空之门》是一款基于AI的冒险解谜游戏，采用双层AI系统：**全局SystemPrompt**（上帝视角）和**NPC独立记忆系统**（角色视角），实现深度沉浸的对话体验。

## 核心系统架构

### 1. 全局游戏状态管理 (`GameCover.tsx`)

**作用**: 游戏的"中央大脑"，管理整个游戏的状态和流程

**关键功能**:
- 管理游戏阶段（封面 → 输入名字 → 章节0 → 章节1 → ...）
- 维护玩家信息（名字、选择）
- 记录所有叙事片段（narrativeSegments）
- 记录所有对话历史（conversationHistory）
- 传递状态给各个场景组件

**代码位置**: `/components/GameCover.tsx`

```typescript
const [gameState, setGameState] = useState({
  playerName: "",
  currentPhase: "cover",
  narrativeHistory: [],      // 所有故事片段
  conversationHistory: [],   // 所有对话记录
  playerChoice: null,
});
```

---

### 2. 全局SystemPrompt系统 (`gameSystemPrompt.ts`)

**作用**: 构建"上帝视角"的AI提示词，用于主线剧情AI（如"守望者"）

**特点**:
- ✅ 知道所有已发生的事件
- ✅ 知道所有场景的叙事内容
- ✅ 知道玩家在各个场景的选择
- ✅ 知道完整的对话历史
- ❌ **不知道未来剧情**（通过场景上下文控制）

**代码位置**: `/utils/gameSystemPrompt.ts`

**关键函数**:
```typescript
// 构建包含完整历史的SystemPrompt
buildGlobalSystemPrompt(gameState: GameState): string

// 为特定场景添加上下文
addSceneContext(basePrompt: string, sceneContext: string): string

// 预定义的场景上下文（防止AI泄露未来剧情）
SCENE_CONTEXTS.scene1  // 一成不变的工作
SCENE_CONTEXTS.scene2  // 失控的监控室
SCENE_CONTEXTS.scene3  // 不属于此世的光
// ... 等等
```

**使用场景**:
- Scene 1-5 的AI对话（守望者AI）
- 主线剧情推进
- 需要记住完整游戏历史的对话

---

### 3. NPC独立记忆系统 (`npcMemorySystem.ts`)

**作用**: 为每个NPC提供独立的身份、记忆和对话历史

**特点**:
- ✅ 每个NPC只知道自己的身份信息
- ✅ 只记得与玩家的对话历史
- ✅ 只知道从玩家处学到的信息
- ❌ **不知道游戏全局剧情**
- ❌ **不知道玩家在其他地方的经历**（除非玩家告诉他们）

**代码位置**: `/utils/npcMemorySystem.ts`

**核心概念**:

#### NPC身份 (NPCIdentity)
```typescript
{
  id: "vendor",
  name: "王老板",
  role: "集市小贩",
  personality: "精明、健谈、消息灵通",
  background: "在集市摆摊二十多年...",
  knowledge: [
    "集市上最近生意不太好",
    "码头的船夫行为古怪",
    // NPC天生知道的事情
  ],
  goals: "做生意赚钱，打听消息",
  secrets: "可选的秘密信息",
}
```

#### NPC记忆 (NPCMemory)
```typescript
{
  npcId: "vendor",
  conversationHistory: [
    { playerMessage: "...", npcResponse: "...", timestamp: ... },
  ],
  learnedInfo: [
    "玩家来自另一个世界",
    // 从玩家处学到的信息
  ],
  playerRelationship: 15,  // -100 到 100
  emotionalState: "curious",
  metPlayer: true,
}
```

**关键函数**:
```typescript
// 构建NPC专属的SystemPrompt
buildNPCSystemPrompt(identity: NPCIdentity, playerName: string): string

// 获取NPC当前应该使用的Prompt
getNPCPrompt(npcId: string, playerName: string): string

// 更新NPC记忆
updateNPCMemoryAfterChat(
  npcId: string,
  playerMessage: string,
  npcResponse: string,
  learnedInfo?: string[],
  emotionChange?: string,
  relationshipDelta?: number
): void
```

**使用场景**:
- 章节1的集市NPC对话
- 任何需要角色扮演的NPC
- 需要独立身份和记忆的角色

---

### 4. NPC对话组件 (`NPCChat.tsx`)

**作用**: 使用NPC记忆系统的AI对话界面

**特点**:
- 自动加载NPC的对话历史
- 第一次见面时NPC主动问候
- 每次对话自动更新NPC记忆
- 支持关系值和情绪系统
- 支持条件触发（onDialogueCondition）

**代码位置**: `/components/game/NPCChat.tsx`

**使用示例**:
```tsx
<NPCChat
  npcId="vendor"
  playerName={playerName}
  isOpen={true}
  onClose={() => setActiveNPC(null)}
  onDialogueCondition={(condition) => {
    if (condition === "mentioned_bronze_ding") {
      // 触发游戏事件
    }
  }}
/>
```

---

### 5. 传统对话框 (`DialogueBox.tsx`)

**作用**: 用于预设的、非AI的NPC对话

**特点**:
- 固定的对话脚本
- 打字机效果
- 适用于简单的、脚本化的对话

**代码位置**: `/components/game/DialogueBox.tsx`

**使用场景**:
- 不需要AI的简单NPC
- 教程对话
- 固定剧情对话

---

## 系统对比

| 特性 | 全局SystemPrompt | NPC记忆系统 |
|------|-----------------|-------------|
| **知识范围** | 所有已发生的事件 | 仅NPC自己的经历 |
| **记忆内容** | 所有场景叙事+对话 | 仅与玩家的对话 |
| **视角** | 上帝视角 | 角色视角 |
| **适用场景** | 主线AI（守望者） | 各类NPC |
| **AI身份** | 博物馆监控AI | 具体角色 |
| **是否知道未来** | 否（通过场景上下文控制） | 否（完全不知道） |
| **对话风格** | 统一（守望者风格） | 多样（根据NPC性格） |

---

## 工作流程

### 游戏启动流程

```
1. 玩家进入封面 (GameCover - phase: "cover")
   ↓
2. 点击"开始游戏"
   ↓
3. 输入角色名字 (NameInput - phase: "nameInput")
   ↓
4. 进入章节0介绍 (ChapterIntro - phase: "chapter0Intro")
   ↓
5. 进入场景1-5 (CombinedScenes1to5 - phase: "chapter0")
   使用：全局SystemPrompt系统
   AI角色：守望者（博物馆监控AI）
   ↓
6. 场景6：选择分支点 (Scene6_ChoicePoint)
   玩家选择：集市 / 皇宫 / 竹林
   ↓
7. 进入章节1 (Chapter1_Market - phase: "chapter1")
   使用：NPC独立记忆系统
   AI角色：各类NPC（小贩、和尚、船夫等）
```

### AI对话流程

#### 主线对话（使用全局SystemPrompt）

```
1. 场景组件调用 buildGlobalSystemPrompt(gameState)
   ↓
2. 添加场景上下文 addSceneContext(basePrompt, SCENE_CONTEXTS.scene1)
   ↓
3. 发送到DeepSeek API
   ↓
4. 获得AI回复
   ↓
5. 更新 gameState.conversationHistory
   ↓
6. 传递更新后的gameState给下一个场景
```

#### NPC对话（使用独立记忆）

```
1. NPCChat组件加载 getNPCPrompt(npcId, playerName)
   ↓
2. 检查是否第一次见面
   是 → 自动生成问候语
   否 → 加载对话历史
   ↓
3. 玩家输入消息
   ↓
4. 构建对话上下文（NPC SystemPrompt + 对话历史）
   ↓
5. 发送到DeepSeek API
   ↓
6. 获得NPC回复
   ↓
7. 调用 updateNPCMemoryAfterChat() 更新记忆
   - 记录对话
   - 更新学到的信息
   - 调整关系值
   - 更新情绪状态
```

---

## 场景组件架构

### 叙事场景基类 (`NarrativeSceneBase.tsx`)

**作用**: 可复用的叙事场景模板

**特点**:
- 自动播放旁白
- 空格键跳过
- 底部进度条
- 支持amber/cyan两种主题
- 左侧文字 + 右侧图片布局

**代码位置**: `/components/shared/NarrativeSceneBase.tsx`

**使用示例**:
```tsx
<NarrativeSceneBase
  segments={[
    { text: "第一段旁白..." },
    { text: "第二段旁白..." },
  ]}
  backgroundImage={image}
  imageAlt="场景描述"
  theme="amber"
  onComplete={() => handleComplete()}
/>
```

---

### 场景6优化 (`Scene6_ChoicePoint.tsx`)

**最新优化**:
1. ✅ **空格键提示优化**
   - 移到底部（仿照NarrativeSceneBase）
   - 不占据画面中心
   - 仅在旁白阶段显示

2. ✅ **选项UI位置优化**
   - 放在文本区域中间
   - 给文本预留空间（min-h-[300px]）
   - 选项不会太靠下

**代码位置**: `/components/Scene6_ChoicePoint.tsx`

---

## 预定义的NPC

### 集市区域

| NPC ID | 名字 | 身份 | 特点 | 秘密 |
|--------|------|------|------|------|
| `vendor` | 王老板 | 集市小贩 | 精明健谈，消息灵通 | - |
| `monk` | 慧明法师 | 云游僧人 | 慈悲睿智，说话带禅机 | 知道青铜鼎的真正用途 |
| `boatman` | 老张 | 码头船夫 | 粗犷直率，有点迷信 | 是被唤醒的文物守护者 |
| `scholar` | 李文儒 | 私塾先生 | 文雅博学，好奇心强 | - |
| `guard` | 刘守义 | 官府守卫 | 严肃忠诚，有正义感 | 发现上级隐瞒真相 |
| `beggar` | 疯老头 | 乞丐/守护者 | 表面疯癫，实则清醒 | 知道完整真相，需觉醒 |

**详细信息**: 参见 `/utils/npcMemorySystem.ts` 中的 `NPC_IDENTITIES`

---

## 调试工具

### GameStateDebugger

**作用**: 实时查看游戏状态

**代码位置**: `/components/GameStateDebugger.tsx`

**使用**:
```tsx
{import.meta.env.DEV && (
  <GameStateDebugger gameState={gameState} />
)}
```

### NPC记忆调试

```typescript
// 查看所有NPC记忆
console.log(npcMemoryManager.exportMemories());

// 查看特定NPC记忆
console.log(npcMemoryManager.getMemory("vendor"));
```

---

## 数据流图

```
┌─────────────────────────────────────────────────────┐
│                    GameCover                        │
│  ┌─────────────────────────────────────────────┐   │
│  │         gameState (全局游戏状态)             │   │
│  │  - playerName                                │   │
│  │  - currentPhase                              │   │
│  │  - narrativeHistory                          │   │
│  │  - conversationHistory                       │   │
│  │  - playerChoice                              │   │
│  └─────────────────────────────────────────────┘   │
└──────────┬──────────────────────────┬───────────────┘
           │                          │
           │                          │
    ┌──────▼──────┐          ┌────────▼────────┐
    │ 场景1-5     │          │   章节1         │
    │ (主线)      │          │  (NPC互动)      │
    └──────┬──────┘          └────────┬────────┘
           │                          │
           │                          │
    ┌──────▼────────────────┐  ┌──────▼──────────────┐
    │ gameSystemPrompt.ts   │  │ npcMemorySystem.ts  │
    │ (上帝视角)            │  │ (角色视角)          │
    └──────┬────────────────┘  └──────┬──────────────┘
           │                          │
           │                          │
    ┌──────▼──────┐          ┌────────▼────────┐
    │ 守望者AI    │          │   NPC AI        │
    │ (DeepSeek)  │          │  (DeepSeek)     │
    └─────────────┘          └─────────────────┘
```

---

## 开发指南

### 添加新场景（使用全局SystemPrompt）

1. 在 `gameSystemPrompt.ts` 的 `SCENE_CONTEXTS` 中添加场景上下文
2. 创建场景组件，使用 `buildGlobalSystemPrompt()` 和 `addSceneContext()`
3. 在场景中调用AI时传递完整的SystemPrompt
4. 更新 `gameState.conversationHistory` 和 `narrativeHistory`

### 添加新NPC（使用独立记忆）

1. 在 `npcMemorySystem.ts` 的 `NPC_IDENTITIES` 中定义身份
2. 使用 `<NPCChat>` 组件创建对话界面
3. 可选：根据对话条件触发游戏事件

### 场景间数据传递

通过 `GameCover.tsx` 中的 `gameState` 向下传递：

```tsx
// GameCover.tsx
<CombinedScenes1to5
  playerName={gameState.playerName}
  onComplete={(narrativeSegments, conversations) => {
    setGameState(prev => ({
      ...prev,
      narrativeHistory: [...prev.narrativeHistory, ...narrativeSegments],
      conversationHistory: [...prev.conversationHistory, ...conversations],
      currentPhase: "scene6Choice",
    }));
  }}
/>
```

---

## API配置

### DeepSeek API

**环境变量**: `VITE_DEEPSEEK_API_KEY`

**模型**: `deepseek-chat`

**使用位置**:
- `/components/CombinedScenes1to5.tsx` (全局SystemPrompt)
- `/components/game/NPCChat.tsx` (NPC记忆系统)

---

## 文件结构

```
/
├── App.tsx                           # 应用入口
├── components/
│   ├── GameCover.tsx                 # 游戏状态管理中心 ⭐
│   ├── CombinedScenes1to5.tsx        # 场景1-5（使用全局Prompt）
│   ├── Scene6_ChoicePoint.tsx        # 场景6选择点 ✨NEW
│   ├── Chapter1_Market.tsx           # 章节1：集市
│   ├── shared/
│   │   ├── NarrativeSceneBase.tsx    # 叙事场景基类
│   │   └── ChapterIntroBase.tsx      # 章节介绍基类
│   └── game/
│       ├── NPCChat.tsx               # NPC AI对话组件 ⭐NEW
│       ├── NPCInteractionExample.tsx # NPC交互示例 ✨NEW
│       ├── DialogueBox.tsx           # 传统对话框
│       └── README_NPC_MEMORY.md      # NPC系统文档 📖NEW
├── utils/
│   ├── gameSystemPrompt.ts           # 全局SystemPrompt系统 ⭐
│   └── npcMemorySystem.ts            # NPC记忆系统 ⭐NEW
└── SYSTEM_ARCHITECTURE.md            # 本文档 📖NEW
```

---

## 最佳实践

### 1. 使用全局SystemPrompt时

✅ **应该**:
- 在每个场景添加专门的场景上下文
- 防止AI泄露未来剧情
- 记录所有对话和叙事到 gameState

❌ **不应该**:
- 在prompt中包含未发生的剧情
- 跳过场景上下文直接使用全局prompt

### 2. 使用NPC记忆系统时

✅ **应该**:
- 给每个NPC设计清晰的身份和动机
- 设计有深度的秘密信息
- 利用关系系统创造不同对话分支

❌ **不应该**:
- 让NPC知道全局剧情
- 让NPC知道玩家在其他地方的经历（除非玩家告诉他们）

### 3. 场景设计

✅ **应该**:
- 使用 `NarrativeSceneBase` 复用代码
- 保持统一的UI风格（底部提示、进度条等）
- 给文本和选项预留足够空间

❌ **不应该**:
- 让UI元素占据画面中心（提示应在底部）
- 让选项太靠下或太靠上

---

## 更新日志

### 2024-11-XX - 最新更新

#### ✨ 新功能
1. **NPC独立记忆系统** (`npcMemorySystem.ts`)
   - 每个NPC拥有独立的身份、记忆和对话历史
   - 关系系统（-100到100）
   - 情绪状态系统
   - 学习能力（记住玩家告诉的信息）

2. **NPCChat组件** (`NPCChat.tsx`)
   - 使用NPC记忆系统的AI对话界面
   - 自动加载对话历史
   - 第一次见面主动问候
   - 支持条件触发

3. **NPC交互示例** (`NPCInteractionExample.tsx`)
   - 展示如何使用NPC系统
   - 可视化NPC状态和关系值
   - 开发调试工具

#### 🐛 优化修复
1. **Scene6优化**
   - 空格键提示移到底部
   - 选项UI位置优化（居中显示）
   - 给文本区域预留空间

#### 📖 文档
1. 创建 `README_NPC_MEMORY.md` - NPC系统使用指南
2. 创建 `SYSTEM_ARCHITECTURE.md` - 完整系统架构文档

---

## 未来扩展计划

### NPC系统
- [ ] NPC之间的关系网络
- [ ] NPC日程系统（不同时间在不同地点）
- [ ] 更细分的情绪系统
- [ ] NPC主动推理能力

### 游戏机制
- [ ] 保存/加载系统
- [ ] 成就系统
- [ ] 多结局系统
- [ ] 时间线系统

### UI/UX
- [ ] 对话历史查看器
- [ ] NPC关系图谱
- [ ] 剧情回顾功能

---

## 联系与支持

如有问题或建议，请查阅：
- `/components/game/README_NPC_MEMORY.md` - NPC系统详细文档
- `/utils/gameSystemPrompt.ts` - 全局Prompt系统
- `/utils/npcMemorySystem.ts` - NPC记忆系统

---

**文档版本**: 1.0  
**最后更新**: 2024-11-XX  
**维护者**: 时空之门开发团队
