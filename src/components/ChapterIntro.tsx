import { useState, useEffect } from "react";
import { motion } from "motion/react";
import museumImage from "figma:asset/69b6d32837150681bb7465f798c8ba704fc7c5ec.png";

interface ChapterIntroProps {
  chapterTitle: string;
  onComplete: () => void;
}

export function ChapterIntro({ chapterTitle, onComplete }: ChapterIntroProps) {
  const [showTitle, setShowTitle] = useState(false);

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
      {/* 博物馆背景图片 */}
      <motion.div
        className="absolute inset-0"
        animate={{
          filter: showTitle ? "blur(8px)" : "blur(0px)",
        }}
        transition={{ duration: 1 }}
      >
        <img
          src={museumImage}
          alt="博物馆夜景"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
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
              className="h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-8 mx-auto w-64"
            />

            {/* 章节标题 */}
            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="chapter-title text-5xl md:text-7xl text-amber-200 mb-4"
              style={{
              }}
            >
              {chapterTitle}
            </motion.h2>

            {/* 装饰线 - 下 */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent mt-8 mx-auto w-64"
            />

            {/* 章节提示 */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="text-amber-300/80 tracking-widest mt-8 text-xl"
            >
              Chapter I
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
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none"
      />
    </motion.div>
  );
}
