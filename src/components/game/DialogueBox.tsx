/**
 * DialogueBox - NPC对话框容器组件
 * 
 * 职责：
 * 1. 显示固定对话（打字机效果）
 * 2. 在AI模式下嵌入NPCChat组件
 * 3. 处理物品/线索给予
 * 4. 管理对话流程切换
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { NPC } from "../../types/game";
import { npcMemoryManager } from "../../utils/npcMemory";
import { ContinueHint } from "../ui/ContinueHint";
import { NPCChat } from "./NPCChat";
import { useGame } from "../../contexts/GameContext";

interface DialogueBoxProps {
  npc: NPC;
  onClose: () => void;
  onDialogueComplete?: () => void;
  onGiveItem?: () => void;
  playerName: string;
}

export function DialogueBox({
  npc,
  onClose,
  onDialogueComplete,
  onGiveItem,
  playerName,
}: DialogueBoxProps) {
  const { gameState, updateGameState } = useGame();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [chatMode, setChatMode] = useState(false); // 是否进入AI聊天模式

  // 获取NPC记忆
  const npcMemory = npcMemoryManager.getMemory(npc.id);
  const isFirstMeet = !npcMemory.metPlayer;

  console.log("📖 [DialogueBox] 组件初始化");
  console.log("├─ NPC:", npc.name, `(${npc.id})`);
  console.log("├─ 玩家:", playerName);
  console.log("├─ 是否第一次见面:", isFirstMeet);
  console.log("└─ 对话数量:", npc.dialogue.length);

  // 初始化：如果不是第一次见面，直接进入AI聊天模式
  useEffect(() => {
    if (!isFirstMeet) {
      console.log("🔄 [DialogueBox] 非首次见面，直接进入AI模式");
      setChatMode(true);
    }
  }, [isFirstMeet]);

  // 确保dialogue是有效的字符串数组
  const validDialogue = npc.dialogue.filter(
    (d) => d && typeof d === "string" && d.trim().length > 0,
  );
  const currentDialogue = validDialogue[currentIndex] || "";

  // 打字机效果（仅在固定对话模式）
  useEffect(() => {
    if (chatMode || !currentDialogue || currentDialogue.length === 0) return;

    console.log("⌨️ [DialogueBox] 开始打字机效果");
    console.log("├─ 对话索引:", currentIndex + 1, "/", validDialogue.length);
    console.log("└─ 内容:", currentDialogue.substring(0, 30) + "...");

    setIsTyping(true);
    setDisplayText("");
    let charIndex = 0;

    // 立即显示第一个字符
    if (currentDialogue.length > 0) {
      setDisplayText(currentDialogue[0]);
      charIndex = 1;
    }

    const typingInterval = setInterval(() => {
      if (charIndex < currentDialogue.length) {
        const nextChar = currentDialogue[charIndex];
        if (nextChar !== undefined) {
          setDisplayText((prev) => prev + nextChar);
        }
        charIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
        console.log("✅ [DialogueBox] 打字机效果完成");
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [currentDialogue, chatMode]);

  const handleNext = () => {
    if (isTyping) {
      // 跳过打字效果
      console.log("⏩ [DialogueBox] 跳过打字效果");
      setDisplayText(currentDialogue);
      setIsTyping(false);
    } else if (currentIndex < validDialogue.length - 1) {
      // 下一句对话
      console.log("➡️ [DialogueBox] 进入下一句对话");
      setCurrentIndex((prev) => prev + 1);
    } else {
      // 固定对话结束
      console.log("🏁 [DialogueBox] 固定对话结束");
      
      // 给予物品/线索
      if (npc.givesItem && onGiveItem) {
        console.log("📦 [DialogueBox] 给予物品:", npc.givesItem.name);
        onGiveItem();
      }
      if (onDialogueComplete) {
        onDialogueComplete();
      }

      // 检查是否是第一次见面，如果是则切换到AI聊天模式
      if (isFirstMeet) {
        console.log("🔄 [DialogueBox] 首次见面，切换到AI模式");
        setChatMode(true);
      } else {
        console.log("👋 [DialogueBox] 关闭对话框");
        onClose();
      }
    }
  };

  // 空格键和回车键支持（仅固定对话模式）
  useEffect(() => {
    if (chatMode) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        handleNext();
      } else if (e.code === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isTyping, currentIndex, validDialogue.length, chatMode]);

  return (
    <>
      {/* 背景遮罩 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-50"
        onClick={onClose}
      />

      {/* 对话框 */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4"
      >
        {!chatMode ? (
          // 固定对话模式
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-amber-600/50 rounded-lg shadow-2xl overflow-hidden">
            {/* NPC信息栏 */}
            <div className="bg-amber-900/30 border-b border-amber-600/30 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-600/20 border-2 border-amber-500/50 flex items-center justify-center">
                  <span className="text-xl">👤</span>
                </div>
                <div>
                  <h3 className="text-amber-200">{npc.name}</h3>
                  <p className="text-amber-400/60 text-xs">{npc.role}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-amber-400 hover:text-amber-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 对话内容 */}
            <div className="px-6 py-6 min-h-[120px]">
              <p className="text-amber-100 text-lg leading-relaxed">
                {displayText}
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                    }}
                    className="inline-block w-2 h-5 bg-amber-400 ml-1"
                  />
                )}
              </p>
            </div>

            {/* 底部操作栏 */}
            <div className="bg-slate-900/50 border-t border-amber-600/30 px-6 py-4 flex items-center justify-between">
              <ContinueHint
                action={
                  isTyping
                    ? "跳过"
                    : currentIndex < validDialogue.length - 1
                      ? "继续"
                      : isFirstMeet
                        ? "开始对话"
                        : "结束对话"
                }
                borderColor="border-amber-400/30"
                bgColor="bg-amber-400/5"
                textColor="text-amber-400"
                className="text-sm"
              />

              <div className="flex items-center gap-3">
                <span className="text-amber-400/60 text-sm">
                  {currentIndex + 1} / {validDialogue.length}
                </span>
                <Button
                  onClick={handleNext}
                  size="sm"
                  className="bg-amber-900/50 hover:bg-amber-800/50 text-amber-200 border border-amber-600/50"
                >
                  {isTyping
                    ? "跳过"
                    : currentIndex < validDialogue.length - 1
                      ? "继续"
                      : isFirstMeet
                        ? "开始对话"
                        : "结束"}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // AI聊天模式 - 使用NPCChat组件
          <NPCChat
            npcId={npc.id}
            playerName={playerName}
            gameState={gameState}
            onUpdateGameState={updateGameState}
            onClose={onClose}
            isOpen={true}
          />
        )}
      </motion.div>
    </>
  );
}