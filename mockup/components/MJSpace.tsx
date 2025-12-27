import React, { useState } from 'react';
import { Campaign, Session } from '../types';
import { SessionList } from './SessionList';
import { SessionForm } from './SessionForm';
import { PlayerManagement } from './PlayerManagement';
import { Lock, Users, Plus } from 'lucide-react';

interface MJSpaceProps {
  campaign: Campaign;
}

export function MJSpace({ campaign }: MJSpaceProps) {
  const [activeTab, setActiveTab] = useState<'sessions' | 'players'>('sessions');
  const [sessions, setSessions] = useState<Session[]>(campaign.sessions);
  const [showNewSession, setShowNewSession] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(sessions[0] || null);

  const handleAddSession = (sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSession: Session = {
      ...sessionData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSessions([...sessions, newSession]);
    setSelectedSession(newSession);
    setShowNewSession(false);
  };

  const handleUpdateSession = (updatedSession: Session) => {
    setSessions(sessions.map(s => s.id === updatedSession.id ? updatedSession : s));
    setSelectedSession(updatedSession);
    setEditingSession(null);
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
    if (selectedSession?.id === sessionId) {
      setSelectedSession(sessions[0] || null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex items-center gap-4">
        <Lock className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-blue-900">{campaign.name}</h2>
          <p className="text-blue-700">{campaign.universe} - Espace Maître de Jeu Privé</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition duration-200 ${
            activeTab === 'sessions'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📝 Sessions
        </button>
        <button
          onClick={() => setActiveTab('players')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition duration-200 ${
            activeTab === 'players'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Users className="w-5 h-5" />
          Joueurs
        </button>
      </div>

      {activeTab === 'sessions' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">Gestion des Sessions</h3>
            <button
              onClick={() => setShowNewSession(!showNewSession)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              <Plus className="w-5 h-5" />
              Nouvelle Session
            </button>
          </div>

          {showNewSession && (
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Créer une nouvelle session</h4>
              <SessionForm
                onSubmit={handleAddSession}
                onCancel={() => setShowNewSession(false)}
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📖 Sessions</h3>
                {sessions.length === 0 ? (
                  <p className="text-gray-600">Aucune session pour le moment</p>
                ) : (
                  <div className="space-y-2">
                    {sessions.map((session) => (
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
                  <div className="flex justify-between items-start">
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
                    <div className="flex gap-2">
                      {selectedSession.isPublished && (
                        <span className="text-xs font-semibold bg-green-100 text-green-800 px-3 py-1 rounded-full">
                          ✅ Publiée
                        </span>
                      )}
                      <button
                        onClick={() => setEditingSession(selectedSession)}
                        className="text-blue-600 hover:text-blue-800 font-semibold py-2 px-4 rounded-lg hover:bg-blue-50"
                      >
                        ✏️ Éditer
                      </button>
                      <button
                        onClick={() => handleDeleteSession(selectedSession.id)}
                        className="text-rose-600 hover:text-rose-800 font-semibold py-2 px-4 rounded-lg hover:bg-rose-50"
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>

                  {editingSession?.id === selectedSession.id ? (
                    <div className="border-t pt-4">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Éditer la session</h4>
                      <SessionForm
                        initialSession={editingSession}
                        onSubmit={(data) => handleUpdateSession({ ...editingSession, ...data, updatedAt: new Date() })}
                        onCancel={() => setEditingSession(null)}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="border-t pt-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">📝 Résumé</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {selectedSession.summary}
                        </p>
                      </div>

                      {selectedSession.privateNotes && (
                        <div className="border-t pt-4 bg-yellow-50 p-4 rounded-lg">
                          <h4 className="text-lg font-semibold text-yellow-900 mb-2">🔐 Notes privées (MJ uniquement)</h4>
                          <p className="text-yellow-800 whitespace-pre-wrap">
                            {selectedSession.privateNotes}
                          </p>
                        </div>
                      )}

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
                    </>
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
      )}

      {activeTab === 'players' && (
        <PlayerManagement campaign={campaign} />
      )}
    </div>
  );
}