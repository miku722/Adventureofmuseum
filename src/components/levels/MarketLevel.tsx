import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGame } from "../../contexts/GameContext";
import { Inventory } from "../game/Inventory";
import { DialogueBox } from "../game/DialogueBox";
import { chapter1NPCs, bronzeDingAbility, tributeFood } from "../../data/chapter1_npcs";
import { NPC } from "../../types/game";
import { MapPin, Users, AlertCircle } from "lucide-react";

interface MarketLevelProps {
  playerName: string;
  playerChoice: "market" | "palace" | "bamboo" | null;
  onComplete: (destination: "palace" | "bamboo") => void;
}

type Location = "market" | "dock" | "school" | "government" | "market_corner";

export function MarketLevel({
  playerName,
  playerChoice,
  onComplete,
}: MarketLevelProps) {
  const { gameState, addItem, addClue, addAbility, hasItem } = useGame();
  const [currentLocation, setCurrentLocation] = useState<Location>("market");
  const [activeNPC, setActiveNPC] = useState<NPC | null>(null);
  const [beggarAwakened, setBeggarAwakened] = useState(false);
  const [showAwakenUI, setShowAwakenUI] = useState(false);
  const [showEndChoice, setShowEndChoice] = useState(false);

  // 地点配置
  const locations = {
    market: {
      name: "集市中心",
      description: "热闹的宋代集市，人声鼎沸",
      npcs: ["vendor", "monk"],
    },
    dock: {
      name: "码头",
      description: "停靠着几艘船，船夫们在休息",
      npcs: ["boatman"],
    },
    school: {
      name: "私塾",
      description: "书香气息浓厚的地方",
      npcs: ["scholar"],
    },
    government: {
      name: "官府门口",
      description: "庄严肃穆的官府大门",
      npcs: ["guard"],
    },
    market_corner: {
      name: "集市角落",
      description: "脏乱的角落，弥漫着奇怪的气息",
      npcs: ["beggar"],
    },
  };

  // 处理NPC对话
  const handleNPCClick = (npcId: string) => {
    let npc = { ...chapter1NPCs[npcId] };
    
    // 特殊情况处理
    if (npcId === "boatman" && hasItem("tribute_food")) {
      npc = { ...chapter1NPCs.boatmanAfterAwakening };
    }
    
    setActiveNPC(npc);
  };

  // 对话结束处理
  const handleDialogueComplete = () => {
    if (!activeNPC) return;

    // 给予物品
    if (activeNPC.givesItem) {
      addItem(activeNPC.givesItem);
    }

    // 给予线索
    if (activeNPC.givesClue) {
      addClue(activeNPC.givesClue);
    }

    // 特殊处理：船夫吃了贡品后，显示结束选项
    if (activeNPC.id === "boatman" && hasItem("tribute_food")) {
      setShowEndChoice(true);
      setActiveNPC(null);
      return;
    }

    // DialogueBox会自动处理是否进入AI聊天模式
    // 不需要在这里关闭，DialogueBox会自己处理
  };

  // 唤醒乞丐
  const handleAwakenBeggar = () => {
    const hasAllClues =
      gameState.clues.some((c) => c.id === "clue_ding_ritual") &&
      gameState.clues.some((c) => c.id === "clue_vessel") &&
      gameState.clues.some((c) => c.id === "clue_missing_ding");

    if (!hasAllClues) {
      alert("你还没有收集到足够的线索！试着和其他NPC对话获取更多信息。");
      return;
    }

    setShowAwakenUI(true);
  };

  // 完成唤醒
  const completeAwakening = () => {
    setBeggarAwakened(true);
    addAbility(bronzeDingAbility);
    setShowAwakenUI(false);
    
    // 显示唤醒动画
    setActiveNPC(chapter1NPCs.beggarAwakening);
  };

  // 使用"供养"能力
  const useSupplyPower = () => {
    if (!gameState.abilities.some((a) => a.id === "supply_power")) {
      alert("你还没有获得这个能力！");
      return;
    }

    if (hasItem("tribute_food")) {
      alert("你已经有贡品了！");
      return;
    }

    addItem(tributeFood);
    alert("你使用了'历史回响：供养'，具现化出了祭祀贡品！");
  };

  const getCurrentLocationNPCs = () => {
    return locations[currentLocation].npcs;
  };

  // 检查是否收集了所有线索
  const hasAllClues = () => {
    return (
      gameState.clues.some((c) => c.id === "clue_ding_ritual") &&
      gameState.clues.some((c) => c.id === "clue_vessel") &&
      gameState.clues.some((c) => c.id === "clue_missing_ding")
    );
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-amber-900 via-orange-800 to-slate-900 overflow-hidden">
      {/* 背景装饰 - 模拟清明上河图风格 */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: -100 }}
            animate={{ x: window.innerWidth + 100 }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            className="absolute w-8 h-8 bg-amber-400 rounded-full blur-xl"
            style={{
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* 背包系统 */}
      <Inventory />

      {/* 地点信息栏 */}
      <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm border-2 border-amber-600/50 rounded-lg p-4 max-w-xs z-30">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-5 h-5 text-amber-400" />
          <h3 className="text-amber-200">{locations[currentLocation].name}</h3>
        </div>
        <p className="text-amber-400/70 text-sm">
          {locations[currentLocation].description}
        </p>
      </div>

      {/* 能力栏 */}
      {gameState.abilities.length > 0 && (
        <div className="absolute top-20 left-4 bg-slate-900/80 backdrop-blur-sm border-2 border-purple-600/50 rounded-lg p-3 max-w-xs z-30">
          <h4 className="text-purple-300 text-sm mb-2">可用能力：</h4>
          {gameState.abilities.map((ability) => (
            <button
              key={ability.id}
              onClick={useSupplyPower}
              className="w-full text-left bg-purple-900/30 hover:bg-purple-800/40 border border-purple-500/50 rounded px-3 py-2 text-purple-200 text-sm transition-all"
            >
              ✨ {ability.name}
            </button>
          ))}
        </div>
      )}

      {/* 主要游戏区域 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8">
        {/* 地点切换按钮 */}
        <div className="mb-8 flex flex-wrap gap-3 justify-center">
          {Object.entries(locations).map(([key, loc]) => (
            <button
              key={key}
              onClick={() => setCurrentLocation(key as Location)}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                currentLocation === key
                  ? "bg-amber-600 border-amber-400 text-white"
                  : "bg-slate-900/80 border-amber-600/50 text-amber-300 hover:border-amber-400"
              }`}
            >
              {loc.name}
            </button>
          ))}
        </div>

        {/* NPC列表 */}
        <div className="w-full max-w-4xl">
          <div className="bg-slate-900/80 backdrop-blur-sm border-2 border-amber-600/50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-amber-400" />
              <h3 className="text-amber-200 text-xl">此处的人物：</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getCurrentLocationNPCs().map((npcId) => {
                const npc = chapter1NPCs[npcId];
                const isSpecial = npcId === "beggar" && !beggarAwakened;

                return (
                  <div key={npcId} className="relative">
                    <button
                      onClick={() => handleNPCClick(npcId)}
                      className="w-full text-left bg-slate-800/50 hover:bg-slate-700/50 border border-amber-600/30 hover:border-amber-400/50 rounded-lg p-4 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-amber-900/30 rounded-lg flex items-center justify-center border border-amber-600/30 group-hover:border-amber-400/50 transition-all">
                          <span className="text-2xl">👤</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-amber-200 mb-1">{npc.name}</h4>
                          <p className="text-amber-400/70 text-sm">{npc.role}</p>
                        </div>
                        {isSpecial && (
                          <AlertCircle className="w-5 h-5 text-red-400 animate-pulse" />
                        )}
                      </div>
                    </button>

                    {/* 唤醒按钮（仅乞丐） */}
                    {isSpecial && hasAllClues() && (
                      <button
                        onClick={handleAwakenBeggar}
                        className="absolute -top-2 -right-2 bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded-full text-sm shadow-lg animate-pulse"
                      >
                        ✨ 唤醒
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* NPC对话框 */}
      <AnimatePresence>
        {activeNPC && (
          <DialogueBox
            npc={activeNPC}
            onClose={() => setActiveNPC(null)}
            onDialogueComplete={handleDialogueComplete}
            onGiveItem={() => {
              if (activeNPC.givesItem) {
                addItem(activeNPC.givesItem);
              }
            }}
            playerName={playerName}
          />
        )}
      </AnimatePresence>

      {/* 唤醒UI */}
      <AnimatePresence>
        {showAwakenUI && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-gradient-to-br from-purple-950 via-slate-900 to-purple-950 border-2 border-purple-500 rounded-lg p-8 max-w-2xl"
            >
              <h2 className="text-purple-200 text-2xl mb-4 text-center">
                唤醒文物
              </h2>
              <div className="space-y-4 text-purple-100 mb-6">
                <p>"你不是乞丐！你根本不需要食物！"</p>
                <p className="text-purple-300">乞丐：（迷茫）"饿... 我好饿..."</p>
                <p>"你是'国之重器'，是一尊'青铜鼎'！"</p>
                <p>
                  "你的职责不是吞噬，而是'盛放'！是承载敬天法祖的'祭品'！"
                </p>
                <p className="text-purple-300">
                  乞丐：（抱头尖叫）"我... 我是... 鼎？"
                </p>
                <p>
                  "你忘记了你的荣耀，只剩下了贪婪！你的本分是'供养'万民，而不是索取！"
                </p>
              </div>
              <button
                onClick={completeAwakening}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-lg transition-all"
              >
                完成唤醒
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 结束选择 */}
      <AnimatePresence>
        {showEndChoice && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-gradient-to-br from-slate-900 via-amber-950/50 to-slate-900 border-2 border-amber-600 rounded-lg p-8 max-w-2xl"
            >
              <h2 className="text-amber-200 text-2xl mb-4 text-center">
                船夫准备好了！
              </h2>
              <p className="text-amber-100 mb-6 text-center">
                你该前往何处？
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => onComplete("palace")}
                  className="w-full bg-amber-900/50 hover:bg-amber-800/50 text-amber-200 py-3 rounded-lg border border-amber-600/50 transition-all"
                >
                  直奔宫殿
                </button>
                <button
                  onClick={() => onComplete("bamboo")}
                  className="w-full bg-amber-900/50 hover:bg-amber-800/50 text-amber-200 py-3 rounded-lg border border-amber-600/50 transition-all"
                >
                  探索竹林
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
