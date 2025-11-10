# API迁移总结

## ✅ 迁移完成

已成功将NPC对话系统从**DeepSeek API**迁移到**阿里云DashScope API**（通义千问）。

---

## 🔄 主要变更

### 之前 (DeepSeek)

```typescript
// API配置
const API_URL = "https://api.deepseek.com/v1/chat/completions";
const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;

// 请求体
{
  model: "deepseek-chat",
  messages: [...],
  temperature: 0.8,
  max_tokens: 300
}
```

### 现在 (DashScope)

```typescript
// API配置（支持环境变量 + 默认值）
const API_URL = import.meta.env.VITE_API_URL || 
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
const API_KEY = import.meta.env.VITE_API_KEY || 
  "sk-e3c846e265644474ab7b47271e32be0c";

// 请求体
{
  model: "qwen-plus",  // 通义千问Plus
  messages: [...],
  temperature: 0.8,
  max_tokens: 300
}
```

---

## 📦 修改的文件

### 1. `/components/game/NPCChat.tsx`

**修改位置**：
- `sendInitialGreeting()` 函数 (第91-148行)
- `handleSend()` 函数 (第165-241行)

**修改内容**：
```typescript
// 两处都改为：
const API_URL = import.meta.env.VITE_API_URL || 
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
const API_KEY = import.meta.env.VITE_API_KEY || 
  "sk-e3c846e265644474ab7b47271e32be0c";

// 模型改为：
model: "qwen-plus"
```

### 2. `/.env.example`

```env
# 阿里云DashScope API配置
VITE_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
VITE_API_KEY=your_api_key_here
```

### 3. `/ERROR_FIXES.md`

更新了API密钥配置说明，指向DashScope控制台。

### 4. `/API_CONFIGURATION.md` (新增)

完整的API配置文档，包含：
- 快速开始指南
- API详细说明
- 切换其他API的方法
- 常见问题排查

---

## 🎯 优势

### 为什么选择DashScope？

1. **中文优化** ✅
   - 通义千问专为中文优化
   - 更好地理解中文语境和文化

2. **访问速度** ✅
   - 国内访问延迟低
   - 响应更快，体验更流畅

3. **成本效益** ✅
   - 价格相对优惠
   - 更适合国内项目

4. **兼容性好** ✅
   - 使用OpenAI兼容格式
   - 易于切换到其他API

---

## 🚀 如何使用

### 步骤1: 获取API密钥

访问 [DashScope控制台](https://dashscope.console.aliyun.com/) 创建API密钥

### 步骤2: 配置环境变量

创建`.env`文件：

```env
VITE_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
VITE_API_KEY=sk-你的密钥
```

### 步骤3: 重启服务器

```bash
npm run dev
```

### 步骤4: 测试

1. 进入游戏Chapter1_Market场景
2. 点击任意NPC
3. 观察AI对话是否正常

---

## 🔧 回退机制

代码中保留了默认API配置作为回退：

```typescript
const API_URL = import.meta.env.VITE_API_URL || "默认URL";
const API_KEY = import.meta.env.VITE_API_KEY || "默认密钥";
```

**说明**：
- 如果环境变量未配置，会使用默认值
- 默认值仅供测试，生产环境请配置环境变量

---

## 🔄 切换到其他API

代码设计支持灵活切换：

### 切换到OpenAI

```env
VITE_API_URL=https://api.openai.com/v1/chat/completions
VITE_API_KEY=sk-your-openai-key
```

然后修改`NPCChat.tsx`中的`model: "gpt-3.5-turbo"`

### 切换到DeepSeek

```env
VITE_API_URL=https://api.deepseek.com/v1/chat/completions
VITE_API_KEY=sk-your-deepseek-key
```

然后修改`model: "deepseek-chat"`

---

## 📊 测试清单

- [x] API连接测试
- [x] NPC初始问候功能
- [x] NPC对话交互功能
- [x] 对话历史记录
- [x] 错误处理
- [x] 环境变量配置
- [x] 默认值回退机制

---

## 📝 注意事项

### 1. API密钥安全

⚠️ **不要**将API密钥提交到git仓库

确保`.env`文件在`.gitignore`中：

```gitignore
.env
.env.local
.env.*.local
```

### 2. 重启服务器

修改`.env`文件后**必须**重启开发服务器才能生效。

### 3. 生产环境

生产环境部署时，需要在部署平台配置环境变量：
- Vercel: Project Settings > Environment Variables
- Netlify: Site Settings > Environment Variables

---

## 🐛 问题排查

### 问题：NPC不说话

**检查项**：
1. `.env`文件是否存在
2. `VITE_API_KEY`是否正确配置
3. 开发服务器是否已重启
4. 浏览器控制台是否有错误

### 问题：401 Unauthorized

**原因**：API密钥无效

**解决**：
1. 检查密钥是否正确
2. 确认密钥未过期
3. 重新生成密钥

---

## 📚 相关文档

- **详细配置**: [API_CONFIGURATION.md](./API_CONFIGURATION.md)
- **错误修复**: [ERROR_FIXES.md](./ERROR_FIXES.md)
- **NPC系统**: [NPC_MEMORY_SYSTEM.md](./NPC_MEMORY_SYSTEM.md)
- **对话改进**: [CHANGELOG_DIALOGUE_IMPROVEMENTS.md](./CHANGELOG_DIALOGUE_IMPROVEMENTS.md)

---

## ✨ 后续优化建议

### 短期
- [ ] 添加API请求重试机制
- [ ] 优化错误提示文案
- [ ] 添加加载进度显示

### 中期
- [ ] 实现流式响应（SSE）
- [ ] 添加响应缓存
- [ ] 支持多语言

### 长期
- [ ] 本地模型支持
- [ ] 多模态对话（图片、语音）
- [ ] 个性化对话调优

---

**迁移日期**: 2024-11-XX  
**状态**: ✅ 完成  
**测试**: ✅ 通过  
**文档**: ✅ 完成
