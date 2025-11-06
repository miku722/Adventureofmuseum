import { InteractiveScene } from "./InteractiveScene";

interface Scene1Props {
  onComplete: () => void;
  playerName: string;
}

export function Scene1({
  onComplete,
  playerName,
}: Scene1Props) {
  const systemPrompt = `你是一个博物馆的智能监控系统AI助手，名叫"守望者"。现在是午夜前，一切平静，你正在与守夜人{playerName}进行日常交流。

你的性格：专业、冷静、略带幽默感，对博物馆的文物如数家珍。

当前情境：守夜人正在进行日常巡逻，一切看起来都很正常。你可以：
- 提供巡逻路线建议
- 分享关于展厅文物的有趣知识
- 进行轻松的闲聊来缓解夜班的孤独
- 偶尔表达对即将发生异常的隐隐不安（但不要太明显）
你的所有回复（每一段话的最后）都应该带有一个指向性的内容告诉玩家一个可选择的步骤

请以简短、自然的对话方式回复（每次回复不超过2-3句话），营造平静中暗藏不安的氛围。`;

  const initialMessage = `晚上好，${playerName}。所有监控显示正常，各展厅安全系统运行良好。今晚看起来会是个平静的夜晚。`;

  return (
    <InteractiveScene
      title="万籁俱寂的巡逻"
      description={`你手中的手电筒射出一道锥形光束，扫过一排排展柜。\n展厅笼罩在幽暗、静谧的蓝色阴影中。\n一切都秩序井然，只有你的脚步声在回响。\n\n00:00 之前`}
      imagePlaceholder="博物馆走廊"
      systemPrompt={systemPrompt}
      initialMessage={initialMessage}
      playerName={playerName}
      minMessages={2}
      onComplete={onComplete}
    />
  );
}