import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Play,
  Settings,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";
import exampleImage from "figma:asset/e9f84ea05cc517bde6db2eceec7da6c851a5c149.png";
import { motion, AnimatePresence } from "motion/react";
import { NameInput } from "./ui/NameInput";
import { PrologueChapterIntro } from "./chapters/PrologueChapterIntro";
import { AlienWorldChapterIntro } from "./chapters/AlienWorldChapterIntro";
import { PrologueNarrator } from "./narrative/PrologueNarrator";
import { PrologueScenes } from "./scenes/PrologueScenes";
import { PortalTransition } from "./scenes/PortalTransition";
import { MarketChapterIntro } from "./chapters/MarketChapterIntro";
import { MarketMissionBriefing } from "./narrative/MarketMissionBriefing";
import { MarketLevel } from "./levels/MarketLevel";
import { DebugPanel } from "./debug/DebugPanel";
import { useDebugMode } from "../hooks/useDebugMode";
import { GameState } from "../utils/gameSystemPrompt";
import { GameStateDebugger } from "./debug/GameStateDebugger";

export function GameManager() {
  const [isMuted, setIsMuted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [playerChoice, setPlayerChoice] = useState<"market" | "palace" | "bamboo" | null>(null);
  const [showChapterIntro, setShowChapterIntro] =
    useState(false);
  const [gamePhase, setGamePhase] = useState<
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
    | "game"
  >("cover");

  // 全局游戏状态 - "上帝视角"
  const [gameState, setGameState] = useState<GameState>({
    playerName: "",
    currentPhase: "cover",
    currentScene: undefined,
    narrativeHistory: [],
    conversationHistory: [],
    playerChoice: null,
    inventory: [],
    clues: [],
    skills: [],
  });

  // 调试模式
  const debugMode = useDebugMode();

  // 同步游戏状态
  useEffect(() => {
    setGameState((prev) => ({
      ...prev,
      playerName,
      currentPhase: gamePhase,
      playerChoice,
    }));
  }, [playerName, gamePhase, playerChoice]);

  // 添加叙事片段到历史
  const addNarrativeToHistory = (narrative: string) => {
    setGameState((prev) => ({
      ...prev,
      narrativeHistory: [...prev.narrativeHistory, narrative],
    }));
  };

  // 添加对话到历史
  const addConversationToHistory = (conversation: string) => {
    setGameState((prev) => ({
      ...prev,
      conversationHistory: [...prev.conversationHistory, conversation],
    }));
  };

  // 更新当前场景
  const updateCurrentScene = (scene: string) => {
    setGameState((prev) => ({
      ...prev,
      currentScene: scene,
    }));
  };

  // 调试信息
  useEffect(() => {
    console.log(
      "GameManager - gamePhase:",
      gamePhase,
      "playerName:",
      playerName,
    );
  }, [gamePhase, playerName]);

  return (
    <>
      {/* 游戏状态调试器 */}
      <GameStateDebugger gameState={gameState} />

      {/* 调试面板 */}
      <AnimatePresence>
        {debugMode && (
          <DebugPanel
            currentPhase={gamePhase}
            onPhaseChange={(phase) => {
              setGamePhase(phase);
              // 如果跳转到需要玩家名字的场景，设置默认名字
              if (
                !playerName &&
                [
                  "chapter",
                  "story",
                  "scenes",
                  "transitionChoice",
                  "chapter2",
                  "chapter1_intro",
                  "market_intro",
                  "chapter1_market",
                  "game",
                ].includes(phase)
              ) {
                setPlayerName("调试玩家");
              }
            }}
            onClose={() => {
              // 不需要手动关闭，按Ctrl+D会自动关闭
            }}
            playerName={playerName}
          />
        )}
      </AnimatePresence>

      {gamePhase === "name" && (
        <NameInput
          onComplete={(name) => {
            setPlayerName(name);
            setGamePhase("chapter");
          }}
        />
      )}

      {gamePhase === "chapter" && (
        <PrologueChapterIntro
          chapterTitle="博物馆夜"
          onComplete={() => {
            setGamePhase("story");
          }}
        />
      )}

      {gamePhase === "story" && (
        <PrologueNarrator
          playerName={playerName}
          onComplete={(narratives) => {
            // 将叙事片段添加到游戏状态
            if (narratives && narratives.length > 0) {
              setGameState((prev) => ({
                ...prev,
                narrativeHistory: [
                  ...prev.narrativeHistory,
                  "【博物馆之夜的序章】\n" + narratives.join("\n\n"),
                ],
              }));
            }
            setGamePhase("scenes");
          }}
        />
      )}

      {gamePhase === "scenes" && (
        <PrologueScenes
          playerName={playerName}
          gameState={gameState}
          onUpdateGameState={setGameState}
          onComplete={() => {
            setGamePhase("chapter2");
            console.log(
              "进入游戏主界面，玩家名字:",
              playerName,
            );
          }}
        />
      )}

      {gamePhase === "chapter2" && (
        <AlienWorldChapterIntro
          chapterTitle="未知世界"
          subtitle="Chapter One"
          onComplete={() => setGamePhase("transitionChoice")}
        />
      )}

      {gamePhase === "transitionChoice" && (
        <PortalTransition
          playerName={playerName}
          onComplete={(choice) => {
            setPlayerChoice(choice);
            setGamePhase("chapter1_intro");
          }}
        />
      )}

      {gamePhase === "chapter1_intro" && (
        <MarketChapterIntro
          onComplete={() => setGamePhase("market_intro")}
        />
      )}

      {gamePhase === "market_intro" && (
        <MarketMissionBriefing
          onComplete={() => setGamePhase("chapter1_market")}
        />
      )}

      {gamePhase === "chapter1_market" && (
        <MarketLevel
          playerName={playerName}
          playerChoice={playerChoice}
          onComplete={() => setGamePhase("game")}
        />
      )}

      {gamePhase === "game" && (
        <div className="fixed inset-0 bg-black flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-4xl text-amber-200 tracking-wider">
              游戏主界面
            </h2>
            <p className="text-amber-400">玩家：{playerName}</p>
            <p className="text-slate-400">游戏内容开发中...</p>
          </div>
        </div>
      )}

      {gamePhase === "cover" && (
        <div className="relative w-full h-screen overflow-hidden bg-black">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={exampleImage}
              alt="Game background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 flex flex-col items-center justify-between h-full px-8 py-12">
            {/* Top Section - Logo and Sound */}
            <div className="w-full flex justify-between items-start">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-col gap-1"
              >
                <div className="text-amber-400/80 tracking-widest">
                  ANCIENT MYSTERIES
                </div>
                <div className="text-amber-300/60 tracking-wide">
                  冒险解谜游戏
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                onClick={() => setIsMuted(!isMuted)}
                className="p-3 rounded-full bg-black/30 hover:bg-black/50 transition-colors border border-amber-600/30"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-amber-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-amber-400" />
                )}
              </motion.button>
            </div>

            {/* Center Section - Game Title */}
            <div className="flex flex-col items-center gap-6 -mt-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="text-center"
              >
                <h1 className="game-title text-7xl md:text-8xl mb-4 text-amber-200 drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]">
                  时空之门
                </h1>
                <p className="text-xl md:text-2xl text-amber-300/90 tracking-widest mb-2">
                  THE PORTAL OF TIME
                </p>
                <p className="text-amber-400/70 tracking-wide">
                  揭开历史的秘密 · 穿越时空的冒险
                </p>
              </motion.div>

              {/* Decorative Elements */}
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "200px" }}
                transition={{ duration: 1, delay: 0.8 }}
                className="h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent"
              />
            </div>

            {/* Bottom Section - Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col gap-4 w-full max-w-md"
            >
              <Button
                size="lg"
                onClick={() => setGamePhase("name")}
                className="w-full bg-amber-600 hover:bg-amber-500 text-black border-2 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)] transition-all hover:shadow-[0_0_30px_rgba(251,191,36,0.8)] group"
              >
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                开始游戏
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-black/40 border-amber-600/50 text-amber-200 hover:bg-black/60 hover:border-amber-400 hover:text-amber-100 backdrop-blur-sm"
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  成就
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-black/40 border-amber-600/50 text-amber-200 hover:bg-black/60 hover:border-amber-400 hover:text-amber-100 backdrop-blur-sm"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  设置
                </Button>
              </div>

              {/* Copyright */}
              <p className="text-center text-amber-400/40 mt-4 tracking-wide">
                © 2025 Mystery Games Studio. All Rights
                Reserved.
              </p>
            </motion.div>
          </div>

          {/* Animated Glow Effects */}
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"
          />
        </div>
      )}
    </>
  );
}