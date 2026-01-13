interface ControlsProps {
  onNewGame: () => void;
  onSolve: () => void;
  onHint: () => void;
  onReset: () => void;
  onExport: () => void;
  onImport: () => void;
  gameMode: number;
}

/**
 * Controls component - Game control buttons and mode display
 */
const Controls = ({
  onNewGame,
  onSolve,
  onHint,
  onReset,
  onExport,
  onImport,
  gameMode
}: ControlsProps) => {
  return (
    <div className="bg-white/10 p-4 rounded-xl flex flex-wrap gap-4 items-center justify-center mb-6 backdrop-blur-sm border border-white/10">
      <button
        onClick={onNewGame}
        className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-5 rounded-lg transition-all active:scale-95 shadow-lg shadow-green-900/20"
      >
        新游戏 New Game
      </button>

      <div className="px-4 py-2 bg-black/20 rounded-lg border border-white/10">
        <span className="text-white/60 text-xs uppercase tracking-wider block mb-0.5">模式 Mode</span>
        <span className="text-white font-bold">Draw {gameMode}</span>
      </div>

      <button
        onClick={onSolve}
        className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-5 rounded-lg transition-all active:scale-95 shadow-lg shadow-purple-900/20"
      >
        求解 Solve
      </button>

      <button
        onClick={onHint}
        className="bg-amber-500 hover:bg-amber-400 text-white font-bold py-2 px-5 rounded-lg transition-all active:scale-95 shadow-lg shadow-amber-900/20"
      >
        提示 Hint
      </button>

      <button
        onClick={onReset}
        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-5 rounded-lg transition-all active:scale-95 shadow-lg shadow-blue-900/20"
      >
        重置 Reset
      </button>

      <button
        onClick={onExport}
        className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-5 rounded-lg transition-all active:scale-95 shadow-lg shadow-slate-900/20"
      >
        导出 Export
      </button>

      <button
        onClick={onImport}
        className="bg-slate-500 hover:bg-slate-400 text-white font-bold py-2 px-5 rounded-lg transition-all active:scale-95 shadow-lg shadow-slate-900/20"
      >
        导入 Import
      </button>
    </div>
  )
}

export default Controls
