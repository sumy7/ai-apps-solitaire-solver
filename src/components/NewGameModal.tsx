import { DRAW_MODES } from '../constants/gameConstants';

interface NewGameModalProps {
  isOpen: boolean;
  onStartGame: (drawMode: number) => void;
  onCancel?: () => void;
  canCancel: boolean;
}

const NewGameModal = ({ isOpen, onStartGame, onCancel, canCancel }: NewGameModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-300">
        
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-slate-800">新游戏 New Game</h2>
          <p className="text-slate-500">选择抽牌模式以开始 Select Draw Mode to Start</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => onStartGame(DRAW_MODES.ONE)}
            className="group relative flex items-center justify-center p-6 rounded-xl border-2 border-green-100 bg-green-50 hover:bg-green-600 hover:border-green-600 transition-all duration-300"
          >
            <div className="text-center">
              <span className="block text-2xl font-bold text-green-700 group-hover:text-white mb-1">
                抽 1 张 (Draw 1)
              </span>
              <span className="text-sm text-green-600/70 group-hover:text-white/80">
                较简单 / Easier
              </span>
            </div>
          </button>

          <button
            onClick={() => onStartGame(DRAW_MODES.THREE)}
            className="group relative flex items-center justify-center p-6 rounded-xl border-2 border-blue-100 bg-blue-50 hover:bg-blue-600 hover:border-blue-600 transition-all duration-300"
          >
            <div className="text-center">
              <span className="block text-2xl font-bold text-blue-700 group-hover:text-white mb-1">
                抽 3 张 (Draw 3)
              </span>
              <span className="text-sm text-blue-600/70 group-hover:text-white/80">
                标准难度 / Standard
              </span>
            </div>
          </button>
        </div>

        {canCancel && onCancel && (
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 font-medium transition-colors"
          >
            取消 Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default NewGameModal;
