import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGame } from "../../contexts/GameContext";
import { Package, X, BookOpen, Sparkles } from "lucide-react";
import { Button } from "../ui/button";

export function Inventory() {
  const { gameState } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"items" | "clues" | "abilities">(
    "items",
  );

  return (
    <>
      {/* 背包按钮 */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-40 bg-amber-900/80 backdrop-blur-sm p-3 rounded-full border-2 border-amber-600/50 hover:border-amber-400 transition-all hover:scale-110"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Package className="w-6 h-6 text-amber-200" />
        {gameState.inventory.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
          >
            {gameState.inventory.length}
          </motion.div>
        )}
      </motion.button>

      {/* 背包面板 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* 背包主面板 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl bg-gradient-to-br from-slate-900 via-amber-950/50 to-slate-900 border-2 border-amber-600/50 rounded-lg shadow-2xl overflow-hidden"
            >
              {/* 标题栏 */}
              <div className="bg-amber-900/30 border-b border-amber-600/30 p-4 flex items-center justify-between">
                <h2 className="text-amber-200 text-2xl tracking-wide">背包</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-amber-400 hover:text-amber-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* 标签页 */}
              <div className="flex border-b border-amber-600/30 bg-slate-900/50">
                <button
                  onClick={() => setActiveTab("items")}
                  className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-all ${
                    activeTab === "items"
                      ? "bg-amber-900/40 border-b-2 border-amber-400 text-amber-200"
                      : "text-amber-400/60 hover:text-amber-300"
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>物品 ({gameState.inventory.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab("clues")}
                  className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-all ${
                    activeTab === "clues"
                      ? "bg-amber-900/40 border-b-2 border-amber-400 text-amber-200"
                      : "text-amber-400/60 hover:text-amber-300"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>线索 ({gameState.clues.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab("abilities")}
                  className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-all ${
                    activeTab === "abilities"
                      ? "bg-amber-900/40 border-b-2 border-amber-400 text-amber-200"
                      : "text-amber-400/60 hover:text-amber-300"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>能力 ({gameState.abilities.length})</span>
                </button>
              </div>

              {/* 内容区域 */}
              <div className="p-6 max-h-96 overflow-y-auto">
                {/* 物品列表 */}
                {activeTab === "items" && (
                  <div className="grid grid-cols-2 gap-4">
                    {gameState.inventory.length === 0 ? (
                      <div className="col-span-2 text-center py-12 text-amber-400/60">
                        背包空空如也...
                      </div>
                    ) : (
                      gameState.inventory.map((item, index) => (
                        <motion.div
                          key={`${item.id}-${index}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-slate-800/50 border border-amber-600/30 rounded-lg p-4 hover:border-amber-400/50 transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-amber-900/30 rounded-lg flex items-center justify-center border border-amber-600/30">
                              <span className="text-2xl">{item.icon || "📦"}</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-amber-200 mb-1">{item.name}</h3>
                              <p className="text-amber-400/70 text-xs">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}

                {/* 线索列表 */}
                {activeTab === "clues" && (
                  <div className="space-y-3">
                    {gameState.clues.length === 0 ? (
                      <div className="text-center py-12 text-amber-400/60">
                        暂无线索...
                      </div>
                    ) : (
                      gameState.clues.map((clue, index) => (
                        <motion.div
                          key={`${clue.id}-${index}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-slate-800/50 border border-amber-600/30 rounded-lg p-4 hover:border-amber-400/50 transition-all"
                        >
                          <div className="flex items-start gap-3 mb-2">
                            <BookOpen className="w-5 h-5 text-amber-400 mt-1" />
                            <div className="flex-1">
                              <h3 className="text-amber-200 mb-1">{clue.title}</h3>
                              <p className="text-amber-400/70 text-sm mb-2">
                                {clue.content}
                              </p>
                              <p className="text-amber-500/50 text-xs">
                                来源：{clue.source}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}

                {/* 能力列表 */}
                {activeTab === "abilities" && (
                  <div className="space-y-3">
                    {gameState.abilities.length === 0 ? (
                      <div className="text-center py-12 text-amber-400/60">
                        暂无能力...
                      </div>
                    ) : (
                      gameState.abilities.map((ability, index) => (
                        <motion.div
                          key={`${ability.id}-${index}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gradient-to-r from-amber-900/30 to-purple-900/30 border border-amber-600/50 rounded-lg p-4 hover:border-amber-400/70 transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-amber-600/20 rounded-lg flex items-center justify-center border border-amber-400/30">
                              <Sparkles className="w-6 h-6 text-amber-300" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-amber-200 mb-1">{ability.name}</h3>
                              <p className="text-amber-400/70 text-sm">
                                {ability.description}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* 底部按钮 */}
              <div className="bg-slate-900/50 border-t border-amber-600/30 p-4">
                <Button
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-amber-900/50 hover:bg-amber-800/50 text-amber-200 border border-amber-600/50"
                >
                  关闭
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}