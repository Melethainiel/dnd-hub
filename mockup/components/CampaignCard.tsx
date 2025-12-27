import React from 'react';
import { Campaign } from '../types';
import { Users, Scroll } from 'lucide-react';

interface CampaignCardProps {
  campaign: Campaign;
  role: 'mj' | 'player';
  onClick: () => void;
}

export function CampaignCard({ campaign, role, onClick }: CampaignCardProps) {
  const sessionCount = campaign.sessions.length;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 p-6 cursor-pointer"
    >
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900">{campaign.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{campaign.universe}</p>
      </div>

      <p className="text-gray-700 text-sm mb-4 line-clamp-2">
        {campaign.description}
      </p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Scroll className="w-4 h-4" />
          <span>{sessionCount} session{sessionCount !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>
            {role === 'mj' ? `${campaign.players.length} joueur${campaign.players.length !== 1 ? 's' : ''}` : 'Joueur'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
          role === 'mj'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-purple-100 text-purple-800'
        }`}>
          {role === 'mj' ? '🔐 Maître de Jeu' : '👁️ Joueur'}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(campaign.updatedAt).toLocaleDateString('fr-FR')}
        </span>
      </div>
    </div>
  );
}