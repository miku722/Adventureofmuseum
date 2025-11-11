import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../ui/button";
import { useTouchContinue } from "../../hooks/useTouchContinue";
import { ContinueHint } from "../ui/ContinueHint";

interface NarrativeSegment {
  text: string;
}

interface NarrativeSceneBaseProps {
  segments: NarrativeSegment[];
  backgroundImage: string;
  imageAlt: string;
  theme?: "amber" | "cyan";
  continueButtonText?: string;
  onComplete: () => void;
  showParticles?: boolean;
}

const themeConfig = {
  amber: {
    textColor: "text-amber-100/90",
    lineColor: "via-amber-400/30",
    glowColor: "bg-amber-400/5",
    progressColor: "bg-amber-400/50",
    hintColor: "text-amber-400/60",
    hintBorderColor: "border-amber-400/30",
    hintBgColor: "bg-amber-400/5",
    buttonGradient: "from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400",
    buttonShadow: "shadow-amber-600/20",
    gradientFrom: "from-slate-900",
    particleColor: "bg-blue-100/10",
    bgGradient: "from-slate-900 via-slate-800 to-slate-900",
  },
  cyan: {
    textColor: "text-cyan-100/90",
    lineColor: "via-cyan-400/30",
    glowColor: "bg-cyan-400/5",
    progressColor: "bg-cyan-400/50",
    hintColor: "text-cyan-400/60",
    hintBorderColor: "border-cyan-400/30",
    hintBgColor: "bg-cyan-400/5",
    buttonGradient: "from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400",
    buttonShadow: "shadow-cyan-600/20",
    gradientFrom: "from-purple-950",
    particleColor: "bg-cyan-300",
    bgGradient: "from-purple-950 via-violet-900 to-slate-900",
  },
};

export function NarrativeSceneBase({
  segments,
  backgroundImage,
  imageAlt,
  theme = "amber",
  continueButtonText = "继续故事",
  onComplete,
  showParticles = false,
}: NarrativeSceneBaseProps) {
  const [currentSegment, setCurrentSegment] = useState(0);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const onCompleteRef = useRef(onComplete);
  const config = themeConfig[theme];

  // 保持 onComplete 引用最新
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // 调试信息
  useEffect(() => {
    console.log(
      "NarrativeSceneBase - currentSegment:",
      currentSegment,
      "showContinueButton:",
      showContinueButton,
    );
  }, [currentSegment, showContinueButton]);

  // 处理触控点击 - 跳过到下一段（仅在未显示按钮时生效）
  useTouchContinue(() => {
    if (currentSegment < segments.length) {
      setCurrentSegment((prev) => prev + 1);
    }
  }, !showContinueButton && currentSegment < segments.length);

  // 所有段落显示完毕后，显示继续按钮
  useEffect(() => {
    if (currentSegment >= segments.length && !showContinueButton) {
      const buttonTimer = setTimeout(() => {
        setShowContinueButton(true);
      }, 1000);
      return () => {
        clearTimeout(buttonTimer);
      };
    }
  }, [currentSegment, showContinueButton, segments.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className={`fixed inset-0 z-50 bg-gradient-to-br ${config.bgGradient}`}
    >
      <div className="w-full h-full flex">
        {/* 左侧旁白区域 */}
        <div className="w-full md:w-1/2 flex items-center justify-center px-8 md:px-16 relative">
          <div className="max-w-2xl space-y-8">
            <AnimatePresence mode="wait">
              {segments
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
                    <p className={`narration-text ${config.textColor} text-xl md:text-2xl`}>
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
              className={`h-[1px] bg-gradient-to-r from-transparent ${config.lineColor} to-transparent`}
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
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] ${config.glowColor} rounded-full blur-3xl pointer-events-none`}
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
              src={backgroundImage}
              alt={imageAlt}
              className="w-full h-full object-cover"
            />
            {/* 渐变遮罩，让图片边缘融入背景 */}
            <div className={`absolute inset-0 bg-gradient-to-r ${config.gradientFrom} via-transparent to-transparent`} />
            <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* 发光粒子效果（可选） */}
          {showParticles && (
            <>
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 0,
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    y: [
                      Math.random() * 800,
                      Math.random() * 800 - 200,
                    ],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                  className={`absolute w-1 h-1 ${config.particleColor} rounded-full blur-[1px] pointer-events-none`}
                  style={{
                    left: `${Math.random() * 100}%`,
                  }}
                />
              ))}
            </>
          )}

          {/* 月光/光效 */}
          <motion.div
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`absolute top-20 right-32 w-64 h-64 ${config.particleColor} rounded-full blur-3xl pointer-events-none`}
          />

          {/* 额外光效（仅限cyan主题） */}
          {theme === "cyan" && (
            <>
              <motion.div
                animate={{
                  opacity: [0.2, 0.4, 0.2],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none"
              />

              <motion.div
                animate={{
                  opacity: [0.15, 0.3, 0.15],
                  scale: [1.2, 1, 1.2],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute top-1/3 left-1/3 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl pointer-events-none"
              />
            </>
          )}
        </motion.div>
      </div>

      {/* 底部进度指示器和提示 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
        <div className="flex gap-2">
          {segments.map((_, index) => (
            <motion.div
              key={index}
              initial={{ scaleX: 0 }}
              animate={{
                scaleX: index <= currentSegment ? 1 : 0.3,
                opacity: index <= currentSegment ? 1 : 0.3,
              }}
              transition={{ duration: 0.5 }}
              className={`h-1 w-12 ${config.progressColor} rounded-full origin-left`}
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
              className={`bg-gradient-to-r ${config.buttonGradient} text-black shadow-lg ${config.buttonShadow} px-8 py-6`}
            >
              {continueButtonText}
            </Button>
          </motion.div>
        )}

        {/* 触控点击提示 - 跳过 */}
        {!showContinueButton && (
          <ContinueHint 
            action="跳过"
            borderColor={config.hintBorderColor}
            bgColor={config.hintBgColor}
            textColor={config.hintColor}
          />
        )}
      </div>
    </motion.div>
  );
}