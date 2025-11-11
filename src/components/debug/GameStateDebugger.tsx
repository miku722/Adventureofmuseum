import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bug, ChevronDown, ChevronUp } from "lucide-react";
import { GameState } from "../../utils/gameSystemPrompt";

interface GameStateDebuggerProps {
  gameState: GameState;
}

export function GameStateDebugger({ gameState }: GameStateDebuggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  if (process.env.NODE_ENV === "production") {
    return null; // 生产环境不显示
  }

  // 监听 Ctrl+G 快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'g') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      {/* 调试面板 - 无按钮，仅通过 Ctrl+G 调出 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="w-96 max-h-[600px] bg-gray-900 border border-purple-500 rounded-lg shadow-2xl overflow-hidden"
          >
            {/* 标题 */}
            <div className="bg-purple-600 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bug className="w-4 h-4" />
                <span className="text-sm">游戏状态调试器</span>
                <span className="text-xs text-purple-200">(Ctrl+G)</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            {/* 内容区域 */}
            <div className="overflow-y-auto max-h-[540px] p-4 space-y-3 text-xs">
              {/* 基本信息 */}
              <div className="bg-gray-800 p-3 rounded">
                <h3 className="text-purple-400 mb-2">基本信息</h3>
                <div className="space-y-1 text-gray-300">
                  <div>
                    <span className="text-gray-500">玩家名字：</span>
                    {gameState.playerName || "(未设置)"}
                  </div>
                  <div>
                    <span className="text-gray-500">当前阶段：</span>
                    {gameState.currentPhase}
                  </div>
                  {gameState.currentScene && (
                    <div>
                      <span className="text-gray-500">当前场景：</span>
                      {gameState.currentScene}
                    </div>
                  )}
                  {gameState.playerChoice && (
                    <div>
                      <span className="text-gray-500">玩家选择：</span>
                      {gameState.playerChoice}
                    </div>
                  )}
                </div>
              </div>

              {/* 叙事历史 */}
              <div className="bg-gray-800 rounded overflow-hidden">
                <button
                  onClick={() => toggleSection("narrative")}
                  className="w-full p-3 flex items-center justify-between text-purple-400 hover:bg-gray-700 transition-colors"
                >
                  <span>
                    叙事历史 ({gameState.narrativeHistory.length})
                  </span>
                  {expandedSection === "narrative" ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedSection === "narrative" && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
                        {gameState.narrativeHistory.length === 0 ? (
                          <div className="text-gray-500 italic">
                            暂无叙事历史
                          </div>
                        ) : (
                          gameState.narrativeHistory.map((narrative, index) => (
                            <div
                              key={index}
                              className="bg-gray-900 p-2 rounded text-gray-300"
                            >
                              <div className="text-purple-400 mb-1">
                                片段 {index + 1}
                              </div>
                              <div className="whitespace-pre-wrap text-xs line-clamp-3">
                                {narrative}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 对话历史 */}
              <div className="bg-gray-800 rounded overflow-hidden">
                <button
                  onClick={() => toggleSection("conversation")}
                  className="w-full p-3 flex items-center justify-between text-purple-400 hover:bg-gray-700 transition-colors"
                >
                  <span>
                    对话历史 ({gameState.conversationHistory.length})
                  </span>
                  {expandedSection === "conversation" ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedSection === "conversation" && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
                        {gameState.conversationHistory.length === 0 ? (
                          <div className="text-gray-500 italic">
                            暂无对话历史
                          </div>
                        ) : (
                          gameState.conversationHistory.map(
                            (conversation, index) => (
                              <div
                                key={index}
                                className="bg-gray-900 p-2 rounded text-gray-300"
                              >
                                <div className="text-cyan-400 mb-1">
                                  对话 {index + 1}
                                </div>
                                <div className="whitespace-pre-wrap text-xs line-clamp-4">
                                  {conversation}
                                </div>
                              </div>
                            )
                          )
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 统计信息 */}
              <div className="bg-gray-800 p-3 rounded">
                <h3 className="text-purple-400 mb-2">统计</h3>
                <div className="grid grid-cols-2 gap-2 text-gray-300">
                  <div className="bg-gray-900 p-2 rounded text-center">
                    <div className="text-2xl text-purple-400">
                      {gameState.narrativeHistory.length}
                    </div>
                    <div className="text-xs text-gray-500">叙事片段</div>
                  </div>
                  <div className="bg-gray-900 p-2 rounded text-center">
                    <div className="text-2xl text-cyan-400">
                      {gameState.conversationHistory.length}
                    </div>
                    <div className="text-xs text-gray-500">对话场景</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}