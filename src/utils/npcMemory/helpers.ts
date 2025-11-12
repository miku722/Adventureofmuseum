/**
 * NPC记忆系统 - 辅助函数
 */

import { npcMemoryManager } from './manager';
import { buildNPCSystemPrompt } from './prompt';
import { getNPCIdentity } from './npcDatabase';

/**
 * 获取NPC当前应该使用的SystemPrompt
 */
export function getNPCPrompt(npcId: string, playerName: string): string {
  const identity = getNPCIdentity(npcId);
  if (!identity) {
    console.error(`未找到NPC身份信息: ${npcId}`);
    return "";
  }
  
  const memory = npcMemoryManager.getMemory(npcId);
  return buildNPCSystemPrompt(identity, playerName, memory);
}

/**
 * 处理NPC对话后的记忆更新（async todo flow）
 */
export async function updateNPCMemoryAfterChat(
  npcId: string,
  playerMessage: string,
  npcResponse: string,
  learnedInfo?: string[],
  emotionChange?: string,
  relationshipDelta?: number,
  thinkingSteps?: string[]
): Promise<void> {
  // Record conversation (包含思考步骤)
  await npcMemoryManager.addConversation(npcId, playerMessage, npcResponse, thinkingSteps);

  // Update learned (过滤后)
  if (learnedInfo && learnedInfo.length > 0) {
    for (const info of learnedInfo) {
      await npcMemoryManager.learnInfo(npcId, info);
    }
  }

  // Update emotion
  if (emotionChange) {
    await npcMemoryManager.updateEmotion(npcId, emotionChange);
  }

  // Update relationship
  if (relationshipDelta !== undefined) {
    await npcMemoryManager.updateRelationship(npcId, relationshipDelta);
  }

  // 验证完整性
  const isValid = await npcMemoryManager.verifyIntegrity(npcId);
  if (!isValid) {
    console.warn(`⚠️ [NPC记忆] ${npcId} 记忆完整性检查失败`);
  }
}
