import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { MJSpace } from '../components/MJSpace';
import { PlayerSpace } from '../components/PlayerSpace';
import { ArrowLeft } from 'lucide-react';
import { Campaign } from '../types';
import { mockCampaigns } from '../data/mockData';

export function CampaignPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const campaign = mockCampaigns.find(c => c.id === campaignId);

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour au tableau de bord
          </button>
          <div className="text-center py-12">
            <p className="text-gray-600">Campagne non trouvée</p>
          </div>
        </main>
      </div>
    );
  }

  const isMJ = campaign.masterId === user?.id;
  const isPlayer = campaign.players.some(p => p.userId === user?.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour au tableau de bord
        </button>

        {isMJ ? (
          <MJSpace campaign={campaign} />
        ) : isPlayer ? (
          <PlayerSpace campaign={campaign} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Accès non autorisé</p>
          </div>
        )}
      </main>
    </div>
  );
}