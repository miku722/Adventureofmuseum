import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ChevronRight,
  Send,
  MessageCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { NPC } from "../../types/game";
import {
  getNPCPrompt,
  updateNPCMemoryAfterChat,
  npcMemoryManager,
} from "../../utils/npcMemorySystem";
import { ContinueHint } from "../ui/ContinueHint";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface DialogueBoxProps {
  npc: NPC;
  onClose: () => void;
  onDialogueComplete?: () => void;
  onGiveItem?: () => void;
  playerName: string; // 玩家名字用于AI对话
}

export function DialogueBox({
  npc,
  onClose,
  onDialogueComplete,
  onGiveItem,
  playerName,
}: DialogueBoxProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  // AI聊天相关状态
  const [chatMode, setChatMode] = useState(false); // 是否进入AI聊天模式
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 获取NPC记忆
  const npcMemory = npcMemoryManager.getMemory(npc.id);
  const isFirstMeet = !npcMemory.metPlayer;

  // 初始化：如果不是第一次见面，直接进入AI聊天模式
  useEffect(() => {
    if (!isFirstMeet) {
      setChatMode(true);
    }
  }, [isFirstMeet]);

  // 确保dialogue是有效的字符串数组，过滤掉undefined和空值
  const validDialogue = npc.dialogue.filter(
    (d) => d && typeof d === "string" && d.trim().length > 0,
  );
  const currentDialogue = validDialogue[currentIndex] || "";

  // 打字机效果（仅在固定对话模式）
  useEffect(() => {
    if (chatMode || !currentDialogue || currentDialogue.length === 0) return;

    setIsTyping(true);
    setDisplayText("");
    let charIndex = 0;

    // ✅ 立即显示第一个字符，避免漏字
    if (currentDialogue.length > 0) {
      setDisplayText(currentDialogue[0]);
      charIndex = 1;
    }

    const typingInterval = setInterval(() => {
      if (charIndex < currentDialogue.length) {
        const nextChar = currentDialogue[charIndex];
        if (nextChar !== undefined) {
          setDisplayText((prev) => prev + nextChar);
        }
        charIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [currentDialogue, chatMode]);

  // 自动滚动到底部（AI聊天模式）
  useEffect(() => {
    if (chatMode && scrollRef.current) {
      scrollRef.current.scrollTop =
        scrollRef.current.scrollHeight;
    }
  }, [messages, chatMode]);

  // 初始化AI对话
  useEffect(() => {
    if (chatMode) {
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

      // 如果是第一次见面且没有历史记录，NPC主动打招呼
      if (isFirstMeet && history.length === 0) {
        sendInitialGreeting();
      }

      // 聚焦输入框
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [chatMode]);

  // NPC主动打招呼
  const sendInitialGreeting = async () => {
    setIsLoading(true);
    try {
      const systemPrompt = getNPCPrompt(npc.id, playerName);
      const greetingPrompt = `${systemPrompt}\n\n这是${playerName}第一次遇见你，请主动打个招呼并简单介绍自己。记住要符合你的身份和性格。`;

      // API配置
      const API_URL =
        "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
      const API_KEY = "sk-e3c846e265644474ab7b47271e32be0c";

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

      const newMessage: Message = {
        role: "assistant",
        content: greeting,
        timestamp: Date.now(),
      };

      setMessages([newMessage]);
    } catch (error) {
      console.error("获取NPC问候失败:", error);

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

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // API配置
      const API_URL =
        "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
      const API_KEY = "sk-e3c846e265644474ab7b47271e32be0c";

      // 获取NPC的SystemPrompt
      const systemPrompt = getNPCPrompt(npc.id, playerName);

      // 构建对话消息
      const conversationMessages = messages
        .concat(userMessage)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

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
      const npcResponse = data.choices[0].message.content;

      const assistantMessage: Message = {
        role: "assistant",
        content: npcResponse,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // 更新NPC记忆
      updateNPCMemoryAfterChat(
        npc.id,
        userMessage.content,
        assistantMessage.content,
        undefined,
        undefined,
        1,
      );
    } catch (error) {
      console.error("发送消息败:", error);
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

  const handleNext = () => {
    if (isTyping) {
      // 跳过打字效果，直接显示全部文字
      setDisplayText(currentDialogue);
      setIsTyping(false);
    } else if (currentIndex < validDialogue.length - 1) {
      // 下一句对话
      setCurrentIndex((prev) => prev + 1);
    } else {
      // 固定对话结束，给予物品/线索
      if (npc.givesItem && onGiveItem) {
        onGiveItem();
      }
      if (onDialogueComplete) {
        onDialogueComplete();
      }

      // 检查是否是第一次见面，如果是则切换到AI聊天模式
      if (isFirstMeet) {
        setChatMode(true);
      } else {
        // 不是第一次见面，直接关闭对话框
        onClose();
      }
    }
  };

  // 空格键和回车键支持（仅固定对话模式）
  useEffect(() => {
    if (chatMode) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        handleNext();
      } else if (e.code === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () =>
      window.removeEventListener("keydown", handleKeyPress);
  }, [isTyping, currentIndex, validDialogue.length, chatMode]);

  // 回车发送消息（AI聊天模式）
  useEffect(() => {
    if (!chatMode) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      } else if (e.code === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () =>
      window.removeEventListener("keydown", handleKeyPress);
  }, [input, chatMode, isLoading]);

  return (
    <>
      {/* 背景遮罩 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-50"
        onClick={onClose}
      />

      {/* 对话框 */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4"
      >
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-amber-600/50 rounded-lg shadow-2xl overflow-hidden">
          {/* NPC信息栏 */}
          <div className="bg-amber-900/30 border-b border-amber-600/30 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-600/20 border-2 border-amber-500/50 flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
              <div>
                <h3 className="text-amber-200">{npc.name}</h3>
                <p className="text-amber-400/60 text-xs">
                  {npc.role}
                </p>
              </div>
              {chatMode && (
                <div className="ml-2 px-2 py-1 bg-purple-600/20 border border-purple-500/50 rounded text-purple-300 text-xs flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  AI对话
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-amber-400 hover:text-amber-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 对话内容区域 */}
          {!chatMode ? (
            // 固定对话模式
            <>
              <div className="px-6 py-6 min-h-[120px]">
                <p className="text-amber-100 text-lg leading-relaxed">
                  {displayText}
                  {isTyping && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                      }}
                      className="inline-block w-2 h-5 bg-amber-400 ml-1"
                    />
                  )}
                </p>
              </div>

              {/* 底部操作栏 */}
              <div className="bg-slate-900/50 border-t border-amber-600/30 px-6 py-4 flex items-center justify-between">
                <ContinueHint 
                  action={
                    isTyping
                      ? "跳过"
                      : currentIndex < validDialogue.length - 1
                        ? "继续"
                        : isFirstMeet
                          ? "开始对话"
                          : "结束对话"
                  }
                  borderColor="border-amber-400/30"
                  bgColor="bg-amber-400/5"
                  textColor="text-amber-400"
                  className="text-sm"
                />

                <div className="flex items-center gap-3">
                  <span className="text-amber-400/60 text-sm">
                    {currentIndex + 1} / {validDialogue.length}
                  </span>
                  <Button
                    onClick={handleNext}
                    size="sm"
                    className="bg-amber-900/50 hover:bg-amber-800/50 text-amber-200 border border-amber-600/50"
                  >
                    {isTyping
                      ? "跳过"
                      : currentIndex < validDialogue.length - 1
                        ? "继续"
                        : isFirstMeet
                          ? "开始对话"
                          : "结束"}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            // AI聊天模式
            <>
              {/* 消息列表 */}
              <div className="h-[400px] overflow-hidden">
                <ScrollArea className="h-full px-6 py-4">
                  <div ref={scrollRef} className="space-y-4">
                    {messages.map((msg, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${
                          msg.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            msg.role === "user"
                              ? "bg-amber-600/30 border border-amber-500/50 text-amber-100"
                              : "bg-slate-800/50 border border-slate-600/50 text-slate-200"
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        </div>
                      </motion.div>
                    ))}

                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="bg-slate-800/50 border border-slate-600/50 rounded-lg px-4 py-2">
                          <div className="flex gap-1">
                            <motion.div
                              animate={{
                                opacity: [0.4, 1, 0.4],
                              }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: 0,
                              }}
                              className="w-2 h-2 bg-amber-400 rounded-full"
                            />
                            <motion.div
                              animate={{
                                opacity: [0.4, 1, 0.4],
                              }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: 0.2,
                              }}
                              className="w-2 h-2 bg-amber-400 rounded-full"
                            />
                            <motion.div
                              animate={{
                                opacity: [0.4, 1, 0.4],
                              }}
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
              </div>

              {/* 输入区域 */}
              <div className="bg-slate-900/50 border-t border-amber-600/30 px-6 py-4">
                <div className="flex gap-3">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`与${npc.name}对话...`}
                    disabled={isLoading}
                    className="flex-1 bg-slate-800/50 border-amber-600/30 text-amber-100 placeholder:text-amber-400/40 focus:border-amber-500"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    size="sm"
                    className="bg-amber-900/50 hover:bg-amber-800/50 text-amber-200 border border-amber-600/50 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-amber-400/40 text-xs mt-2">
                  按 Enter 发送 • Esc 关闭对话
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}