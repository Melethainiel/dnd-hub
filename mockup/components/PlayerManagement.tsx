import React, { useState } from 'react';
import { Campaign } from '../types';
import { Users, Plus, Copy, Trash2 } from 'lucide-react';

interface PlayerManagementProps {
  campaign: Campaign;
}

export function PlayerManagement({ campaign }: PlayerManagementProps) {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitedPlayers, setInvitedPlayers] = useState(campaign.players);
  const [inviteCode] = useState(campaign.id.substring(0, 8).toUpperCase());

  const handleInviteByEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail) {
      const newPlayer = {
        userId: Math.random().toString(36).substr(2, 9),
        email: inviteEmail,
        name: inviteEmail.split('@')[0],
        joinedAt: new Date(),
      };
      setInvitedPlayers([...invitedPlayers, newPlayer]);
      setInviteEmail('');
      setShowInvite(false);
    }
  };

  const handleRemovePlayer = (userId: string) => {
    setInvitedPlayers(invitedPlayers.filter(p => p.userId !== userId));
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-6 h-6" />
          Gestion des joueurs
        </h3>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          <Plus className="w-5 h-5" />
          Inviter un joueur
        </button>
      </div>

      {showInvite && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-4">Inviter un joueur</h4>
            
            <div className="mb-6">
              <h5 className="font-semibold text-gray-900 mb-2">Option 1: Partager le code d'invitation</h5>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteCode}
                  readOnly
                  className="flex-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg font-mono text-center"
                />
                <button
                  onClick={copyInviteCode}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  <Copy className="w-5 h-5" />
                  Copier
                </button>
              </div>
            </div>

            <div>
              <h5 className="font-semibold text-gray-900 mb-2">Option 2: Inviter par email</h5>
              <form onSubmit={handleInviteByEmail} className="flex gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@exemple.com"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  Inviter
                </button>
              </form>
            </div>
          </div>

          <button
            onClick={() => setShowInvite(false)}
            className="w-full text-center py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            Fermer
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        {invitedPlayers.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">Aucun joueur pour le moment</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Joueur</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rejoint le</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invitedPlayers.map((player) => (
                  <tr key={player.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {player.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {player.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(player.joinedAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleRemovePlayer(player.userId)}
                        className="text-rose-600 hover:text-rose-800 transition duration-200"
                        title="Retirer le joueur"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}