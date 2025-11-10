# 可复用组件文档

这个目录包含了游戏中的可复用基础组件。这些组件被设计为高度可配置，可以在不同场景中重复使用。

## ChapterIntroBase - 章节介绍基础组件

用于展示章节标题和介绍的全屏组件。

### 功能特性
- 背景图片淡入，然后模糊
- 章节标题从模糊背景中浮现
- 装饰线条动画
- 副标题显示
- 环境光效动画
- 支持两种主题：amber（琥珀金）和 cyan（青色）

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| chapterTitle | string | 必需 | 章节标题 |
| subtitle | string | "Chapter" | 副标题（如 "Prologue", "Chapter One"） |
| backgroundImage | string | 必需 | 背景图片路径 |
| imageAlt | string | 必需 | 图片的alt文本 |
| theme | "amber" \| "cyan" | "amber" | 颜色主题 |
| onComplete | () => void | 必需 | 完成时的回调函数 |

### 使用示例

```tsx
import { ChapterIntroBase } from "./shared/ChapterIntroBase";
import backgroundImg from "figma:asset/xxx.png";

function MyChapterIntro({ onComplete }: { onComplete: () => void }) {
  return (
    <ChapterIntroBase
      chapterTitle="失落的午夜"
      subtitle="Prologue"
      backgroundImage={backgroundImg}
      imageAlt="博物馆夜景"
      theme="amber"
      onComplete={onComplete}
    />
  );
}
```

### 主题配置

**Amber主题（琥珀金）**
- 线条颜色：琥珀金
- 标题颜色：琥珀金200
- 副标题颜色：琥珀金300/80
- 光效：琥珀金光晕

**Cyan主题（青色）**
- 线条颜色：青色
- 标题颜色：青色200
- 副标题颜色：青色300/80
- 光效：青色+紫色双重光晕

---

## NarrativeSceneBase - 旁白场景基础组件

用于展示故事旁白的左右分屏组件，支持键盘交互。

### 功能特性
- 左右分屏布局（左侧文字，右侧图片）
- 旁白文字逐段显示，带打字机效果
- 自动播放（每段4秒）
- 空格/回车键跳过到下一段
- 进度条指示器
- 所有段落显示完毕后出现继续按钮
- 支持两种主题：amber（琥珀金）和 cyan（青色）
- 可选的发光粒子效果

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| segments | NarrativeSegment[] | 必需 | 旁白文本段落数组 |
| backgroundImage | string | 必需 | 右侧背景图片路径 |
| imageAlt | string | 必需 | 图片的alt文本 |
| theme | "amber" \| "cyan" | "amber" | 颜色主题 |
| continueButtonText | string | "继续故事" | 继续按钮的文字 |
| onComplete | () => void | 必需 | 完成时的回调函数 |
| showParticles | boolean | false | 是否显示发光粒子效果 |

### 类型定义

```tsx
interface NarrativeSegment {
  text: string;
}
```

### 使用示例

```tsx
import { NarrativeSceneBase } from "./shared/NarrativeSceneBase";
import backgroundImg from "figma:asset/xxx.png";

const segments = [
  { text: "这是第一段旁白..." },
  { text: "这是第二段旁白..." },
  { text: "这是第三段旁白..." },
];

function MyNarrativeScene({ onComplete }: { onComplete: () => void }) {
  return (
    <NarrativeSceneBase
      segments={segments}
      backgroundImage={backgroundImg}
      imageAlt="场景描述"
      theme="cyan"
      continueButtonText="进入下一章"
      onComplete={onComplete}
      showParticles={true}
    />
  );
}
```

### 交互说明

1. **自动播放**：每段文字显示4秒后自动进入下一段
2. **手动跳过**：按空格或回车键立即显示下一段
3. **继续游戏**：所有段落显示完毕后，按空格/回车或点击按钮继续

### 主题配置

**Amber主题（琥珀金）**
- 文字颜色：琥珀金100/90
- 背景渐变：slate系列
- 按钮：琥珀金渐变
- 适用于：博物馆、古代场景

**Cyan主题（青色）**
- 文字颜色：青色100/90
- 背景渐变：紫色-紫罗兰-slate
- 按钮：青色渐变
- 粒子效果：青色发光粒子
- 额外光效：紫色光晕
- 适用于：时空穿越、神秘场景

---

## 最佳实践

### 创建新的章节介绍

1. 创建一个新的组件文件（如 `ChapterIntro3.tsx`）
2. 导入 `ChapterIntroBase`
3. 传入特定的标题、图片和主题
4. 导出包装组件

```tsx
import { ChapterIntroBase } from "./shared/ChapterIntroBase";
import myImage from "figma:asset/xxx.png";

interface ChapterIntro3Props {
  chapterTitle: string;
  onComplete: () => void;
}

export function ChapterIntro3({ chapterTitle, onComplete }: ChapterIntro3Props) {
  return (
    <ChapterIntroBase
      chapterTitle={chapterTitle}
      subtitle="Chapter Two"
      backgroundImage={myImage}
      imageAlt="场景描述"
      theme="cyan"
      onComplete={onComplete}
    />
  );
}
```

### 创建新的旁白场景

1. 创建一个新的组件文件（如 `Scene7.tsx`）
2. 定义旁白段落数组
3. 导入 `NarrativeSceneBase`
4. 传入段落、图片和配置
5. 导出包装组件

```tsx
import { NarrativeSceneBase } from "./shared/NarrativeSceneBase";
import sceneImage from "figma:asset/xxx.png";

const segments = [
  { text: "旁白内容1..." },
  { text: "旁白内容2..." },
  // ...更多段落
];

export function Scene7({ onComplete }: { onComplete: () => void }) {
  return (
    <NarrativeSceneBase
      segments={segments}
      backgroundImage={sceneImage}
      imageAlt="场景7"
      theme="amber"
      continueButtonText="继续探索"
      onComplete={onComplete}
      showParticles={false}
    />
  );
}
```

### 选择合适的主题

- **Amber主题**：温暖、古典、博物馆、历史相关场景
- **Cyan主题**：神秘、科幻、时空穿越、魔法相关场景

### 性能优化建议

1. **图片优化**：使用适当大小的图片资源
2. **段落数量**：建议每个场景3-8段旁白，保持节奏
3. **粒子效果**：仅在需要时启用 `showParticles`，避免性能问题

---

## 维护说明

如果需要修改所有章节介绍或旁白场景的共同行为，只需修改基础组件：
- `ChapterIntroBase.tsx` - 修改章节介绍的通用逻辑
- `NarrativeSceneBase.tsx` - 修改旁白场景的通用逻辑

所有使用这些基础组件的具体场景都会自动继承更新。
