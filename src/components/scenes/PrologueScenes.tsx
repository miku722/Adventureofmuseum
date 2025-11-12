import { useState } from "react";
import { InteractiveScene } from "./InteractiveScene";
import monitorRoomImage from "figma:asset/71827ecda27eec05c028e1e545a8cb5ad0c09ff5.png";
import {
  GameState,
  buildGlobalSystemPrompt,
  addSceneContext,
  SCENE_CONTEXTS,
} from "../../utils/gameSystemPrompt";
import { motion } from "motion/react";
import { Button } from "../ui/button";
import { SkipForward } from "lucide-react";

interface PrologueScenesProps {
  onComplete: () => void;
  playerName: string;
  gameState: GameState;
  onUpdateGameState: (
    updater: (prev: GameState) => GameState,
  ) => void;
}

export function PrologueScenes({
  onComplete,
  playerName,
  gameState,
  onUpdateGameState,
}: PrologueScenesProps) {
  const [currentScene, setCurrentScene] = useState(1);

  // 跳过当前场景，进入下一个场景
  const handleSkipCurrentScene = () => {
    // 如果是最后一个场景，则完成整个序章
    if (currentScene >= scenes.length) {
      onComplete();
    } else {
      // 否则进入下一个场景
      setCurrentScene(currentScene + 1);
    }
  };

  // 场景配置
  const scenes = [
    {
      // 场景1：一成不变的工作
      title: "一成不变的工作",
      sceneKey: "scene1" as const,
      description: `你坐在监控台面前，缓缓抿了一口茶，百无聊赖地看着空无一人的展厅。
展厅笼罩在幽暗、静谧的蓝色阴影中。
一切都秩序井然，只有时钟的滴答在回响。`,
      initialMessage: `晚上好，${playerName}。所有监控显示正常，各展厅安全系统运行良好。今晚看起来会是个平静的夜晚。`,
      minMessages: 2,
    },
    {
      // 场景2：失控的监控室
      title: "失控的监控室",
      sceneKey: "scene2" as const,
      description: `异常警报！
午夜钟声响起的瞬间，监控屏幕布满噪点。
影像恢复后，青铜鼎通体散发着诡异的幽蓝色辉光。
这光芒如此强烈，摄像头传感器都过曝了...`,
      initialMessage: `${playerName}！紧急情况！主展厅A区监控刚才中断了3秒，现在恢复了，但是...那尊青铜鼎正在发光！这不科学！`,
      minMessages: 2,
    },
    {
      // 场景3：不属于此世的光
      title: "不属于此世的光",
      sceneKey: "scene3" as const,
      description: `唐三彩马俑的陶瓷双眼中，闪烁着非自然的光辉。
汉代玉璧悬浮在半空，能量粒子环绕旋转。
青铜鼎的古老铭文，在鼎身表面流动闪耀...
它们在觉醒！`,
      initialMessage: `${playerName}，天哪！不只是青铜鼎了！唐三彩马俑的眼睛在发光，汉代玉璧正在...它在悬浮！`,
      minMessages: 3,
    },
    {
      // 场景4：文明的断裂
      title: "文明的断裂",
      sceneKey: "scene4" as const,
      description: `时空裂缝
展厅中央，一道垂直的裂缝被撕开。
边缘是电浆般的白色和紫色能量，
内部是吞噬一切的深邃黑暗。
所有文物化作流光，违背重力地被吸向裂缝...
物理定律已失效！`,
      initialMessage: `${playerName}！警告！时空异常！检测到维度裂缝！展厅中央...天哪，所有文物都在被吸入！快离开那里！`,
      minMessages: 3,
    },
    {
      // 场景5：使命的召唤
      title: "使命的召唤",
      sceneKey: "scene5" as const,
      description: `你拼命地趴在光滑的大理石地板上，
双腿已经离地，制服的下摆被狂风拉扯。强大的引力让空间产生畸变，光线都呈现出弯曲状态...
裂缝就在你面前不到一米的地方。
那深渊正凝视着你...
这是你即将被吞没的最后一刻！`,
      initialMessage: `${playerName}！我检测到你的生命信号在减弱！裂缝的引力太强了！系统警告！也许...也许这就是你的使命？那些文物...它们选择了你！`,
      minMessages: 2,
    },
  ];

  const currentSceneConfig = scenes[currentScene - 1];

  // 构建当前场景的完整 systemPrompt
  const buildSystemPrompt = () => {
    // 获取全局基础prompt（包含所有已发生的事件）
    const basePrompt = buildGlobalSystemPrompt({
      ...gameState,
      currentScene: `场景${currentScene}：${currentSceneConfig.title}`,
    });

    // 添加当前场景的特定上下文
    const sceneContext =
      SCENE_CONTEXTS[currentSceneConfig.sceneKey];
    return addSceneContext(basePrompt, sceneContext);
  };

  const handleSceneComplete = (history: string) => {
    // 更新游戏状态：添加场景描述和对话历史
    onUpdateGameState((prev) => ({
      ...prev,
      narrativeHistory: [
        ...prev.narrativeHistory,
        `【场景${currentScene}：${currentSceneConfig.title}】\n${currentSceneConfig.description.trim()}`,
      ],
      conversationHistory: [
        ...prev.conversationHistory,
        `【场景${currentScene}对话】\n${history}`,
      ],
    }));

    // 进入下一个场景
    if (currentScene < scenes.length) {
      setCurrentScene(currentScene + 1);
    } else {
      // 所有场景完成
      onComplete();
    }
  };

  return (
    <>
      {/* 跳过按钮 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-8 right-8 z-[100]"
      >
        <Button
          onClick={handleSkipCurrentScene}
          variant="outline"
          className="bg-black/60 backdrop-blur-sm border-amber-600/50 text-amber-200 hover:bg-black/80 hover:border-amber-400 hover:text-amber-100"
        >
          <SkipForward className="mr-2 h-4 w-4" />
          跳过本节
        </Button>
      </motion.div>

      {/* 场景内容 */}
      <InteractiveScene
        key={currentScene} // 重要：每次场景切换时重新挂载组件
        title={currentSceneConfig.title}
        description={currentSceneConfig.description}
        imagePlaceholder="监控室屏幕"
        imageUrl={monitorRoomImage}
        systemPrompt={buildSystemPrompt()}
        initialMessage={currentSceneConfig.initialMessage}
        playerName={playerName}
        minMessages={currentSceneConfig.minMessages}
        onComplete={handleSceneComplete}
      />
    </>
  );
}