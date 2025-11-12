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
import { NameInput } from "./NameInput";
import { ChapterIntro } from "./ChapterIntro";
import { ChapterIntro2 } from "./ChapterIntro2";
import { StoryNarration } from "./StoryNarration";
import { CombinedScenes1to5 } from "./CombinedScenes1to5";
import { TransitionAndChoice } from "./TransitionAndChoice";
import { Chapter1Intro } from "./Chapter1Intro";
import { MarketIntroNarration } from "./MarketIntroNarration";
import { Chapter1Market } from "./Chapter1_Market";
import { DebugPanel } from "./DebugPanel";
import { useDebugMode } from "../hooks/useDebugMode";
import { GameState } from "../utils/gameSystemPrompt";
import { GameStateDebugger } from "./GameStateDebugger";

export function GameCover() {
  const [isMuted, setIsMuted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [playerChoice, setPlayerChoice] = useState<"market" | "palace" | "bamboo" | null>(null);
  const [showChapterIntro, setShowChapterIntro] =
    useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
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
      "GameCover - gamePhase:",
      gamePhase,
      "playerName:",
      playerName,
    );
  }, [gamePhase, playerName]);

  return (
    <>
      {/* 游戏状态调试器 */}
      <GameStateDebugger gameState={gameState} />

      {/* 设置弹窗 */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border-2 border-amber-600/50 rounded-lg p-8 max-w-md w-full mx-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-amber-200 flex items-center gap-2">
                  <Settings className="w-6 h-6" />
                  设置
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-amber-400 hover:text-amber-200 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4 text-amber-100">
                <div className="flex items-center justify-between p-3 bg-black/40 rounded">
                  <span>音效</span>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`px-4 py-1 rounded ${isMuted ? 'bg-gray-700' : 'bg-amber-600'} transition-colors`}
                  >
                    {isMuted ? '关闭' : '开启'}
                  </button>
                </div>
                <div className="p-3 bg-black/40 rounded text-center text-amber-400/60">
                  更多设置开发中...
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 成就弹窗 */}
      <AnimatePresence>
        {showAchievements && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center"
            onClick={() => setShowAchievements(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border-2 border-amber-600/50 rounded-lg p-8 max-w-md w-full mx-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-amber-200 flex items-center gap-2">
                  <Trophy className="w-6 h-6" />
                  成就
                </h2>
                <button
                  onClick={() => setShowAchievements(false)}
                  className="text-amber-400 hover:text-amber-200 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                <div className="p-4 bg-black/40 rounded border border-amber-600/30">
                  <div className="flex items-center gap-3 mb-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <span className="text-amber-200">冒险开始</span>
                  </div>
                  <p className="text-sm text-amber-400/60">开始你的第一次冒险</p>
                </div>
                <div className="p-3 bg-black/40 rounded text-center text-amber-400/60">
                  更多成就等待解锁...
                </div>
              </div>
            </motion.div>
          </motion.div>
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
        <ChapterIntro
          chapterTitle="博物馆夜"
          onComplete={() => {
            setGamePhase("story");
          }}
        />
      )}

      {gamePhase === "story" && (
        <StoryNarration
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
        <CombinedScenes1to5
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
        <ChapterIntro2
          chapterTitle="未知世界"
          subtitle="Chapter One"
          onComplete={() => setGamePhase("transitionChoice")}
        />
      )}

      {gamePhase === "transitionChoice" && (
        <TransitionAndChoice
          playerName={playerName}
          onComplete={(choice) => {
            setPlayerChoice(choice);
            setGamePhase("chapter1_intro");
          }}
        />
      )}

      {gamePhase === "chapter1_intro" && (
        <Chapter1Intro
          playerName={playerName}
          playerChoice={playerChoice}
          onComplete={() => setGamePhase("market_intro")}
        />
      )}

      {gamePhase === "market_intro" && (
        <MarketIntroNarration
          onComplete={() => setGamePhase("chapter1_market")}
        />
      )}

      {gamePhase === "chapter1_market" && (
        <Chapter1Market
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
                  揭开历史的密 · 穿越时空的冒险
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
                  onClick={() => setShowAchievements(true)}
                  className="bg-black/40 border-amber-600/50 text-amber-200 hover:bg-black/60 hover:border-amber-400 hover:text-amber-100 backdrop-blur-sm"
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  成就
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowSettings(true)}
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