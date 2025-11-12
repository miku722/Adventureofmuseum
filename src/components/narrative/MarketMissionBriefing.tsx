import { NarrativeSceneBase } from "../shared/NarrativeSceneBase";
import marketImage from "figma:asset/e9f84ea05cc517bde6db2eceec7da6c851a5c149.png";

interface MarketMissionBriefingProps {
  onComplete: () => void;
}

const narrativeSegments = [
  {
    text: '异常能量波动检测到。时空层：北宋。文物名称：青铜鼎。状态：失联。',
  },
  {
    text: '你坠入集市，落地时尘土飞扬，耳边是嘈杂的人声与商贩叫卖。',
  },
  {
    text: "警告：该区域存在'供养机制失衡'，饥饿与贪婪蔓延。",
  },
  {
    text: '【主线任务】\n找到"异常节点"的起源，恢复被遗忘的"青铜鼎"。',
  },
];

export function MarketMissionBriefing({
  onComplete,
}: MarketMissionBriefingProps) {
  return (
    <NarrativeSceneBase
      segments={narrativeSegments}
      backgroundImage={marketImage}
      imageAlt="北宋汴梁集市"
      theme="amber"
      continueButtonText="开始任务"
      onComplete={onComplete}
      showParticles={false}
    />
  );
}
