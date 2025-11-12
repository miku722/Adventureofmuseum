/**
 * useChatAPI - AI对话API调用Hook
 * 封装通用的AI对话API调用逻辑，可被多个组件复用
 */

import { getNPCPrompt } from "../utils/npcMemorySystem";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatAPIConfig {
  apiUrl?: string;
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * 默认API配置
 */
const DEFAULT_CONFIG: Required<ChatAPIConfig> = {
  apiUrl:
    "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
  apiKey: "sk-e3c846e265644474ab7b47271e32be0c",
  model: "qwen-plus",
  temperature: 0.8,
  maxTokens: 300,
};

/**
 * 调用AI对话API
 */
export async function callChatAPI(
  messages: ChatMessage[],
  config: ChatAPIConfig = {},
): Promise<string> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  console.log("🌐 [ChatAPI] 调用 API...");
  console.log("├─ 模型:", finalConfig.model);
  console.log("├─ 消息数量:", messages.length);
  console.log("├─ Temperature:", finalConfig.temperature);
  console.log("├─ Max Tokens:", finalConfig.maxTokens);

  const response = await fetch(finalConfig.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${finalConfig.apiKey}`,
    },
    body: JSON.stringify({
      model: finalConfig.model,
      messages: messages,
      temperature: finalConfig.temperature,
      max_tokens: finalConfig.maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ [ChatAPI] API调用失败:", response.status, errorText);
    throw new Error(
      `API调用失败: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  console.log("✅ [ChatAPI] 收到响应:", content.substring(0, 80) + "...");

  return content;
}

/**
 * 生成NPC初始问候
 */
export async function generateNPCGreeting(
  npcId: string,
  playerName: string,
  config: ChatAPIConfig = {},
): Promise<string> {
  console.log("👋 [ChatAPI] 生成NPC初始问候...");
  console.log("├─ NPC ID:", npcId);
  console.log("├─ 玩家名字:", playerName);

  const systemPrompt = getNPCPrompt(npcId, playerName);
  
  // 检查是否曾经关闭过对话（老友式问候）
  const { npcMemoryManager } = await import("../utils/npcMemorySystem");
  const npcMemory = npcMemoryManager.getMemory(npcId);
  const isFirstMeet = !npcMemory.metPlayer;
  const hasClosedBefore = npcMemory.closedConversation;

  let greetingPrompt: string;
  
  if (isFirstMeet) {
    // 第一次见面
    console.log("├─ 问候类型: 首次见面");
    greetingPrompt = `${systemPrompt}\n\n这是${playerName}第一次遇见你，请主动打个招呼并简单介绍自己。记住要符合你的身份和性格。`;
  } else if (hasClosedBefore) {
    // 关闭后再次打开（老友式问候）
    console.log("├─ 问候类型: 老友重逢");
    const timeSinceLastClose = npcMemory.lastClosedTime 
      ? Math.floor((Date.now() - npcMemory.lastClosedTime) / 1000 / 60) // 分钟
      : 0;
    const timeDesc = timeSinceLastClose < 5 ? "刚才" : timeSinceLastClose < 60 ? "不久前" : "之前";
    
    greetingPrompt = `${systemPrompt}\n\n${playerName}${timeDesc}离开了，现在又回来找你。用老朋友的口吻热情地招呼TA，可以简单提一下你们之前的对话或者问问TA是不是有新的想法。保持自然、友好，符合你的性格。`;
  } else {
    // 普通再次对话（已见过但没关闭过）
    console.log("├─ 问候类型: 继续对话");
    greetingPrompt = `${systemPrompt}\n\n${playerName}再次来找你对话。自然地继续你们的交流，可以提到之前的对话内容。`;
  }

  const content = await callChatAPI(
    [
      {
        role: "system",
        content: greetingPrompt,
      },
    ],
    { ...config, maxTokens: 200 },
  );

  console.log("💬 [ChatAPI] 初始问候生成完成");
  return content;
}

/**
 * 生成NPC对话响应
 */
export async function generateNPCResponse(
  npcId: string,
  playerName: string,
  conversationHistory: ChatMessage[],
  config: ChatAPIConfig = {},
): Promise<string> {
  console.log("🚀 [ChatAPI] 生成NPC响应...");
  console.log("├─ NPC ID:", npcId);
  console.log("├─ 历史消息数:", conversationHistory.length);

  const systemPrompt = getNPCPrompt(npcId, playerName);

  const content = await callChatAPI(
    [
      {
        role: "system",
        content: systemPrompt,
      },
      ...conversationHistory,
    ],
    config,
  );

  console.log("💬 [ChatAPI] NPC响应生成完成");
  return content;
}