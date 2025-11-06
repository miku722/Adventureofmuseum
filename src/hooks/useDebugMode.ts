import { useState, useEffect } from "react";

/**
 * 调试模式Hook
 * 按Ctrl+D切换调试模式
 * 调试模式下显示场景切换器
 */
export function useDebugMode() {
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+D 切换调试模式
      if (e.ctrlKey && e.key === "d") {
        e.preventDefault();
        setDebugMode((prev) => {
          const newMode = !prev;
          console.log(`[DEBUG] 调试模式: ${newMode ? "开启" : "关闭"}`);
          return newMode;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return debugMode;
}
