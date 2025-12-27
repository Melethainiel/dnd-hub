import React, { useState } from 'react';
import { Session } from '../types';
import { Upload, Trash2 } from 'lucide-react';

interface SessionFormProps {
  initialSession?: Session;
  onSubmit: (data: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function SessionForm({ initialSession, onSubmit, onCancel }: SessionFormProps) {
  const [sessionNumber, setSessionNumber] = useState(initialSession?.number || 1);
  const [sessionDate, setSessionDate] = useState(
    initialSession?.sessionDate 
      ? new Date(initialSession.sessionDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [summary, setSummary] = useState(initialSession?.summary || '');
  const [privateNotes, setPrivateNotes] = useState(initialSession?.privateNotes || '');
  const [publicNotes, setPublicNotes] = useState(initialSession?.publicNotes || '');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isPublished, setIsPublished] = useState(initialSession?.isPublished || false);
  const [nextSessionDate, setNextSessionDate] = useState(
    initialSession?.nextSessionDate
      ? new Date(initialSession.nextSessionDate).toISOString().split('T')[0]
      : ''
  );
  const [nextSessionTheme, setNextSessionTheme] = useState(initialSession?.nextSessionTheme || '');

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      number: sessionNumber,
      sessionDate: new Date(sessionDate),
      summary,
      privateNotes,
      publicNotes,
      isPublished,
      nextSessionDate: nextSessionDate ? new Date(nextSessionDate) : undefined,
      nextSessionTheme,
      hasPrivateNotes: !!privateNotes,
      campaignId: initialSession?.campaignId || '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Numéro de session
          </label>
          <input
            type="number"
            min="1"
            value={sessionNumber}
            onChange={(e) => setSessionNumber(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date de la session
          </label>
          <input
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📝 Résumé de la session
        </label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Décrivez les événements clés, les actions des joueurs..."
          rows={5}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🔐 Notes privées (MJ uniquement)
        </label>
        <textarea
          value={privateNotes}
          onChange={(e) => setPrivateNotes(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Secrets, plans futurs, jets cachés..."
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ✏️ Notes publiques (à partager avec les joueurs)
        </label>
        <textarea
          value={publicNotes}
          onChange={(e) => setPublicNotes(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Informations partagées avec les joueurs..."
          rows={3}
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            📢 Publier et partager avec les joueurs
          </span>
        </label>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-900 mb-4">🎲 Prochaine session</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date prévue
            </label>
            <input
              type="date"
              value={nextSessionDate}
              onChange={(e) => setNextSessionDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thème/Prérequis
            </label>
            <input
              type="text"
              value={nextSessionTheme}
              onChange={(e) => setNextSessionTheme(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Thème ou préparation recommandée"
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          🎙️ Transcription audio (optionnel)
        </label>
        <div className="relative">
          <input
            type="file"
            accept="audio/*"
            onChange={handleAudioUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              {audioFile ? audioFile.name : 'Cliquez pour sélectionner un fichier audio'}
            </p>
            <p className="text-xs text-gray-500 mt-1">MP3, WAV, M4A...</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
        >
          {initialSession ? 'Mettre à jour' : 'Créer la session'}
        </button>
      </div>
    </form>
  );
}