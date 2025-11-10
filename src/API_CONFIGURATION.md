# API配置说明文档

## 📋 概述

本游戏的NPC对话系统已经切换到使用**阿里云DashScope API**（通义千问模型），采用OpenAI兼容模式，支持灵活的AI对话功能。

---

## 🔧 当前配置

### API提供商
- **服务商**: 阿里云灵积（DashScope）
- **API端点**: `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`
- **模型**: `qwen-plus` (通义千问Plus)
- **兼容性**: OpenAI API格式

### 为什么选择DashScope？

1. ✅ **中文优化**: 通义千问对中文理解和生成更优秀
2. ✅ **响应速度**: 国内访问速度快，延迟低
3. ✅ **成本效益**: 相比国际API更具性价比
4. ✅ **兼容性好**: 使用OpenAI兼容格式，易于切换

---

## 🚀 快速开始

### 步骤1: 获取API密钥

1. 访问 [阿里云DashScope控制台](https://dashscope.console.aliyun.com/)
2. 注册/登录阿里云账号
3. 开通灵积模型服务（DashScope）
4. 进入"API-KEY管理"页面
5. 创建新的API-KEY
6. 复制生成的密钥

### 步骤2: 配置环境变量

在项目根目录创建`.env`文件：

```env
# 阿里云DashScope API配置
VITE_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
VITE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxx
```

**注意**: 将`sk-xxxxxxxxxxxxxxxxxxxxxx`替换为你的实际API密钥

### 步骤3: 重启开发服务器

```bash
# 停止当前服务器（Ctrl+C）
# 重新启动
npm run dev
```

---

## 📁 文件结构

### 环境变量文件

```
项目根目录/
├── .env.example          # 环境变量示例（提交到git）
├── .env                  # 本地配置（不提交）
└── .env.local            # 本地私有配置（不提交，优先级最高）
```

### 相关代码文件

```
/components/game/
└── NPCChat.tsx           # NPC对话组件（使用API）

/utils/
└── npcMemorySystem.ts    # NPC记忆系统
```

---

## 🔍 NPCChat.tsx API配置详解

### 配置代码位置

在`NPCChat.tsx`中有两处使用API的地方：

#### 1. 初始问候（sendInitialGreeting函数）

```typescript
// API配置
const API_URL = import.meta.env.VITE_API_URL || 
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
const API_KEY = import.meta.env.VITE_API_KEY || 
  "sk-e3c846e265644474ab7b47271e32be0c";

const response = await fetch(API_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
  body: JSON.stringify({
    model: "qwen-plus",        // 通义千问Plus模型
    messages: [...],
    temperature: 0.8,          // 创造性参数
    max_tokens: 200,           // 最大生成长度
  }),
});
```

#### 2. 对话消息（handleSend函数）

```typescript
// API配置
const API_URL = import.meta.env.VITE_API_URL || 
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
const API_KEY = import.meta.env.VITE_API_KEY || 
  "sk-e3c846e265644474ab7b47271e32be0c";

const response = await fetch(API_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
  body: JSON.stringify({
    model: "qwen-plus",        // 通义千问Plus模型
    messages: [
      { role: "system", content: systemPrompt },
      ...conversationMessages
    ],
    temperature: 0.8,
    max_tokens: 300,           // 对话可以更长一些
  }),
});
```

### 回退机制

代码中使用了`||`运算符提供默认值：

```typescript
const API_URL = import.meta.env.VITE_API_URL || "默认URL";
const API_KEY = import.meta.env.VITE_API_KEY || "默认密钥";
```

**说明**：
- 如果配置了环境变量，使用环境变量
- 如果未配置，使用硬编码的默认值（仅供测试）
- **生产环境强烈建议配置环境变量**

---

## 🎮 使用示例

### 环境变量配置示例

#### 开发环境 (.env)

```env
# 开发环境配置
VITE_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
VITE_API_KEY=sk-dev-key-xxxxx
```

#### 生产环境 (.env.production)

```env
# 生产环境配置
VITE_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
VITE_API_KEY=sk-prod-key-xxxxx
```

#### 测试环境 (.env.test)

```env
# 测试环境配置（可以使用mock服务）
VITE_API_URL=http://localhost:3001/mock/chat
VITE_API_KEY=test-key
```

---

## 🔄 切换到其他API提供商

如果需要切换到其他API提供商（如OpenAI、DeepSeek等），只需修改环境变量：

### 切换到OpenAI

```env
VITE_API_URL=https://api.openai.com/v1/chat/completions
VITE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx
```

然后修改`NPCChat.tsx`中的`model`参数：

```typescript
model: "gpt-3.5-turbo",  // 或 "gpt-4"
```

### 切换到DeepSeek

```env
VITE_API_URL=https://api.deepseek.com/v1/chat/completions
VITE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx
```

修改model参数：

```typescript
model: "deepseek-chat",
```

### 切换到其他兼容OpenAI格式的服务

只要API格式兼容OpenAI，都可以通过修改`VITE_API_URL`和`VITE_API_KEY`来切换。

---

## ⚙️ 模型参数说明

### temperature (温度)

```typescript
temperature: 0.8
```

- **范围**: 0.0 - 2.0
- **说明**: 控制回复的创造性和随机性
- **0.0-0.3**: 更确定、更一致的回复
- **0.7-0.9**: 平衡创造性和一致性（推荐）
- **1.0-2.0**: 更有创意、更多样化的回复

**当前设置**: 0.8 - 适合NPC对话，既有个性又不失稳定性

### max_tokens (最大令牌数)

```typescript
max_tokens: 200  // 初始问候
max_tokens: 300  // 正常对话
```

- **说明**: 限制生成文本的最大长度
- **中文**: 大约1个token = 1.5-2个中文字
- **200 tokens**: 约300-400个中文字（适合简短问候）
- **300 tokens**: 约450-600个中文字（适合对话回复）

**建议**：
- 初始问候：200 tokens（简短介绍）
- 正常对话：300-500 tokens（详细回答）
- 长篇叙事：500-1000 tokens

### model (模型选择)

```typescript
model: "qwen-plus"
```

**DashScope可用模型**：

| 模型 | 说明 | 上下文长度 | 适用场景 |
|------|------|-----------|---------|
| `qwen-turbo` | 快速版本 | 8K | 简单对话 |
| `qwen-plus` | 标准版本 | 32K | 一般对话（当前使用）|
| `qwen-max` | 高级版本 | 8K | 复杂推理 |
| `qwen-long` | 长文本版本 | 1M | 长文档处理 |

**当前选择**: `qwen-plus` - 性能和成本的最佳平衡

---

## 📊 API调用流程

### 1. NPC初次见面

```
玩家点击NPC
  ↓
Chapter1_Market触发handleNPCClick
  ↓
DialogueBox显示固定对话
  ↓
对话完成后触发handleDialogueComplete
  ↓
检测到第一次见面
  ↓
打开NPCChat组件
  ↓
NPCChat.sendInitialGreeting()
  ↓
调用DashScope API
  ↓
生成NPC问候语
  ↓
显示在对话框中
```

### 2. 对话交互

```
玩家输入消息
  ↓
NPCChat.handleSend()
  ↓
构建对话历史
  ↓
调用DashScope API
  ↓
传入：
  - System Prompt (NPC身份)
  - 对话历史
  - 当前消息
  ↓
生成NPC回复
  ↓
更新NPC记忆
  ↓
显示回复
```

### 3. API请求格式

```json
{
  "model": "qwen-plus",
  "messages": [
    {
      "role": "system",
      "content": "你是一个宋代商贩王老板..."
    },
    {
      "role": "user",
      "content": "你好，请问你知道青铜鼎吗？"
    }
  ],
  "temperature": 0.8,
  "max_tokens": 300
}
```

### 4. API响应格式

```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "哎呀这位客官，您这一问可问到点子上了..."
      }
    }
  ]
}
```

---

## 🛡️ 安全最佳实践

### 1. 环境变量管理

✅ **推荐做法**：
```env
# .env (不提交到git)
VITE_API_KEY=sk-real-key-xxxxx
```

❌ **避免**：
```typescript
// 硬编码在代码中
const API_KEY = "sk-real-key-xxxxx";
```

### 2. .gitignore配置

确保以下文件在`.gitignore`中：

```gitignore
# 环境变量
.env
.env.local
.env.*.local

# 不要忽略示例文件
!.env.example
```

### 3. API密钥权限

- ✅ 使用API密钥而不是账号密码
- ✅ 定期轮换API密钥
- ✅ 为不同环境使用不同密钥
- ✅ 设置API使用配额限制

### 4. 错误处理

代码中已实现完善的错误处理：

```typescript
try {
  // API调用
} catch (error) {
  console.error("API调用失败:", error);
  // 显示友好的错误提示
  // 不暴露敏感信息
}
```

---

## 🐛 常见问题排查

### 问题1: "获取NPC问候失败"

**可能原因**：
- API密钥未配置或错误
- 网络连接问题
- API服务不可用

**解决方案**：
1. 检查`.env`文件是否存在
2. 确认`VITE_API_KEY`已正确配置
3. 重启开发服务器
4. 检查网络连接
5. 查看控制台详细错误信息

### 问题2: API调用返回401错误

**原因**: API密钥无效或已过期

**解决方案**：
1. 登录DashScope控制台
2. 检查API密钥状态
3. 重新生成新的API密钥
4. 更新`.env`文件
5. 重启服务器

### 问题3: API调用超时

**原因**: 网络延迟或服务繁忙

**解决方案**：
1. 检查网络连接
2. 尝试减小`max_tokens`参数
3. 等待片刻后重试
4. 考虑添加超时重试机制

### 问题4: 回复内容不符合预期

**原因**: System Prompt不够明确或temperature设置不当

**解决方案**：
1. 优化`getNPCPrompt()`的提示词
2. 调整`temperature`参数（降低获得更稳定的回复）
3. 增加更多上下文信息
4. 查看`/utils/npcMemorySystem.ts`

---

## 📈 性能优化建议

### 1. 请求优化

```typescript
// 避免频繁请求
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
```

### 2. 响应缓存

```typescript
// 缓存常见问题的回复
const responseCache = new Map();

if (responseCache.has(userMessage)) {
  return responseCache.get(userMessage);
}
```

### 3. 流式响应（未来优化）

```typescript
// 使用SSE流式接收响应
const response = await fetch(API_URL, {
  // ...
  body: JSON.stringify({
    // ...
    stream: true  // 启用流式响应
  })
});
```

---

## 📝 维护日志

### v1.0 (当前版本)

**日期**: 2024-11-XX

**更改**：
- ✅ 从DeepSeek切换到阿里云DashScope
- ✅ 使用通义千问Plus模型
- ✅ 支持环境变量配置
- ✅ 添加默认值回退机制
- ✅ 完善错误处理

**影响的文件**：
- `/components/game/NPCChat.tsx`
- `/.env.example`
- `/ERROR_FIXES.md`

---

## 🔗 相关资源

### 官方文档
- [阿里云DashScope文档](https://help.aliyun.com/zh/dashscope/)
- [通义千问API参考](https://help.aliyun.com/zh/dashscope/developer-reference/api-details)
- [OpenAI兼容模式](https://help.aliyun.com/zh/dashscope/developer-reference/compatibility-of-openai-with-dashscope)

### 项目文档
- [NPC记忆系统](./NPC_MEMORY_SYSTEM.md)
- [对话系统改进日志](./CHANGELOG_DIALOGUE_IMPROVEMENTS.md)
- [错误修复文档](./ERROR_FIXES.md)

### 控制台链接
- [DashScope控制台](https://dashscope.console.aliyun.com/)
- [API-KEY管理](https://dashscope.console.aliyun.com/apiKey)
- [使用统计](https://dashscope.console.aliyun.com/billing)

---

## 🤝 贡献指南

如果需要添加新的API提供商支持：

1. 在`NPCChat.tsx`中添加新的配置选项
2. 更新`.env.example`文件
3. 添加相应的错误处理
4. 更新本文档
5. 测试不同场景

---

## 📞 支持

遇到问题？

1. 查看本文档的"常见问题排查"部分
2. 查看`/ERROR_FIXES.md`
3. 检查浏览器控制台错误信息
4. 联系项目维护者

---

**最后更新**: 2024-11-XX  
**维护者**: 时空之门开发团队  
**版本**: 1.0
