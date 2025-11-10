/**
 * NPC独立记忆系统
 * 每个NPC拥有独立的记忆和身份，不知道"上帝视角"
 * 只知道自己的身份信息和与玩家的互动历史
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
}

export interface NPCMemory {
  npcId: string;
  conversationHistory: {
    timestamp: number;
    playerMessage: string;
    npcResponse: string;
  }[];
  learnedInfo: string[]; // NPC从玩家处学到的信息
  playerRelationship: number; // 与玩家的关系值 (-100 到 100)
  emotionalState: string; // 当前情绪状态
  metPlayer: boolean; // 是否已经见过玩家
}

/**
 * NPC记忆存储
 */
class NPCMemoryManager {
  private memories: Map<string, NPCMemory> = new Map();

  /**
   * 初始化NPC记忆
   */
  initNPC(npcId: string): NPCMemory {
    if (!this.memories.has(npcId)) {
      const memory: NPCMemory = {
        npcId,
        conversationHistory: [],
        learnedInfo: [],
        playerRelationship: 0,
        emotionalState: "neutral",
        metPlayer: false,
      };
      this.memories.set(npcId, memory);
      return memory;
    }
    return this.memories.get(npcId)!;
  }

  /**
   * 获取NPC记忆
   */
  getMemory(npcId: string): NPCMemory {
    if (!this.memories.has(npcId)) {
      return this.initNPC(npcId);
    }
    return this.memories.get(npcId)!;
  }

  /**
   * 添加对话记录
   */
  addConversation(
    npcId: string,
    playerMessage: string,
    npcResponse: string
  ): void {
    const memory = this.getMemory(npcId);
    memory.conversationHistory.push({
      timestamp: Date.now(),
      playerMessage,
      npcResponse,
    });
    memory.metPlayer = true;
  }

  /**
   * NPC学习新信息
   */
  learnInfo(npcId: string, info: string): void {
    const memory = this.getMemory(npcId);
    if (!memory.learnedInfo.includes(info)) {
      memory.learnedInfo.push(info);
    }
  }

  /**
   * 更新关系值
   */
  updateRelationship(npcId: string, delta: number): void {
    const memory = this.getMemory(npcId);
    memory.playerRelationship = Math.max(
      -100,
      Math.min(100, memory.playerRelationship + delta)
    );
  }

  /**
   * 更新情绪状态
   */
  updateEmotion(npcId: string, emotion: string): void {
    const memory = this.getMemory(npcId);
    memory.emotionalState = emotion;
  }

  /**
   * 清除所有记忆（用于游戏重置）
   */
  clearAll(): void {
    this.memories.clear();
  }

  /**
   * 导出所有记忆（用于保存游戏）
   */
  exportMemories(): Record<string, NPCMemory> {
    const exported: Record<string, NPCMemory> = {};
    this.memories.forEach((memory, npcId) => {
      exported[npcId] = memory;
    });
    return exported;
  }

  /**
   * 导入记忆（用于加载游戏）
   */
  importMemories(memories: Record<string, NPCMemory>): void {
    this.memories.clear();
    Object.entries(memories).forEach(([npcId, memory]) => {
      this.memories.set(npcId, memory);
    });
  }
}

// 全局NPC记忆管理器实例
export const npcMemoryManager = new NPCMemoryManager();

/**
 * 构建NPC专属的SystemPrompt
 * 这个prompt只包含NPC自己的身份和记忆，不包含游戏的全局信息
 */
export function buildNPCSystemPrompt(
  identity: NPCIdentity,
  playerName: string
): string {
  const memory = npcMemoryManager.getMemory(identity.id);

  let prompt = `你是${identity.name}，一个生活在这个世界中的${identity.role}。

【你的身份】
- 姓名：${identity.name}
- 职业/身份：${identity.role}
- 性格：${identity.personality}
- 背景：${identity.background}
- 当前位置：${identity.location}`;

  if (identity.goals) {
    prompt += `\n- 目标/动机：${identity.goals}`;
  }

  if (identity.secrets) {
    prompt += `\n- 秘密：${identity.secrets}（你会根据情况决定是否透露）`;
  }

  // 添加NPC的初始知识
  if (identity.knowledge.length > 0) {
    prompt += `\n\n【你知道的事情】\n`;
    identity.knowledge.forEach((k, index) => {
      prompt += `${index + 1}. ${k}\n`;
    });
  }

  // 添加从玩家处学到的信息
  if (memory.learnedInfo.length > 0) {
    prompt += `\n【你从${playerName}处了解到的信息】\n`;
    memory.learnedInfo.forEach((info, index) => {
      prompt += `${index + 1}. ${info}\n`;
    });
  }

  // 添加对话历史
  if (memory.conversationHistory.length > 0) {
    prompt += `\n【你与${playerName}的对话历史】\n`;
    memory.conversationHistory.forEach((conv, index) => {
      prompt += `\n[对话 ${index + 1}]\n`;
      prompt += `${playerName}: ${conv.playerMessage}\n`;
      prompt += `${identity.name}: ${conv.npcResponse}\n`;
    });
  }

  // 添加关系和情绪状态
  prompt += `\n【当前状态】`;
  
  if (memory.metPlayer) {
    prompt += `\n- 你已经认识${playerName}`;
    const relationship = memory.playerRelationship;
    if (relationship > 50) {
      prompt += `，你们是好朋友，你很信任${playerName}`;
    } else if (relationship > 20) {
      prompt += `，你对${playerName}有好感`;
    } else if (relationship < -50) {
      prompt += `，你不信任${playerName}，对TA持怀疑态度`;
    } else if (relationship < -20) {
      prompt += `，你对${playerName}有些警惕`;
    } else {
      prompt += `，你对${playerName}持中性态度`;
    }
  } else {
    prompt += `\n- 这是你第一次见到${playerName}`;
  }

  prompt += `\n- 当前情绪：${memory.emotionalState}`;

  // 添加行为规则
  prompt += `\n\n【重要规则】
1. 你只知道自己的经历和记忆，不知道游戏的全局剧情
2. 你不知道${playerName}在其他地方的经历，除非TA告诉你
3. 你要根据自己的性格和立场来回应，保持角色一致性
4. 你的回复应该简短自然（2-3句话），符合你的身份和处境
5. 你会记住${playerName}告诉你的信息，并在之后的对话中体现出来
6. 根据你的性格，你可能会主动提供信息，也可能需要${playerName}努力才能获得信息
7. 你的态度会根据${playerName}的行为和对话内容而变化

现在请以${identity.name}的身份，自然地与${playerName}对话。`;

  return prompt;
}

/**
 * 预定义的NPC身份信息
 */
export const NPC_IDENTITIES: Record<string, NPCIdentity> = {
  // 集市小贩
  vendor: {
    id: "vendor",
    name: "王老板",
    role: "集市小贩",
    personality: "精明、健谈、消息灵通，但有点市侩",
    background:
      "在集市摆摊二十多年，见过各种各样的人和事，对集市周边的情况了如指掌",
    location: "集市中心",
    knowledge: [
      "集市上最近生意不太好，大家都在议论宫殿里的异象",
      "前几天有个道士来过集市，买了很多符纸",
      "码头的船夫最近行为古怪，总是自言自语",
      "官府最近管得很严，不许讨论宫殿的事情",
    ],
    goals: "做生意赚钱，同时也喜欢打听消息",
  },

  // 和尚
  monk: {
    id: "monk",
    name: "慧明法师",
    role: "云游僧人",
    personality: "慈悲、睿智、神秘，说话常带禅机",
    background:
      "从远方寺庙云游而来，精通佛法，似乎对这个世界的异常现象有所了解",
    location: "集市中心（暂时停留）",
    knowledge: [
      "这个世界的天空和月亮不同寻常，这是时空错乱的征兆",
      "古老的青铜器具有连接不同时空的力量",
      "有缘人会被文物选中，承担特殊的使命",
      "宫殿中存在强大的力量，但也伴随着巨大的危险",
    ],
    goals: "寻找有缘人，传递佛法智慧，化解世间劫难",
    secrets: "他知道青铜鼎的真正用途，但不会轻易告诉别人",
  },

  // 船夫
  boatman: {
    id: "boatman",
    name: "老张",
    role: "码头船夫",
    personality: "粗犷、直率、有点迷信",
    background: "在码头摆渡多年，最近经历了一些奇怪的事情",
    location: "码头",
    knowledge: [
      "前几天夜里看到河面上有奇怪的光",
      "有些货物运到宫殿后就再也没运出来过",
      "听说宫殿里在举行什么秘密仪式",
      "自己的记忆有时会出现混乱，不知道是不是生病了",
    ],
    goals: "养家糊口，希望搞清楚自己记忆混乱的原因",
    secrets: "他其实是被唤醒的文物守护者，但自己还不知道",
  },

  // 书生
  scholar: {
    id: "scholar",
    name: "李文儒",
    role: "私塾先生",
    personality: "文雅、博学、好奇心强",
    background: "饱读诗书，对历史和古物有研究，最近在研究古代典籍",
    location: "私塾",
    knowledge: [
      "古籍中记载过类似的天象异变，预示着重大变革",
      "青铜器在古代不仅是礼器，还有神秘的用途",
      "宫殿的建筑布局暗藏玄机，似乎与星象有关",
      "有一本古书提到过'时空之门'和'守护者'",
    ],
    goals: "探索真相，记录历史",
  },

  // 守卫
  guard: {
    id: "guard",
    name: "刘守义",
    role: "官府守卫",
    personality: "严肃、忠诚、循规蹈矩，但也有正义感",
    background: "在官府当差十年，忠于职守，最近接到很多奇怪的命令",
    location: "官府门口",
    knowledge: [
      "官府下令任何人不得接近宫殿",
      "最近有很多货物被运往宫殿，都是古董和青铜器",
      "上面的官员最近行为古怪，像是被什么东西控制了",
      "听说宫殿里在准备某种仪式",
    ],
    goals: "履行职责，但也想保护无辜的百姓",
    secrets: "他发现上级可能在隐瞒什么，但不敢声张",
  },

  // 乞丐
  beggar: {
    id: "beggar",
    name: "疯老头",
    role: "乞丐/隐藏身份：觉醒的守护者",
    personality: "表面疯癫，实则清醒；经历过巨大的创伤",
    background:
      "原本是宫殿的守护者，因为某次失败的仪式而坠入疯狂，流落街头",
    location: "集市角落",
    knowledge: [
      "（未觉醒时）只会说一些疯癫的话，但偶尔会说出真相",
      "（觉醒后）青铜鼎是开启时空之门的钥匙",
      "（觉醒后）宫殿中的仪式是为了夺取青铜鼎的力量",
      "（觉醒后）守夜人是被选中的人，必须阻止仪式",
    ],
    goals: "（觉醒后）帮助守夜人完成使命，赎回自己过去的罪",
    secrets: "他知道完整的真相，但需要特殊的方式才能觉醒",
  },
};

/**
 * 获取NPC当前应该使用的SystemPrompt
 */
export function getNPCPrompt(npcId: string, playerName: string): string {
  const identity = NPC_IDENTITIES[npcId];
  if (!identity) {
    console.error(`未找到NPC身份信息: ${npcId}`);
    return "";
  }

  return buildNPCSystemPrompt(identity, playerName);
}

/**
 * 处理NPC对话后的记忆更新
 */
export function updateNPCMemoryAfterChat(
  npcId: string,
  playerMessage: string,
  npcResponse: string,
  learnedInfo?: string[],
  emotionChange?: string,
  relationshipDelta?: number
): void {
  // 记录对话
  npcMemoryManager.addConversation(npcId, playerMessage, npcResponse);

  // 更新学到的信息
  if (learnedInfo && learnedInfo.length > 0) {
    learnedInfo.forEach((info) => {
      npcMemoryManager.learnInfo(npcId, info);
    });
  }

  // 更新情绪
  if (emotionChange) {
    npcMemoryManager.updateEmotion(npcId, emotionChange);
  }

  // 更新关系
  if (relationshipDelta !== undefined) {
    npcMemoryManager.updateRelationship(npcId, relationshipDelta);
  }
}
