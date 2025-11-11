import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Loader2 } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface AIChatProps {
  onComplete: (finalMessage?: string) => void;
  systemPrompt: string;
  initialMessage?: string;
  minMessages?: number; // 最少对话轮数
  playerName: string;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export function AIChat({
  onComplete,
  systemPrompt,
  initialMessage,
  minMessages = 3,
  playerName,
}: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [canContinue, setCanContinue] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // API配置 - 用户需要填入自己的配置
  const API_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"; // 例如: "https://api.openai.com/v1/chat/completions"
  const API_KEY = "sk-e3c846e265644474ab7b47271e32be0c";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      // 添加初始消息
      const timer = setTimeout(() => {
        setMessages([
          {
            role: "assistant",
            content: initialMessage,
          },
        ]);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [initialMessage, messages.length]);

  useEffect(() => {
    // 聚焦输入框
    if (!isLoading && messages.length > 0) {
      inputRef.current?.focus();
    }
  }, [isLoading, messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessageCount((prev) => prev + 1);

    // 添加用户消息
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // 调用AI API
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
              content: systemPrompt.replace("{playerName}", playerName),
            },
            ...newMessages,
          ],
          temperature: 0.8,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn("AI API返回错误，使用模拟响应:", errorData);
        throw new Error("API调用失败");
      }

      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;

      setMessages([
        ...newMessages,
        { role: "assistant", content: assistantMessage },
      ]);

      // 检查是否可以继续
      if (messageCount + 1 >= minMessages) {
        setCanContinue(true);
      }
    } catch (error) {
      // 如果API调用失败，优雅地降级到模拟响应
      console.info("使用模拟AI响应模式");
      const mockResponse = generateMockResponse(userMessage);
      setMessages([
        ...newMessages,
        { role: "assistant", content: mockResponse },
      ]);

      if (messageCount + 1 >= minMessages) {
        setCanContinue(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 渲染消息文本
  const renderMessage = (text: string) => {
    // 直接返回文本，不再处理glitch标记
    return text;
  };

  // 模拟响应（当API不可用时）
  const generateMockResponse = (input: string): string => {
    // 根据用户输入提供更智能的响应
    if (input.includes("帮助") || input.includes("怎么办") || input.includes("不知道")) {
      return `${playerName}，我理解你的困惑。作为守望者系统，我会尽力协助你。仔细观察周围的环境，寻找任何异常的线索。`;
    } else if (input.includes("怕") || input.includes("害怕") || input.includes("恐惧")) {
      return `勇气不是没有恐惧，而是面对恐惧依然前行。${playerName}，你被选中是有原因的。相信自己。`;
    } else if (input.includes("是") || input.includes("好的") || input.includes("明白") || input.includes("知道")) {
      return "很好。让我们继续调查。保持警惕，任何细节都可能是关键。";
    } else if (input.includes("什么") || input.includes("为什么") || input.includes("?") || input.includes("？")) {
      return "这个问题很复杂。根据我的分析，这些现象与博物馆的文物有关。我们需要更多信息才能得出结论。";
    } else if (input.includes("文物") || input.includes("展品") || input.includes("古董")) {
      return "没错，这些文物似乎拥有某种未知的能量。我的传感器检测到异常的能量波动。";
    } else {
      // 通用响应
      const responses = [
        "我明白你的疑虑。这确实超出了常理，但我们必须面对现实。",
        "时间紧迫，我们需要立即行动。你准备好了吗？",
        "这些文物的力量远超我们的想象，必须小心。",
        `相信你的直觉，${playerName}，你是唯一能够阻止这一切的人。`,
        "记住，每一个选择都会影响最终的结果。",
        `${playerName}，作为守望者系统，我会一直在这里协助你。`,
        "我的数据库显示，类似事件极为罕见，这可能是重大发现。",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg border border-amber-600/30 shadow-2xl overflow-hidden"
      >
        {/* 对话区域 */}
        <div className="h-[500px] overflow-y-auto p-6 space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === "user"
                      ? "bg-amber-600/20 border border-amber-600/30 text-amber-100"
                      : "bg-slate-700/50 border border-slate-600/30 text-slate-200"
                  }`}
                >
                  <p className="dialogue-text">
                    {renderMessage(message.content)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-slate-700/50 border border-slate-600/30 rounded-lg px-4 py-3">
                <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="border-t border-amber-600/30 p-4 bg-slate-900/50">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入你的回复..."
              disabled={isLoading}
              className="flex-1 bg-slate-800/50 border-slate-600/50 text-amber-100 placeholder:text-slate-500 focus-visible:ring-amber-600/50 focus-visible:border-amber-600/50"
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-amber-600 hover:bg-amber-500 text-black"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {canContinue && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex justify-end"
            >
              <Button
                onClick={() => onComplete()}
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black shadow-lg shadow-amber-600/20"
              >
                继续故事
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}