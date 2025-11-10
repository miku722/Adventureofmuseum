# NPC系统快速入门指南

> 5分钟快速了解如何使用NPC独立记忆系统

## 🚀 最简单的使用方法

### 步骤1: 导入组件

```tsx
import { NPCChat } from "./components/game/NPCChat";
import { useState } from "react";
```

### 步骤2: 添加状态

```tsx
function YourComponent({ playerName }) {
  const [activeNPC, setActiveNPC] = useState<string | null>(null);
  
  // ... 你的组件代码
}
```

### 步骤3: 添加触发按钮

```tsx
<button onClick={() => setActiveNPC("vendor")}>
  与王老板对话
</button>
```

### 步骤4: 添加对话界面

```tsx
<NPCChat
  npcId="vendor"
  playerName={playerName}
  isOpen={activeNPC === "vendor"}
  onClose={() => setActiveNPC(null)}
/>
```

### 完整示例

```tsx
import { useState } from "react";
import { NPCChat } from "./components/game/NPCChat";

function MarketScene({ playerName }: { playerName: string }) {
  const [activeNPC, setActiveNPC] = useState<string | null>(null);

  return (
    <div>
      {/* NPC触发按钮 */}
      <button onClick={() => setActiveNPC("vendor")}>
        与王老板对话
      </button>
      
      {/* NPC对话界面 */}
      <NPCChat
        npcId="vendor"
        playerName={playerName}
        isOpen={activeNPC === "vendor"}
        onClose={() => setActiveNPC(null)}
      />
    </div>
  );
}
```

---

## 📋 可用的NPC列表

| NPC ID | 名字 | 身份 | 特点 |
|--------|------|------|------|
| `vendor` | 王老板 | 集市小贩 | 精明健谈，消息灵通 |
| `monk` | 慧明法师 | 云游僧人 | 慈悲睿智，知道秘密 |
| `boatman` | 老张 | 码头船夫 | 粗犷直率，有点迷信 |
| `scholar` | 李文儒 | 私塾先生 | 文雅博学，好奇心强 |
| `guard` | 刘守义 | 官府守卫 | 严肃忠诚，有正义感 |
| `beggar` | 疯老头 | 乞丐 | 表面疯癫，实则清醒 |

### 使用任何NPC

只需要改变 `npcId`：

```tsx
// 与和尚对话
<NPCChat npcId="monk" playerName={playerName} ... />

// 与船夫对话
<NPCChat npcId="boatman" playerName={playerName} ... />

// 与书生对话
<NPCChat npcId="scholar" playerName={playerName} ... />
```

---

## 🎯 核心特性

### 1. 自动记忆对话

**第一次对话**:
```
玩家: "你好"
王老板: "哎呀，客官您好！第一次来吧？"
```

**第二次对话**:
```
玩家: "我又来了"
王老板: "是您啊！上次您不是打听过宫殿的事儿吗？"
```

系统自动记住了之前的对话！

---

### 2. 独立的NPC视角

每个NPC**不知道**：
- ❌ 游戏的全局剧情
- ❌ 玩家在其他地方的经历
- ❌ 其他NPC的对话内容
- ❌ 未来会发生什么

每个NPC**只知道**：
- ✅ 自己的身份和背景
- ✅ 与玩家的对话历史
- ✅ 玩家告诉自己的信息

---

### 3. 关系值系统

```
对话次数越多 → 关系值越高 → NPC态度越友好
```

查看关系值：
```tsx
import { npcMemoryManager } from "../utils/npcMemorySystem";

const memory = npcMemoryManager.getMemory("vendor");
console.log("关系值:", memory.playerRelationship); // 0到100
```

---

## 🔧 高级功能

### 条件触发

当NPC提到某些关键信息时，触发游戏事件：

```tsx
<NPCChat
  npcId="monk"
  playerName={playerName}
  isOpen={true}
  onClose={() => setActiveNPC(null)}
  onDialogueCondition={(condition) => {
    if (condition === "mentioned_bronze_ding") {
      // 触发事件：获得线索
      console.log("和尚提到了青铜鼎！");
      addClue("bronze_ding_secret");
    }
  }}
/>
```

在 `NPCChat.tsx` 的 `checkDialogueConditions` 函数中添加检测逻辑：

```typescript
const checkDialogueConditions = (response: string) => {
  if (response.includes("青铜鼎")) {
    onDialogueCondition?.("mentioned_bronze_ding");
  }
  if (response.includes("宫殿")) {
    onDialogueCondition?.("mentioned_palace");
  }
};
```

---

### 手动更新NPC记忆

```tsx
import { npcMemoryManager } from "../utils/npcMemorySystem";

// 让NPC学习新信息
npcMemoryManager.learnInfo("vendor", "玩家帮助了老人");

// 调整关系值
npcMemoryManager.updateRelationship("vendor", 20); // +20好感

// 更新情绪
npcMemoryManager.updateEmotion("vendor", "grateful");
```

---

## 🆕 添加新NPC

### 步骤1: 在 `/utils/npcMemorySystem.ts` 中添加定义

```typescript
export const NPC_IDENTITIES: Record<string, NPCIdentity> = {
  // ... 现有NPC
  
  // 添加新NPC
  blacksmith: {
    id: "blacksmith",
    name: "铁匠张三",
    role: "铁匠铺老板",
    personality: "豪爽、热心、力气大",
    background: "经营铁匠铺十多年，会打造各种工具和兵器",
    location: "铁匠铺",
    knowledge: [
      "最近有人定制了很多青铜器具",
      "这些器具的样式很古老，像是仿制品",
    ],
    goals: "做好生意，帮助需要的人",
  },
};
```

### 步骤2: 在游戏中使用

```tsx
<button onClick={() => setActiveNPC("blacksmith")}>
  与铁匠对话
</button>

<NPCChat
  npcId="blacksmith"
  playerName={playerName}
  isOpen={activeNPC === "blacksmith"}
  onClose={() => setActiveNPC(null)}
/>
```

就这么简单！✨

---

## 🎨 UI定制

### 改变对话框外观

编辑 `/components/game/NPCChat.tsx`：

```tsx
// 改变颜色主题
className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
// 改为紫色主题
className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900"

// 改变边框颜色
className="border border-amber-500/20"
// 改为青色
className="border border-cyan-500/20"
```

---

## 💾 保存和加载

### 保存所有NPC记忆

```tsx
import { npcMemoryManager } from "../utils/npcMemorySystem";

// 保存游戏
function saveGame() {
  const allMemories = npcMemoryManager.exportMemories();
  localStorage.setItem("npc_memories", JSON.stringify(allMemories));
}
```

### 加载NPC记忆

```tsx
// 加载游戏
function loadGame() {
  const savedMemories = localStorage.getItem("npc_memories");
  if (savedMemories) {
    npcMemoryManager.importMemories(JSON.parse(savedMemories));
  }
}
```

---

## 🐛 常见问题

### Q1: NPC不记得之前的对话？

**检查**：
- 确保使用了相同的 `npcId`
- 确保没有刷新页面（记忆在运行时保存）
- 检查是否调用了 `npcMemoryManager.clearAll()`

### Q2: 如何让NPC知道某些剧情信息？

**方法1**: 在NPC的 `knowledge` 中添加：
```typescript
knowledge: [
  "宫殿里发生了奇怪的事情",
  "最近天空出现了三个月亮",
]
```

**方法2**: 手动添加学习信息：
```typescript
npcMemoryManager.learnInfo("vendor", "宫殿里有时空裂缝");
```

### Q3: 如何查看NPC当前状态？

```typescript
const memory = npcMemoryManager.getMemory("vendor");
console.log("对话次数:", memory.conversationHistory.length);
console.log("关系值:", memory.playerRelationship);
console.log("情绪:", memory.emotionalState);
console.log("学到的信息:", memory.learnedInfo);
```

---

## 📚 更多资源

- **详细文档**: `/components/game/README_NPC_MEMORY.md`
- **系统架构**: `/SYSTEM_ARCHITECTURE.md`
- **更新日志**: `/CHANGELOG_NPC_SYSTEM.md`
- **示例组件**: `/components/game/NPCInteractionExample.tsx`

---

## 🎮 试试看！

### 测试NPC记忆

1. 打开与王老板的对话
2. 告诉他一些事情（比如："我来自未来"）
3. 关闭对话
4. 再次打开对话
5. 问他："你还记得我吗？"

王老板会记住你之前说的话！🎉

### 测试多个NPC

1. 告诉王老板一个秘密
2. 关闭对话
3. 打开与和尚的对话
4. 和尚**不会**知道你告诉王老板的秘密

每个NPC都是独立的！🎭

---

## ✨ 快速提示

- 💬 **第一次见面**: NPC会主动问候
- 🧠 **记忆持久**: 对话历史自动保存
- 🤝 **关系系统**: 每次对话关系值+1
- 🎭 **独立视角**: NPC不知道全局剧情
- 📖 **学习能力**: NPC记住玩家告诉的信息

---

## 🚀 立即开始

复制这个模板到你的组件：

```tsx
import { useState } from "react";
import { NPCChat } from "./components/game/NPCChat";

function MyScene({ playerName }: { playerName: string }) {
  const [activeNPC, setActiveNPC] = useState<string | null>(null);

  return (
    <div>
      {/* 你的场景UI */}
      
      {/* NPC按钮 */}
      <button onClick={() => setActiveNPC("vendor")}>
        与王老板对话
      </button>
      
      {/* 对话界面 */}
      <NPCChat
        npcId="vendor"
        playerName={playerName}
        isOpen={activeNPC === "vendor"}
        onClose={() => setActiveNPC(null)}
      />
    </div>
  );
}
```

就这么简单！开始创建你的NPC互动吧！🎉

---

**快速入门完成！** 🎊

需要更多帮助？查看 `/components/game/README_NPC_MEMORY.md`
