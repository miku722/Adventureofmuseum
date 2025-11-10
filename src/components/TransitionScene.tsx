import { NarrativeSceneBase } from "./shared/NarrativeSceneBase";
import riftImage from "figma:asset/91537110258929abd280ae0c27ba8d0c2dc31331.png";

interface TransitionSceneProps {
  onComplete: () => void;
}

const narrativeSegments = [
  {
    text: "时空裂缝散发着如梦似幻的光芒。我能感受到从中传来的古老气息——那是青铜的锈蚀味，丝绸的幽香，还有墨汁未干的竹简香。",
  },
  {
    text: "我最后看了一眼熟悉的展厅... 还有桌上那杯还温热的菊花茶。",
  },
  {
    text: "然后，我深吸一口气，消失在裂缝中。",
  },
  {
    text: "眩晕感袭来，世界在我眼前旋转、扭曲...",
  },
  {
    text: "当我视线重新清晰时，我发现自己站在一个完全陌生的世界。",
  },
  {
    text: "天空呈现着深紫色，三个月亮悬挂在云层之间，空气中飘浮着发光的粒子。",
  },
  {
    text: "脚下是由未知材质构成的大理石地面，上面刻着我看不懂但感觉似曾相识的古老符文。",
  },
  {
    text: "突然，我听到了熟悉的声音... 叮铃铃~ 是那个汉代铜铃！",
  },
];

export function TransitionScene({ onComplete }: TransitionSceneProps) {
  return (
    <NarrativeSceneBase
      segments={narrativeSegments}
      backgroundImage={riftImage}
      imageAlt="时空裂缝"
      theme="cyan"
      continueButtonText="进入新世界"
      onComplete={onComplete}
      showParticles={true}
    />
  );
}
