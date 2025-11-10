import { NarrativeSceneBase } from "../shared/NarrativeSceneBase";
import museumInterior from "figma:asset/cdc0af926f550e7f0779a5e8c15e05fa8559a86a.png";

interface PrologueNarratorProps {
  onComplete: (narratives?: string[]) => void;
}

const narrativeSegments = [
  {
    text: "这是你担任博物馆守夜人的第十年。工作很简单：默默地守护文化瑰宝，确保每一件文物都在它该在的位置上。",
  },
  {
    text: "你独自走在万籁俱寂、一尘不染的展厅中，手电筒的光扫过一排排展柜，整个展厅只有你的脚步声在回响。你百无聊赖地打了个哈欠，回到监控室。",
  },
  {
    text: "你给自己倒了满满一杯热腾腾的菊花茶。你舒了一口气：又是平静的一晚... 本该如此。",
  },
];

export function PrologueNarrator({
  onComplete,
}: PrologueNarratorProps) {
  const handleComplete = () => {
    // 将叙事文本提取出来传递给父组件
    const narrativeTexts = narrativeSegments.map(
      (seg) => seg.text,
    );
    onComplete(narrativeTexts);
  };

  return (
    <NarrativeSceneBase
      segments={narrativeSegments}
      backgroundImage={museumInterior}
      imageAlt="博物馆内景"
      theme="amber"
      continueButtonText="继续故事"
      onComplete={handleComplete}
      showParticles={false}
    />
  );
}
