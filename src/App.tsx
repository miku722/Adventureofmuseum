import { GameProvider } from "./contexts/GameContext";
import { GameManager } from "./components/GameManager";

export default function App() {
  return (
    <GameProvider>
      <div className="min-h-screen">
        <GameManager />
      </div>
    </GameProvider>
  );
}