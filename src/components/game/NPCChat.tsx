/**
 * NPC专属AI对话组件
 * 使用NPC独立记忆系统，每个NPC只知道自己的身份和记忆
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
} from "../../utils/npcMemorySystem";
import { ThinkingProcess } from "./ThinkingProcess";
import {
  GameState,
  GameItem,
  Clue,
  Skill,
} from "../../utils/gameSystemPrompt";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // 获取NPC记忆
  const npcMemory = npcMemoryManager.getMemory(npcId);
  const isFirstMeet = !npcMemory.metPlayer;

  // 初始化对话 - 加载历史记录
  useEffect(() => {
    if (isOpen) {
      // 从NPC记忆中恢复对话历史
      const history: Message[] = npcMemory.conversationHistory
        .map((conv) => [
          {
            role: "user" as const,
            content: conv.playerMessage,
            timestamp: conv.timestamp,
          },
          {
            role: "assistant" as const,
            content: conv.npcResponse,
            timestamp: conv.timestamp,
          },
        ])
        .flat();

      setMessages(history);

      // 如果是第一次见面，NPC主动打招呼
      if (isFirstMeet && history.length === 0) {
        sendInitialGreeting();
      }

      // 聚焦输入框
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, npcId]);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop =
        scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // NPC主动打招呼
  const sendInitialGreeting = async () => {
    console.log("👋 [NPCChat] 开始发送初始问候...");
    setIsLoading(true);
    try {
      console.log("📝 [NPCChat] 构建 SystemPrompt...");
      const systemPrompt = getNPCPrompt(npcId, playerName);
      const greetingPrompt = `${systemPrompt}\n\n这是${playerName}第一次遇见你，请主动打个招呼并简单介绍自己。记住要符合你的身份和性格。`;

      // API配置
      const API_URL =
        "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
      const API_KEY = "sk-e3c846e265644474ab7b47271e32be0c";

      console.log("🌐 [NPCChat] 调用 API...");
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
              content: greetingPrompt,
            },
          ],
          temperature: 0.8,
          max_tokens: 200,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `API调用失败: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      const greeting = data.choices[0].message.content;

      console.log(
        "✅ [NPCChat] 收到 API 响应:",
        greeting.substring(0, 50) + "...",
      );

      const newMessage: Message = {
        role: "assistant",
        content: greeting,
        timestamp: Date.now(),
      };

      setMessages([newMessage]);
      console.log("💬 [NPCChat] 初始问候完成");

      // 不需要记录初始问候到历史中，因为它不是对话的一部分
    } catch (error) {
      console.error("❌ [NPCChat] 获取NPC问候失败:", error);

      // 根据不同的错误类型给出不同的提示
      let errorMessage = "（NPC似乎有些恍惚，没有说话...）";
      if (error instanceof Error) {
        if (error.message.includes("API密钥未配置")) {
          errorMessage = "（需要配置API密钥才能与NPC对话）";
        } else if (error.message.includes("API调用失败")) {
          errorMessage = "（连接出现问题，请稍后再试...）";
        }
      }

      setMessages([
        {
          role: "assistant",
          content: errorMessage,
          timestamp: Date.now(),
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
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    console.log("🚀 [NPCChat] 开始处理用户消息...");

    try {
      // API配置
      const API_URL =
        "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
      const API_KEY = "sk-e3c846e265644474ab7b47271e32be0c";

      // 获取NPC的SystemPrompt
      console.log("📝 [NPCChat] 获取 SystemPrompt...");
      const systemPrompt = getNPCPrompt(npcId, playerName);

      // 构建对话消息
      const conversationMessages = messages
        .concat(userMessage)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      console.log("🌐 [NPCChat] 调用 API...");
      console.log("├─ 消息数量:", conversationMessages.length);

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
              content: systemPrompt,
            },
            ...conversationMessages,
          ],
          temperature: 0.8,
          max_tokens: 300,
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
          // 添加物品到玩家背包
          const newItem: GameItem = {
            id: `item_${Date.now()}_${Math.random()}`,
            name: itemName,
            description: `从${npcMemory.npcId}处获得`,
            type: "quest",
          };

          onUpdateGameState((prev) => ({
            ...prev,
            inventory: [...prev.inventory, newItem],
          }));

          console.log(`  ✨ [物品获得] ${itemName}`);
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

      // 检测使用物品 - 检测 [使用：xxx] 标记
      const useItemRegex = /\[使用：([^\]]+)\]/g;
      const useMatches = [
        ...userMessage.content.matchAll(useItemRegex),
      ];

      if (useMatches.length > 0) {
        console.log(
          `🎒 [NPCChat] 发现 ${useMatches.length} 个使用物品标记`,
        );
        useMatches.forEach((match) => {
          const itemName = match[1].trim();
          // 从背包中移除物品
          onUpdateGameState((prev) => ({
            ...prev,
            inventory: prev.inventory.filter(
              (item) => item.name !== itemName,
            ),
          }));

          console.log(`  ♻️ [物品使用] ${itemName}`);
        });
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: npcResponse,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      console.log("💬 [NPCChat] 对话完成");

      // 更新NPC记忆
      updateNPCMemoryAfterChat(
        npcId,
        userMessage.content,
        assistantMessage.content,
        // 这里可以根据对话内容自动提取学到的信息
        undefined,
        // 可以根据对话内容分析情绪变化
        undefined,
        // 可以根据对话内容调整关系值（这里简单设为+1）
        1,
      );

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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-amber-500/20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between p-4 border-b border-amber-500/20">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-amber-400" />
              <div>
                <h3 className="text-amber-200">
                  与 {npcMemory.npcId} 对话
                </h3>
                <p className="text-xs text-slate-400">
                  {isFirstMeet ? "初次见面" : "继续对话"}
                </p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-amber-200"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* 对话区域 */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {/* 思维链 */}
              <ThinkingProcess
                gameState={gameState}
                isThinking={isLoading}
              />

              {messages.map((message, index) => (
                <motion.div
                  key={index}
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
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.role === "user"
                        ? "bg-amber-600/20 text-amber-100 border border-amber-500/30"
                        : "bg-slate-700/50 text-slate-200 border border-slate-600/30"
                    }`}
                  >
                    {renderMessageContent(message.content)}
                  </div>
                </motion.div>
              ))}

              {/* 加载中指示器 */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-slate-700/50 rounded-lg px-4 py-3 border border-slate-600/30">
                    <div className="flex gap-2">
                      <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: 0,
                        }}
                        className="w-2 h-2 bg-amber-400 rounded-full"
                      />
                      <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: 0.2,
                        }}
                        className="w-2 h-2 bg-amber-400 rounded-full"
                      />
                      <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: 0.4,
                        }}
                        className="w-2 h-2 bg-amber-400 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {/* 输入区域 */}
          <div className="p-4 border-t border-amber-500/20">
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}