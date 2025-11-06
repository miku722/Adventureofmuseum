import { useEffect, useRef } from "react";

/**
 * 键盘继续Hook
 * 监听空格键和回车键，触发回调函数
 * @param onContinue - 按键时触发的回调函数
 * @param enabled - 是否启用监听（默认true）
 */
export function useKeyboardContinue(
  onContinue: () => void,
  enabled: boolean = true
) {
  const onContinueRef = useRef(onContinue);

  // 保持回调函数引用最新
  useEffect(() => {
    onContinueRef.current = onContinue;
  }, [onContinue]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        onContinueRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled]);
}
