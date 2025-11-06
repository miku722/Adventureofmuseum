# InteractiveScene 组件说明

## 概述
`InteractiveScene` 是一个通用的交互式场景组件，用于场景1-5的新UI设计。它采用左右分屏布局（左边文字，右边图片），实现了打字机效果、AI对话和流畅的交互体验。

## 功能特性

### 1. 打字机效果
- 标题和描述以打字机效果逐字显示
- 打字速度：标题80ms/字，描述50ms/字
- 打字完成后显示光标闪烁效果

### 2. 渐进式交互
- 描述打印完成后，文本输入框从下方缓缓升起
- AI初始消息在输入框升起前显示
- 流畅的动画过渡效果

### 3. 对话历史管理
- 用户输入和AI回复接在已打印的文本后
- 自动滚动到最新消息
- 可向上滚动查看历史对话
- 顶部和底部淡出效果（maskImage渐变）

### 4. 视觉设计
- 左侧：文字内容区（可滚动）
- 右侧：图片占位符（带旋转动画效果）
- 环境光效和渐变背景
- 响应式设计（移动端隐藏图片区域）

## 使用方法

```tsx
import { InteractiveScene } from "./InteractiveScene";

export function Scene1({ onComplete, playerName }: Scene1Props) {
  return (
    <InteractiveScene
      title="场景标题"
      description="场景描述文本\n可以使用\n多行"
      imagePlaceholder="图片描述"
      systemPrompt="AI系统提示词..."
      initialMessage={`AI初始消息，可使用${playerName}`}
      playerName={playerName}
      minMessages={2}
      onComplete={onComplete}
    />
  );
}
```

## Props 说明

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| title | string | 是 | - | 场景标题 |
| description | string | 是 | - | 场景描述（支持\n换行） |
| imagePlaceholder | string | 否 | "神秘场景" | 图片占位符文字 |
| systemPrompt | string | 是 | - | AI系统提示词 |
| initialMessage | string | 是 | - | AI初始消息 |
| playerName | string | 是 | - | 玩家名字 |
| minMessages | number | 否 | 2 | 最少对话轮数 |
| onComplete | () => void | 是 | - | 完成回调 |

## 技术细节

### 状态管理
- `displayedTitle` / `displayedDescription`: 当前显示的标题/描述
- `titleComplete` / `descriptionComplete`: 打字完成标志
- `showInput`: 输入框显示控制
- `messages`: 对话历史数组
- `canContinue`: 是否可以继续游戏

### 特殊功能
- **乱码效果**: AI消息中的`<glitch/>`标记会被渲染为GlitchText组件
- **自动滚动**: 新消息时自动滚动到底部
- **键盘控制**: 完成后支持空格/回车继续
- **API集成**: 支持阿里云千问API，失败时降级到模拟响应

### 滚动区域设计
```css
maskImage: "linear-gradient(to bottom, transparent 0%, black 5%, black 85%, transparent 100%)"
```
- 顶部5%淡出：隐藏滚动区域顶部内容
- 中间85%完全可见
- 底部15%淡出：为输入框区域提供视觉过渡

## 与旧版本的区别

### 旧版本（Scene1-5原实现）
- 先显示全屏旁白，3-5秒后切换到独立对话框
- 对话框是黑色背景+气泡式消息
- 旁白和对话是分离的两个阶段

### 新版本（InteractiveScene）
- 左右分屏布局，一半图片一半文字
- 打字机效果显示标题和描述
- 对话内容接在描述后，形成连贯的文本流
- 所有内容在同一个可滚动区域内
- 文本过多时自动淡出，支持滚动查看历史

## 已更新的场景

✅ Scene1: 万籁俱寂的巡逻
✅ Scene2: 失控的监控室  
✅ Scene3: 不属于此世的光
✅ Scene4: 文明的断裂（带<glitch/>效果）
✅ Scene5: 使命的召唤（带<glitch/>效果）

## 注意事项

1. description文本使用`\n`换行，会在渲染时正确显示
2. systemPrompt中的`{playerName}`会自动替换为实际玩家名
3. 图片占位符目前使用旋转圆环动画，后续可替换为真实图片
4. minMessages控制何时显示"继续"提示，建议2-3轮对话
5. 淡出效果依赖于CSS maskImage，旧浏览器可能不支持
