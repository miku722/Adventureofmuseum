# NPC独立记忆系统使用指南

## 概述

NPC独立记忆系统为游戏中的每个NPC提供了独立的身份、记忆和对话历史。每个NPC只知道自己的身份信息和与玩家的互动，**不知道游戏的"上帝视角"**，这使得对话更加真实和沉浸。

## 核心概念

### 1. 与全局SystemPrompt的区别

- **全局SystemPrompt** (`gameSystemPrompt.ts`): "上帝视角"
  - 包含所有已发生的事件
  - 包含所有场景的叙事片段
  - 包含玩家在所有场景的选择
  - 用于主线剧情的AI对话（如"守望者"AI）

- **NPC SystemPrompt** (`npcMemorySystem.ts`): "角色视角"
  - 只包含NPC自己的身份信息
  - 只包含与玩家的对话历史
  - 只包含NPC从玩家处学到的信息
  - 不知道玩家在其他地方的经历
  - 用于NPC角色的AI对话

### 2. NPC记忆结构

每个NPC拥有：

```typescript
interface NPCMemory {
  npcId: string;                // NPC唯一ID
  conversationHistory: [];      // 对话历史
  learnedInfo: string[];        // 从玩家处学到的信息
  playerRelationship: number;   // 与玩家的关系值 (-100到100)
  emotionalState: string;       // 当前情绪状态
  metPlayer: boolean;           // 是否已见过玩家
}
```

### 3. NPC身份信息

每个NPC都有预定义的身份：

```typescript
interface NPCIdentity {
  id: string;           // 唯一ID
  name: string;         // 姓名
  role: string;         // 职业/身份
  personality: string;  // 性格特点
  background: string;   // 背景故事
  location: string;     // 所在地点
  knowledge: string[];  // 初始知识（天然知道的事情）
  goals?: string;       // 目标/动机
  secrets?: string;     // 秘密信息
}
```

## 使用方法

### 1. 在组件中使用NPCChat

```tsx
import { NPCChat } from "./game/NPCChat";
import { useState } from "react";

function YourComponent({ playerName }) {
  const [activeNPC, setActiveNPC] = useState<string | null>(null);

  return (
    <>
      {/* 点击NPC打开对话 */}
      <button onClick={() => setActiveNPC("vendor")}>
        与王老板对话
      </button>

      {/* NPC对话界面 */}
      <NPCChat
        npcId="vendor"
        playerName={playerName}
        isOpen={activeNPC === "vendor"}
        onClose={() => setActiveNPC(null)}
        onDialogueCondition={(condition) => {
          // 可选：处理特殊对话条件
          console.log("触发条件:", condition);
        }}
      />
    </>
  );
}
```

### 2. 添加新的NPC

在 `/utils/npcMemorySystem.ts` 的 `NPC_IDENTITIES` 中添加：

```typescript
export const NPC_IDENTITIES: Record<string, NPCIdentity> = {
  // 现有NPC...
  
  // 添加新NPC
  newNPC: {
    id: "newNPC",
    name: "新NPC名字",
    role: "新NPC职业",
    personality: "性格描述",
    background: "背景故事",
    location: "所在位置",
    knowledge: [
      "这个NPC天然知道的事情1",
      "这个NPC天然知道的事情2",
    ],
    goals: "这个NPC的目标",
    secrets: "这个NPC的秘密（可选）",
  },
};
```

### 3. 手动更新NPC记忆

如果需要在对话之外更新NPC记忆（例如剧情事件）：

```typescript
import { npcMemoryManager } from "../../utils/npcMemorySystem";

// 让NPC学习新信息
npcMemoryManager.learnInfo("vendor", "玩家来自现代世界");

// 更新关系值
npcMemoryManager.updateRelationship("vendor", 10); // +10好感度

// 更新情绪状态
npcMemoryManager.updateEmotion("vendor", "excited");
```

### 4. 获取NPC当前状态

```typescript
import { npcMemoryManager } from "../../utils/npcMemorySystem";

const memory = npcMemoryManager.getMemory("vendor");
console.log("关系值:", memory.playerRelationship);
console.log("情绪:", memory.emotionalState);
console.log("是否见过玩家:", memory.metPlayer);
console.log("学到的信息:", memory.learnedInfo);
```

## 已预定义的NPC

### 1. 王老板 (vendor)
- **身份**: 集市小贩
- **性格**: 精明、健谈、消息灵通
- **知识**: 集市八卦、周边情况
- **目标**: 做生意赚钱，打听消息

### 2. 慧明法师 (monk)
- **身份**: 云游僧人
- **性格**: 慈悲、睿智、神秘
- **知识**: 时空异象、青铜器秘密
- **目标**: 寻找有缘人，化解劫难
- **秘密**: 知道青铜鼎的真正用途

### 3. 老张 (boatman)
- **身份**: 码头船夫
- **性格**: 粗犷、直率、迷信
- **知识**: 河面异象、宫殿货物
- **秘密**: 是被唤醒的文物守护者（自己还不知道）

### 4. 李文儒 (scholar)
- **身份**: 私塾先生
- **性格**: 文雅、博学、好奇
- **知识**: 古籍记载、青铜器研究
- **目标**: 探索真相，记录历史

### 5. 刘守义 (guard)
- **身份**: 官府守卫
- **性格**: 严肃、忠诚、有正义感
- **知识**: 官府命令、宫殿秘密
- **秘密**: 发现上级可能隐瞒真相

### 6. 疯老头 (beggar)
- **身份**: 乞丐 / 隐藏：觉醒的守护者
- **性格**: 表面疯癫，实则清醒
- **知识**: （觉醒后）完整的真相
- **特殊**: 需要特殊方式觉醒

## 对话示例

### 第一次见面

**玩家第一次遇到王老板时：**

1. NPCChat组件检测到 `metPlayer === false`
2. 自动调用AI生成问候语
3. 问候语基于NPC的性格和身份

**王老板可能的问候：**
> "哎呀，这位客官，面生得很啊！第一次来咱们集市吧？我这儿货全价实，要不要看看？"

### 记住之前的对话

**第二次见到王老板：**

因为系统记住了之前的对话，王老板会表现出认识玩家：

**玩家**: "我又来了"

**王老板**: "哎呀，是您啊！上次您不是打听过宫殿的事儿吗？今天又有什么需要的？"

### 学习新信息

**玩家告诉王老板一些事情：**

**玩家**: "我是从另一个世界来的"

**王老板**: "什么？！另一个世界？这...这也太玄乎了吧！虽然最近确实怪事挺多的...您可别唬我啊！"

这个信息会被记录到 `learnedInfo` 中，之后的对话王老板会记得这件事。

## 高级功能

### 1. 条件触发

当NPC提到某些关键信息时，触发游戏事件：

```typescript
<NPCChat
  npcId="monk"
  playerName={playerName}
  isOpen={true}
  onClose={() => setActiveNPC(null)}
  onDialogueCondition={(condition) => {
    if (condition === "mentioned_bronze_ding") {
      // 触发特殊事件：获得线索
      addClue({
        id: "monk_bronze_hint",
        description: "和尚提到了青铜鼎的秘密",
      });
    }
  }}
/>
```

### 2. 动态修改NPC知识

在剧情推进时，可以动态添加NPC的知识：

```typescript
// 当玩家完成某个任务后
npcMemoryManager.learnInfo(
  "vendor",
  "玩家已经调查过码头了"
);

// 下次对话时，王老板会知道这件事
```

### 3. 关系系统

根据玩家的选择调整关系值：

```typescript
// 玩家帮助了NPC
npcMemoryManager.updateRelationship("vendor", 20);

// 玩家欺骗了NPC
npcMemoryManager.updateRelationship("vendor", -30);

// 关系值影响NPC的态度和愿意透露的信息
```

## 保存和加载

### 导出记忆（保存游戏）

```typescript
import { npcMemoryManager } from "../../utils/npcMemorySystem";

const allMemories = npcMemoryManager.exportMemories();
localStorage.setItem("npc_memories", JSON.stringify(allMemories));
```

### 导入记忆（加载游戏）

```typescript
const savedMemories = localStorage.getItem("npc_memories");
if (savedMemories) {
  npcMemoryManager.importMemories(JSON.parse(savedMemories));
}
```

## 注意事项

1. **NPC不知道全局剧情**: 确保NPC的SystemPrompt中不包含它不应该知道的信息
2. **保持角色一致性**: 每个NPC应该根据自己的性格和立场回应
3. **记忆持久性**: NPC会记住所有与玩家的对话，确保对话有连贯性
4. **关系影响**: NPC的态度会根据关系值变化，从敌对到友好
5. **性能考虑**: 每次对话都会调用AI API，注意控制频率

## 最佳实践

### 1. 设计有深度的NPC

给NPC设计：
- 清晰的目标和动机
- 有趣的背景故事
- 秘密信息（需要建立信任才能获得）
- 性格特点（影响对话风格）

### 2. 利用关系系统

- 设计需要高关系值才能触发的对话分支
- 根据关系值改变NPC的态度和提供的信息
- 创造道德选择：欺骗NPC获得信息 vs 诚实建立信任

### 3. 记忆系统的妙用

- 让NPC记住玩家的承诺，后续检查是否兑现
- 根据玩家之前的选择，NPC给出不同反应
- 创造"回忆杀"：NPC提起之前的对话

### 4. 觉醒机制

参考"疯老头"的设计：
- 初始状态：NPC处于某种限制状态
- 触发条件：玩家收集特定物品/完成特定任务
- 觉醒后：NPC的知识和态度发生巨大变化

## 调试

查看NPC的当前记忆状态：

```typescript
// 在开发环境中
if (import.meta.env.DEV) {
  console.log("NPC记忆:", npcMemoryManager.getMemory("vendor"));
}
```

## 未来扩展

可以考虑添加：
- NPC之间的关系网络（A告诉B关于玩家的事）
- NPC的日程系统（不同时间在不同地点）
- NPC的情绪细分（喜悦、愤怒、恐惧等）
- 更复杂的学习系统（NPC主动推理信息）
