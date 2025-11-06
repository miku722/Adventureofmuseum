# AI对话组件说明

## 问题解决

**问题：** AI对话框没有显示输入框

**原因：** GameCover组件中，封面界面（cover）始终在渲染，即使在其他游戏阶段也会显示，遮挡了AI对话框。

**解决方案：** 将封面界面也包装在条件渲染中（`{gamePhase === "cover" && ...}`），确保只在cover阶段显示。

## AIChat组件结构

AIChat组件是一个完整的对话界面，包含：

### 1. 对话窗口（居中显示）
- 半透明黑色背景遮罩 (`z-50`)
- 居中的对话框（最大宽度2xl）
- 琥珀金色边框，渐变背景

### 2. 对话区域（顶部）
- 高度500px，可滚动
- AI消息显示在左侧（灰色背景）
- 用户消息显示在右侧（琥珀色背景）
- 加载时显示旋转图标

### 3. 输入区域（底部）
- 输入框：深色背景，琥珀色聚焦效果
- 发送按钮：琥珀色背景，黑色文字，带发送图标
- "继续故事"按钮：在达到最少对话轮数后显示

## 交互流程

1. **初始化**: AIChat组件挂载后500ms显示初始消息
2. **用户输入**: 在输入框输入文字，按Enter或点击发送按钮
3. **AI响应**: 调用AI API（或使用模拟响应）
4. **继续条件**: 达到minMessages轮对话后，显示"继续故事"按钮
5. **完成**: 点击"继续故事"触发onComplete回调

## API配置

需要在AIChat.tsx中配置：
```typescript
const API_URL = "YOUR_API_URL_HERE"; // 例如: "https://api.openai.com/v1/chat/completions"
const API_KEY = "YOUR_API_KEY_HERE";
```

如果API不可用，组件会自动使用模拟响应（mock responses）。

## Props说明

- `playerName`: 玩家名字，用于个性化对话
- `systemPrompt`: AI角色设定和对话指引
- `initialMessage`: AI的初始问候语（可选）
- `minMessages`: 最少对话轮数，默认3轮
- `onComplete`: 对话完成的回调函数

## 视觉效果

- 所有消息都有渐入动画（opacity 0→1, y 20→0）
- 输入框自动聚焦
- 消息自动滚动到底部
- "继续故事"按钮有渐变色和阴影效果
