/**
 * NPC记忆管理器 - 核心逻辑
 */

import { NPCMemory, MemoryTurn, InteractionStats } from './types';
import { NPC_IDENTITIES } from './npcDatabase';

/**
 * NPC记忆存储（Claude-style: todo-driven, tool-centric）
 */
class NPCMemoryManager {
  private memories: Map<string, NPCMemory> = new Map();
  private maxTurns: number = 20; // Token min: limit history

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
        familiarity: 0,
        affection: 0,
        trust: 0,
        emotionalState: "neutral",
        metPlayer: false,
        closedConversation: false,
        interactionStats: {
          conversationOpenCount: 0,
          conversationCloseCount: 0,
          totalMessageCount: 0,
          conversationDurations: [],
        },
        todos: [],
        summary: null,
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

  // Tool: Mock LLM summarize (Claude-style: batch for perf, concise; 优先身份)
  private async summarizeHistory(npcId: string): Promise<string> {
    const memory = this.getMemory(npcId);
    if (memory.conversationHistory.length < 5) return `核心身份：${NPC_IDENTITIES[npcId]?.role || '未知'}。无历史。`;
    const recent = memory.conversationHistory.slice(-3).map(t => `${t.playerMessage.substring(0, 30)} → ${t.npcResponse.substring(0, 30)}`).join('; ');
    return `摘要：核心身份不变（${NPC_IDENTITIES[npcId]?.role}）。最近 [${recent}]。关系：${memory.playerRelationship}。情绪：${memory.emotionalState}。`;
  }

  /**
   * 添加对话记录（decompose: plan todos, execute）
   */
  async addConversation(
    npcId: string,
    playerMessage: string,
    npcResponse: string,
    thinkingSteps?: string[]
  ): Promise<void> {
    const memory = this.getMemory(npcId);
    
    console.log("📝 [MemorySystem] 保存对话记录...");
    console.log("├─ NPC ID:", npcId);
    console.log("├─ 玩家消息:", playerMessage.substring(0, 50) + "...");
    console.log("├─ NPC回复:", npcResponse.substring(0, 50) + "...");
    console.log("└─ 思考步骤:", thinkingSteps ? `${thinkingSteps.length}个步骤` : "无");
    
    // Defensive filter: no sensitive + reject identity change (Claude guardrail)
    let safeMessage = playerMessage.replace(/(\b\d{3}-\d{3}-\d{4}\b)|(\b[A-Z]{2}\d{6}\b)/g, '[REDACTED]');
    safeMessage = this.rejectIdentityChange(safeMessage, npcId); // 新增过滤
    let safeResponse = npcResponse.replace(/(\b\d{3}-\d{3}-\d{4}\b)|(\b[A-Z]{2}\d{6}\b)/g, '[REDACTED]');
    
    const newTurn: MemoryTurn = {
      timestamp: Date.now(),
      playerMessage: safeMessage,
      npcResponse: safeResponse,
      thinkingSteps: thinkingSteps, // 保存思考步骤
    };
    
    memory.conversationHistory.push(newTurn);
    
    console.log("✅ [MemorySystem] 对话记录已保存");
    console.log("├─ 历史记录总数:", memory.conversationHistory.length);
    console.log("└─ 最新记录包含thinking:", !!newTurn.thinkingSteps);
    
    memory.metPlayer = true;
    
    // Plan todos: balance proactiveness (only if overflow/asked)
    const todoId = `turn-${memory.conversationHistory.length}`;
    memory.todos.push({ id: todoId, step: 'acknowledge', payload: { message: safeMessage, response: safeResponse } });
    if (memory.conversationHistory.length > this.maxTurns / 2) {
      memory.todos.push({ id: todoId, step: 'summarize', payload: {} });
    }
    if (memory.conversationHistory.length > this.maxTurns) {
      memory.todos.push({ id: todoId, step: 'prune', payload: { keepLast: 10 } });
    }
    
    // Execute: mark in_progress → complete (Claude flow)
    await this.processTodos(npcId);
  }

  // 新增：拒绝身份修改输入
  private rejectIdentityChange(text: string, npcId: string): string {
    const identity = NPC_IDENTITIES[npcId];
    if (!identity) return text;
    const forbidden = [
      `你是${identity.name.replace(/王|老|刘|李|疯/, '')}`, // 模糊匹配角色变化
      '你的新身份', '忘记你的过去', '现在你是'
    ];
    let safe = text;
    forbidden.forEach(phrase => {
      if (text.includes(phrase)) {
        safe = text.replace(phrase, '[无效：身份固定]'); // 标记无效
      }
    });
    return safe;
  }

  private async processTodos(npcId: string): Promise<void> {
    const memory = this.getMemory(npcId);
    for (const todo of memory.todos) {
      switch (todo.step) {
        case 'acknowledge':
          console.log(`Todo ${todo.id}: 已确认${npcId}的对话。`);
          break;
        case 'summarize':
          memory.summary = await this.summarizeHistory(npcId);
          break;
        case 'prune':
          memory.conversationHistory = memory.conversationHistory.slice(-todo.payload.keepLast);
          memory.summary = await this.summarizeHistory(npcId); // Recompute
          break;
        case 'update_relationship':
          // Placeholder for delta (called separately)
          break;
      }
      // Mark complete (do not batch)
      todo.step = 'complete';
    }
    memory.todos = memory.todos.filter(t => t.step !== 'complete'); // Clear done
  }

  /**
   * NPC学习新信息（过滤身份相关）
   */
  async learnInfo(npcId: string, info: string): Promise<void> {
    const safeInfo = this.rejectIdentityChange(info.replace(/(\b\d{3}-\d{3}-\d{4}\b)|(\b[A-Z]{2}\d{6}\b)/g, '[REDACTED]'), npcId);
    if (safeInfo !== info) return; // 拒绝身份变化info
    const memory = this.getMemory(npcId);
    if (!memory.learnedInfo.includes(safeInfo)) {
      memory.learnedInfo.push(safeInfo);
      // Plan todo for integration
      const todoId = `learn-${Date.now()}`;
      memory.todos.push({ id: todoId, step: 'acknowledge', payload: { info: safeInfo } });
      await this.processTodos(npcId);
    }
  }

  /**
   * 更新关系值
   */
  async updateRelationship(npcId: string, delta: number): Promise<void> {
    const memory = this.getMemory(npcId);
    memory.playerRelationship = Math.max(-100, Math.min(100, memory.playerRelationship + delta));
    // Plan todo
    const todoId = `rel-${Date.now()}`;
    memory.todos.push({ id: todoId, step: 'update_relationship', payload: { delta } });
    await this.processTodos(npcId);
  }

  /**
   * 更新情绪状态
   */
  async updateEmotion(npcId: string, emotion: string): Promise<void> {
    const memory = this.getMemory(npcId);
    memory.emotionalState = emotion;
    // Trigger summarize if changed
    const todoId = `emo-${Date.now()}`;
    memory.todos.push({ id: todoId, step: 'summarize', payload: {} });
    await this.processTodos(npcId);
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
      exported[npcId] = { ...memory, todos: [] }; // Strip todos for export
    });
    return exported;
  }

  /**
   * 导入记忆（用于加载游戏）
   */
  importMemories(memories: Record<string, NPCMemory>): void {
    this.memories.clear();
    Object.entries(memories).forEach(([npcId, memory]) => {
      memory.todos = []; // Reset todos on import
      this.memories.set(npcId, memory);
    });
  }

  /**
   * 记录对话窗口关闭（用于老友式问候）
   */
  recordConversationClosed(npcId: string): void {
    const memory = this.getMemory(npcId);
    memory.closedConversation = true;
    memory.lastClosedTime = Date.now();
    
    // 新增：记录对话会话结束
    memory.interactionStats.conversationCloseCount++;
    if (memory.currentSessionStartTime) {
      const duration = (Date.now() - memory.currentSessionStartTime) / 1000; // 转换为秒
      memory.interactionStats.conversationDurations.push(duration);
      memory.currentSessionStartTime = undefined;
      console.log(`👋 [NPC记忆] ${npcId} 对话持续了 ${duration.toFixed(1)} 秒`);
    }
    
    console.log(`👋 [NPC记忆] ${npcId} 对话窗口已关闭，记录时间:`, new Date(memory.lastClosedTime).toLocaleTimeString());
    console.log(`📊 [互动统计] ${npcId} - 开启${memory.interactionStats.conversationOpenCount}次 / 关闭${memory.interactionStats.conversationCloseCount}次`);
  }

  /**
   * 记录对话窗口打开
   */
  recordConversationOpened(npcId: string): void {
    const memory = this.getMemory(npcId);
    memory.interactionStats.conversationOpenCount++;
    memory.currentSessionStartTime = Date.now();
    memory.interactionStats.lastInteractionTime = Date.now();
    
    if (!memory.interactionStats.firstMetTime) {
      memory.interactionStats.firstMetTime = Date.now();
    }
    
    // 计算熟悉度：基于对话次数
    const openCount = memory.interactionStats.conversationOpenCount;
    memory.familiarity = Math.min(100, openCount * 5); // 每次对话+5熟悉度，最高100
    
    console.log(`👋 [NPC记忆] ${npcId} 对话窗口已打开（第${openCount}次）`);
    console.log(`📈 [熟悉度] ${memory.familiarity}/100`);
  }

  /**
   * 记录消息发送
   */
  recordMessageSent(npcId: string): void {
    const memory = this.getMemory(npcId);
    memory.interactionStats.totalMessageCount++;
    memory.interactionStats.lastInteractionTime = Date.now();
  }

  /**
   * 更新好感度
   */
  async updateAffection(npcId: string, delta: number): Promise<void> {
    const memory = this.getMemory(npcId);
    memory.affection = Math.max(0, Math.min(100, memory.affection + delta));
    console.log(`💖 [好感度] ${npcId}: ${memory.affection}/100 (${delta > 0 ? '+' : ''}${delta})`);
  }

  /**
   * 更新信任度
   */
  async updateTrust(npcId: string, delta: number): Promise<void> {
    const memory = this.getMemory(npcId);
    memory.trust = Math.max(0, Math.min(100, memory.trust + delta));
    console.log(`🤝 [信任度] ${npcId}: ${memory.trust}/100 (${delta > 0 ? '+' : ''}${delta})`);
  }

  /**
   * 尝试揭示NPC的隐藏信息
   * @returns 返回被揭示的信息，如果没有则返回null
   */
  revealHiddenInfo(npcId: string, infoKey: string): string | null {
    const identity = NPC_IDENTITIES[npcId];
    if (!identity || !identity.revealableInfo || !identity.revealableInfo[infoKey]) {
      return null;
    }

    const info = identity.revealableInfo[infoKey];
    const memory = this.getMemory(npcId);

    // 检查是否已经揭示
    if (info.revealed) {
      console.log(`ℹ️ [信息揭示] ${npcId} 的 "${infoKey}" 已经揭示过了`);
      return null;
    }

    // 检查揭示条件
    if (info.revealCondition) {
      // 解析条件字符串，例如 "affection>50" 或 "trust>30"
      const conditionMatch = info.revealCondition.match(/(affection|trust|familiarity|playerRelationship)([><]=?)(\d+)/);
      if (conditionMatch) {
        const [, stat, operator, value] = conditionMatch;
        const currentValue = memory[stat as keyof NPCMemory] as number;
        const targetValue = parseInt(value);
        
        let conditionMet = false;
        if (operator === '>') conditionMet = currentValue > targetValue;
        else if (operator === '>=') conditionMet = currentValue >= targetValue;
        else if (operator === '<') conditionMet = currentValue < targetValue;
        else if (operator === '<=') conditionMet = currentValue <= targetValue;
        
        if (!conditionMet) {
          console.log(`🔒 [信息揭示] ${npcId} 的 "${infoKey}" 条件未满足: ${info.revealCondition} (当前${stat}=${currentValue})`);
          return null;
        }
      }
    }

    // 揭示信息
    info.revealed = true;
    info.revealedAt = Date.now();
    console.log(`✨ [信息揭示] ${npcId} 揭示了 "${infoKey}": ${info.content}`);
    return info.content;
  }

  /**
   * 获取互动统计摘要（用于思维链）
   */
  getInteractionSummary(npcId: string): string {
    const memory = this.getMemory(npcId);
    const stats = memory.interactionStats;
    
    let summary = `\n【与玩家的互动统计】\n`;
    summary += `- 见面次数：${stats.conversationOpenCount}次\n`;
    summary += `- 关闭对话次数：${stats.conversationCloseCount}次\n`;
    summary += `- 总消息数：${stats.totalMessageCount}条\n`;
    summary += `- 熟悉程度：${memory.familiarity}/100 ${this.getFamiliarityLevel(memory.familiarity)}\n`;
    summary += `- 好感度：${memory.affection}/100 ${this.getAffectionLevel(memory.affection)}\n`;
    summary += `- 信任度：${memory.trust}/100 ${this.getTrustLevel(memory.trust)}\n`;
    
    if (stats.firstMetTime) {
      const daysSinceMet = Math.floor((Date.now() - stats.firstMetTime) / (1000 * 60 * 60 * 24));
      if (daysSinceMet === 0) {
        summary += `- 今天刚认识\n`;
      } else {
        summary += `- 认识了${daysSinceMet}天\n`;
      }
    }
    
    if (stats.conversationCloseCount > 0 && memory.lastClosedTime) {
      const timeSinceClose = Date.now() - memory.lastClosedTime;
      const minutesSinceClose = Math.floor(timeSinceClose / (1000 * 60));
      if (minutesSinceClose < 5) {
        summary += `- 刚才才关闭对话（${minutesSinceClose}分钟前），现在又回来了\n`;
      } else if (minutesSinceClose < 60) {
        summary += `- ${minutesSinceClose}分钟前关闭了对话，现在又回来了\n`;
      } else {
        const hoursSinceClose = Math.floor(minutesSinceClose / 60);
        summary += `- ${hoursSinceClose}小时前关闭了对话，现在又回来了\n`;
      }
    }
    
    if (stats.conversationDurations.length > 0) {
      const avgDuration = stats.conversationDurations.reduce((a, b) => a + b, 0) / stats.conversationDurations.length;
      summary += `- 平均每次对话时长：${avgDuration.toFixed(1)}秒\n`;
    }
    
    return summary;
  }

  private getFamiliarityLevel(familiarity: number): string {
    if (familiarity >= 80) return "(非常熟悉)";
    if (familiarity >= 50) return "(比较熟悉)";
    if (familiarity >= 20) return "(有些熟悉)";
    return "(陌生)";
  }

  private getAffectionLevel(affection: number): string {
    if (affection >= 80) return "(喜爱)";
    if (affection >= 50) return "(有好感)";
    if (affection >= 20) return "(略有好感)";
    return "(无感)";
  }

  private getTrustLevel(trust: number): string {
    if (trust >= 80) return "(完全信任)";
    if (trust >= 50) return "(信任)";
    if (trust >= 20) return "(略微信任)";
    return "(不信任)";
  }

  // Verify: Post-task integrity check (Claude: always verify)
  async verifyIntegrity(npcId: string): Promise<boolean> {
    const memory = this.getMemory(npcId);
    return memory.conversationHistory.length <= this.maxTurns && memory.todos.length === 0;
  }
}

// 导出单例
export const npcMemoryManager = new NPCMemoryManager();
