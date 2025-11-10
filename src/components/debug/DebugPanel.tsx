import { motion } from "motion/react";
import { Button } from "../ui/button";
import { X } from "lucide-react";

type GamePhase =
  | "cover"
  | "name"
  | "chapter"
  | "story"
  | "scenes"
  | "chapter2"
  | "transitionChoice"
  | "chapter1_intro"
  | "market_intro"
  | "chapter1_market"
  | "game";

interface DebugPanelProps {
  currentPhase: GamePhase;
  onPhaseChange: (phase: GamePhase) => void;
  onClose: () => void;
  playerName: string;
}

const PHASES: { id: GamePhase; label: string }[] = [
  { id: "cover", label: "游戏封面" },
  { id: "name", label: "输入名字" },
  { id: "chapter", label: "博物馆夜 - Prologue" },
  { id: "story", label: "故事引入" },
  { id: "scenes", label: "场景1-5(合并)" },
  { id: "chapter2", label: "未知世界 - Chapter One" },
  { id: "transitionChoice", label: "过渡+选择(合并)" },
  { id: "chapter1_intro", label: "关卡一-序幕" },
  { id: "market_intro", label: "集市-任务引入" },
  { id: "chapter1_market", label: "关卡一-集市之谜" },
  { id: "game", label: "游戏主界面" },
];

export function DebugPanel({
  currentPhase,
  onPhaseChange,
  onClose,
  playerName,
}: DebugPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 right-4 z-[9999] bg-slate-900/95 backdrop-blur-sm border-2 border-amber-600/50 rounded-lg shadow-2xl p-4 max-w-md"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-amber-400 tracking-wider">
            🛠️ 调试面板
          </h3>
          <p className="text-slate-400 mt-1">
            玩家: {playerName || "未设置"}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-800 rounded transition-colors"
        >
          <X className="w-4 h-4 text-amber-400" />
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-slate-400 mb-3">
          快速跳转场景：
        </p>
        <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
          {PHASES.map((phase) => (
            <Button
              key={phase.id}
              size="sm"
              onClick={() => {
                console.log(`[DEBUG] 跳转到场景: ${phase.label}`);
                onPhaseChange(phase.id);
              }}
              className={`${
                currentPhase === phase.id
                  ? "bg-amber-600 hover:bg-amber-500 text-black"
                  : "bg-slate-800 hover:bg-slate-700 text-amber-200 border border-amber-600/30"
              }`}
            >
              {phase.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700">
        <p className="text-slate-500 text-xs">
          提示: 再次按 <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-600">Ctrl+D</kbd> 关闭
        </p>
      </div>
    </motion.div>
  );
}
