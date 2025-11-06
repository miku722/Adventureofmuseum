# 图片资源文件夹

此文件夹用于存放游戏中使用的图片资源。

## 文件夹结构建议

```
/assets/images/
├── backgrounds/     # 背景图片
├── characters/      # 角色图片
├── objects/         # 物品图片
├── ui/             # UI元素图片
└── effects/        # 特效图片
```

## 使用方法

在组件中导入图片：

```tsx
import exampleImage from "../../assets/images/your-image.png";

// 使用
<img src={exampleImage} alt="描述" />
```

## 注意事项

- 图片命名使用小写字母和连字符（例如：`museum-background.png`）
- 优先使用 `.png` 格式（支持透明）或 `.jpg` 格式（更小的文件大小）
- 建议图片尺寸不超过 2MB
- 为每张图片提供清晰的命名，便于识别用途
