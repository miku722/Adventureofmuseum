# 快速开始指南 - 全局SystemPrompt系统

## 🚀 5分钟快速上手

### 1. 运行游戏并测试

启动游戏后：
1. 点击"开始游戏"
2. 输入角色名字
3. 观看序章叙事
4. 进入场景1-5的对话环节

### 2. 打开调试工具查看状态

在游戏运行时，点击**右下角的紫色Bug图标**打开游戏状态调试器：

- 📊 查看当前游戏阶段和玩家信息
- 📜 展开"叙事历史"查看所有发生的故事片段
- 💬 展开"对话历史"查看所有对话记录
- 📈 查看统计信息

### 3. 观察AI的记忆能力

在场景2或场景3中，尝试：
- 提到"刚才的茶"（引用场景1）
- 询问"青铜鼎现在怎么样了"（引用之前的事件）

AI会展现出对之前事件的完整记忆！

## 📚 系统概览

### 核心概念

**游戏上帝 = 基础设定 + 所有已发生的事件 + 当前场景指令**

```typescript
// 1. 基础设定（守望者AI的核心身份）
const baseSystemPrompt = `你是博物馆的智能监控系统AI助手...`;

// 2. 已发生的事件（叙事 + 对话）
gameState.narrativeHistory = ["场景1的描述", "场景2的描述", ...];
gameState.conversationHistory = ["场景1的对话", "场景2的对话", ...];

// 3. 当前场景指令
const sceneContext = SCENE_CONTEXTS["scene2"];

// 4. 合并成完整的SystemPrompt
const finalPrompt = buildGlobalSystemPrompt(gameState) + sceneContext;
```

### 数据流

```
开始游戏
  ↓
StoryNarration (序章叙事)
  → 保存到 narrativeHistory
  ↓
场景1 (日常巡逻)
  → AI回复基于：基础设定 + 序章叙事
  → 对话完成后保存到 conversationHistory
  ↓
场景2 (监控异常)
  → AI回复基于：基础设定 + 序章叙事 + 场景1描述 + 场景1对话
  → 对话完成后保存到 conversationHistory
  ↓
场景3, 4, 5...
  → AI记得所有之前的事情！
```

## 🎯 关键文件说明

### `/utils/gameSystemPrompt.ts`
**游戏大脑** - 负责构建AI的提示词

```typescript
// 构建全局SystemPrompt
buildGlobalSystemPrompt(gameState)

// 添加场景特定上下文
addSceneContext(basePrompt, sceneContext)

// 预设的场景提示词
SCENE_CONTEXTS.scene1  // 一成不变的工作
SCENE_CONTEXTS.scene2  // 失控的监控室
// ... 等等
```

### `/components/GameCover.tsx`
**游戏指挥中心** - 管理全局游戏状态

```typescript
const [gameState, setGameState] = useState<GameState>({
  playerName: "",
  currentPhase: "cover",
  narrativeHistory: [],      // 所有叙事片段
  conversationHistory: [],   // 所有对话记录
  // ...
});
```

### `/components/CombinedScenes1to5.tsx`
**场景管理器** - 运行场景1-5

```typescript
// 构建包含完整历史的SystemPrompt
const systemPrompt = addSceneContext(
  buildGlobalSystemPrompt(gameState),
  SCENE_CONTEXTS[sceneKey]
);

// 场景完成后更新全局状态
onUpdateGameState((prev) => ({
  ...prev,
  narrativeHistory: [...prev.narrativeHistory, newNarrative],
  conversationHistory: [...prev.conversationHistory, newConversation],
}));
```

## 🛠️ 常见使用场景

### 场景1：添加新场景

1. **定义场景上下文** (在 `/utils/gameSystemPrompt.ts`)

```typescript
export const SCENE_CONTEXTS = {
  // ... 现有场景
  
  myNewScene: `当前状态：描述AI的心理状态
  
  情境描述：
  - 发生了什么事
  - AI需要知道的信息
  
  你应该：
  - AI应该做什么
  - 如何回复玩家
  
  语气：描述语气和风格`,
};
```

2. **在场景配置中使用**

```typescript
const scenes = [
  // ... 现有场景
  {
    title: "我的新场景",
    sceneKey: "myNewScene" as const,
    description: "场景的描述文本...",
    initialMessage: "AI的开场白...",
    minMessages: 2,
  },
];
```

### 场景2：查看AI收到的完整提示词

打开浏览器控制台，在InteractiveScene组件中添加：

```typescript
console.log("=== SystemPrompt ===");
console.log(systemPrompt);
console.log("===================");
```

### 场景3：调试对话历史

使用GameStateDebugger：
1. 点击右下角紫色Bug图标
2. 展开"对话历史"
3. 查看每个场景的对话记录

## ⚡ 快速测试清单

测试全局记忆功能是否正常：

- [ ] 开始游戏，输入名字
- [ ] 完成序章叙事
- [ ] 在场景1中与AI对话（至少2轮）
- [ ] 打开调试器，确认"叙事历史"有1条记录
- [ ] 完成场景1，进入场景2
- [ ] 打开调试器，确认"对话历史"有1条记录
- [ ] 在场景2中提到场景1的事情
- [ ] 观察AI是否能引用之前的对话
- [ ] 重复测试场景3-5

## 🐛 常见问题

### Q: AI不记得之前的对话？
**A**: 检查：
1. `onUpdateGameState` 是否被正确调用
2. 调试器中是否显示对话历史
3. `buildGlobalSystemPrompt` 是否包含历史记录

### Q: 调试器显示为空？
**A**: 
1. 确保叙事组件使用了 `onComplete(narratives)` 返回数据
2. 确保对话组件调用了 `onUpdateGameState`

### Q: 如何重置游戏状态？
**A**: 刷新页面即可（未来可以添加localStorage持久化）

## 📖 进阶阅读

- 完整架构文档：`/GAME_STATE_ARCHITECTURE.md`
- 实现细节：`/IMPLEMENTATION_SUMMARY.md`
- 场景合并说明：`/components/README_SCENE_MERGE.md`

## 🎓 最佳实践

1. **总是使用调试器** - 确保状态正确更新
2. **简洁的场景上下文** - 不要让SystemPrompt过长
3. **及时保存历史** - 每个场景完成立即更新
4. **测试记忆功能** - 在新场景中引用旧事件
5. **避免剧透** - 永远不要在SystemPrompt中提及未来剧情

---

**祝你使用愉快！** 🎮✨

有问题？查看完整文档或联系开发团队。
