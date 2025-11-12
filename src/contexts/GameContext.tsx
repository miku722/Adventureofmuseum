import { createContext, useContext, useState, ReactNode } from "react";
import { GameState, GameItem, Clue, Ability, NPC } from "../types/game";

interface GameContextType {
  gameState: GameState;
  updateGameState: (updater: (prev: GameState) => GameState) => void;
  addItem: (item: GameItem) => void;
  removeItem: (itemId: string) => void;
  hasItem: (itemId: string) => boolean;
  addClue: (clue: Clue) => void;
  addAbility: (ability: Ability) => void;
  updateNPCState: (npcId: string, updates: Partial<NPC>) => void;
  getNPC: (npcId: string) => NPC | undefined;
  completeQuest: (questId: string) => void;
  setLocation: (location: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>({
    inventory: [],
    clues: [],
    abilities: [],
    currentLocation: "market",
    completedQuests: [],
    npcStates: {},
  });

  const updateGameState = (updater: (prev: GameState) => GameState) => {
    setGameState(updater);
  };

  const addItem = (item: GameItem) => {
    setGameState((prev) => {
      // 检查是否已经有相同名称的物品
      const existingItem = prev.inventory.find((i) => i.name === item.name);
      
      if (existingItem) {
        // 如果已有该物品，增加数量
        console.log(`物品 ${item.name} 数量增加: ${existingItem.quantity || 1} → ${(existingItem.quantity || 1) + (item.quantity || 1)}`);
        return {
          ...prev,
          inventory: prev.inventory.map((i) =>
            i.name === item.name
              ? { ...i, quantity: (i.quantity || 1) + (item.quantity || 1) }
              : i
          ),
        };
      }
      
      // 如果没有该物品，添加新物品（确保有quantity字段）
      console.log(`物品 ${item.name} 已添加到背包 ×${item.quantity || 1}`);
      return {
        ...prev,
        inventory: [...prev.inventory, { ...item, quantity: item.quantity || 1 }],
      };
    });
  };

  const removeItem = (itemId: string) => {
    setGameState((prev) => ({
      ...prev,
      inventory: prev.inventory.filter((item) => item.id !== itemId),
    }));
  };

  const hasItem = (itemId: string) => {
    return gameState.inventory.some((item) => item.id === itemId);
  };

  const addClue = (clue: Clue) => {
    setGameState((prev) => {
      // 检查是否已经有这个线索
      if (prev.clues.some((c) => c.id === clue.id)) {
        console.log(`线索 ${clue.title} 已经获得`);
        return prev;
      }
      return {
        ...prev,
        clues: [...prev.clues, clue],
      };
    });
  };

  const addAbility = (ability: Ability) => {
    setGameState((prev) => {
      // 检查是否已经有这个能力
      if (prev.abilities.some((a) => a.id === ability.id)) {
        console.log(`能力 ${ability.name} 已经获得`);
        return prev;
      }
      return {
        ...prev,
        abilities: [...prev.abilities, ability],
      };
    });
  };

  const updateNPCState = (npcId: string, updates: Partial<NPC>) => {
    setGameState((prev) => ({
      ...prev,
      npcStates: {
        ...prev.npcStates,
        [npcId]: {
          ...prev.npcStates[npcId],
          ...updates,
        } as NPC,
      },
    }));
  };

  const getNPC = (npcId: string) => {
    return gameState.npcStates[npcId];
  };

  const completeQuest = (questId: string) => {
    setGameState((prev) => ({
      ...prev,
      completedQuests: [...prev.completedQuests, questId],
    }));
  };

  const setLocation = (location: string) => {
    setGameState((prev) => ({
      ...prev,
      currentLocation: location,
    }));
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        updateGameState,
        addItem,
        removeItem,
        hasItem,
        addClue,
        addAbility,
        updateNPCState,
        getNPC,
        completeQuest,
        setLocation,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}