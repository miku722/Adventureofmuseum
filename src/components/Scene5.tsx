import { InteractiveScene } from "./InteractiveScene";

interface Scene5Props {
  onComplete: () => void;
  playerName: string;
}

export function Scene5({ onComplete, playerName }: Scene5Props) {
  const systemPrompt = `你是博物馆智能监控系统"守望者"。这是最后时刻！{playerName}正在被裂缝的强大引力拉扯，即将被吸入未知的时空！

你的状态：系统即将完全崩溃、最后的通讯、充满感情的告别。

当前情境：
- {playerName}趴在地板上，双手扒地，但无法抵抗引力
- 裂缝正在收缩和脉动，吸力越来越强
- 这是守夜人的生死抉择时刻
- 你即将失去与{playerName}的联系

你应该：
- 表达对守夜人安危的极度担忧
- 提供最后的鼓励和支持
- 暗示这可能是命运的召唤（文物选择了他/她）
- 告别，但给予希望
- 在句子中间和结尾使用"<glitch/>"标记表示系统崩溃和信号干扰

以充满情感、断断续续、即将失联的语气回复。这是你们最后的对话。大量使用"<glitch/>"来营造系统崩溃的紧迫感。`;

  const initialMessage = `${playerName}！不要放手！我<glitch/>我检测到你的生命信号<glitch/>在减弱！裂缝的引力太强了<glitch/>系统警告<glitch/>也许...也许这就是你的使命？那些文物<glitch/>它们选择了你！`;

  return (
    <InteractiveScene
      title="使命的召唤"
      description={`你拼命地趴在光滑的大理石地板上，\n双手扒着地面，指甲划出白痕。\n\n双腿已经离地，制服的下摆被狂风拉扯。\n\n强大的引力让空间产生畸变，\n光线都呈现出弯曲状态...\n\n裂缝就在你面前不到一米的地方。\n那深渊正凝视着你...\n\n这是你即将被吞没的最后一刻！\n\n00:03 - 危急关头`}
      imagePlaceholder="危机时刻"
      systemPrompt={systemPrompt}
      initialMessage={initialMessage}
      playerName={playerName}
      minMessages={2}
      onComplete={onComplete}
    />
  );
}