// 游戏物品
export interface GameItem {
  id: string;
  name: string;
  description: string;
  icon?: string;
  type: "food" | "artifact" | "clue" | "ability";
  quantity?: number; // 物品数量，默认为1
}

// NPC类型
export interface NPC {
  id: string;
  name: string;
  role: string;
  location: string;
  dialogue: string[];
  currentDialogueIndex: number;
  isAwakened?: boolean;
  requiredItems?: string[];
  givesItem?: GameItem;
  givesClue?: Clue;
}

// 线索
export interface Clue {
  id: string;
  title: string;
  content: string;
  source: string;
}

// 游戏能力
export interface Ability {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

// 游戏状态
export interface GameState {
  inventory: GameItem[];
  clues: Clue[];
  abilities: Ability[];
  currentLocation: string;
  completedQuests: string[];
  npcStates: Record<string, NPC>;
}