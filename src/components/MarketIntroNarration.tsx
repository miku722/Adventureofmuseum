import { NarrativeSceneBase } from "./shared/NarrativeSceneBase";
import marketImage from "figma:asset/e9f84ea05cc517bde6db2eceec7da6c851a5c149.png";

interface MarketIntroNarrationProps {
  onComplete: () => void;
}

const narrativeSegments = [
  {
    text: '「异常能量波动检测到。时空层：北宋。',
  },
  {
    text: '文物名称：青铜鼎。',
  },
  {
    text: '状态：失联。',
  },
  {
    text: "请立即派遣守护员执行'历史修复'任务。」",
  },
  {
    text: '你坠入集市，落地时尘土飞扬，耳边是嘈杂的人声与商贩叫卖。',
  },
  {
    text: '「当前时间节点：北宋汴梁。',
  },
  {
    text: "主异常源：被遗忘的'鼎'。",
  },
  {
    text: "警告：该区域存在'供养机制失衡'，饥饿与贪婪蔓延。",
  },
  {
    text: "请查明'食物'与'礼仪'的关系，恢复失衡的象征物。」",
  },
  {
    text: '【主线任务】\n找到"异常节点"的起源，恢复被遗忘的"青铜鼎"。',
  },
];

export function MarketIntroNarration({
  onComplete,
}: MarketIntroNarrationProps) {
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
