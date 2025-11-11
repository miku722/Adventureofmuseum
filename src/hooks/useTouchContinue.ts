import { useEffect, useRef } from "react";

/**
 * 触控继续Hook
 * 监听点击事件，触发回调函数
 * @param onContinue - 点击时触发的回调函数
 * @param enabled - 是否启用监听（默认true）
 */
export function useTouchContinue(
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

    const handleClick = (e: MouseEvent | TouchEvent) => {
      // 避免在输入框或按钮上触发
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "BUTTON" ||
        target.closest("button") ||
        target.closest("input") ||
        target.closest("textarea")
      ) {
        return;
      }

      onContinueRef.current();
    };

    // 同时监听鼠标和触控事件
    document.addEventListener("click", handleClick);
    document.addEventListener("touchend", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("touchend", handleClick);
    };
  }, [enabled]);
}
