import { ChapterIntroBase } from "../shared/ChapterIntroBase";
import marketBg from "figma:asset/cd195df1d4a046820f0571b2f97b720c9511c295.png";

interface MarketChapterIntroProps {
  onComplete: () => void;
}

export function MarketChapterIntro({ onComplete }: MarketChapterIntroProps) {
  return (
    <ChapterIntroBase
      chapterTitle="集市之谜"
      subtitle="关卡一"
      backgroundImage={marketBg}
      imageAlt="集市场景"
      theme="amber"
      onComplete={onComplete}
    />
  );
}
