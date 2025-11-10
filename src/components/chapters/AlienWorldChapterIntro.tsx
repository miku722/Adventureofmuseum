import { ChapterIntroBase } from "../shared/ChapterIntroBase";
import unknownWorldImage from "figma:asset/5d2733fa296bfc3f9a67d64469c94a9d316169f6.png";

interface AlienWorldChapterIntroProps {
  chapterTitle: string;
  subtitle?: string;
  onComplete: () => void;
}

export function AlienWorldChapterIntro({
  chapterTitle,
  subtitle = "Chapter One",
  onComplete,
}: AlienWorldChapterIntroProps) {
  return (
    <ChapterIntroBase
      chapterTitle={chapterTitle}
      subtitle={subtitle}
      backgroundImage={unknownWorldImage}
      imageAlt="未知世界"
      theme="cyan"
      onComplete={onComplete}
    />
  );
}
