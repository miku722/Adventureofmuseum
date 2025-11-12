/**
 * NPC专属AI对话组件
 * 使用NPC独立记忆系统，每个NPC只知道自己的身份和记忆
 * 
 * 职责：
 * 1. 处理AI对话交互
 * 2. 解析和显示物品/线索/技能标记
 * 3. 显示AI思维链
 * 4. 管理对话历史和NPC记忆
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Send,
  X,
  MessageCircle,
  Package,
  Search,
  Zap,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import {
  getNPCPrompt,
  updateNPCMemoryAfterChat,
  npcMemoryManager,
} from "../../utils/npcMemory";
import { ThinkingMessage } from "./ThinkingMessage";
import {
  GameState,
  GameItem,
  Clue,
  Skill,
} from "../../utils/gameSystemPrompt";
import { generateNPCGreeting, generateNPCResponse } from "../../hooks/useChatAPI";

// 生成唯一消息ID
let messageIdCounter = 0;
function generateMessageId(): string {
  return `msg-${Date.now()}-${++messageIdCounter}`;
}

interface Message {
  role: "user" | "assistant" | "thinking";
  content: string;
  timestamp: number;
  isThinking?: boolean;
  id: string; // 改为必需字段
  thinkingContent?: string; // 改为字符串
}

interface NPCChatProps {
  npcId: string;
  playerName: string;
  gameState: GameState;
  onUpdateGameState: (
    updater: (prev: GameState) => GameState,
  ) => void;
  onClose: () => void;
  isOpen: boolean;
  // 可选：当对话达到某些条件时触发
  onDialogueCondition?: (condition: string) => void;
}

export function NPCChat({
  npcId,
  playerName,
  gameState,
  onUpdateGameState,
  onClose,
  isOpen,
  onDialogueCondition,
}: NPCChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 滚动到底部的函数
  const scrollToBottom = (smooth: boolean = false) => {
    if (scrollRef.current) {
      const scrollOptions: ScrollToOptions = {
        top: scrollRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      };
      scrollRef.current.scrollTo(scrollOptions);
      console.log('📜 [NPCChat] 滚动到底部');
    }
  };

  // 监听 isLoading 状态变化
  useEffect(() => {
    console.log("🔄 [NPCChat] isLoading 状态变化:", isLoading);
    console.log("├─ NPC ID:", npcId);
    console.log("├─ 时间:", new Date().toLocaleTimeString());
    console.log(
      "└─ 状态:",
      isLoading ? "🟢 加载中..." : "🔴 空闲",
    );
  }, [isLoading, npcId]);

  // 验证props
  useEffect(() => {
    console.log("🔍 [NPCChat] Props验证:");
    console.log("├─ onUpdateGameState类型:", typeof onUpdateGameState);
    console.log("├─ gameState:", gameState);
    console.log("└─ isOpen:", isOpen);
    
    if (typeof onUpdateGameState !== 'function') {
      console.error("❌ [NPCChat] onUpdateGameState不是函数！");
    }
  }, []);

  // 获取NPC记忆
  const npcMemory = npcMemoryManager.getMemory(npcId);
  const isFirstMeet = !npcMemory.metPlayer;

  // 处理关闭对话（记录到NPC记忆）
  const handleClose = () => {
    console.log("👋 [NPCChat] 用户关闭对话窗口");
    npcMemoryManager.recordConversationClosed(npcId);
    onClose();
  };

  // 初始化对话 - 加载历史记录
  useEffect(() => {
    if (isOpen) {
      // 记录对话打开
      npcMemoryManager.recordConversationOpened(npcId);
      
      console.log("📜 [NPCChat] 恢复历史记录...");
      console.log("├─ conversationHistory条数:", npcMemory.conversationHistory.length);
      
      // 从NPC记忆中恢复对话历史，为每条消息生成唯一ID，包括思考步骤
      const history: Message[] = npcMemory.conversationHistory
        .map((conv, convIndex) => {
          console.log(`  ├─ 历史记录[${convIndex}] thinking:`, conv.thinkingSteps ? `${conv.thinkingSteps.length}个步骤` : "无");
          return [
            {
              role: "user" as const,
              content: conv.playerMessage,
              timestamp: conv.timestamp,
              id: `history-user-${convIndex}-${conv.timestamp}`,
            },
            {
              role: "assistant" as const,
              content: conv.npcResponse,
              timestamp: conv.timestamp,
              id: `history-assistant-${convIndex}-${conv.timestamp}`,
              thinkingSteps: conv.thinkingSteps, // 恢复思考步骤
            },
          ];
        })
        .flat();

      console.log("└─ 恢复了", history.length, "条消息");
      setMessages(history);

      // 如果是第一次见面，NPC主动打招呼
      if (isFirstMeet && history.length === 0) {
        sendInitialGreeting();
      }

      // 聚焦输入框并滚动到底部
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom();
      }, 100);
    }
  }, [isOpen, npcId]);

  // 当消息更新时滚动到底部
  useEffect(() => {
    if (messages.length > 0) {
      // 延迟滚动，确保DOM已更新
      setTimeout(() => scrollToBottom(true), 100);
    }
  }, [messages]);

  // NPC主动打招呼
  const sendInitialGreeting = async () => {
    console.log("👋 [NPCChat] 开始发送初始问候...");
    setIsLoading(true);
    try {
      // 使用 useChatAPI hook
      const greeting = await generateNPCGreeting(npcId, playerName);

      const newMessage: Message = {
        role: "assistant",
        content: greeting,
        timestamp: Date.now(),
        id: generateMessageId(),
      };

      setMessages([newMessage]);
      console.log("💬 [NPCChat] 初始问候完成");
      
      // 滚动到底部
      setTimeout(() => scrollToBottom(true), 100);
    } catch (error) {
      console.error("❌ [NPCChat] 获取NPC问候失败:", error);

      let errorMessage = "(NPC似乎有些恍惚，没有说话...)";
      if (error instanceof Error) {
        if (error.message.includes("API密钥未配置")) {
          errorMessage = "(需要配置API密钥才能与NPC对话)";
        } else if (error.message.includes("API调用失败")) {
          errorMessage = "(连接出现问题，请稍后再试...)";
        }
      }

      setMessages([
        {
          role: "assistant",
          content: errorMessage,
          timestamp: Date.now(),
          id: generateMessageId(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 发送消息
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    console.log("📤 [NPCChat] 用户发送消息:", input.trim());

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
      id: generateMessageId(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setThinkingSteps([]); // 清空旧的思考步骤

    console.log("🚀 [NPCChat] 开始处理用户消息...");

    try {
      // API配置
      const API_URL =
        "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
      const API_KEY = "sk-e3c846e265644474ab7b47271e32be0c";

      // 获取NPC的SystemPrompt
      console.log("📝 [NPCChat] 获取 SystemPrompt...");
      const systemPrompt = getNPCPrompt(npcId, playerName);

      // 构建对话消息 - 过滤掉无效的role
      const conversationMessages = messages
        .concat(userMessage)
        .filter((msg) => msg.role === "user" || msg.role === "assistant") // 只保留有效的role
        .map((msg) => ({
          role: msg.role as "user" | "assistant", // 确保类型正确
          content: msg.content,
        }));

      console.log("🌐 [NPCChat] 调用 API...");
      console.log("├─ 消息数量:", conversationMessages.length);

      // 增强的system prompt，要求AI输出思考过程，包含互动统计
      const interactionSummary = npcMemoryManager.getInteractionSummary(npcId);
      
      // 构建详细的背包物品列表
      const inventoryDetails = gameState?.inventory?.length > 0 
        ? gameState.inventory.map(item => `"${item.name}"(${item.description || '无描述'})`).join('、')
        : '无';
      
      // 构建详细的线索列表
      const cluesDetails = gameState?.clues?.length > 0
        ? gameState.clues.map(clue => `"${clue.title}": ${clue.content}`).join('；')
        : '无';
      
      // 构建详细的技能列表
      const skillsDetails = gameState?.skills?.length > 0
        ? gameState.skills.map(skill => `"${skill.name}"(${skill.description})`).join('、')
        : '无';
      
      const enhancedSystemPrompt = `${systemPrompt}

${interactionSummary}

=== 重要：思考过程输出格式 ===
**你必须严格按照以下格式输出，不可省略任何部分：**

[思考开始]
用自然的自言自语方式思考，就像在心里盘算一样，口语化、流畅，不要用结构化格式。

思考时要考虑：
- 看看他背包里有什么...（${inventoryDetails}）
- 他刚才说了什么？想做什么呢...
- 如果他想用某个东西，得先确认他有没有...背包里有：${gameState?.inventory?.map(i => `"${i.name}"`).join('、') || '空的'}
- 要是他没有那个东西，可不能让他乱用，得告诉他没有
- 如果他想交换东西，我该不该答应呢...
- 我和他现在的关系...熟悉度${npcMemory.familiarity}，好感${npcMemory.affection}，信任${npcMemory.trust}，这是第${npcMemory.interactionStats.conversationOpenCount}次见面了
- 该怎么回应他呢？要不要给点什么...
- 这次对话之后，关系会有什么变化吗...好感度可能+/-多少，信任度呢...

**重要：用完整的句子思考，像一个人在内心独白，不要列表，不要序号，不要冒号格式。随意一点，自然一点，像真正的思考过程。**

示例（仅供参考格式）：
"嗯...让我想想，他背包里有包子和水壶。刚才他说想吃包子？那就让他吃吧，反正他有。吃完应该能恢复点体力。我们关系还不错，这样能增加点好感度吧，大概+2左右..."

[思考结束]

[回复内容]
你的实际回复内容...

**注意：[思考开始]和[思考结束]标记是必需的，即使思考内容很简单也不能省略。**`;

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "qwen-plus",
          messages: [
            {
              role: "system",
              content: enhancedSystemPrompt,
            },
            ...conversationMessages,
          ],
          temperature: 0.8,
          max_tokens: 500, // 增加token限制以容纳思考过程
        }),
      });

      if (!response.ok) {
        throw new Error(
          `API调用失败: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      let npcResponse = data.choices[0].message.content;

      console.log(
        "✅ [NPCChat] 收到 NPC 响应:",
        npcResponse.substring(0, 80) + "...",
      );
      
      console.log("📝 [NPCChat] 完整响应内容:", npcResponse);
      
      // 解析思考过程
      const thinkingMatch = npcResponse.match(/\[思考开始\]([\s\S]*?)\[思考结束\]/);
      let parsedThinkingContent = ""; // 改为字符串
      
      console.log("🔍 [NPCChat] 思考过程匹配结果:", thinkingMatch ? "找到思考内容" : "❌ 未找到思考内容");
      
      if (thinkingMatch) {
        parsedThinkingContent = thinkingMatch[1].trim();
        console.log("💭 [NPCChat] 原始思考内容:", parsedThinkingContent);
        console.log("✅ [NPCChat] 解析到思考过程，长度:", parsedThinkingContent.length, "字符");
      } else {
        console.warn("⚠️ [NPCChat] AI响应中没有找到[思考开始]和[思考结束]标记！");
        console.log("  └─ 这可能导致思考过程不显示");
      }

      // 提取实际回复内容
      const replyMatch = npcResponse.match(/\[回复内容\]([\s\S]*)/);
      if (replyMatch) {
        npcResponse = replyMatch[1].trim();
      } else if (thinkingMatch) {
        // 如果有思考但没有明确的回复标记，移除思考部分
        npcResponse = npcResponse.replace(/\[思考开始\][\s\S]*?\[思考结束\]\s*/, '').trim();
      }

      console.log("🔍 [NPCChat] 解析特殊标记...");

      // 解析物品 - 检测 [获得物品：xxx] 标记
      const itemRegex = /\[获得物品：([^\]]+)\]/g;
      const itemMatches = [...npcResponse.matchAll(itemRegex)];

      if (itemMatches.length > 0) {
        console.log(
          `📦 [NPCChat] 发现 ${itemMatches.length} 个物品标记`,
        );
        itemMatches.forEach((match) => {
          const itemName = match[1].trim();
          
          // 检查背包中是否已有该物品
          const existingItem = gameState?.inventory?.find(
            (item) => item.name === itemName
          );
          
          if (existingItem) {
            // 如果已有该物品，增加数量
            onUpdateGameState((prev) => ({
              ...prev,
              inventory: prev.inventory.map((item) =>
                item.name === itemName
                  ? { ...item, quantity: (item.quantity || 1) + 1 }
                  : item
              ),
            }));
            console.log(`  ✨ [物品数量增加] ${itemName} x${(existingItem.quantity || 1) + 1}`);
          } else {
            // 如果没有该物品，添加新物品
            const newItem: GameItem = {
              id: `item_${Date.now()}_${Math.random()}`,
              name: itemName,
              description: `从${npcMemory.npcId}处获得`,
              type: "quest",
              quantity: 1,
            };

            onUpdateGameState((prev) => ({
              ...prev,
              inventory: [...prev.inventory, newItem],
            }));

            console.log(`  ✨ [物品获得] ${itemName} x1`);
          }
        });
      }

      // 解析线索 - 检测 [线索：标题|内容] 标记
      const clueRegex = /\[线索：([^\|]+)\|([^\]]+)\]/g;
      const clueMatches = [...npcResponse.matchAll(clueRegex)];

      if (clueMatches.length > 0) {
        console.log(
          `🔍 [NPCChat] 发现 ${clueMatches.length} 个线索标记`,
        );
        clueMatches.forEach((match) => {
          const clueTitle = match[1].trim();
          const clueContent = match[2].trim();
          // 添加线索
          const newClue: Clue = {
            id: `clue_${Date.now()}_${Math.random()}`,
            title: clueTitle,
            content: clueContent,
            discoveredAt: Date.now(),
          };

          onUpdateGameState((prev) => ({
            ...prev,
            clues: [...prev.clues, newClue],
          }));

          console.log(
            `  🔎 [线索获得] ${clueTitle}: ${clueContent}`,
          );
        });
      }

      // 解析技能 - 检测 [技能：技能名|描述] 标记
      const skillRegex = /\[技能：([^\|]+)\|([^\]]+)\]/g;
      const skillMatches = [
        ...npcResponse.matchAll(skillRegex),
      ];

      if (skillMatches.length > 0) {
        console.log(
          `⚡ [NPCChat] 发现 ${skillMatches.length} 个技能标记`,
        );
        skillMatches.forEach((match) => {
          const skillName = match[1].trim();
          const skillDescription = match[2].trim();
          // 添加技能
          const newSkill: Skill = {
            id: `skill_${Date.now()}_${Math.random()}`,
            name: skillName,
            description: skillDescription,
            level: 1,
          };

          onUpdateGameState((prev) => ({
            ...prev,
            skills: [...prev.skills, newSkill],
          }));

          console.log(
            `  ⚡ [技能获得] ${skillName}: ${skillDescription}`,
          );
        });
      }

      // 检测使用物品 - 检测 [使用：xxx] 标记（从NPC的回复中检测）
      const useItemRegex = /\[使用：([^\]]+)\]/g;
      const useMatches = [
        ...npcResponse.matchAll(useItemRegex),
      ];

      if (useMatches.length > 0) {
        console.log(
          `🎒 [NPCChat] 发现 ${useMatches.length} 个使用物品标记`,
        );
        useMatches.forEach((match) => {
          const itemName = match[1].trim();
          console.log(`  🔍 [检查背包] 尝试使用物品: ${itemName}`);<br/>          
          // 查找该物品
          const targetItem = gameState?.inventory?.find(
            (item) => item.name === itemName
          );
          
          if (targetItem) {
            const currentQuantity = targetItem.quantity || 1;
            
            if (currentQuantity > 1) {
              // 如果数量大于1，减少数量
              onUpdateGameState((prev) => ({
                ...prev,
                inventory: prev.inventory.map((item) =>
                  item.name === itemName
                    ? { ...item, quantity: currentQuantity - 1 }
                    : item
                ),
              }));
              console.log(`  ✅ [物品使用] ${itemName} 数量减少: ${currentQuantity} → ${currentQuantity - 1}`);
            } else {
              // 如果数量为1或未定义，直接移除该物品
              onUpdateGameState((prev) => ({
                ...prev,
                inventory: prev.inventory.filter(
                  (item) => item.name !== itemName,
                ),
              }));
              console.log(`  ✅ [物品使用] ${itemName} 已从背包移除（最后一个）`);
            }
          } else {
            console.log(`  ⚠️ [警告] 玩家背包中没有 ${itemName}，但NPC试图使用`);<br/>          }
        });
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: npcResponse,
        timestamp: Date.now(),
        id: generateMessageId(),
        thinkingContent: parsedThinkingContent.length > 0 ? parsedThinkingContent : undefined,
      };

      // 直接添加消息，不需要延迟等待
      // isLoading 状态会自动在 finally 块中设置为 false
      setMessages((prev) => [...prev, assistantMessage]);
      console.log("💬 [NPCChat] 对话完成");
      console.log("💭 [NPCChat] assistantMessage.thinkingContent:", assistantMessage.thinkingContent ? "有内容" : "无内容");

      // 解析AI思考过程中的关系变化建议
      let relationshipDelta = 0;
      let affectionDelta = 0;
      let trustDelta = 0;
      let emotionChange: string | undefined = undefined;

      if (parsedThinkingContent.length > 0) {
        const thinkingText = parsedThinkingContent;
        console.log("🔍 [NPCChat] 解析思考过程中的关系变化...");

        // 解析关系值变化：关系值+5, 关系+10, 关系-5 等
        const relationMatch = thinkingText.match(/关系值?\s*([+\-])\s*(\d+)/);
        if (relationMatch) {
          const sign = relationMatch[1];
          const value = parseInt(relationMatch[2]);
          relationshipDelta = sign === '+' ? value : -value;
          console.log(`  💝 关系值变化: ${sign}${value}`);
        }

        // 解析好感度变化：好感度+5, 好感+10 等
        const affectionMatch = thinkingText.match(/好感度?\s*([+\-])\s*(\d+)/);
        if (affectionMatch) {
          const sign = affectionMatch[1];
          const value = parseInt(affectionMatch[2]);
          affectionDelta = sign === '+' ? value : -value;
          console.log(`  💖 好感度变化: ${sign}${value}`);
        }

        // 解析信任度变化：信任度+5, 信任+10 等
        const trustMatch = thinkingText.match(/信任度?\s*([+\-])\s*(\d+)/);
        if (trustMatch) {
          const sign = trustMatch[1];
          const value = parseInt(trustMatch[2]);
          trustDelta = sign === '+' ? value : -value;
          console.log(`  🤝 信任度变化: ${sign}${value}`);
        }

        // 解析情绪变化
        const emotionMatch = thinkingText.match(/情绪[变化为：]+\s*[「"]?([^「"）\n]+)[」"]?/);
        if (emotionMatch) {
          emotionChange = emotionMatch[1].trim();
          console.log(`  😊 情绪变化: ${emotionChange}`);
        }
      }

      // 如果没有解析到任何变化，默认给一点关系值增长（持续互动）
      if (relationshipDelta === 0 && affectionDelta === 0 && trustDelta === 0) {
        relationshipDelta = 1;
        console.log("  ℹ️ 未检测到明确变化，默认关系值+1");
      }

      // 更新NPC记忆（保存思考步骤）
      await updateNPCMemoryAfterChat(
        npcId,
        userMessage.content,
        assistantMessage.content,
        // 这里可以根据对话内容自动提取学到的信息
        undefined,
        // 情绪变化
        emotionChange,
        // 关系值变化
        relationshipDelta,
        // 保存思考步骤
        parsedThinkingContent.length > 0 ? [parsedThinkingContent] : undefined
      );

      // 单独更新好感度和信任度（因为 updateNPCMemoryAfterChat 不处理这两个）
      if (affectionDelta !== 0) {
        await npcMemoryManager.updateAffection(npcId, affectionDelta);
      }
      if (trustDelta !== 0) {
        await npcMemoryManager.updateTrust(npcId, trustDelta);
      }
      
      console.log("✅ [NPCChat] NPC记忆已更新，包含思考步骤");
      console.log(`📊 [关系变化] 关系值${relationshipDelta>=0?'+':''}${relationshipDelta}, 好感度${affectionDelta>=0?'+':''}${affectionDelta}, 信任度${trustDelta>=0?'+':''}${trustDelta}`);

      // 检查是否触发特殊条件
      checkDialogueConditions(npcResponse);
    } catch (error) {
      console.error("❌ [NPCChat] 发送消息失败:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "（连接中断...）",
          timestamp: Date.now(),
          id: generateMessageId(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 检查对话条件（可扩展）
  const checkDialogueConditions = (response: string) => {
    // 这里可以添加条件检测逻辑
    // 例如：如果NPC提到某些关键词，触发特定事件
    if (onDialogueCondition) {
      // 示例条件
      if (response.includes("青铜鼎")) {
        onDialogueCondition("mentioned_bronze_ding");
      }
    }
  };

  // 处理回车键发送
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 渲染消息内容，解析特殊标记并高亮显示
  const renderMessageContent = (content: string) => {
    // 移除标记符号，但保留文字内容用于显示
    let displayContent = content;

    // 提取所有特殊标记
    const items = [
      ...content.matchAll(/\[获得物品：([^\]]+)\]/g),
    ];
    const clues = [
      ...content.matchAll(/\[线索：([^\|]+)\|([^\]]+)\]/g),
    ];
    const skills = [
      ...content.matchAll(/\[技能：([^\|]+)\|([^\]]+)\]/g),
    ];

    // 移除标记，只保留纯文本
    displayContent = displayContent.replace(
      /\[获得物品：[^\]]+\]/g,
      "",
    );
    displayContent = displayContent.replace(
      /\[线索：[^\]]+\]/g,
      "",
    );
    displayContent = displayContent.replace(
      /\[技能：[^\]]+\]/g,
      "",
    );
    displayContent = displayContent.replace(
      /\[使用：[^\]]+\]/g,
      "",
    );

    return (
      <div className="space-y-2">
        {/* 主要文本内容 */}
        {displayContent.trim() && (
          <p className="text-sm leading-relaxed">
            {displayContent.trim()}
          </p>
        )}

        {/* 物品获得提示 */}
        {items.map((match, index) => (
          <motion.div
            key={`item-${index}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 p-2 bg-amber-500/20 border border-amber-400/50 rounded-lg mt-2"
          >
            <Package className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-amber-300">获得物品</p>
              <p className="text-sm text-amber-100">
                {match[1]}
              </p>
            </div>
          </motion.div>
        ))}

        {/* 线索获得提示 */}
        {clues.map((match, index) => (
          <motion.div
            key={`clue-${index}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-start gap-2 p-2 bg-cyan-500/20 border border-cyan-400/50 rounded-lg mt-2"
          >
            <Search className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-cyan-300">发现线索</p>
              <p className="text-sm text-cyan-100">
                {match[1]}
              </p>
              <p className="text-xs text-cyan-200/70 mt-1">
                {match[2]}
              </p>
            </div>
          </motion.div>
        ))}

        {/* 技能获得提示 */}
        {skills.map((match, index) => (
          <motion.div
            key={`skill-${index}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-start gap-2 p-2 bg-purple-500/20 border border-purple-400/50 rounded-lg mt-2"
          >
            <Zap className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-purple-300">
                习得技能
              </p>
              <p className="text-sm text-purple-100">
                {match[1]}
              </p>
              <p className="text-xs text-purple-200/70 mt-1">
                {match[2]}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* 背景遮罩 - 独立层，不点击关闭以防误触 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      />

      {/* 对话框 - 采用DialogueBox的底部布局方式 */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4"
      >
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg shadow-2xl border-2 border-amber-600/50 flex flex-col h-[80vh] max-h-[600px]">
          {/* 头部 */}
          <div className="bg-amber-900/30 border-b border-amber-600/30 px-6 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-600/20 border-2 border-amber-500/50 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-amber-200">
                  与 {npcMemory.npcId} 对话
                </h3>
                <p className="text-xs text-amber-400/60">
                  {isFirstMeet ? "初次见面" : "继续对话"}
                </p>
              </div>
            </div>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="text-amber-400 hover:text-amber-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* 对话区域 - 可滚动 */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4 pb-4" ref={scrollRef}>
                {messages.map((message) => {
                  return (
                  <div key={message.id}>
                    {/* 如果这条消息有思考内容，先显示思考框 */}
                    {message.thinkingContent && message.thinkingContent.length > 0 && (
                      <div className="mb-2">
                        <ThinkingMessage
                          isThinking={false}
                          thinkingContent={message.thinkingContent}
                        />
                      </div>
                    )}
                    
                    {/* 显示消息内容 */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-3 break-words ${
                          message.role === "user"
                            ? "bg-amber-600/20 text-amber-100 border border-amber-500/30"
                            : "bg-slate-700/50 text-slate-200 border border-slate-600/30"
                        }`}
                      >
                        {renderMessageContent(message.content)}
                      </div>
                    </motion.div>
                  </div>
                  );
                })}

                {/* 当前加载中的thinking消息 */}
                {isLoading && (
                  <div key="thinking-message">
                    <ThinkingMessage
                      isThinking={true}
                    />
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* 输入区域 */}
          <div className="p-4 border-t border-amber-500/20 flex-shrink-0 bg-slate-900/80">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入消息... (回车发送)"
                disabled={isLoading}
                className="flex-1 bg-slate-800/50 border-slate-600/50 text-slate-200 placeholder:text-slate-500 focus:border-amber-500/50"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Shift + Enter 换行 | Enter 发送
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}