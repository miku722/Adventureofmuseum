# 场景合并说明文档

## 概述
将Scene1.tsx至Scene5.tsx五个独立场景文件合并为一个统一的组件文件：`CombinedScenes1to5.tsx`

## 合并日期
2025-11-07

## 主要改进

### 1. 统一的SystemPrompt架构 ✨

所有5个场景现在共享同一个**基础systemPrompt**，确保AI的核心性格和行为一致：

```typescript
const baseSystemPrompt = `你是博物馆的智能监控系统AI助手，名叫"守望者"。

你的性格特点：
- 专业、冷静、理性，但也有人性化的一面
- 对博物馆的文物如数家珍
- 在危机时刻会展现出对守夜人的关心
- 会根据情况变化调整语气（从轻松到紧张再到崩溃）
...
`;
```

### 2. 动态上下文注入 🎯

每个场景会自动累积之前发生的情况，注入到当前的systemPrompt中：

**结构：**
```
基础SystemPrompt
  +
===已经发生的情况===
  【故事进展】
    - 场景1的描述
    - 场景2的描述
    - ...
  【对话历史】
    - 场景1的对话
    - 场景2的对话
    - ...
  +
===当前场景===
  当前场景的特定上下文
```

**效果：**
- AI能完整了解整个故事进展
- 对话更加连贯，能引用之前的事件
- 不同场景间的过渡更自然

### 3. 场景配置

每个场景包含：
- `title`: 场景标题
- `description`: 场景描述文本（会被累积到故事历史）
- `contextPrompt`: 场景特定的提示词（描述当前情境）
- `initialMessage`: AI的开场白
- `minMessages`: 最少对话轮数

### 4. 统一的视觉呈现

所有5个场景使用同一张背景图片（监控室屏幕），保持视觉连贯性。

```typescript
imageUrl={monitorRoomImage}
```

## 文件结构

### 创建的文件
- ✅ `/components/CombinedScenes1to5.tsx` - 新的合并组件

### 删除的文件
- ❌ `/components/Scene1.tsx`
- ❌ `/components/Scene2.tsx`
- ❌ `/components/Scene3.tsx`
- ❌ `/components/Scene4.tsx`
- ❌ `/components/Scene5.tsx`
- ❌ `/components/CombinedScenes.tsx` (旧的合并组件)

### 更新的文件
- ✏️ `/components/GameCover.tsx` - 使用新的CombinedScenes1to5组件
- ✏️ `/components/InteractiveScene.tsx` - 支持返回对话历史

## 技术实现

### 状态管理

```typescript
const [currentScene, setCurrentScene] = useState(1); // 当前场景索引
const [storyHistory, setStoryHistory] = useState<string>(""); // 故事描述历史
const [conversationHistory, setConversationHistory] = useState<string>(""); // 对话历史
```

### 历史累积

```typescript
const handleSceneComplete = (history: string) => {
  // 保存场景描述
  const sceneStory = `场景${currentScene}【${title}】：\n${description}`;
  setStoryHistory(prev => prev ? `${prev}\n\n${sceneStory}` : sceneStory);
  
  // 保存对话历史
  const formattedHistory = `\n===场景${currentScene}对话===\n${history}`;
  setConversationHistory(prev => prev ? `${prev}\n${formattedHistory}` : formattedHistory);
  
  // 进入下一场景
  setCurrentScene(currentScene + 1);
};
```

### SystemPrompt构建

```typescript
const buildSystemPrompt = () => {
  let prompt = baseSystemPrompt;
  
  // 添加已发生的情况
  if (storyHistory || conversationHistory) {
    prompt += `\n\n===已经发生的情况===`;
    if (storyHistory) {
      prompt += `\n\n【故事进展】\n${storyHistory}`;
    }
    if (conversationHistory) {
      prompt += `\n\n【对话历史】\n${conversationHistory}`;
    }
  }
  
  // 添加当前场景上下文
  prompt += `\n\n===当前场景===\n${currentSceneConfig.contextPrompt}`;
  
  return prompt;
};
```

## 5个场景概览

### 场景1：一成不变的工作
- **描述**: 守夜人的日常巡逻，平静的夜晚
- **语气**: 轻松、专业，略带幽默
- **最小对话数**: 2

### 场景2：失控的监控室
- **描述**: 午夜钟声响起，青铜鼎发光，监控异常
- **语气**: 紧张、专业但略显慌乱
- **最小对话数**: 2

### 场景3：不属于此世的光
- **描述**: 多件文物觉醒，超自然现象爆发
- **语气**: 紧急、快速，系统过载
- **最小对话数**: 3

### 场景4：文明的断裂
- **描述**: 时空裂缝出现，物理定律失效
- **语气**: 急促、断断续续，开始<glitch/>
- **最小对话数**: 3

### 场景5：使命的召唤
- **描述**: 守夜人即将被吸入裂缝，最后时刻
- **语气**: 充满情感、即将失联，大量<glitch/>
- **最小对话数**: 2

## 优势总结

✅ **代码更简洁**: 5个文件合并为1个，减少重复代码
✅ **维护更容易**: 统一的systemPrompt，修改一处即可
✅ **AI更智能**: 完整的上下文让AI回复更连贯
✅ **扩展更灵活**: 添加新场景只需在配置数组中添加即可
✅ **视觉更统一**: 所有场景共享同一背景图片

## 使用示例

```tsx
<CombinedScenes1to5
  playerName={playerName}
  onComplete={() => {
    // 5个场景全部完成后的回调
    setGamePhase("transitionChoice");
  }}
/>
```

## 未来可优化方向

1. 可以将场景配置独立到JSON或配置文件中
2. 可以添加场景跳过功能（调试用）
3. 可以添加场景回溯功能
4. 可以将对话历史保存到localStorage实现存档功能
