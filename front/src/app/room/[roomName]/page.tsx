'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import MarbleIcon from '@/components/MarbleIcon';
import { useRoomPlayers } from '@/hooks/useRoomPlayers';
import { closeWebSocketConnection } from '@/utils/websocket';
import { clearRoomFromLocalStorage, getPlayerName } from '@/utils/localStorage';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomName = params.roomName as string;
  const [isConnected, setIsConnected] = useState(false);
  const [currentPlayerName, setCurrentPlayerName] = useState<string | null>(null);

  const {
    players,
    roomData,
    loading: playersLoading,
    playerCount
  } = useRoomPlayers(roomName);

  useEffect(() => {
    // Récupérer le nom du joueur actuel
    const playerName = getPlayerName();
    setCurrentPlayerName(playerName);

    setTimeout(() => {
      setIsConnected(true);
    }, 1000);
  }, [roomName]);

  const handleLeaveRoom = () => {
    try {
      // Nettoyer les données de la room du localStorage
      clearRoomFromLocalStorage();
      console.log('Données de room supprimées lors de la sortie');

      // Fermer la connexion WebSocket
      closeWebSocketConnection();
      console.log('Connexion WebSocket fermée lors de la sortie');

      // Naviguer vers la page d'accueil
      router.push('/');
    } catch (error) {
      console.error('❌ Erreur lors de la sortie de la room:', error);
      // Naviguer quand même vers la page d'accueil
      router.push('/');
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <MarbleIcon className="w-16 h-16 mx-auto mb-4" animate={true} />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Connexion à la room...
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Chargement de &ldquo;{roomName}&rdquo;
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <MarbleIcon className="w-8 h-8 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {roomName}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {playerCount} joueur(s) connecté(s) • État: {roomData?.state || 'Inconnue'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLeaveRoom}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
            >
              Quitter
            </button>
          </div>
        </div>
      </header>

      {/* Zone de jeu principale */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Panneau des joueurs */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Joueurs ({playerCount})
              </h3>

              {playersLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-gray-600 dark:text-gray-300 text-sm">Chargement...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {players.length === 0 ? (
                    <div className="text-center py-8">
                      <MarbleIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Aucun joueur dans cette room pour le moment.
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                        Les joueurs apparaîtront ici quand ils rejoindront la room.
                      </p>
                    </div>
                  ) : (
                    players.map((player, index) => (
                      <div
                        key={index}
                        className={`flex items-center p-3 rounded-lg transition-colors ${
                          player.name === currentPlayerName
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800'
                            : 'bg-gray-50 dark:bg-gray-700'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          player.name === currentPlayerName
                            ? 'bg-blue-500'
                            : 'bg-gray-400'
                        }`}>
                          <span className="text-white font-medium text-sm">
                            {player.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <span className="text-gray-900 dark:text-white font-medium">
                            {player.name}
                          </span>
                          {player.name === currentPlayerName && (
                            <span className="ml-2 text-blue-600 dark:text-blue-400 text-xs font-medium">
                              (Vous)
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Bouton pour démarrer la course */}
              <button
                disabled={playerCount < 2 || roomData?.state !== 'waiting'}
                className="w-full mt-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100"
              >
                {roomData?.state === 'in-game' ? '🏃 Course en cours...' :
                 roomData?.state === 'finished' ? '🏆 Course terminée' :
                 playerCount < 2 ? `🏁 Attente de joueurs (${playerCount}/2 min)` :
                 '🏁 Démarrer la course'}
              </button>

              {playerCount < 2 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                  Il faut au moins 2 joueurs pour démarrer une course
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
