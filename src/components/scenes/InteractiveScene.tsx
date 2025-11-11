import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Loader2 } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface InteractiveSceneProps {
  title: string;
  description: string;
  imagePlaceholder?: string;
  imageUrl?: string; // 新增：真实图片URL
  systemPrompt: string;
  initialMessage: string;
  playerName: string;
  minMessages?: number;
  onComplete: (conversationHistory: string) => void; // 修改：接收对话历史
}

interface Message {
  role: "user" | "assistant" | "narrator";
  content: string;
}

export function InteractiveScene({
  title,
  description,
  imagePlaceholder = "神秘场景",
  imageUrl, // 新增：真实图片URL
  systemPrompt,
  initialMessage,
  playerName,
  minMessages = 2,
  onComplete,
}: InteractiveSceneProps) {
  const [displayedTitle, setDisplayedTitle] = useState("");
  const [displayedDescription, setDisplayedDescription] =
    useState("");
  const [titleComplete, setTitleComplete] = useState(false);
  const [descriptionComplete, setDescriptionComplete] =
    useState(false);
  const [showInput, setShowInput] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // API配置
  const API_URL =
    "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
  const API_KEY = "sk-e3c846e265644474ab7b47271e32be0c";

  // 打字机效果 - 标题
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= title.length) {
        setDisplayedTitle(title.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
        setTitleComplete(true);
      }
    }, 80);
    return () => clearInterval(timer);
  }, [title]);

  // 打字机效果 - 描述
  useEffect(() => {
    if (!titleComplete) return;
    let index = 0;
    const timer = setInterval(() => {
      if (index <= description.length) {
        setDisplayedDescription(description.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
        setDescriptionComplete(true);
      }
    }, 50);
    return () => clearInterval(timer);
  }, [titleComplete, description]);

  // 描述完成后显示初始AI消息和输入框
  useEffect(() => {
    if (!descriptionComplete) return;
    const timer = setTimeout(() => {
      // 添加AI初始消息
      setMessages([
        { role: "assistant", content: initialMessage },
      ]);
      // 显示输入框
      setShowInput(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [descriptionComplete, initialMessage]);

  // 自动滚动到底部
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages, displayedDescription]);

  // 聚焦输入框
  useEffect(() => {
    if (showInput && !isLoading) {
      inputRef.current?.focus();
    }
  }, [showInput, isLoading]);

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
      const apiMessages = newMessages
        .filter((m) => m.role !== "narrator")
        .map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
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
              content: systemPrompt.replace(
                "{playerName}",
                playerName,
              ),
            },
            ...apiMessages,
          ],
          temperature: 0.8,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error("API调用失败");
      }

      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;

      setMessages([
        ...newMessages,
        { role: "assistant", content: assistantMessage },
      ]);
    } catch (error) {
      // 降级到模拟响应
      console.info("使用模拟AI响应模式");
      const mockResponse = generateMockResponse(userMessage);
      setMessages([
        ...newMessages,
        { role: "assistant", content: mockResponse },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
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

  // 模拟响应
  const generateMockResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (
      input.includes("帮助") ||
      input.includes("怎么办") ||
      input.includes("不知道")
    ) {
      return `${playerName}，我理解你的困惑。作为守望者系统，我会尽力协助你。仔细观察周围的环境，寻找任何异常的线索。`;
    } else if (
      input.includes("怕") ||
      input.includes("害怕") ||
      input.includes("恐惧")
    ) {
      return `勇气不是没有恐惧，而是面对恐惧依然前行。${playerName}，你被选中是有原因的。相信自己。`;
    } else if (
      input.includes("是") ||
      input.includes("好的") ||
      input.includes("明白") ||
      input.includes("知道")
    ) {
      return "很好。让我们继续调查。保持警惕，任何细节都可能是关键。";
    } else {
      const responses = [
        "我明白你的疑虑。这确实超出了常理，但我们必须面对现实。",
        "时间紧迫，我们需要立即行动。你准备好了吗？",
        `相信你的直觉，${playerName}，你是唯一能够阻止这一切的人。`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
    >
      <div className="w-full h-full flex">
        {/* 左侧文字区域 */}
        <div className="w-full md:w-1/2 flex flex-col px-8 md:px-16 py-8 relative">
          {/* 可滚动的内容区域 */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto space-y-6 pr-4 relative"
            style={{
              maskImage:
                "linear-gradient(to bottom, transparent 0%, black 5%, black 85%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, black 5%, black 85%, transparent 100%)",
            }}
          >
            {/* 标题 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-8"
            >
              <h2 className="scene-title text-4xl md:text-3xl text-amber-200">
                {displayedTitle}
                {!titleComplete && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                    }}
                    className="text-amber-400"
                  >
                    |
                  </motion.span>
                )}
              </h2>
            </motion.div>

            {/* 装饰线 */}
            {titleComplete && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8 }}
                className="h-[2px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent"
              />
            )}

            {/* 描述 */}
            {titleComplete && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="narration-text text-slate-300 text-xl md:text-2xl whitespace-pre-wrap">
                  {displayedDescription}
                  {!descriptionComplete && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                      }}
                      className="text-amber-400"
                    >
                      |
                    </motion.span>
                  )}
                </p>
              </motion.div>
            )}

            {/* 对话历史 */}
            {messages.length > 0 && (
              <div className="space-y-4 mt-8">
                <AnimatePresence mode="popLayout">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`${
                        message.role === "user"
                          ? "text-amber-300"
                          : "text-blue-200"
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-1">
                        <span className="text-xs text-amber-400/60 tracking-wider">
                          {message.role === "user"
                            ? playerName
                            : "守望者"}
                        </span>
                      </div>
                      <p className="dialogue-text text-lg md:text-xl">
                        {renderMessage(message.content)}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-blue-200"
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-slate-400">
                      守望者正在思考...
                    </span>
                  </motion.div>
                )}
              </div>
            )}

            <div ref={messagesEndRef} className="h-4" />
          </div>

          {/* 输入框区域 */}
          <AnimatePresence>
            {showInput && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="mt-6 pt-4 border-t border-amber-600/20"
              >
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* 环境光效 */}
          <motion.div
            animate={{
              opacity: [0.05, 0.15, 0.05],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-400/5 rounded-full blur-3xl pointer-events-none"
          />
        </div>

        {/* 右侧图片区域 */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="hidden md:block w-1/2 relative"
        >
          <div className="absolute inset-0">
            {imageUrl ? (
              // 显示真实图片
              <>
                <img
                  src={imageUrl}
                  alt={imagePlaceholder}
                  className="w-full h-full object-cover"
                />
                {/* 渐变遮罩，让图片边缘融入背景 */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-black/20" />
              </>
            ) : (
              // 显示占位符
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 mx-auto rounded-full bg-amber-400/10 border-2 border-amber-400/30 flex items-center justify-center">
                    <motion.div
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-24 h-24 rounded-full border-4 border-transparent border-t-amber-400/50 border-r-amber-400/30"
                    />
                  </div>
                  <p className="text-amber-400/40 tracking-widest text-sm">
                    {imagePlaceholder}
                  </p>
                </div>
                {/* 渐变遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-black/20" />
              </div>
            )}
          </div>

          {/* 光效 */}
          <motion.div
            animate={{
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-20 right-32 w-64 h-64 bg-blue-100/10 rounded-full blur-3xl pointer-events-none"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}