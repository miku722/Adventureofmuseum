/**
 * AI思维链展示组件
 * 显示AI的内部思考过程和玩家状态
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronRight, Package, Search, Zap } from "lucide-react";
import { GameState } from "../../utils/gameSystemPrompt";

interface ThinkingProcessProps {
  gameState: GameState;
  isThinking?: boolean;
}

export function ThinkingProcess({ gameState, isThinking = false }: ThinkingProcessProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);

  const { inventory, clues, skills } = gameState;

  // 监听 isThinking 状态变化
  useEffect(() => {
    console.log("💭 [ThinkingProcess] isThinking 接收到的值:", isThinking);
    console.log("├─ 时间:", new Date().toLocaleTimeString());
    console.log("└─ 显示状态:", isThinking ? "✅ 显示 Thinking 面板" : "❌ 隐藏 Thinking 面板");
  }, [isThinking]);

  // 监听游戏状态变化
  useEffect(() => {
    console.log("📊 [ThinkingProcess] 游戏状态更新:");
    console.log("├─ 物品数量:", inventory.length);
    console.log("├─ 线索数量:", clues.length);
    console.log("└─ 技能数量:", skills.length);
    
    if (inventory.length > 0) {
      console.log("  📦 物品列表:", inventory.map(i => i.name).join(", "));
    }
    if (clues.length > 0) {
      console.log("  🔍 线索列表:", clues.map(c => c.title).join(", "));
    }
    if (skills.length > 0) {
      console.log("  ⚡ 技能列表:", skills.map(s => s.name).join(", "));
    }
  }, [inventory, clues, skills]);

  return (
    <div className="space-y-2">
      {/* Thinking 展示 */}
      {isThinking && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/40 border border-slate-600/30 rounded-lg overflow-hidden"
        >
          <button
            onClick={() =>
              setIsThinkingExpanded(!isThinkingExpanded)
            }
            className="w-full px-3 py-2 flex items-center gap-2 text-slate-300 hover:bg-slate-700/30 transition-colors text-sm"
          >
            {isThinkingExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
            <span className="text-slate-400">Thinking</span>
            {!isThinkingExpanded && (
              <div className="flex gap-1 ml-auto">
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0,
                  }}
                  className="w-1 h-1 bg-slate-400 rounded-full"
                />
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0.3,
                  }}
                  className="w-1 h-1 bg-slate-400 rounded-full"
                />
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0.6,
                  }}
                  className="w-1 h-1 bg-slate-400 rounded-full"
                />
              </div>
            )}
          </button>

          <AnimatePresence>
            {isThinkingExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-slate-600/30"
              >
                <div className="px-3 py-2 text-xs text-slate-400 space-y-1">
                  <p>• 正在分析玩家意图...</p>
                  <p>• 检索相关记忆和知识...</p>
                  <p>• 生成回应内容...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* 状态栏 - 默认折叠 */}
      <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 border border-slate-600/40 rounded-lg overflow-hidden backdrop-blur-sm">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-3 py-2 flex items-center justify-between text-slate-300 hover:bg-slate-700/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <span className="text-sm">状态</span>
          </div>

          {/* 快速预览 - 折叠时显示 */}
          {!isExpanded && (
            <div className="flex items-center gap-3 text-xs">
              {inventory.length > 0 && (
                <div className="flex items-center gap-1 text-amber-400">
                  <Package className="w-3 h-3" />
                  <span>{inventory.length}</span>
                </div>
              )}
              {clues.length > 0 && (
                <div className="flex items-center gap-1 text-cyan-400">
                  <Search className="w-3 h-3" />
                  <span>{clues.length}</span>
                </div>
              )}
              {skills.length > 0 && (
                <div className="flex items-center gap-1 text-purple-400">
                  <Zap className="w-3 h-3" />
                  <span>{skills.length}</span>
                </div>
              )}
              {inventory.length === 0 &&
                clues.length === 0 &&
                skills.length === 0 && (
                  <span className="text-slate-500 italic">
                    空
                  </span>
                )}
            </div>
          )}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-slate-600/30"
            >
              <div className="p-3 space-y-3">
                {/* 物品栏 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 text-xs">
                    <Package className="w-3.5 h-3.5" />
                    <span>物品栏</span>
                    <span className="text-slate-500">
                      ({inventory.length})
                    </span>
                  </div>
                  {inventory.length === 0 ? (
                    <p className="text-slate-500 text-xs italic pl-5">
                      暂无物品
                    </p>
                  ) : (
                    <div className="space-y-1 pl-5">
                      {inventory.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-2 text-xs bg-black/20 p-2 rounded border border-amber-500/20"
                        >
                          <span className="text-amber-400">
                            •
                          </span>
                          <div className="flex-1">
                            <p className="text-amber-100">
                              {item.name}
                            </p>
                            {item.description && (
                              <p className="text-slate-400 text-[10px] mt-0.5">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 线索栏 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs">
                    <Search className="w-3.5 h-3.5" />
                    <span>线索栏</span>
                    <span className="text-slate-500">
                      ({clues.length})
                    </span>
                  </div>
                  {clues.length === 0 ? (
                    <p className="text-slate-500 text-xs italic pl-5">
                      暂无线索
                    </p>
                  ) : (
                    <div className="space-y-1 pl-5">
                      {clues.map((clue) => (
                        <div
                          key={clue.id}
                          className="flex items-start gap-2 text-xs bg-black/20 p-2 rounded border border-cyan-500/20"
                        >
                          <span className="text-cyan-400">
                            •
                          </span>
                          <div className="flex-1">
                            <p className="text-cyan-100">
                              {clue.title}
                            </p>
                            {clue.content && (
                              <p className="text-slate-400 text-[10px] mt-0.5">
                                {clue.content}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 技能栏 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 text-xs">
                    <Zap className="w-3.5 h-3.5" />
                    <span>技能栏</span>
                    <span className="text-slate-500">
                      ({skills.length})
                    </span>
                  </div>
                  {skills.length === 0 ? (
                    <p className="text-slate-500 text-xs italic pl-5">
                      暂无技能
                    </p>
                  ) : (
                    <div className="space-y-1 pl-5">
                      {skills.map((skill) => (
                        <div
                          key={skill.id}
                          className="flex items-start gap-2 text-xs bg-black/20 p-2 rounded border border-purple-500/20"
                        >
                          <span className="text-purple-400">
                            •
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-purple-100">
                                {skill.name}
                              </p>
                              {skill.level && (
                                <span className="text-purple-400 text-[10px] bg-purple-500/20 px-1.5 py-0.5 rounded">
                                  Lv.{skill.level}
                                </span>
                              )}
                            </div>
                            {skill.description && (
                              <p className="text-slate-400 text-[10px] mt-0.5">
                                {skill.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}