'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MarbleIcon from '@/components/MarbleIcon';
import validateRoomName from '@/utils/validateRoomName';

export default function Home() {
  const [roomName, setRoomName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const router = useRouter();

  const handleRoomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === '' || validateRoomName(value)) {
      setRoomName(value);
      setValidationError('');
    } else {
      setValidationError('Seules les lettres et les chiffres sont autorisés');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || !validateRoomName(roomName) || validationError) return;

    setIsLoading(true);

    try {
      console.log('Création de la room:', roomName);

      await new Promise(resolve => setTimeout(resolve, 1000));

      router.push(`/room/${encodeURIComponent(roomName.trim())}`);
    } catch (error) {
      console.error('Erreur lors de la création de la room:', error);
      alert('Erreur lors de la création de la room');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <MarbleIcon className="w-16 h-16" animate={true} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Marble Race
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Créez une room et défiez vos amis dans des courses de billes épiques !
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="roomName" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Nom de la room
              </label>
              <input
                id="roomName"
                type="text"
                value={roomName}
                onChange={handleRoomNameChange}
                placeholder="MonSuperJeu123"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors ${
                  validationError 
                    ? 'border-red-500 dark:border-red-400 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                }`}
                required
                maxLength={10}
                disabled={isLoading}
              />
              {validationError && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                  {validationError}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Maximum 10 caractères • Lettres et chiffres uniquement
              </p>
            </div>

            <button
              type="submit"
              disabled={!roomName.trim() || isLoading || !!validationError || !validateRoomName(roomName)}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Création en cours...
                </div>
              ) : (
                'Créer la room'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
