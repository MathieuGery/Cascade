'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import MarbleIcon from '@/components/MarbleIcon';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomName = params.roomName as string;
  const [isConnected, setIsConnected] = useState(false);
  const [players, setPlayers] = useState<string[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setIsConnected(true);
    }, 1000);
  }, [roomName]);

  const handleLeaveRoom = () => {
    router.push('/');
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
                  {players.length} joueur(s) connecté(s)
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
                Joueurs ({players.length})
              </h3>
              <div className="space-y-3">
                {players.map((player, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <MarbleIcon className="w-6 h-6 mr-3" />
                    <span className="text-gray-900 dark:text-white font-medium">
                      {player}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bouton pour démarrer la course */}
              <button className="w-full mt-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105">
                🏁 Démarrer la course
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
