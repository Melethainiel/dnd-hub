import React, { useState } from 'react';
import { Campaign } from '../types';
import { Eye } from 'lucide-react';

interface PlayerSpaceProps {
  campaign: Campaign;
}

export function PlayerSpace({ campaign }: PlayerSpaceProps) {
  const [selectedSession, setSelectedSession] = useState(campaign.sessions[0] || null);

  const publicSessions = campaign.sessions.filter(s => s.isPublished);

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 flex items-center gap-4">
        <Eye className="w-8 h-8 text-purple-600" />
        <div>
          <h2 className="text-2xl font-bold text-purple-900">{campaign.name}</h2>
          <p className="text-purple-700">{campaign.universe} - Espace Joueur</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📖 Résumés de Sessions</h3>
            {publicSessions.length === 0 ? (
              <p className="text-gray-600">Aucun résumé disponible pour le moment</p>
            ) : (
              <div className="space-y-2">
                {publicSessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className={`w-full text-left p-3 rounded-lg transition duration-200 ${
                      selectedSession?.id === session.id
                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                        : 'hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="font-semibold">Session {session.number}</div>
                    <div className="text-xs text-gray-600">
                      {new Date(session.sessionDate).toLocaleDateString('fr-FR')}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedSession ? (
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Session {selectedSession.number}
                </h3>
                <p className="text-gray-600">
                  {new Date(selectedSession.sessionDate).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">📝 Résumé</h4>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedSession.summary}
                  </p>
                </div>
              </div>

              {selectedSession.publicNotes && (
                <div className="border-t pt-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">✏️ Notes publiques</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedSession.publicNotes}
                  </p>
                </div>
              )}

              {selectedSession.nextSessionTheme && (
                <div className="border-t pt-4 bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-blue-900 mb-2">🎲 Prochaine session</h4>
                  <p className="text-blue-800">{selectedSession.nextSessionTheme}</p>
                  {selectedSession.nextSessionDate && (
                    <p className="text-sm text-blue-700 mt-2">
                      Prévue le {new Date(selectedSession.nextSessionDate).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-600">Sélectionnez une session pour voir les détails</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}