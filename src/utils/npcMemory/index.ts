/**
 * NPC记忆系统 - 统一导出
 * 
 * 使用示例：
 * ```typescript
 * import { npcMemoryManager, getNPCPrompt, updateNPCMemoryAfterChat } from '@/utils/npcMemory';
 * 
 * // 获取NPC记忆
 * const memory = npcMemoryManager.getMemory('vendor');
 * 
 * // 获取NPC prompt
 * const prompt = getNPCPrompt('vendor', '玩家名');
 * 
 * // 更新记忆
 * await updateNPCMemoryAfterChat('vendor', '玩家消息', 'NPC回复', ['新信息'], '开心', 5);
 * ```
 */

// 类型定义
export * from './types';

// NPC数据库
export * from './npcDatabase';

// 核心管理器
export { npcMemoryManager } from './manager';

// Prompt生成
export { buildNPCSystemPrompt } from './prompt';

// 辅助函数
export * from './helpers';
