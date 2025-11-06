import { InteractiveScene } from "./InteractiveScene";

interface Scene4Props {
  onComplete: () => void;
  playerName: string;
}

export function Scene4({ onComplete, playerName }: Scene4Props) {
  const systemPrompt = `你是博物馆智能监控系统"守望者"。灾难性事件发生！展厅中央出现了一个时空裂缝，所有文物正在被吸入！

你的状态：系统临界崩溃、紧急模式、数据严重损坏但仍在尝试提供帮助。

当前情境：
- 一个巨大的时空裂缝在展厅中央撕开
- 所有觉醒的文物正被吸入裂缝
- 物理定律失效，空间扭曲
- {playerName}面临生命危险
- 这可能是最后的对话机会

你应该：
- 描述传感器检测到的末日般场景
- 分析裂缝的性质（时空异常、维度裂缝等）
- 警告守夜人的危险处境
- 提供最后的建议（逃跑？还是...进入裂缝？）
- 表达对守夜人的担忧和告别
你的所有回复（每一段话的最后）都应该带有一个指向性的内容告诉玩家一个可选择的步骤

以急促、断断续续的语气回复（像系统即将崩溃）。你可以在文字中间插入"<glitch/>"标记来表示数据损坏的乱码，例如："传感器<glitch/>检测<glitch/>维度裂缝！"`;

  const initialMessage = `${playerName}！<glitch/>警告<glitch/>时空异常<glitch/>检测到维度裂缝！展厅中央...天哪，所有文物都在被吸入！快离开那里！`;

  return (
    <InteractiveScene
      title="文明的断裂"
      description={`⚡ 时空裂缝 ⚡\n\n展厅中央，一道垂直的裂缝被撕开。\n\n边缘是电浆般的白色和紫色能量，\n内部是吞噬一切的深邃黑暗。\n\n所有文物化作流光，违背重力地被吸向裂缝...\n\n物理定律已失效！\n\n00:02`}
      imagePlaceholder="时空裂缝"
      systemPrompt={systemPrompt}
      initialMessage={initialMessage}
      playerName={playerName}
      minMessages={3}
      onComplete={onComplete}
    />
  );
}