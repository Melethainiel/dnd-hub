import React from 'react';
import { Session } from '../types';
import { Trash2, Edit2, Lock, Eye } from 'lucide-react';

interface SessionListProps {
  sessions: Session[];
  role: 'mj' | 'player';
  onEdit?: (session: Session) => void;
  onDelete?: (sessionId: string) => void;
}

export function SessionList({ sessions, role, onEdit, onDelete }: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-600">Aucune session pour le moment</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {sessions.map((session) => (
        <div key={session.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Session {session.number}</h3>
              <p className="text-sm text-gray-500">
                {new Date(session.sessionDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="flex gap-2">
              {session.isPublished && (
                <span className="flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  <Eye className="w-3 h-3" />
                  Publiée
                </span>
              )}
              {role === 'mj' && (
                <>
                  <button
                    onClick={() => onEdit?.(session)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Éditer"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDelete?.(session.id)}
                    className="text-rose-600 hover:text-rose-800"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {session.hasPrivateNotes && role === 'mj' && (
            <div className="flex items-center gap-2 text-xs bg-yellow-50 text-yellow-800 px-3 py-2 rounded mb-4 border border-yellow-200">
              <Lock className="w-4 h-4" />
              Contient des notes privées (MJ uniquement)
            </div>
          )}

          <p className="text-gray-700 text-sm line-clamp-3 mb-4">
            {session.summary}
          </p>

          {session.nextSessionTheme && (
            <div className="text-sm bg-blue-50 p-3 rounded border border-blue-200">
              <p className="font-semibold text-blue-900">Thème suivant:</p>
              <p className="text-blue-800">{session.nextSessionTheme}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}