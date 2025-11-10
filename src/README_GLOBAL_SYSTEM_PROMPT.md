# 全局SystemPrompt系统 - 项目说明

## 📖 概述

本项目实现了一个**全局游戏状态管理系统**和**智能SystemPrompt构建器**，让AI能够在整个游戏过程中保持完整的记忆，像一个真正的"游戏上帝"一样了解所有已发生的事件。

## ✨ 核心特性

### 🧠 完整的AI记忆系统
- AI能记住所有叙事片段
- AI能引用之前的对话
- AI的回复基于完整的游戏历史

### 🎮 智能上下文管理
- 动态构建SystemPrompt
- 只包含已发生的事件
- 绝不泄露未来剧情

### 🔍 可视化调试工具
- 实时查看游戏状态
- 浏览叙事和对话历史
- 统计信息一目了然

## 🗂️ 文档目录

### 入门指南
- **[快速开始指南](./QUICK_START_GUIDE.md)** ⭐ 
  - 5分钟快速上手
  - 测试AI记忆功能
  - 常见问题解答

### 详细文档
- **[架构文档](./GAME_STATE_ARCHITECTURE.md)**
  - 系统设计理念
  - 数据流详解
  - API参考

- **[实现总结](./IMPLEMENTATION_SUMMARY.md)**
  - 完成的工作清单
  - 代码结构说明
  - 下一步建议

- **[场景合并说明](./components/README_SCENE_MERGE.md)**
  - 场景1-5合并细节
  - 代码优化说明

## 🚀 快速开始

### 1. 运行游戏
```bash
# 启动开发服务器
npm run dev
```

### 2. 测试AI记忆
1. 开始游戏并输入角色名
2. 完成序章和场景1
3. 在场景2中提到"刚才的茶"
4. 观察AI是否能引用场景1的内容

### 3. 打开调试器
点击右下角的**紫色Bug图标** 🐛

## 📁 项目结构

```
/
├── utils/
│   └── gameSystemPrompt.ts           # ⭐ 核心：SystemPrompt构建器
│
├── components/
│   ├── GameCover.tsx                 # ⭐ 核心：全局状态管理
│   ├── CombinedScenes1to5.tsx       # ⭐ 核心：场景1-5管理
│   ├── GameStateDebugger.tsx         # 调试工具
│   ├── StoryNarration.tsx            # 叙事组件
│   ├── InteractiveScene.tsx          # AI对话组件
│   └── ...
│
└── docs/
    ├── QUICK_START_GUIDE.md          # 快速开始
    ├── GAME_STATE_ARCHITECTURE.md    # 架构文档
    ├── IMPLEMENTATION_SUMMARY.md     # 实现总结
    └── README_GLOBAL_SYSTEM_PROMPT.md # 本文档
```

## 🎯 核心组件

### 1. GameState 接口
```typescript
interface GameState {
  playerName: string;              // 玩家名字
  currentPhase: string;            // 当前阶段
  currentScene?: string;           // 当前场景
  narrativeHistory: string[];      // 叙事历史 📜
  conversationHistory: string[];   // 对话历史 💬
  playerChoice?: string;           // 玩家选择
}
```

### 2. SystemPrompt构建函数
```typescript
// 构建全局SystemPrompt（包含所有已发生的事件）
buildGlobalSystemPrompt(gameState: GameState): string

// 添加场景特定上下文
addSceneContext(basePrompt: string, sceneContext: string): string
```

### 3. 场景上下文配置
```typescript
SCENE_CONTEXTS = {
  scene1: "...",  // 一成不变的工作
  scene2: "...",  // 失控的监控室
  scene3: "...",  // 不属于此世的光
  scene4: "...",  // 文明的断裂
  scene5: "...",  // 使命的召唤
  market: "...",  // 异世界市场
}
```

## 💡 设计理念

### 游戏上帝视角
```
SystemPrompt = 基础设定 + 已发生事件 + 当前场景
```

- **基础设定**: 守望者AI的核心身份和性格
- **已发生事件**: 所有叙事 + 所有对话
- **当前场景**: 场景特定的指令和语气

### 叙事连贯性

AI能够：
- ✅ 在场景2引用场景1的对话
- ✅ 记住玩家说过的每一句话
- ✅ 根据历史调整回复语气
- ❌ 但不会提及未来的剧情

## 🛠️ 开发指南

### 添加新场景

1. 在 `gameSystemPrompt.ts` 中定义场景上下文：
```typescript
export const SCENE_CONTEXTS = {
  myScene: `当前状态：...
  
  情境：...
  
  你应该：...
  
  语气：...`,
};
```

2. 在场景组件中使用：
```typescript
const systemPrompt = addSceneContext(
  buildGlobalSystemPrompt(gameState),
  SCENE_CONTEXTS.myScene
);
```

3. 场景完成后更新状态：
```typescript
onUpdateGameState((prev) => ({
  ...prev,
  narrativeHistory: [...prev.narrativeHistory, narrative],
  conversationHistory: [...prev.conversationHistory, conversation],
}));
```

## 🐛 调试技巧

### 1. 使用GameStateDebugger
- 点击右下角Bug图标
- 查看实时状态
- 展开历史记录

### 2. 控制台日志
```typescript
console.log('GameState:', gameState);
console.log('SystemPrompt:', systemPrompt);
```

### 3. 断点调试
在以下位置设置断点：
- `buildGlobalSystemPrompt()` - 查看构建的提示词
- `handleSceneComplete()` - 查看历史更新
- `onUpdateGameState()` - 查看状态变化

## 📊 系统流程图

```
启动游戏
   ↓
输入角色名 → gameState.playerName
   ↓
序章叙事 → gameState.narrativeHistory[0]
   ↓
场景1
   ├─ SystemPrompt = base + narrativeHistory[0]
   ├─ AI对话...
   └─ 完成 → gameState.conversationHistory[0]
   ↓
场景2
   ├─ SystemPrompt = base + narrativeHistory[0,1] + conversationHistory[0]
   ├─ AI对话...（能引用场景1！）
   └─ 完成 → gameState.conversationHistory[1]
   ↓
场景3, 4, 5...
   └─ AI记得越来越多的内容！
```

## ⚡ 性能优化

- ✅ 使用不可变更新模式
- ✅ 只在需要时重建SystemPrompt
- ✅ 使用React.memo优化渲染
- 🔄 未来：实现历史压缩和摘要

## 🎓 最佳实践

1. **状态管理**
   - 使用函数式更新
   - 保持不可变性
   - 及时保存历史

2. **SystemPrompt设计**
   - 保持简洁明了
   - 避免重复信息
   - 明确当前场景指令

3. **调试流程**
   - 总是使用调试器
   - 验证历史记录
   - 测试AI记忆功能

## 🔮 未来计划

- [ ] localStorage持久化存储
- [ ] 游戏存档/读档功能
- [ ] 对话历史回溯查看
- [ ] 多分支剧情追踪
- [ ] AI回复质量评分
- [ ] 自动化测试覆盖

## 📞 获取帮助

- 查看 [快速开始指南](./QUICK_START_GUIDE.md)
- 阅读 [架构文档](./GAME_STATE_ARCHITECTURE.md)
- 检查 [实现总结](./IMPLEMENTATION_SUMMARY.md)

## 📜 更新日志

### v1.0.0 (2025-11-07)
- ✅ 实现全局GameState系统
- ✅ 创建SystemPrompt构建器
- ✅ 合并场景1-5组件
- ✅ 添加GameStateDebugger
- ✅ 完善文档系统

---

**版本**: 1.0.0  
**最后更新**: 2025-11-07  
**状态**: ✅ 生产就绪

**Happy Coding!** 🎮✨
