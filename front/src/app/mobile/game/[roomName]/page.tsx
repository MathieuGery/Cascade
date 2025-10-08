'use client';
import React, { useState } from 'react';

const MobileGamePage = () => {
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [castingAnimation, setCastingAnimation] = useState<number | null>(null);

  // Simule le lancement d'un sort
  const castSpell = (cellIndex: number) => {
    setSelectedCell(cellIndex);
    setCastingAnimation(cellIndex);

    // Animation de cast
    setTimeout(() => {
      setCastingAnimation(null);
      setSelectedCell(null);
    }, 1000);
  };

  // Générer la grille 3x3
  const renderGrid = () => {
    const cells = [];
    for (let i = 0; i < 9; i++) {
      const isSelected = selectedCell === i;
      const isCasting = castingAnimation === i;

      cells.push(
        <div
          key={i}
          onClick={() => castSpell(i)}
          className={`
            relative aspect-square border-2 rounded-lg cursor-pointer
            transition-all duration-300 transform
            ${isCasting
              ? 'border-yellow-400 bg-gradient-to-br from-yellow-500/30 to-orange-500/30 scale-110 shadow-xl shadow-yellow-400/50'
              : isSelected
              ? 'border-blue-400 bg-gradient-to-br from-blue-500/20 to-purple-500/20'
              : 'border-gray-600 bg-gradient-to-br from-gray-800 to-gray-900 hover:border-gray-500 hover:scale-105'
            }
            active:scale-95
          `}
        >
          {/* Effet de magie */}
          {isCasting && (
            <div className="absolute inset-0 rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent animate-pulse" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-8 h-8 border-2 border-yellow-400 rounded-full animate-spin border-t-transparent" />
              </div>
            </div>
          )}

          {/* Numéro de case (optionnel pour debug) */}
          <div className="absolute top-1 left-1 text-xs text-gray-500 opacity-50">
            {i + 1}
          </div>

          {/* Icône de sort */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`
              text-3xl transition-all duration-300
              ${isCasting
                ? 'text-yellow-300 animate-bounce'
                : 'text-gray-400 group-hover:text-gray-300'
              }
            `}>
              ✨
            </div>
          </div>

          {/* Effet de particules lors du cast */}
          {isCasting && (
            <>
              <div className="absolute top-2 right-2 w-1 h-1 bg-yellow-400 rounded-full animate-ping" />
              <div className="absolute bottom-3 left-3 w-1 h-1 bg-blue-400 rounded-full animate-ping animation-delay-200" />
              <div className="absolute top-3 left-1/2 w-1 h-1 bg-purple-400 rounded-full animate-ping animation-delay-400" />
            </>
          )}
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
          🔮 Tableau de Sorts
        </h1>
        <p className="text-gray-400 text-sm">
          Touchez une case pour lancer un sort
        </p>
      </div>

      {/* Grille de sorts 3x3 */}
      <div className="max-w-md mx-auto">
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          {renderGrid()}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 max-w-md mx-auto">
        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
          <h4 className="text-sm font-medium text-gray-300 mb-2">🎮 Instructions</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Touchez une case pour lancer un sort</li>
            <li>• Observez sur l&apos;écran les effets du sort !</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MobileGamePage;
