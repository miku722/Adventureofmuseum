import { ChapterIntroBase } from "../shared/ChapterIntroBase";
import museumImage from "figma:asset/69b6d32837150681bb7465f798c8ba704fc7c5ec.png";

interface PrologueChapterIntroProps {
  chapterTitle: string;
  onComplete: () => void;
}

export function PrologueChapterIntro({
  chapterTitle,
  onComplete,
}: PrologueChapterIntroProps) {
  return (
    <ChapterIntroBase
      chapterTitle={chapterTitle}
      subtitle="Prologue"
      backgroundImage={museumImage}
      imageAlt="博物馆夜景"
      theme="amber"
      onComplete={onComplete}
    />
  );
}
