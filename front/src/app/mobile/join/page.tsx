'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MarbleIcon from '@/components/MarbleIcon';
import validateRoomName from '@/utils/validateRoomName';
import { joinRoom } from '@/utils/websocket';

export default function MobileJoinPage() {
  const [playerName, setPlayerName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [validationErrors, setValidationErrors] = useState({ player: '', room: '' });
  const router = useRouter();
  const searchParams = useSearchParams();

  const roomFromUrl = searchParams.get('room');
  if (roomFromUrl && !roomName) {
    setRoomName(roomFromUrl);
  }

  const handlePlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setPlayerName(value);
    setValidationErrors(prev => ({ ...prev, player: '' }));
  };

  const handleRoomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === '' || validateRoomName(value)) {
      setRoomName(value);
      setValidationErrors(prev => ({ ...prev, room: '' }));
    } else {
      setValidationErrors(prev => ({
        ...prev,
        room: 'Seules les lettres et les chiffres sont autorisés'
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!playerName.trim() || !roomName.trim() || !validateRoomName(roomName) ||
        validationErrors.player || validationErrors.room) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('Rejoindre la room:', { playerName, roomName });
      const joinRoomStatus = await joinRoom(roomName, playerName);
      if (!joinRoomStatus.success) {
        setJoinError((joinRoomStatus.response.payload as { error?: string }).error || 'Erreur lors de la connexion');
        return;
      }

      // Redirection vers la page de salle d'attente après un join réussi
      console.log('✅ Connexion réussie, redirection vers la salle d\'attente');
      router.push(`/mobile/waiting-room/${encodeURIComponent(roomName)}`);
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setJoinError('Erreur lors de la connexion à la room');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900 p-4">
      <div className="max-w-sm mx-auto pt-8">
        {/* Header mobile optimisé */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <MarbleIcon className="w-12 h-12" animate={true} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Rejoindre une partie
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm px-4">
            Choisissez votre nom de joueur et rejoignez la course !
          </p>
        </div>

        {/* Formulaire mobile */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Nom du joueur */}
            <div>
              <label
                htmlFor="playerName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                👤 Votre nom de joueur
              </label>
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={handlePlayerNameChange}
                placeholder="Joueur123"
                className={`w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors ${
                  validationErrors.player
                    ? 'border-red-500 dark:border-red-400 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                }`}
                required
                maxLength={20}
                disabled={isLoading}
              />
              {validationErrors.player && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                  {validationErrors.player}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Maximum 20 caractères • Lettres et chiffres uniquement
              </p>
            </div>

            {/* Nom de la room */}
            <div>
              <label
                htmlFor="roomName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                🏠 Code de la room
              </label>
              <input
                id="roomName"
                type="text"
                value={roomName}
                onChange={handleRoomNameChange}
                placeholder="room123"
                className={`w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors ${
                  validationErrors.room
                    ? 'border-red-500 dark:border-red-400 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                }`}
                required
                maxLength={10}
                disabled={isLoading || !!roomFromUrl}
              />
              {validationErrors.room && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                  {validationErrors.room}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {roomFromUrl ? 'Room spécifiée dans le lien' : 'Maximum 10 caractères • Lettres et chiffres uniquement'}
              </p>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={
                !playerName.trim() ||
                !roomName.trim() ||
                isLoading ||
                !!validationErrors.player ||
                !!validationErrors.room ||
                !validateRoomName(roomName)
              }
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Connexion...
                </div>
              ) : (
                '🚀 Rejoindre la course !'
              )}
            </button>
            {/* Affichage des erreurs de connexion */}
            {joinError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="text-red-400 text-lg">⚠️</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Erreur de connexion
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      {joinError}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Instructions mobiles */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
            💡 Comment ça marche ?
          </h3>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Choisissez un nom de joueur unique</li>
            <li>• Rentrez le code affiché sur la télévision</li>
            <li>• Rejoignez et attendez le début de la course !</li>
          </ul>
        </div>

        {/* Lien pour revenir à l'accueil */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium underline"
          >
            ← Retour à l&apos;accueil
          </button>
        </div>
      </div>
    </div>
  );
}
