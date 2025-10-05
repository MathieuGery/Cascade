'use client';

import { useRoomPlayers } from '@/hooks/useRoomPlayers';
import { useState } from 'react';

interface PlayersListProps {
  roomName: string;
}

export default function PlayersList({ roomName }: PlayersListProps) {
  const {
    players,
    roomData,
    loading,
    addPlayer,
    removePlayer,
    updateRoomState,
    hasPlayer,
    playerCount
  } = useRoomPlayers(roomName);

  const [newPlayerName, setNewPlayerName] = useState('');

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlayerName.trim() && !hasPlayer(newPlayerName.trim())) {
      addPlayer(newPlayerName.trim());
      setNewPlayerName('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-300">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Room: {roomData?.name || roomName}
        </h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">État:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            roomData?.state === 'waiting' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
            roomData?.state === 'in-game' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
          }`}>
            {roomData?.state || 'Inconnue'}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Joueurs connectés ({playerCount})
        </h3>

        {players.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 italic">
            Aucun joueur dans cette room pour le moment.
          </p>
        ) : (
          <div className="space-y-2">
            {players.map((player, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-medium text-sm">
                      {player.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {player.name}
                  </span>
                </div>
                <button
                  onClick={() => removePlayer(player.name)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                >
                  Retirer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleAddPlayer} className="mb-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="Nom du joueur"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            maxLength={20}
          />
          <button
            type="submit"
            disabled={!newPlayerName.trim() || hasPlayer(newPlayerName.trim())}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors"
          >
            Ajouter
          </button>
        </div>
        {newPlayerName.trim() && hasPlayer(newPlayerName.trim()) && (
          <p className="text-red-500 text-sm mt-1">Ce joueur est déjà présent dans la room</p>
        )}
      </form>

      <div className="flex space-x-2">
        <button
          onClick={() => updateRoomState('waiting')}
          className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-md transition-colors"
        >
          En attente
        </button>
        <button
          onClick={() => updateRoomState('in-game')}
          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-md transition-colors"
        >
          En jeu
        </button>
        <button
          onClick={() => updateRoomState('finished')}
          className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-md transition-colors"
        >
          Terminé
        </button>
      </div>

      {roomData && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Dernière mise à jour: {new Date(roomData.lastUpdated).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
