/**
 * NPC记忆系统 - 类型定义
 */

export interface NPCIdentity {
  id: string;
  name: string;
  role: string; // 职业/身份
  personality: string; // 性格特点
  background: string; // 背景故事
  location: string; // 所在地点
  knowledge: string[]; // 初始知识（这个NPC天然知道的事情）
  goals?: string; // 目标/动机
  secrets?: string; // 秘密信息
  
  // 新增：可被玩家问出的隐藏信息（动态JSON结构）
  revealableInfo?: Record<string, {
    content: string; // 信息内容
    revealed: boolean; // 是否已被玩家问出
    revealCondition?: string; // 揭示条件（如好感度>30）
    revealedAt?: number; // 揭示时间戳
  }>;
  
  // 新增：NPC的自定义数据（完全自由的JSON，可存储任何NPC特定信息）
  customData?: Record<string, any>;
}

export interface MemoryTurn {
  timestamp: number;
  playerMessage: string;
  npcResponse: string;
  thinkingSteps?: string[]; // AI的思考步骤
}

// 互动统计数据
export interface InteractionStats {
  conversationOpenCount: number; // 开启对话次数
  conversationCloseCount: number; // 关闭对话次数
  totalMessageCount: number; // 总消息数
  firstMetTime?: number; // 首次见面时间
  lastInteractionTime?: number; // 最后互动时间
  averageResponseTime?: number; // 平均响应时间（用于分析）
  conversationDurations: number[]; // 每次对话持续时间（秒）
}

export interface MemoryTodo {
  id: string;
  step: 'acknowledge' | 'summarize' | 'prune' | 'update_relationship' | 'complete';
  payload: any;
}

export interface NPCMemory {
  npcId: string;
  conversationHistory: MemoryTurn[];
  learnedInfo: string[]; // NPC从玩家处学到的信息
  
  // 扩展：关系系统
  playerRelationship: number; // 与玩家的关系值 (-100 到 100)
  familiarity: number; // 熟悉程度 (0-100)，随对话次数增加
  affection: number; // 好感度 (0-100)，根据对话内容变化
  trust: number; // 信任度 (0-100)，影响是否透露秘密
  
  emotionalState: string; // 当前情绪状态
  metPlayer: boolean; // 是否已经见过玩家
  closedConversation: boolean; // 是否曾经关闭过对话窗口（用于老友式问候）
  lastClosedTime?: number; // 上次关闭对话的时间戳
  
  // 互动统计
  interactionStats: InteractionStats;
  
  // 对话会话管理
  currentSessionStartTime?: number; // 当前对话开始时间
  
  todos: MemoryTodo[]; // Internal todo queue for autonomy
  summary: string | null; // Concise history summary
}
