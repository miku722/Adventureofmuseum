import { motion } from "motion/react";

interface ContinueHintProps {
  action?: "跳过" | "继续";
  borderColor?: string;
  bgColor?: string;
  textColor?: string;
  className?: string;
}

/**
 * 继续提示组件
 * 显示触控点击提示，遵循DRY原则
 */
export function ContinueHint({
  action = "继续",
  borderColor = "border-amber-400/30",
  bgColor = "bg-amber-400/5",
  textColor = "text-amber-400",
  className = "",
}: ContinueHintProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      className={`flex items-center gap-2 ${textColor}/60 text-sm ${className}`}
    >
      <motion.span
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`px-3 py-1 border ${borderColor} rounded ${bgColor} tracking-wider`}
      >
        触控点击
      </motion.span>
      <span className="tracking-wide">{action}</span>
    </motion.div>
  );
}
