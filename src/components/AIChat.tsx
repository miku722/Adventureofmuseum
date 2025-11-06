import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Loader2 } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { GlitchText } from "./GlitchText";

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

  // 渲染带有乱码标记的文本
  const renderMessageWithGlitch = (text: string) => {
    const parts = text.split("<glitch/>");
    if (parts.length === 1) {
      // 没有乱码标记，直接返回文本
      return text;
    }
    
    // 有乱码标记，渲染为React元素
    return parts.map((part, index) => (
      <span key={index}>
        {part}
        {index < parts.length - 1 && (
          <GlitchText className="text-red-400 mx-1" />
        )}
      </span>
    ));
  };

  // 模拟响应（当API不可用时）
  const generateMockResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    // 检查systemPrompt是否包含乱码提示（Scene4/5的特殊情况）
    const shouldGlitch = systemPrompt.includes("<glitch/>");
    
    // 根据用户输入提供更智能的响应
    if (input.includes("帮助") || input.includes("怎么办") || input.includes("不知道")) {
      const base = `${playerName}，我理解你的困惑。作为守望者系统，我会尽力协助你。仔细观察周围的环境，寻找任何异常的线索。`;
      return shouldGlitch ? base.replace("。", "<glitch/>。").replace("，", "<glitch/>，") : base;
    } else if (input.includes("怕") || input.includes("害怕") || input.includes("恐惧")) {
      const base = `勇气不是没有恐惧，而是面对恐惧依然前行。${playerName}，你被选中是有原因的。相信自己。`;
      return shouldGlitch ? base.replace("。", "<glitch/>。") : base;
    } else if (input.includes("是") || input.includes("好的") || input.includes("明白") || input.includes("知道")) {
      const base = "很好。让我们继续调查。保持警惕，任何细节都可能是关键。";
      return shouldGlitch ? `很好<glitch/>让我们继续<glitch/>保持警惕<glitch/>` : base;
    } else if (input.includes("什么") || input.includes("为什么") || input.includes("?") || input.includes("？")) {
      const base = "这个问题很复杂。根据我的分析，这些现象与博物馆的文物有关。我们需要更多信息才能得出结论。";
      return shouldGlitch ? base.replace("。", "<glitch/>。") : base;
    } else if (input.includes("文物") || input.includes("展品") || input.includes("古董")) {
      const base = "没错，这些文物似乎拥有某种未知的能量。我的传感器检测到异常的能量波动。";
      return shouldGlitch ? `没错<glitch/>这些文物<glitch/>未知的能量<glitch/>异常波动<glitch/>` : base;
    } else {
      // 通用响应
      const responses = shouldGlitch ? [
        `我明白你的疑虑<glitch/>这确实<glitch/>超出了常理<glitch/>我们必须面对现实<glitch/>`,
        `时间紧迫<glitch/>我们需要<glitch/>立即行动<glitch/>你准备好了吗<glitch/>`,
        `这些文物的力量<glitch/>远超我们的想象<glitch/>必须小心<glitch/>`,
        `相信你的直觉<glitch/>${playerName}<glitch/>你是唯一<glitch/>能够阻止这一切的人<glitch/>`,
        `记住<glitch/>每一个选择<glitch/>都会影响<glitch/>最终的结果<glitch/>`,
        `${playerName}<glitch/>作为守望者系统<glitch/>我会一直在这里<glitch/>协助你<glitch/>`,
        `我的数据库<glitch/>显示<glitch/>类似事件<glitch/>极为罕见<glitch/>重大发现<glitch/>`,
      ] : [
        "我明白你的疑虑。这确实超出了常理，但我们必须面对现实。",
        "时间紧迫，我们需要立即采取行动。你准备好了吗？",
        "这些文物的力量远超我们的想象。我们必须小心行事。",
        `相信你的直觉，${playerName}。你是唯一能够阻止这一切的人。`,
        "记住，每一个选择都会影响最终的结果。让我们继续吧。",
        `${playerName}，作为守望者系统，我会一直在这里协助你。我们一起解开这个谜团。`,
        "我的数据库显示，类似的事件在历史上极为罕见。这可能是一个重大发现。",
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
                    {renderMessageWithGlitch(message.content)}
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
