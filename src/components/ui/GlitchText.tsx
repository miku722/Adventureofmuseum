import { useState, useEffect } from "react";

interface GlitchTextProps {
  className?: string;
}

// 用于生成乱码的字符集
const glitchChars = [
  "█", "▓", "▒", "░", "▄", "▀", "■", "□", "▪", "▫",
  "◆", "◇", "◈", "◉", "●", "○", "◐", "◑", "◒", "◓",
  "⚠", "⚡", "✦", "✧", "★", "☆", "✨", "⁂", "※", "‡",
  "†", "§", "¶", "‖", "∥", "∴", "∵", "∷", "∼", "≈",
  "≠", "≡", "≢", "≣", "≤", "≥", "≦", "≧", "≨", "≩",
  "⊕", "⊗", "⊙", "⊚", "⊛", "⊜", "⊝", "⊞", "⊟", "⊠",
  "⟐", "⟑", "⟒", "⟓", "⟔", "⟕", "⟖", "⟗", "⟘", "⟙",
  "◢", "◣", "◤", "◥", "◦", "◧", "◨", "◩", "◪", "◫",
  "Ω", "∞", "∫", "∬", "∭", "∮", "∯", "∰", "∱", "∲",
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
  "A", "B", "C", "D", "E", "F", "X", "Y", "Z", "?",
  "#", "$", "%", "&", "@", "!", "~", "`", "^", "*",
];

// 生成固定长度的乱码
const generateGlitch = () => {
  const length = 10; 
  let result = "";
  for (let i = 0; i < length; i++) {
    result += glitchChars[Math.floor(Math.random() * glitchChars.length)];
  }
  return result;
};

export function GlitchText({ className = "" }: GlitchTextProps) {
  const [glitchText, setGlitchText] = useState(generateGlitch());

  useEffect(() => {
    // 每100-300ms更换一次乱码
    const interval = setInterval(() => {
      setGlitchText(generateGlitch());
    }, Math.random() * 200 + 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className={`inline-block font-mono ${className}`}>
      {glitchText}
    </span>
  );
}
