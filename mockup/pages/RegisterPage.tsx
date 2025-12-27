import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Dice6, ArrowLeft } from 'lucide-react';

export function RegisterPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center justify-center mb-8">
            <Dice6 className="w-8 h-8 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">CampaignHub</h1>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Mode Test
          </h2>
          <p className="text-gray-600 text-center mb-6">
            L'inscription n'est pas disponible en mode test
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">ℹ️ Mode Test Activé:</span> Pour tester l'application, veuillez sélectionner un profil sur la page de connexion.
            </p>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour à la sélection de profils
          </button>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Accédez à la page de connexion pour choisir votre profil de test.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}