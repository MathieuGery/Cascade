'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import MarbleIcon from '@/components/MarbleIcon';

export default function MobileHomePage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');

  const handleQuickJoin = () => {
    if (roomCode.trim()) {
      router.push(`/mobile/join?room=${encodeURIComponent(roomCode.trim())}`);
    } else {
      router.push('/mobile/join');
    }
  };

  const handleJoinWithoutCode = () => {
    router.push('/mobile/join');
  };

  const handleGoToDesktop = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900 p-4">
      <div className="max-w-sm mx-auto pt-8">
        {/* Header mobile optimisé */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <MarbleIcon className="w-16 h-16" animate={true} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Marble Race
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm px-4">
            Rejoignez une course de billes épique depuis votre téléphone !
          </p>
        </div>

        {/* Section principale */}
        <div className="space-y-4">
          {/* Accès rapide avec code */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">
              🎮 Rejoindre une partie
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="quickRoomCode"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Code de la room (optionnel)
                </label>
                <input
                  id="quickRoomCode"
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="ROOM123"
                  className="w-full px-4 py-3 text-lg text-center font-mono border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border-gray-300 dark:border-gray-600 focus:ring-blue-500 transition-colors"
                  maxLength={10}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                  Le code affiché sur l&apos;écran principal
                </p>
              </div>
              
              <button
                onClick={handleQuickJoin}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 text-lg"
              >
                {roomCode.trim() ? `🚀 Rejoindre ${roomCode.trim()}` : '🚀 Choisir une room'}
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
              📱 Comment jouer sur mobile
            </h3>
            <ol className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>1. 📺 Regardez l&apos;écran principal pour le code de room</li>
              <li>2. 📝 Entrez le code ci-dessus ou choisissez une room</li>
              <li>3. 🎮 Utilisez votre téléphone comme manette</li>
              <li>4. 🏆 Suivez la course en temps réel !</li>
            </ol>
          </div>

          {/* Autres options */}
          <div className="space-y-3">
            <button
              onClick={handleJoinWithoutCode}
              className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
            >
              🔍 Parcourir les rooms disponibles
            </button>

            <button
              onClick={handleGoToDesktop}
              className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              🖥️ Version desktop (créer une room)
            </button>
          </div>

          {/* Info téléphone */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              💡 Astuce mobile
            </h3>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              Gardez votre téléphone chargé et la connexion WiFi stable pour une expérience optimale.
              Votre téléphone sert de manette pour contrôler votre bille !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
