import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { NarrativeSceneBase } from "../shared/NarrativeSceneBase";
import riftImage from "figma:asset/91537110258929abd280ae0c27ba8d0c2dc31331.png";

interface PortalTransitionProps {
  onComplete: (choice: "market" | "palace" | "bamboo") => void;
  playerName: string;
}

export function PortalTransition({
  onComplete,
  playerName,
}: PortalTransitionProps) {
  const [showChoices, setShowChoices] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<
    "market" | "palace" | "bamboo" | null
  >(null);

  // 过渡动画的旁白 + 场景6的旁白
  const narrations = [
    {
      text: "时空裂缝散发着如梦似幻的光芒。我能感受到从中传来的古老气息——那是青铜的锈蚀味，丝绸的幽香，还有墨汁未干的竹简香。",
    },
    {
      text: "我深吸一口气，消失在裂缝中。眩晕感袭来，世界在我眼前旋转、扭曲...当我视线重新清晰时，我发现自己站在一个完全陌生的世界。天空散发着耀眼的白光，空气中飘浮着发光的粒子。脚下是由未知材质构成的大理石地面，上面刻着我看不懂但感觉似曾相识的古老符文。",
    },
    {
      text: "突然，我听到了熟悉的声音... 叮铃铃~ 我循声望去，发现远处有一座气势恢宏的宫殿。铜绿色的屋顶在月光下闪闪发光，门前的石狮子眼中闪烁着红光。",
    },
    {
      text: "但同时，我也注意到左边有一片幽暗的竹林，林中隐约传来古筝的声音...还有右边那座看起来像是古代集市的地方，那里灯火通明，人声鼎沸。",
    },
  ];

  const handleChoice = (
    choice: "market" | "palace" | "bamboo",
  ) => {
    setSelectedChoice(choice);
    setTimeout(() => {
      onComplete(choice);
    }, 1500);
  };

  const handleNarrativeComplete = () => {
    setShowChoices(true);
  };

  return (
    <>
      {/* 使用NarrativeSceneBase展示叙事 */}
      <NarrativeSceneBase
        segments={narrations}
        backgroundImage={riftImage}
        imageAlt="时空裂缝"
        theme="cyan"
        continueButtonText="继续"
        onComplete={handleNarrativeComplete}
        showParticles={true}
      />

      {/* 选择弹窗 - 浮现在画面中心 */}
      <AnimatePresence>
        {showChoices && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] pointer-events-auto"
            />

            {/* 选择弹窗 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{
                type: "spring",
                damping: 20,
                stiffness: 300,
              }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-2xl px-4"
            >
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden">
                {/* 装饰性光效 */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
                <motion.div
                  animate={{
                    opacity: [0.1, 0.2, 0.1],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"
                />

                <div className="relative p-8">
                  {/* 标题 */}
                  <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-amber-200 text-3xl text-center mb-3 tracking-wide"
                  >
                    你该前往何处？
                  </motion.h2>

                  {/* 分隔线 */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="h-[2px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent mb-8"
                  />

                  {/* 提示文字 */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-amber-100/70 text-center mb-8 text-sm"
                  >
                    这个选择将决定你的命运...
                  </motion.p>

                  {/* 选项 */}
                  <div className="space-y-4">
                    {/* 选项1：前往集市 */}
                    <motion.button
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.5,
                        type: "spring",
                      }}
                      onClick={() => handleChoice("market")}
                      disabled={selectedChoice !== null}
                      className={`w-full p-6 rounded-xl border-2 transition-all duration-300 group text-left relative overflow-hidden ${
                        selectedChoice === "market"
                          ? "bg-amber-600 border-amber-400 scale-105 shadow-lg shadow-amber-600/50"
                          : selectedChoice === null
                            ? "bg-slate-800/50 border-amber-600/40 hover:bg-slate-700/50 hover:border-amber-400 hover:scale-105 hover:shadow-lg hover:shadow-amber-600/30"
                            : "bg-slate-900/30 border-slate-700/20 opacity-40"
                      }`}
                    >
                      {/* 悬停光效 */}
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="relative">
                        <h4 className="text-amber-200 text-xl mb-2 group-hover:text-amber-100 flex items-center gap-2">
                          <span className="text-2xl">🏪</span>
                          前往集市
                        </h4>
                        <p className="text-amber-300/70 text-sm group-hover:text-amber-300">
                          "那里人声鼎沸，也许最容易收集到情报。"
                        </p>
                      </div>
                    </motion.button>

                    {/* 选项2：直奔宫殿 */}
                    <motion.button
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.6,
                        type: "spring",
                      }}
                      onClick={() => handleChoice("palace")}
                      disabled={selectedChoice !== null}
                      className={`w-full p-6 rounded-xl border-2 transition-all duration-300 group text-left relative overflow-hidden ${
                        selectedChoice === "palace"
                          ? "bg-amber-600 border-amber-400 scale-105 shadow-lg shadow-amber-600/50"
                          : selectedChoice === null
                            ? "bg-slate-800/50 border-amber-600/40 hover:bg-slate-700/50 hover:border-amber-400 hover:scale-105 hover:shadow-lg hover:shadow-amber-600/30"
                            : "bg-slate-900/30 border-slate-700/20 opacity-40"
                      }`}
                    >
                      {/* 悬停光效 */}
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="relative">
                        <h4 className="text-amber-200 text-xl mb-2 group-hover:text-amber-100 flex items-center gap-2">
                          <span className="text-2xl">🏰</span>
                          直奔宫殿
                        </h4>
                        <p className="text-amber-300/70 text-sm group-hover:text-amber-300">
                          "铜铃的声音是从那里传来的，它一定在等我。"
                        </p>
                      </div>
                    </motion.button>

                    {/* 选项3：探索竹林 */}
                    <motion.button
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.7,
                        type: "spring",
                      }}
                      onClick={() => handleChoice("bamboo")}
                      disabled={selectedChoice !== null}
                      className={`w-full p-6 rounded-xl border-2 transition-all duration-300 group text-left relative overflow-hidden ${
                        selectedChoice === "bamboo"
                          ? "bg-amber-600 border-amber-400 scale-105 shadow-lg shadow-amber-600/50"
                          : selectedChoice === null
                            ? "bg-slate-800/50 border-amber-600/40 hover:bg-slate-700/50 hover:border-amber-400 hover:scale-105 hover:shadow-lg hover:shadow-amber-600/30"
                            : "bg-slate-900/30 border-slate-700/20 opacity-40"
                      }`}
                    >
                      {/* 悬停光效 */}
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="relative">
                        <h4 className="text-amber-200 text-xl mb-2 group-hover:text-amber-100 flex items-center gap-2">
                          <span className="text-2xl">🎋</span>
                          探索竹林
                        </h4>
                        <p className="text-amber-300/70 text-sm group-hover:text-amber-300">
                          "古筝声若有若无，听起来有些悲伤..."
                        </p>
                      </div>
                    </motion.button>
                  </div>

                  {/* 选择确认提示 */}
                  {selectedChoice && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 text-center text-amber-300 text-sm"
                    >
                      正在前往...
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}