/**
 * ChatGPT风格的Thinking消息组件
 * 显示AI的思考过程，思考结束后可折叠
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react";

interface ThinkingMessageProps {
  isThinking: boolean;
  thinkingContent?: string; // 改为字符串
  onThinkingComplete?: () => void;
}

export function ThinkingMessage({
  isThinking,
  thinkingContent = "",
  onThinkingComplete,
}: ThinkingMessageProps) {
  // 内部管理折叠状态
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  // 根据 isThinking 决定初始展开状态
  useEffect(() => {
    if (isThinking) {
      // 正在思考中：保持折叠，只显示标题
      setIsExpanded(false);
      setHasCompleted(false);
    } else {
      // 历史思考过程：默认折叠
      setIsExpanded(false);
      setHasCompleted(true);
    }
  }, [isThinking]);

  // 思考完成时
  useEffect(() => {
    if (!isThinking && !hasCompleted) {
      setHasCompleted(true);
      setIsExpanded(false); // 自动折叠
      if (onThinkingComplete) {
        onThinkingComplete();
      }
    }
  }, [isThinking, hasCompleted, onThinkingComplete]);

  if (!isThinking && thinkingContent.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <div className="max-w-[80%] rounded-lg border border-slate-600/40 bg-gradient-to-br from-slate-800/80 to-slate-700/60 overflow-hidden backdrop-blur-sm">
        {/* 头部 */}
        <button
          onClick={() => !isThinking && setIsExpanded(!isExpanded)}
          disabled={isThinking}
          className={`w-full px-4 py-2.5 flex items-center gap-2 text-slate-300 transition-colors ${
            isThinking ? 'cursor-default' : 'hover:bg-slate-700/30 cursor-pointer'
          }`}
        >
          <motion.div
            animate={isThinking ? { rotate: 360 } : {}}
            transition={
              isThinking
                ? { duration: 2, repeat: Infinity, ease: "linear" }
                : {}
            }
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
          </motion.div>

          <span className="text-sm font-medium">
            {isThinking ? "思考中..." : "思考完成"}
          </span>

          {!isThinking && thinkingContent.length > 0 && !isExpanded && (
            <span className="text-xs text-slate-500 ml-1">
              (1 个步骤)
            </span>
          )}

          <div className="ml-auto flex items-center gap-2">
            {isThinking && !isExpanded && (
              <div className="flex gap-1">
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0,
                  }}
                  className="w-1.5 h-1.5 bg-amber-400 rounded-full"
                />
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0.3,
                  }}
                  className="w-1.5 h-1.5 bg-amber-400 rounded-full"
                />
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0.6,
                  }}
                  className="w-1.5 h-1.5 bg-amber-400 rounded-full"
                />
              </div>
            )}

            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>
        </button>

        {/* 思考步骤 */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-slate-600/30"
            >
              <div className="px-4 py-3">
                {/* 思考中：只显示动画 */}
                {isThinking && (
                  <motion.div
                    className="flex items-center justify-center gap-2 py-4"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: 0,
                      }}
                      className="w-2 h-2 bg-amber-400 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: 0.2,
                      }}
                      className="w-2 h-2 bg-amber-400 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: 0.4,
                      }}
                      className="w-2 h-2 bg-amber-400 rounded-full"
                    />
                  </motion.div>
                )}

                {/* 思考完成：显示步骤和完成信息 */}
                {!isThinking && (
                  <div className="space-y-2">
                    {thinkingContent.length > 0 ? (
                      <div className="space-y-2">
                        <motion.div
                          key={0}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0 * 0.1 }}
                          className="flex items-start gap-2 text-xs text-slate-300"
                        >
                          <div className="mt-1.5">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-1.5 h-1.5 rounded-full bg-green-400"
                            />
                          </div>
                          <p className="flex-1 leading-relaxed whitespace-pre-wrap">{thinkingContent}</p>
                        </motion.div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-start gap-2 text-xs text-amber-400/70 italic"
                        >
                          <div className="mt-1.5">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-1.5 h-1.5 rounded-full bg-amber-400/50"
                            />
                          </div>
                          <p className="flex-1 leading-relaxed">AI 未提供思考过程或解析失败</p>
                        </motion.div>
                      </div>
                    )}

                    {hasCompleted && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`text-xs text-green-400 ${
                          thinkingContent.length > 0 ? 'pt-1 border-t border-slate-600/30 mt-2' : ''
                        }`}
                      >
                        ✓ 思考完成
                      </motion.p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}