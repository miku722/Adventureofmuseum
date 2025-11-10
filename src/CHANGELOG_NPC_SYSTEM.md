# NPC系统更新日志

## 2024-11-XX - 重大更新：NPC独立记忆系统

### 🎯 完成的三大任务

#### 1️⃣ Scene6空格键提示优化 ✅

**问题**：
- 空格键提示位置不合理，占据画面中心
- 提示出现时机不对，可能提前出现

**解决方案**：
- 复用 `NarrativeSceneBase` 的代码模式
- 将空格键提示移到底部（`absolute bottom-8`）
- 只在旁白阶段显示（`!showChoices && narrationIndex < narrations.length`）
- 不占据画面中心位置

**修改文件**：`/components/Scene6_ChoicePoint.tsx`

**关键代码**：
```tsx
{/* 底部空格键提示 - 仿照 NarrativeSceneBase */}
<div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
  {!showChoices && narrationIndex < narrations.length && (
    <motion.div className="flex items-center gap-2 text-amber-400/60">
      <motion.span className="px-3 py-1 border border-amber-400/30 rounded bg-amber-400/5">
        空格 / 回车
      </motion.span>
      <span>跳过</span>
    </motion.div>
  )}
</div>
```

---

#### 2️⃣ Scene6选项UI位置优化 ✅

**问题**：
- "你该前往何处"的三个选项UI太靠下
- 文字区域没有给选项留出足够空间

**解决方案**：
- 给旁白文字区域添加 `min-h-[300px]`，预留空间
- 选项显示在文本区域的中间位置
- 保持选项的动画效果和交互性

**修改文件**：`/components/Scene6_ChoicePoint.tsx`

**关键代码**：
```tsx
{/* 旁白文字 */}
<div className="space-y-6 min-h-[300px]">
  <AnimatePresence mode="sync">
    {narrations.slice(0, narrationIndex).map((text, index) => (
      <motion.p ...>{text}</motion.p>
    ))}
  </AnimatePresence>
</div>

{/* 选择按钮 - 放在文本区域中间 */}
<AnimatePresence>
  {showChoices && (
    <motion.div className="space-y-4">
      <motion.h3>你该前往何处？</motion.h3>
      {/* 三个选项按钮 */}
    </motion.div>
  )}
</AnimatePresence>
```

---

#### 3️⃣ NPC独立记忆对话系统 ✅

**需求**：
- NPC对话也做成AI对话
- 每个NPC都有全新的独立记忆
- NPC不知道"上帝视角"
- 只有自己的身份信息
- 获取知识后会记忆这些信息
- 下次与玩家互动时带着这些记忆

**解决方案**：创建完整的NPC独立记忆系统

---

### 📦 新增文件

#### 1. `/utils/npcMemorySystem.ts` ⭐ 核心系统

**功能**：
- `NPCIdentity` 接口：定义NPC身份信息
- `NPCMemory` 接口：管理NPC记忆状态
- `NPCMemoryManager` 类：全局记忆管理器
- `buildNPCSystemPrompt()`: 构建NPC专属SystemPrompt
- `getNPCPrompt()`: 获取NPC当前Prompt
- `updateNPCMemoryAfterChat()`: 更新NPC记忆

**关键特性**：
```typescript
// NPC只知道自己的身份
interface NPCIdentity {
  id: string;
  name: string;
  role: string;
  personality: string;
  background: string;
  knowledge: string[];  // 天生知道的事情
  goals?: string;
  secrets?: string;
}

// NPC的记忆
interface NPCMemory {
  npcId: string;
  conversationHistory: [];  // 对话历史
  learnedInfo: string[];    // 从玩家处学到的信息
  playerRelationship: number;  // 关系值 -100 到 100
  emotionalState: string;
  metPlayer: boolean;
}
```

**预定义的6个NPC**：
1. **王老板** (`vendor`) - 集市小贩，消息灵通
2. **慧明法师** (`monk`) - 云游僧人，知道青铜鼎秘密
3. **老张** (`boatman`) - 码头船夫，隐藏的文物守护者
4. **李文儒** (`scholar`) - 私塾先生，博学好奇
5. **刘守义** (`guard`) - 官府守卫，发现上级隐瞒真相
6. **疯老头** (`beggar`) - 乞丐，需要觉醒的守护者

---

#### 2. `/components/game/NPCChat.tsx` ⭐ 对话组件

**功能**：
- 使用NPC记忆系统的AI对话界面
- 自动加载NPC的对话历史
- 第一次见面时NPC主动问候
- 实时更新NPC记忆
- 支持关系值系统
- 支持条件触发器

**使用示例**：
```tsx
<NPCChat
  npcId="vendor"
  playerName={playerName}
  isOpen={activeNPC === "vendor"}
  onClose={() => setActiveNPC(null)}
  onDialogueCondition={(condition) => {
    if (condition === "mentioned_bronze_ding") {
      // 触发游戏事件
    }
  }}
/>
```

**特点**：
- ✅ 自动检测是否第一次见面
- ✅ 第一次见面时AI自动生成问候语
- ✅ 加载完整对话历史
- ✅ 每次对话后自动更新记忆
- ✅ 关系值自动增长（每次对话+1）
- ✅ 支持回车发送，Shift+回车换行
- ✅ 打字中动画效果

---

#### 3. `/components/game/NPCInteractionExample.tsx` ✨ 示例组件

**功能**：
- 展示如何使用NPC记忆系统
- 可视化NPC状态
- 显示关系值进度条
- 对话次数统计
- 开发环境调试信息

**特点**：
- 🎨 精美的NPC卡片UI
- 📊 关系值可视化（进度条）
- 🎭 NPC状态显示（未见过/一般/友好/警惕/敌对）
- 🔧 开发环境调试面板

---

#### 4. `/components/game/README_NPC_MEMORY.md` 📖 使用文档

**内容**：
- NPC系统概述
- 与全局SystemPrompt的区别
- 使用方法和代码示例
- 添加新NPC的步骤
- 手动更新NPC记忆
- 已预定义的NPC详情
- 对话示例
- 高级功能（条件触发、关系系统）
- 保存和加载
- 最佳实践
- 调试方法
- 未来扩展

---

#### 5. `/SYSTEM_ARCHITECTURE.md` 📖 系统架构文档

**内容**：
- 完整系统架构概述
- 核心系统详解（5大系统）
- 全局SystemPrompt vs NPC记忆系统对比
- 工作流程图
- 场景组件架构
- 数据流图
- 开发指南
- 文件结构
- 最佳实践
- 更新日志
- 未来扩展计划

---

### 🔄 系统对比

| 特性 | 全局SystemPrompt | NPC记忆系统 |
|------|-----------------|-------------|
| **文件位置** | `/utils/gameSystemPrompt.ts` | `/utils/npcMemorySystem.ts` |
| **知识范围** | 所有已发生的事件 | 仅NPC自己的经历 |
| **记忆内容** | 所有场景叙事+对话 | 仅与玩家的对话 |
| **视角** | 上帝视角 | 角色视角 |
| **AI身份** | 博物馆监控AI "守望者" | 具体NPC角色 |
| **适用场景** | 主线剧情（场景1-5） | 章节1的NPC互动 |
| **是否知道未来** | 否（通过场景上下文控制） | 否（完全不知道） |
| **对话风格** | 统一（守望者风格） | 多样（根据NPC性格） |

---

### 🎮 使用场景

#### 使用全局SystemPrompt：
- ✅ Scene 1-5 的"守望者"AI对话
- ✅ 主线剧情推进
- ✅ 需要记住完整游戏历史的对话
- ✅ 博物馆监控系统的视角

#### 使用NPC记忆系统：
- ✅ 章节1的集市NPC（王老板、和尚、船夫等）
- ✅ 需要角色扮演的NPC
- ✅ 需要独立身份和记忆的角色
- ✅ 需要关系系统的角色

---

### 📊 工作流程

#### NPC对话流程：

```
1. 玩家点击NPC
   ↓
2. NPCChat组件打开
   ↓
3. 加载 getNPCPrompt(npcId, playerName)
   - 包含NPC身份
   - 包含对话历史
   - 包含学到的信息
   - 包含关系值
   ↓
4. 检查是否第一次见面
   是 → AI自动生成问候语
   否 → 显示历史对话
   ↓
5. 玩家输入消息
   ↓
6. 构建对话上下文
   SystemPrompt + 对话历史 → DeepSeek API
   ↓
7. 获得NPC回复
   ↓
8. 更新NPC记忆
   - 记录对话
   - 更新学到的信息
   - 调整关系值 +1
   - 更新情绪状态
   ↓
9. 检查条件触发
   - 关键词检测
   - 触发游戏事件
```

---

### 💡 核心创新

#### 1. 双层AI系统架构

```
上帝视角（全局SystemPrompt）
    ↓
  守望者AI
  知道所有事件
    ↑
    │
────┼───────────────────
    │
    ↓
角色视角（NPC记忆系统）
    ↓
  各个NPC
  只知道自己的经历
```

#### 2. 记忆持久性

- NPC会记住所有对话
- 下次见面时体现连贯性
- 支持跨场景的记忆保持

#### 3. 关系系统

```
-100 ←──────── 0 ──────→ +100
 敌对    警惕    中性    友好    信任
```

#### 4. 学习能力

玩家告诉NPC信息 → 记录到 `learnedInfo` → 下次对话时体现

---

### 🧪 测试建议

#### 测试NPC记忆系统：

1. **第一次见面测试**
   - 打开任一NPC对话
   - 验证NPC主动问候
   - 验证问候符合NPC性格

2. **记忆持久性测试**
   - 与NPC对话
   - 关闭对话
   - 再次打开
   - 验证对话历史被保留

3. **学习能力测试**
   - 告诉NPC一些信息
   - 关闭对话
   - 再次打开
   - 验证NPC记住了这些信息

4. **关系系统测试**
   - 多次对话
   - 观察关系值变化
   - 验证NPC态度变化

5. **独立性测试**
   - 告诉NPC A某些事情
   - 与NPC B对话
   - 验证NPC B不知道那些事情

---

### 📝 代码示例

#### 在游戏场景中使用NPC系统：

```tsx
import { useState } from "react";
import { NPCChat } from "./game/NPCChat";

function MarketScene({ playerName }) {
  const [activeNPC, setActiveNPC] = useState<string | null>(null);

  return (
    <div>
      {/* NPC按钮 */}
      <button onClick={() => setActiveNPC("vendor")}>
        与王老板对话
      </button>
      
      <button onClick={() => setActiveNPC("monk")}>
        与和尚对话
      </button>

      {/* NPC对话界面 */}
      {activeNPC && (
        <NPCChat
          npcId={activeNPC}
          playerName={playerName}
          isOpen={true}
          onClose={() => setActiveNPC(null)}
          onDialogueCondition={(condition) => {
            // 处理特殊条件
            if (condition === "mentioned_bronze_ding") {
              console.log("NPC提到了青铜鼎！");
            }
          }}
        />
      )}
    </div>
  );
}
```

#### 手动更新NPC记忆：

```tsx
import { npcMemoryManager } from "../../utils/npcMemorySystem";

// 剧情事件：玩家完成某个任务
function handleQuestComplete() {
  // 让王老板学习到新信息
  npcMemoryManager.learnInfo(
    "vendor",
    "玩家帮助了一个困难的老人"
  );
  
  // 增加好感度
  npcMemoryManager.updateRelationship("vendor", 20);
  
  // 更新情绪
  npcMemoryManager.updateEmotion("vendor", "grateful");
}
```

---

### 🎯 关键优势

1. **真实的角色扮演体验**
   - 每个NPC都是独立的"生命"
   - 有自己的记忆、性格、目标
   - 不会知道不该知道的事情

2. **深度的对话系统**
   - AI生成的对话更自然
   - 根据NPC性格调整语气
   - 支持复杂的对话分支

3. **持久的关系系统**
   - 玩家的选择会影响NPC态度
   - 关系值影响可获得的信息
   - 创造道德选择的深度

4. **可扩展性**
   - 轻松添加新NPC
   - 支持复杂的觉醒机制
   - 可以实现NPC间关系网络

---

### 🐛 已知限制

1. **API调用成本**
   - 每次对话都需要调用AI API
   - 建议控制对话频率

2. **记忆存储**
   - 当前只在运行时保存
   - 需要实现持久化存储

3. **关系值计算**
   - 当前是简单的线性增长
   - 可以实现更复杂的计算逻辑

---

### 🚀 未来扩展方向

1. **NPC间关系网络**
   - NPC A告诉NPC B关于玩家的事
   - 信息在NPC间传播

2. **NPC日程系统**
   - 不同时间NPC在不同地点
   - 玩家需要找到正确时间和地点

3. **更细分的情绪系统**
   - 喜悦、愤怒、恐惧、悲伤等
   - 影响对话风格和内容

4. **NPC主动推理**
   - NPC根据信息推断更多内容
   - 更智能的对话体验

---

### ✅ 完成清单

- [x] Scene6空格键提示优化
- [x] Scene6选项UI位置优化
- [x] NPC独立记忆系统 (`npcMemorySystem.ts`)
- [x] NPCChat对话组件 (`NPCChat.tsx`)
- [x] NPC交互示例 (`NPCInteractionExample.tsx`)
- [x] NPC系统使用文档 (`README_NPC_MEMORY.md`)
- [x] 系统架构文档 (`SYSTEM_ARCHITECTURE.md`)
- [x] 预定义6个NPC角色
- [x] 关系值系统
- [x] 情绪状态系统
- [x] 学习能力系统
- [x] 第一次见面问候系统
- [x] 对话历史持久化
- [x] 条件触发系统

---

### 📖 相关文档

- **NPC系统详细文档**: `/components/game/README_NPC_MEMORY.md`
- **系统架构文档**: `/SYSTEM_ARCHITECTURE.md`
- **全局Prompt系统**: `/utils/gameSystemPrompt.ts`
- **NPC记忆系统**: `/utils/npcMemorySystem.ts`

---

## 总结

本次更新成功实现了完整的**NPC独立记忆系统**，使游戏拥有了双层AI架构：

1. **全局SystemPrompt**（上帝视角）- 用于主线剧情
2. **NPC记忆系统**（角色视角）- 用于NPC互动

这个系统为游戏带来了：
- ✨ 真实的角色扮演体验
- 💬 深度的AI对话系统
- 🤝 动态的关系系统
- 🧠 持久的记忆系统
- 🎭 丰富的NPC个性

同时完成了Scene6的UI优化，使游戏体验更加流畅和专业。

---

**更新时间**: 2024-11-XX  
**版本**: v1.0  
**开发者**: 时空之门开发团队
