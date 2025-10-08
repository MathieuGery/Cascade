'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import MarbleIcon from '@/components/MarbleIcon';
import { useRoomPlayers } from '@/hooks/useRoomPlayers';
import { getPlayerName } from '@/utils/localStorage';

export default function MobileGameStatusPage() {
  const params = useParams();
  const router = useRouter();
  const roomName = params.roomName as string;
  const [currentPlayerName, setCurrentPlayerName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

    // Vérifier si le joueur est bien dans cette room
    if (!playersLoading && playerName && !players.some(p => p.name === playerName)) {
      // Si le joueur n'est pas dans la room, le rediriger vers la page de join
      router.push(`/mobile/join?room=${encodeURIComponent(roomName)}`);
      return;
    }

    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [roomName, players, playersLoading, router]);

  // Redirection automatique vers la page de jeu mobile quand la partie commence
  useEffect(() => {
    if (roomData?.state === 'in-game' && !isLoading) {
      console.log('🎮 Jeu commencé, redirection vers la page de jeu mobile');
      router.push(`/mobile/game/${roomName}`);
    }
  }, [roomData?.state, isLoading, router, roomName]);

  const handleLeaveRoom = () => {
    // Retourner à la page de join
    router.push('/mobile/join');
  };

  if (isLoading || playersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center">
          <MarbleIcon className="w-16 h-16 mx-auto mb-4" animate={true} />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Chargement...
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Récupération du statut de la room
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900 p-4">
      <div className="max-w-sm mx-auto pt-8">
        {/* Header avec info de la room */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-4">
            <MarbleIcon className="w-12 h-12" animate={true} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Room: {roomName}
          </h1>
          <div className="flex items-center justify-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              roomData?.state === 'waiting' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
              roomData?.state === 'in-game' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
            }`}>
              {roomData?.state === 'waiting' ? '⏳ En attente' :
               roomData?.state === 'in-game' ? '🏃 En cours' :
               roomData?.state === 'finished' ? '🏆 Terminée' :
               '❓ Inconnue'}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {playerCount} joueur(s)
            </span>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
          {roomData?.state === 'waiting' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⏳</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                En attente du début
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                L&apos;organisateur va bientôt lancer la course. Restez connecté !
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <p className="text-blue-800 dark:text-blue-200 text-xs">
                  💡 Gardez votre téléphone à portée de main pour les contrôles
                </p>
              </div>
            </div>
          )}

          {roomData?.state === 'in-game' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏃</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Course en cours !
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                La course a commencé ! Suivez l&apos;action sur l&apos;écran principal.
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <p className="text-green-800 dark:text-green-200 text-xs">
                  🎮 Utilisez les contrôles pour diriger votre bille
                </p>
              </div>
            </div>
          )}

          {roomData?.state === 'finished' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Course terminée !
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Félicitations à tous les participants ! Consultez les résultats sur l&apos;écran.
              </p>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                <p className="text-purple-800 dark:text-purple-200 text-xs">
                  🎉 Merci d&apos;avoir participé à cette course !
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Liste des joueurs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Joueurs connectés ({playerCount})
          </h3>

          <div className="space-y-2">
            {players.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                Aucun joueur connecté
              </p>
            ) : (
              players.map((player, index) => (
                <div
                  key={index}
                  className={`flex items-center p-3 rounded-lg ${
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
                    <span className="text-gray-900 dark:text-white font-medium text-sm">
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
        </div>

        {/* Bouton de sortie */}
        <button
          onClick={handleLeaveRoom}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors mb-4"
        >
          🚪 Quitter la room (WIP)
        </button>

        {/* Info supplémentaire */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
            ℹ️ Informations
          </h3>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Cette page se met à jour automatiquement</li>
            <li>• Gardez l&apos;application ouverte pendant la course</li>
            <li>• En cas de problème, rejoignez la room à nouveau</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
