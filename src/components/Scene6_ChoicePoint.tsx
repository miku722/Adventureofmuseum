import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { useTouchContinue } from "../hooks/useTouchContinue";
import { ContinueHint } from "./ui/ContinueHint";

interface Scene6ChoicePointProps {
  onComplete: (choice: "market" | "palace" | "bamboo") => void;
  playerName: string;
}

export function Scene6ChoicePoint({
  onComplete,
  playerName,
}: Scene6ChoicePointProps) {
  const [narrationIndex, setNarrationIndex] = useState(0);
  const [showChoices, setShowChoices] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<
    "market" | "palace" | "bamboo" | null
  >(null);

  const narrations = [
    "我循声望去，发现远处有一座气势恢宏的宫殿。",
    "铜绿色的屋顶在月光下闪闪发光，门前的石狮子眼中闪烁着红光。",
    "但同时，我也注意到左边有一片幽暗的竹林，林中隐约传来古筝的声音...",
    "还有右边那座看起来像是古代集市的地方，那里灯火通明，人声鼎沸。",
  ];

  // 自动播放定时器
  useEffect(() => {
    if (narrationIndex < narrations.length) {
      // 每段文字显示3秒
      const timer = setTimeout(() => {
        setNarrationIndex(narrationIndex + 1);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (!showChoices) {
      // 所有旁白显示完毕，1秒后显示选项
      const choiceTimer = setTimeout(() => {
        setShowChoices(true);
      }, 1000);
      return () => clearTimeout(choiceTimer);
    }
  }, [narrationIndex, narrations.length, showChoices]);

  // 处理触控点击 - 跳过到下一段
  useTouchContinue(() => {
    if (narrationIndex < narrations.length && !showChoices) {
      setNarrationIndex((prev) => prev + 1);
    }
  }, narrationIndex < narrations.length && !showChoices);

  const handleChoice = (choice: "market" | "palace" | "bamboo") => {
    setSelectedChoice(choice);
    setTimeout(() => {
      onComplete(choice);
    }, 1500);
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
        <div className="w-full md:w-1/2 flex flex-col px-8 md:px-16 py-12 relative justify-center">
          <div className="space-y-8">
            {/* 标题 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <h2 className="scene-title text-4xl md:text-5xl text-amber-200 mb-8">
                未知世界
              </h2>
              <div className="h-[2px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent mb-8" />
            </motion.div>

            {/* 旁白文字 */}
            <div className="space-y-6 min-h-[300px]">
              <AnimatePresence mode="sync">
                {narrations.slice(0, narrationIndex).map((text, index) => (
                  <motion.p
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="narration-text text-slate-300 text-lg md:text-xl leading-relaxed"
                  >
                    {text}
                  </motion.p>
                ))}
              </AnimatePresence>
            </div>

            {/* 选择按钮 - 放在文本区域中间 */}
            <AnimatePresence>
              {showChoices && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1 }}
                  className="space-y-4"
                >
                  {/* 标题 */}
                  <motion.h3
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-amber-300 text-2xl tracking-widest mb-6"
                  >
                    你该前往何处？
                  </motion.h3>

                  {/* 选项1：前往集市 */}
                  <motion.button
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    onClick={() => handleChoice("market")}
                    disabled={selectedChoice !== null}
                    className={`w-full p-5 rounded-lg border-2 transition-all duration-300 group text-left ${
                      selectedChoice === "market"
                        ? "bg-amber-600 border-amber-400 scale-105"
                        : selectedChoice === null
                        ? "bg-slate-900/80 border-amber-600/50 hover:bg-slate-800/80 hover:border-amber-400 hover:scale-105"
                        : "bg-slate-900/40 border-slate-700/30 opacity-50"
                    }`}
                  >
                    <h4 className="text-amber-200 text-xl mb-2 group-hover:text-amber-100">
                      前往集市
                    </h4>
                    <p className="text-amber-300/70 text-sm group-hover:text-amber-300">
                      "那里人声鼎沸，也许最容易收集到情报。"
                    </p>
                  </motion.button>

                  {/* 选项2：直奔宫殿 */}
                  <motion.button
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    onClick={() => handleChoice("palace")}
                    disabled={selectedChoice !== null}
                    className={`w-full p-5 rounded-lg border-2 transition-all duration-300 group text-left ${
                      selectedChoice === "palace"
                        ? "bg-amber-600 border-amber-400 scale-105"
                        : selectedChoice === null
                        ? "bg-slate-900/80 border-amber-600/50 hover:bg-slate-800/80 hover:border-amber-400 hover:scale-105"
                        : "bg-slate-900/40 border-slate-700/30 opacity-50"
                    }`}
                  >
                    <h4 className="text-amber-200 text-xl mb-2 group-hover:text-amber-100">
                      直奔宫殿
                    </h4>
                    <p className="text-amber-300/70 text-sm group-hover:text-amber-300">
                      "铜铃的声音是从那里传来的，它一定在等我。"
                    </p>
                  </motion.button>

                  {/* 选项3：探索竹林 */}
                  <motion.button
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 }}
                    onClick={() => handleChoice("bamboo")}
                    disabled={selectedChoice !== null}
                    className={`w-full p-5 rounded-lg border-2 transition-all duration-300 group text-left ${
                      selectedChoice === "bamboo"
                        ? "bg-amber-600 border-amber-400 scale-105"
                        : selectedChoice === null
                        ? "bg-slate-900/80 border-amber-600/50 hover:bg-slate-800/80 hover:border-amber-400 hover:scale-105"
                        : "bg-slate-900/40 border-slate-700/30 opacity-50"
                    }`}
                  >
                    <h4 className="text-amber-200 text-xl mb-2 group-hover:text-amber-100">
                      探索竹林
                    </h4>
                    <p className="text-amber-300/70 text-sm group-hover:text-amber-300">
                      "古筝声若有若无，听起来有些悲伤..."
                    </p>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
            <img
              src={exampleImage}
              alt="未知世界"
              className="w-full h-full object-cover"
            />
            {/* 渐变遮罩，让图片边缘融入背景 */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-black/20" />

            {/* 三个月亮 */}
            <div className="absolute top-20 left-1/4 w-24 h-24 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 opacity-80 blur-sm" />
            <div className="absolute top-32 right-1/3 w-32 h-32 rounded-full bg-gradient-to-br from-purple-200 to-purple-400 opacity-60 blur-sm" />
            <div className="absolute top-40 left-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-cyan-200 to-cyan-400 opacity-70 blur-sm" />
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
            className="absolute top-20 right-32 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl pointer-events-none"
          />
        </motion.div>
      </div>

      {/* 底部触控提示 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
        {/* 触控提示 - 仅在旁白阶段显示 */}
        {!showChoices && narrationIndex < narrations.length && (
          <ContinueHint action="跳过" />
        )}
      </div>
    </motion.div>
  );
}