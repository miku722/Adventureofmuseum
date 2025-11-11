import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Input } from "./ui/input";
import { useTouchContinue } from "../hooks/useTouchContinue";
import { ContinueHint } from "./ui/ContinueHint";

interface NameInputProps {
  onComplete: (name: string) => void;
}

function TypewriterText({ text, delay = 0, onComplete }: { text: string; delay?: number; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setStarted(true);
    }, delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 80);
      return () => clearTimeout(timer);
    } else if (onComplete && currentIndex === text.length) {
      onComplete();
    }
  }, [currentIndex, text, onComplete, started]);

  return (
    <span>
      {displayedText}
      {started && currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block ml-1"
        >
          |
        </motion.span>
      )}
    </span>
  );
}

export function NameInput({ onComplete }: NameInputProps) {
  const [name, setName] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [canContinue, setCanContinue] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 自动聚焦输入框
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // 监听名字输入，启用继续功能
  useEffect(() => {
    setCanContinue(name.trim().length > 0);
  }, [name]);

  // 处理触控点击继续
  useTouchContinue(() => {
    if (canContinue && !isComplete) {
      setIsComplete(true);
    }
  }, canContinue && !isComplete);

  const handleTypewriterComplete = () => {
    setTimeout(() => {
      onComplete(name.trim());
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isComplete ? 0 : 1, y: 0 }}
        transition={{
          duration: isComplete ? 0.5 : 1,
          delay: isComplete ? 0 : 1,
        }}
        className="flex flex-col items-center gap-8 px-8 w-full max-w-2xl"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.5 }}
          className="text-amber-200 text-3xl md:text-4xl text-center tracking-wide"
          style={{
            textShadow: "0 0 20px rgba(251, 191, 36, 0.6)",
          }}
        >
          勇敢者，你的名字是：
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 2 }}
          className="w-full max-w-md"
        >
          <Input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder=""
            maxLength={20}
            className="bg-transparent border-0 border-b-2 border-amber-600/50 rounded-none text-center text-amber-100 text-2xl md:text-3xl px-4 py-6 focus-visible:ring-0 focus-visible:border-amber-400 placeholder:text-amber-700/40 transition-all"
            style={{
              textShadow: "0 0 10px rgba(251, 191, 36, 0.4)",
            }}
          />

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: name.length > 0 ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent mt-2 origin-center"
          />
        </motion.div>

        {/* 触控点击继续提示 */}
        {canContinue && (
          <ContinueHint action="继续" />
        )}

        {/* Ambient glow effect */}
        <motion.div
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-400/5 rounded-full blur-3xl pointer-events-none"
        />
      </motion.div>
              {isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="absolute inset-0 flex items-center justify-center bg-black z-10"
          >
            <p
              className="text-amber-200 text-3xl md:text-4xl text-center tracking-wide px-8 relative z-20"
              style={{
                textShadow: "0 0 30px rgba(251, 191, 36, 0.8)",
              }}
            >
              <TypewriterText 
                text={`欢迎你，${name}，即将进入博物馆冒险世界`}
                delay={1300}
                onComplete={handleTypewriterComplete}
              />
            </p>
          </motion.div>
        )}
    </motion.div>
  );
}