import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { CampaignCard } from '../components/CampaignCard';
import { CreateCampaignModal } from '../components/CreateCampaignModal';
import { UpcomingSessions } from '../components/UpcomingSessions';
import { Plus } from 'lucide-react';
import { Campaign } from '../types';
import { mockCampaigns } from '../data/mockData';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateCampaign = (newCampaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => {
    const campaign: Campaign = {
      ...newCampaign,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCampaigns([...campaigns, campaign]);
    setShowCreateModal(false);
  };

  const handleSelectCampaign = (campaignId: string) => {
    navigate(`/campaign/${campaignId}`);
  };

  const mjCampaigns = campaigns.filter(c => c.masterId === user?.id);
  const playerCampaigns = campaigns.filter(c => 
    c.players.some(p => p.userId === user?.id)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Mes Campagnes</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            <Plus className="w-5 h-5" />
            Nouvelle Campagne
          </button>
        </div>

        {/* Upcoming Sessions */}
        <div className="mb-12">
          <UpcomingSessions campaigns={campaigns} />
        </div>

        {/* MJ Campaigns */}
        {mjCampaigns.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🔐 Campagnes en tant que Maître de Jeu
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mjCampaigns.map(campaign => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  role="mj"
                  onClick={() => handleSelectCampaign(campaign.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Player Campaigns */}
        {playerCampaigns.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              👁️ Campagnes en tant que Joueur
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {playerCampaigns.map(campaign => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  role="player"
                  onClick={() => handleSelectCampaign(campaign.id)}
                />
              ))}
            </div>
          </section>
        )}

        {campaigns.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Aucune campagne pour le moment</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
            >
              Créer votre première campagne
            </button>
          </div>
        )}
      </main>

      {showCreateModal && (
        <CreateCampaignModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateCampaign}
        />
      )}
    </div>
  );
}