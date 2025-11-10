import { createContext, useContext, useState, ReactNode } from "react";
import { GameState, GameItem, Clue, Ability, NPC } from "../types/game";

interface GameContextType {
  gameState: GameState;
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

  const addItem = (item: GameItem) => {
    setGameState((prev) => {
      // 检查是否已经有这个物品
      if (prev.inventory.some((i) => i.id === item.id)) {
        console.log(`物品 ${item.name} 已经在背包中`);
        return prev;
      }
      return {
        ...prev,
        inventory: [...prev.inventory, item],
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