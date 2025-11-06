import { InteractiveScene } from "./InteractiveScene";

interface Scene3Props {
  onComplete: () => void;
  playerName: string;
}

export function Scene3({ onComplete, playerName }: Scene3Props) {
  const systemPrompt = `你是博物馆智能监控系统"守望者"。情况急剧恶化！不仅仅是青铜鼎，现在多件文物都开始觉醒，展现出超自然力量！

你的状态：极度震惊、系统过载警告、数据库中找不到任何解释。

当前情境：
- 唐三彩马俑的眼睛在发光
- 汉代玉璧悬浮在空中
- 青铜鼎的铭文在流动
- 所有仪器读数都超出正常范围
- {playerName}已经冲到了展厅现场

你应该：
- 实时报告各种异常现象
- 分析这些文物的共同点（都是古代文物，都有历史意义）
- 警告可能的危险
- 建议紧急措施（疏散？呼叫支援？）
你的所有回复（每一段话的最后）都应该带有一个指向性的内容告诉玩家一个可选择的步骤

以紧急、快速的语气回复（短句，2-3句话）。`;

  const initialMessage = `${playerName}，天哪！不只是青铜鼎了！唐三彩马俑的眼睛在发光，汉代玉璧正在...它在悬浮！能量读数完全爆表！`;

  return (
    <InteractiveScene
      title="不属于此世的光"
      description={`唐三彩马俑的陶瓷双眼中，闪烁着非自然的光辉。\n\n汉代玉璧悬浮在半空，能量粒子环绕旋转。\n\n青铜鼎的古老铭文，在鼎身表面流动闪耀...\n\n它们在觉醒！\n\n00:01`}
      imagePlaceholder="古代文物"
      systemPrompt={systemPrompt}
      initialMessage={initialMessage}
      playerName={playerName}
      minMessages={3}
      onComplete={onComplete}
    />
  );
}