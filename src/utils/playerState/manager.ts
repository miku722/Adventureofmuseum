/**
 * 玩家状态管理器
 * 负责管理玩家的物品、线索和技能
 */

import { PlayerState, GameItem, Clue, Skill } from './types';

const STORAGE_KEY = 'timePortal_playerState';

/**
 * 玩家状态管理类
 */
class PlayerStateManager {
  private state: PlayerState;

  constructor() {
    this.state = this.loadState();
  }

  /**
   * 从 localStorage 加载状态
   */
  private loadState(): PlayerState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('📦 [PlayerState] 从存储加载状态:', {
          物品数: parsed.inventory?.length || 0,
          线索数: parsed.clues?.length || 0,
          技能数: parsed.skills?.length || 0,
        });
        return parsed;
      }
    } catch (error) {
      console.error('❌ [PlayerState] 加载状态失败:', error);
    }

    // 默认状态
    return {
      playerName: '',
      inventory: [],
      clues: [],
      skills: [],
      lastUpdated: Date.now(),
    };
  }

  /**
   * 保存状态到 localStorage
   */
  private saveState(): void {
    try {
      this.state.lastUpdated = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      console.log('💾 [PlayerState] 状态已保存');
    } catch (error) {
      console.error('❌ [PlayerState] 保存状态失败:', error);
    }
  }

  /**
   * 初始化玩家（设置玩家名）
   */
  initPlayer(playerName: string): void {
    this.state.playerName = playerName;
    this.saveState();
    console.log('👤 [PlayerState] 玩家已初始化:', playerName);
  }

  /**
   * 获取完整状态
   */
  getState(): PlayerState {
    return { ...this.state };
  }

  /**
   * 重置状态（慎用）
   */
  resetState(): void {
    this.state = {
      playerName: this.state.playerName,
      inventory: [],
      clues: [],
      skills: [],
      lastUpdated: Date.now(),
    };
    this.saveState();
    console.log('🔄 [PlayerState] 状态已重置');
  }

  // ==================== 物品管理 ====================

  /**
   * 获取所有物品
   */
  getInventory(): GameItem[] {
    return [...this.state.inventory];
  }

  /**
   * 根据ID查找物品
   */
  getItemById(itemId: string): GameItem | undefined {
    return this.state.inventory.find(item => item.id === itemId);
  }

  /**
   * 根据名称查找物品
   */
  getItemByName(itemName: string): GameItem | undefined {
    return this.state.inventory.find(item => item.name === itemName);
  }

  /**
   * 检查是否拥有某物品
   */
  hasItem(itemName: string): boolean {
    return this.state.inventory.some(item => item.name === itemName);
  }

  /**
   * 添加物品
   */
  addItem(item: Omit<GameItem, 'id' | 'obtainedAt'>): GameItem {
    const newItem: GameItem = {
      ...item,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      obtainedAt: Date.now(),
    };

    // 如果是可堆叠物品且已存在，增加数量
    if (newItem.quantity !== undefined) {
      const existing = this.state.inventory.find(i => i.name === newItem.name);
      if (existing && existing.quantity !== undefined) {
        existing.quantity += newItem.quantity;
        this.saveState();
        console.log(`📦 [PlayerState] 物品堆叠: ${newItem.name} x${existing.quantity}`);
        return existing;
      }
    }

    this.state.inventory.push(newItem);
    this.saveState();
    console.log(`✨ [PlayerState] 获得物品: ${newItem.name}`, newItem.obtainedFrom ? `来自: ${newItem.obtainedFrom}` : '');
    return newItem;
  }

  /**
   * 移除物品（根据名称）
   */
  removeItemByName(itemName: string, quantity: number = 1): boolean {
    const index = this.state.inventory.findIndex(item => item.name === itemName);
    
    if (index === -1) {
      console.warn(`⚠️ [PlayerState] 物品不存在: ${itemName}`);
      return false;
    }

    const item = this.state.inventory[index];

    // 如果是可堆叠物品
    if (item.quantity !== undefined) {
      if (item.quantity > quantity) {
        item.quantity -= quantity;
        this.saveState();
        console.log(`♻️ [PlayerState] 使用物品: ${itemName} x${quantity} (剩余: ${item.quantity})`);
        return true;
      } else if (item.quantity === quantity) {
        this.state.inventory.splice(index, 1);
        this.saveState();
        console.log(`♻️ [PlayerState] 使用物品: ${itemName} x${quantity} (已用完)`);
        return true;
      } else {
        console.warn(`⚠️ [PlayerState] 物品数量不足: ${itemName} (需要: ${quantity}, 拥有: ${item.quantity})`);
        return false;
      }
    }

    // 非堆叠物品，直接移除
    this.state.inventory.splice(index, 1);
    this.saveState();
    console.log(`♻️ [PlayerState] 使用物品: ${itemName}`);
    return true;
  }

  /**
   * 移除物品（根据ID）
   */
  removeItemById(itemId: string): boolean {
    const index = this.state.inventory.findIndex(item => item.id === itemId);
    
    if (index === -1) {
      console.warn(`⚠️ [PlayerState] 物品不存在: ${itemId}`);
      return false;
    }

    const item = this.state.inventory[index];
    this.state.inventory.splice(index, 1);
    this.saveState();
    console.log(`♻️ [PlayerState] 移除物品: ${item.name}`);
    return true;
  }

  // ==================== 线索管理 ====================

  /**
   * 获取所有线索
   */
  getClues(): Clue[] {
    return [...this.state.clues];
  }

  /**
   * 根据ID查找线索
   */
  getClueById(clueId: string): Clue | undefined {
    return this.state.clues.find(clue => clue.id === clueId);
  }

  /**
   * 根据标题查找线索
   */
  getClueByTitle(title: string): Clue | undefined {
    return this.state.clues.find(clue => clue.title === title);
  }

  /**
   * 检查是否已发现某线索
   */
  hasClue(title: string): boolean {
    return this.state.clues.some(clue => clue.title === title);
  }

  /**
   * 添加线索
   */
  addClue(clue: Omit<Clue, 'id' | 'discoveredAt'>): Clue {
    // 检查是否已存在同名线索
    const existing = this.getClueByTitle(clue.title);
    if (existing) {
      console.warn(`⚠️ [PlayerState] 线索已存在: ${clue.title}`);
      return existing;
    }

    const newClue: Clue = {
      ...clue,
      id: `clue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      discoveredAt: Date.now(),
    };

    this.state.clues.push(newClue);
    this.saveState();
    console.log(`🔎 [PlayerState] 发现线索: ${newClue.title}`, newClue.discoveredFrom ? `来自: ${newClue.discoveredFrom}` : '');
    return newClue;
  }

  /**
   * 移除线索
   */
  removeClue(clueId: string): boolean {
    const index = this.state.clues.findIndex(clue => clue.id === clueId);
    
    if (index === -1) {
      console.warn(`⚠️ [PlayerState] 线索不存在: ${clueId}`);
      return false;
    }

    const clue = this.state.clues[index];
    this.state.clues.splice(index, 1);
    this.saveState();
    console.log(`🗑️ [PlayerState] 移除线索: ${clue.title}`);
    return true;
  }

  // ==================== 技能管理 ====================

  /**
   * 获取所有技能
   */
  getSkills(): Skill[] {
    return [...this.state.skills];
  }

  /**
   * 根据ID查找技能
   */
  getSkillById(skillId: string): Skill | undefined {
    return this.state.skills.find(skill => skill.id === skillId);
  }

  /**
   * 根据名称查找技能
   */
  getSkillByName(skillName: string): Skill | undefined {
    return this.state.skills.find(skill => skill.name === skillName);
  }

  /**
   * 检查是否拥有某技能
   */
  hasSkill(skillName: string): boolean {
    return this.state.skills.some(skill => skill.name === skillName);
  }

  /**
   * 添加技能
   */
  addSkill(skill: Omit<Skill, 'id' | 'learnedAt'>): Skill {
    // 检查是否已存在同名技能
    const existing = this.getSkillByName(skill.name);
    if (existing) {
      console.warn(`⚠️ [PlayerState] 技能已存在: ${skill.name}`);
      return existing;
    }

    const newSkill: Skill = {
      ...skill,
      id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      learnedAt: Date.now(),
    };

    this.state.skills.push(newSkill);
    this.saveState();
    console.log(`⚡ [PlayerState] 习得技能: ${newSkill.name} (等级 ${newSkill.level})`, newSkill.learnedFrom ? `来自: ${newSkill.learnedFrom}` : '');
    return newSkill;
  }

  /**
   * 提升技能等级
   */
  upgradeSkill(skillName: string, levelIncrease: number = 1): boolean {
    const skill = this.getSkillByName(skillName);
    
    if (!skill) {
      console.warn(`⚠️ [PlayerState] 技能不存在: ${skillName}`);
      return false;
    }

    skill.level += levelIncrease;
    this.saveState();
    console.log(`📈 [PlayerState] 技能升级: ${skillName} → 等级 ${skill.level}`);
    return true;
  }

  /**
   * 移除技能
   */
  removeSkill(skillId: string): boolean {
    const index = this.state.skills.findIndex(skill => skill.id === skillId);
    
    if (index === -1) {
      console.warn(`⚠️ [PlayerState] 技能不存在: ${skillId}`);
      return false;
    }

    const skill = this.state.skills[index];
    this.state.skills.splice(index, 1);
    this.saveState();
    console.log(`🗑️ [PlayerState] 移除技能: ${skill.name}`);
    return true;
  }

  // ==================== 调试工具 ====================

  /**
   * 打印当前状态摘要
   */
  printSummary(): void {
    console.log('📊 [PlayerState] 当前状态摘要:');
    console.log('├─ 玩家:', this.state.playerName);
    console.log('├─ 物品:', this.state.inventory.length, '件');
    this.state.inventory.forEach(item => {
      console.log(`│  └─ ${item.name}${item.quantity ? ` x${item.quantity}` : ''}`);
    });
    console.log('├─ 线索:', this.state.clues.length, '条');
    this.state.clues.forEach(clue => {
      console.log(`│  └─ ${clue.title}`);
    });
    console.log('└─ 技能:', this.state.skills.length, '个');
    this.state.skills.forEach(skill => {
      console.log(`   └─ ${skill.name} (Lv.${skill.level})`);
    });
  }
}

// 导出单例
export const playerStateManager = new PlayerStateManager();
