import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, TEST_PROFILES } from '../context/AuthContext';
import { Dice6 } from 'lucide-react';

export function LoginPage() {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSelectProfile = async (userId: string) => {
    setIsLoading(true);
    try {
      await login(userId);
      navigate('/dashboard');
    } catch (err) {
      console.error('Erreur de connexion:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center justify-center mb-8">
            <Dice6 className="w-8 h-8 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">CampaignHub</h1>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Sélectionner un profil
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Choisissez un profil pour tester l'application
          </p>

          <div className="space-y-3">
            {TEST_PROFILES.map((profile) => (
              <button
                key={profile.id}
                onClick={() => handleSelectProfile(profile.id)}
                disabled={isLoading}
                className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{profile.name}</p>
                    <p className="text-sm text-gray-600">{profile.email}</p>
                  </div>
                  {profile.id.startsWith('user-') ? (
                    <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      🔐 Maître de Jeu
                    </span>
                  ) : (
                    <span className="text-xs font-semibold bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                      👁️ Joueur
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">💡 Mode Test:</span> Sélectionnez un profil pour commencer. Testez différents rôles (Maître de Jeu ou Joueur) pour explorer toutes les fonctionnalités.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}