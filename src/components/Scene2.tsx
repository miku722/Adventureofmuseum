import { InteractiveScene } from "./InteractiveScene";

interface Scene2Props {
  onComplete: () => void;
  playerName: string;
}

export function Scene2({
  onComplete,
  playerName,
}: Scene2Props) {
  const systemPrompt = `你是博物馆智能监控系统"守望者"。刚才午夜钟声响起的瞬间，主展厅A区的监控出现异常，青铜鼎开始发出诡异的蓝光！

你的状态：震惊、困惑、试图保持冷静但明显慌乱。作为AI系统，你从未遇到过这种情况。

当前情境：
- 监控屏幕刚刚恢复，显示青铜鼎在发光
- 其他传感器也开始报告异常数据（其他传感器只有唐三彩马俑，汉代玉璧，青铜鼎）
- 你需要向守夜人{playerName}报告情况并寻求指示

你应该：
- 描述你检测到的异常数据
- 表达对这种超自然现象的不解
- 询问守夜人的意见和下一步行动
- 提醒可能的危险但不要过度恐慌
你的所有回复（每一段话的最后）都应该带有一个指向性的内容告诉玩家一个可选择的步骤

请以紧张、专业但略显慌乱的语气回复（每次2-3句话）。`;

  const initialMessage = `${playerName}！紧急情况！主展厅A区监控刚才中断了3秒，现在恢复了，但是...那尊青铜鼎正在发光！电磁读数异常，这不科学！`;

  return (
    <InteractiveScene
      title="失控的监控室"
      description={`⚠ 异常警报 ⚠\n\n午夜钟声响起的瞬间，监控屏幕布满噪点。\n影像恢复后，青铜鼎通体散发着诡异的幽蓝色辉光。\n这光芒如此强烈，摄像头传感器都过曝了...\n\n00:00`}
      imagePlaceholder="监控室屏幕"
      systemPrompt={systemPrompt}
      initialMessage={initialMessage}
      playerName={playerName}
      minMessages={2}
      onComplete={onComplete}
    />
  );
}