/**
 * NPC交互示例组件
 * 展示如何在游戏场景中使用NPC记忆系统
 */

import { useState } from "react";
import { motion } from "motion/react";
import { MessageCircle, Users } from "lucide-react";
import { NPCChat } from "./NPCChat";
import { npcMemoryManager, NPC_IDENTITIES } from "../../utils/npcMemorySystem";
import { Button } from "../ui/button";

interface NPCInteractionExampleProps {
  playerName: string;
}

export function NPCInteractionExample({ playerName }: NPCInteractionExampleProps) {
  const [activeNPC, setActiveNPC] = useState<string | null>(null);

  // 示例NPC列表
  const npcList = [
    { id: "vendor", icon: "🛒", color: "amber" },
    { id: "monk", icon: "🙏", color: "purple" },
    { id: "boatman", icon: "⛵", color: "blue" },
    { id: "scholar", icon: "📚", color: "emerald" },
    { id: "guard", icon: "🛡️", color: "red" },
    { id: "beggar", icon: "🎭", color: "slate" },
  ];

  // 获取NPC记忆状态
  const getNPCStatus = (npcId: string) => {
    const memory = npcMemoryManager.getMemory(npcId);
    if (!memory.metPlayer) {
      return { text: "未见过", color: "text-slate-400" };
    }
    
    const relationship = memory.playerRelationship;
    if (relationship > 50) {
      return { text: "友好", color: "text-green-400" };
    } else if (relationship > 0) {
      return { text: "一般", color: "text-yellow-400" };
    } else if (relationship > -50) {
      return { text: "警惕", color: "text-orange-400" };
    } else {
      return { text: "敌对", color: "text-red-400" };
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-8 h-8 text-amber-400" />
            <h1 className="text-amber-200">NPC交互系统</h1>
          </div>
          <p className="text-slate-400">
            点击NPC头像与他们对话。每个NPC都有独立的记忆和身份。
          </p>
        </motion.div>

        {/* NPC网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {npcList.map((npc, index) => {
            const identity = NPC_IDENTITIES[npc.id];
            const status = getNPCStatus(npc.id);
            const memory = npcMemoryManager.getMemory(npc.id);

            return (
              <motion.div
                key={npc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-500/20 rounded-lg p-6 hover:border-amber-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10">
                  {/* NPC头像和名称 */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-5xl">{npc.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-amber-200 mb-1">
                        {identity?.name || "未知"}
                      </h3>
                      <p className="text-slate-400 text-sm mb-2">
                        {identity?.role || ""}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${status.color}`}>
                          {status.text}
                        </span>
                        {memory.metPlayer && (
                          <span className="text-xs text-slate-500">
                            • {memory.conversationHistory.length} 次对话
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* NPC描述 */}
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                    {identity?.personality || ""}
                  </p>

                  {/* 关系条 */}
                  {memory.metPlayer && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>关系值</span>
                        <span>{memory.playerRelationship}</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${((memory.playerRelationship + 100) / 200) * 100}%`,
                          }}
                          transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                          className={`h-full ${
                            memory.playerRelationship > 50
                              ? "bg-green-500"
                              : memory.playerRelationship > 0
                              ? "bg-yellow-500"
                              : memory.playerRelationship > -50
                              ? "bg-orange-500"
                              : "bg-red-500"
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {/* 对话按钮 */}
                  <Button
                    onClick={() => setActiveNPC(npc.id)}
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {memory.metPlayer ? "继续对话" : "开始对话"}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 系统说明 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 bg-slate-800/50 border border-slate-700 rounded-lg p-6"
        >
          <h3 className="text-amber-200 mb-3 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            系统特性
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
            <div>
              <span className="text-amber-400">• 独立记忆：</span>
              每个NPC只记得与你的对话
            </div>
            <div>
              <span className="text-amber-400">• 关系系统：</span>
              根据对话内容动态调整好感度
            </div>
            <div>
              <span className="text-amber-400">• 情绪状态：</span>
              NPC会根据情境表现不同情绪
            </div>
            <div>
              <span className="text-amber-400">• 学习能力：</span>
              NPC会记住你告诉他们的信息
            </div>
          </div>
        </motion.div>

        {/* 调试信息（开发环境） */}
        {import.meta.env.DEV && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 bg-slate-900/50 border border-slate-700 rounded-lg p-4"
          >
            <h4 className="text-slate-400 text-sm mb-2">调试信息（仅开发环境）</h4>
            <pre className="text-xs text-slate-500 overflow-auto">
              {JSON.stringify(npcMemoryManager.exportMemories(), null, 2)}
            </pre>
          </motion.div>
        )}
      </div>

      {/* NPC对话界面 */}
      {activeNPC && (
        <NPCChat
          npcId={activeNPC}
          playerName={playerName}
          isOpen={true}
          onClose={() => setActiveNPC(null)}
          onDialogueCondition={(condition) => {
            console.log("对话触发条件:", condition);
          }}
        />
      )}
    </div>
  );
}
