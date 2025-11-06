import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { useKeyboardContinue } from "../hooks/useKeyboardContinue";
import museumInterior from "figma:asset/cdc0af926f550e7f0779a5e8c15e05fa8559a86a.png";

interface StoryNarrationProps {
  onComplete: () => void;
}

const narrativeSegments = [
  {
    type: "thought" as const,
    text: "这是你担任守夜人的第三年。工作很简单：确保每一件文物都在它该在的位置上。",
  },
  {
    type: "action" as const,
    text: "你走在万籁俱寂、一尘不染的展厅中，手电筒的光扫过一排排展柜。你百无聊赖地打了个哈欠，回到监控室。",
  },
  {
    type: "narration" as const,
    text: "你给自己倒了一杯菊花茶。又是平静的一晚... 本该如此。",
  },
];

export function StoryNarration({
  onComplete,
}: StoryNarrationProps) {
  const [currentSegment, setCurrentSegment] = useState(0);
  const [showContinueButton, setShowContinueButton] =
    useState(false);
  const onCompleteRef = useRef(onComplete);

  // 保持 onComplete 引用最新
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // 调试信息
  useEffect(() => {
    console.log(
      "StoryNarration - currentSegment:",
      currentSegment,
      "showContinueButton:",
      showContinueButton,
    );
  }, [currentSegment, showContinueButton]);

  // 处理空格键和回车键 - 按钮显示后继续游戏
  useKeyboardContinue(() => {
    if (showContinueButton) {
      console.log("空格/回车键触发继续");
      onCompleteRef.current();
    }
  }, showContinueButton);

  // 处理空格键和回车键 - 跳过到下一段
  useKeyboardContinue(() => {
    if (currentSegment < narrativeSegments.length) {
      setCurrentSegment((prev) => prev + 1);
    }
  }, !showContinueButton && currentSegment < narrativeSegments.length);

  // 自动播放定时器
  useEffect(() => {
    if (currentSegment < narrativeSegments.length) {
      // 每段文字显示4秒
      console.log("设置定时器，4秒后显示下一段");
      const timer = setTimeout(() => {
        console.log(
          "定时器触发，currentSegment从",
          currentSegment,
          "变为",
          currentSegment + 1,
        );
        setCurrentSegment((prev) => prev + 1);
      }, 4000);
      return () => clearTimeout(timer);
    } else if (!showContinueButton) {
      // 所有段落显示完毕，2秒后显示继续按钮
      console.log("所有段落显示完毕，2秒后显示继续按钮");
      const buttonTimer = setTimeout(() => {
        console.log("显示继续按钮");
        setShowContinueButton(true);
      }, 1000);
      return () => {
        console.log("清除按钮定时器");
        clearTimeout(buttonTimer);
      };
    }
  }, [currentSegment, showContinueButton]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
    >
      <div className="w-full h-full flex">
        {/* 左侧旁白区域 */}
        <div className="w-full md:w-1/2 flex items-center justify-center px-8 md:px-16 relative">
          <div className="max-w-2xl space-y-8">
            <AnimatePresence mode="wait">
              {narrativeSegments
                .slice(0, currentSegment + 1)
                .map((segment, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.8 }}
                    className={`${
                      index === currentSegment
                        ? "opacity-100"
                        : "opacity-50"
                    } transition-opacity duration-1000`}
                  >
                    <p className="narration-text text-amber-100/90 text-xl md:text-2xl">
                      {segment.text}
                    </p>
                  </motion.div>
                ))}
            </AnimatePresence>

            {/* 装饰元素 */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent"
            />
          </div>

          {/* 环境光效 */}
          <motion.div
            animate={{
              opacity: [0.1, 0.2, 0.1],
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
              src={museumInterior}
              alt="博物馆内景"
              className="w-full h-full object-cover"
            />
            {/* 渐变遮罩，让图片边缘融入背景 */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* 月光效果 */}
          <motion.div
            animate={{
              opacity: [0.3, 0.5, 0.3],
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

      {/* 底部进度指示器和提示 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
        <div className="flex gap-2">
          {narrativeSegments.map((_, index) => (
            <motion.div
              key={index}
              initial={{ scaleX: 0 }}
              animate={{
                scaleX: index <= currentSegment ? 1 : 0.3,
                opacity: index <= currentSegment ? 1 : 0.3,
              }}
              transition={{ duration: 0.5 }}
              className="h-1 w-12 bg-amber-400/50 rounded-full origin-left"
            />
          ))}
        </div>

        {/* 继续按钮 */}
        {showContinueButton && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              onClick={() => onCompleteRef.current()}
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black shadow-lg shadow-amber-600/20 px-8 py-6"
            >
              继续故事
            </Button>
          </motion.div>
        )}

        {/* 空格或回车键提示 */}
        {!showContinueButton && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="flex items-center gap-2 text-amber-400/60"
          >
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="px-3 py-1 border border-amber-400/30 rounded bg-amber-400/5 tracking-wider"
            >
              空格 / 回车
            </motion.span>
            <span className="tracking-wide">跳过</span>
          </motion.div>
        )}

        {/* 按钮显示后的空格或回车提示 */}
        {showContinueButton && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-2 text-amber-400/60"
          >
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="px-3 py-1 border border-amber-400/30 rounded bg-amber-400/5 tracking-wider"
            >
              空格 / 回车
            </motion.span>
            <span className="tracking-wide">继续</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}