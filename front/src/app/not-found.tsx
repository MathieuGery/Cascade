'use client';

import { useRouter } from 'next/navigation';
import MarbleIcon from '@/components/MarbleIcon';

export default function NotFound() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">

        {/* Animation de billes qui tombent */}
        <div className="mb-8 relative">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <div className="animate-bounce [animation-delay:0ms]">
              <MarbleIcon className="w-8 h-8" animate={false} />
            </div>
            <div className="animate-bounce [animation-delay:100ms]">
              <MarbleIcon className="w-10 h-10" animate={false} />
            </div>
            <div className="animate-bounce [animation-delay:200ms]">
              <MarbleIcon className="w-8 h-8" animate={false} />
            </div>
          </div>

          {/* Numéro 404 stylisé */}
          <div className="text-8xl font-bold text-gray-300 dark:text-gray-600 mb-4 select-none">
            404
          </div>
        </div>

        {/* Message principal */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Oups ! Page introuvable
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Il semblerait que cette bille ait roulé trop loin...
            La page que vous cherchez n&apos;existe pas ou a été déplacée.
          </p>

          {/* Boutons d'action */}
          <div className="space-y-3">
            <button
              onClick={handleGoHome}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              🏠 Retour à l&apos;accueil
            </button>

            <button
              onClick={handleGoBack}
              className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              ⬅️ Page précédente
            </button>
          </div>
        </div>

        {/* Suggestions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
            💡 Suggestions
          </h3>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 text-left">
            <li>• Vérifiez l&apos;URL dans la barre d&apos;adresse</li>
            <li>• Créez une nouvelle room depuis l&apos;accueil</li>
            <li>• Rejoignez une room existante via un lien</li>
          </ul>
        </div>

        {/* Footer amusant */}
        <div className="mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Même les meilleures billes se perdent parfois ! 🎱
          </p>
        </div>
      </div>
    </div>
  );
}
