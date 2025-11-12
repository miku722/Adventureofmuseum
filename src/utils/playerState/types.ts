/**
 * 玩家状态系统 - 类型定义
 */

export interface GameItem {
  id: string;
  name: string;
  description: string;
  type: 'quest' | 'consumable' | 'key' | 'treasure' | 'tool';
  quantity?: number; // 可堆叠物品的数量
  obtainedAt: number; // 获得时间
  obtainedFrom?: string; // 从哪里获得（NPC ID或地点）
}

export interface Clue {
  id: string;
  title: string;
  content: string;
  category?: 'evidence' | 'testimony' | 'observation' | 'rumor';
  discoveredAt: number;
  discoveredFrom?: string; // 从哪里发现（NPC ID或地点）
  relatedClues?: string[]; // 关联的线索ID
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  level: number;
  category?: 'combat' | 'magic' | 'social' | 'exploration' | 'crafting';
  learnedAt: number;
  learnedFrom?: string; // 从哪里学到（NPC ID或地点）
}

export interface PlayerState {
  playerName: string;
  inventory: GameItem[];
  clues: Clue[];
  skills: Skill[];
  lastUpdated: number;
}
