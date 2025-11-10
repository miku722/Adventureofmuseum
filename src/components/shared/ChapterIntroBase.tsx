import { useState, useEffect } from "react";
import { motion } from "motion/react";

interface ChapterIntroBaseProps {
  chapterTitle: string;
  subtitle?: string;
  backgroundImage: string;
  imageAlt: string;
  theme?: "amber" | "cyan";
  onComplete: () => void;
}

const themeConfig = {
  amber: {
    lineColor: "via-amber-400",
    titleColor: "text-amber-200",
    subtitleColor: "text-amber-300/80",
    glowColor: "bg-amber-400/10",
    overlayColor: "bg-black/20",
  },
  cyan: {
    lineColor: "via-cyan-400",
    titleColor: "text-cyan-200",
    subtitleColor: "text-cyan-300/80",
    glowColor: "bg-cyan-400/10",
    overlayColor: "bg-gradient-to-b from-purple-900/30 via-violet-900/20 to-black/40",
  },
};

export function ChapterIntroBase({
  chapterTitle,
  subtitle = "Chapter",
  backgroundImage,
  imageAlt,
  theme = "amber",
  onComplete,
}: ChapterIntroBaseProps) {
  const [showTitle, setShowTitle] = useState(false);
  const config = themeConfig[theme];

  useEffect(() => {
    // 显示图片2秒后开始模糊并显示标题
    const timer = setTimeout(() => {
      setShowTitle(true);
    }, 2000);

    // 5秒后完成章节介绍
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 6000);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-50 bg-black"
    >
      {/* 背景图片 */}
      <motion.div
        className="absolute inset-0"
        animate={{
          filter: showTitle ? "blur(8px)" : "blur(0px)",
        }}
        transition={{ duration: 1 }}
      >
        <img
          src={backgroundImage}
          alt={imageAlt}
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 ${config.overlayColor}`} />
      </motion.div>

      {/* 章节标题 */}
      {showTitle && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="text-center px-8">
            {/* 装饰线 - 上 */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className={`h-[2px] bg-gradient-to-r from-transparent ${config.lineColor} to-transparent mb-8 mx-auto w-64`}
            />

            {/* 章节标题 */}
            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className={`chapter-title text-5xl md:text-7xl ${config.titleColor} mb-4`}
            >
              {chapterTitle}
            </motion.h2>

            {/* 装饰线 - 下 */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className={`h-[2px] bg-gradient-to-r from-transparent ${config.lineColor} to-transparent mt-8 mx-auto w-64`}
            />

            {/* 章节提示 */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.5 }}
              className={`${config.subtitleColor} tracking-widest mt-8 text-xl`}
            >
              {subtitle}
            </motion.p>
          </div>
        </motion.div>
      )}

      {/* 环境光效 */}
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
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] ${config.glowColor} rounded-full blur-3xl pointer-events-none`}
      />

      {/* 额外的紫色光效（仅限cyan主题） */}
      {theme === "cyan" && (
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
          className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none"
        />
      )}
    </motion.div>
  );
}
