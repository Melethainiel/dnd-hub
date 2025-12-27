import React from 'react';
import { Campaign } from '../types';
import { CalendarClock } from 'lucide-react';

interface UpcomingSessionsProps {
  campaigns: Campaign[];
}

export function UpcomingSessions({ campaigns }: UpcomingSessionsProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Collect all sessions with their campaign info
  const upcomingSessionsWithCampaign = campaigns
    .flatMap(campaign =>
      campaign.sessions
        .filter(session => new Date(session.sessionDate) >= today && session.nextSessionDate)
        .map(session => ({
          ...session,
          campaignName: campaign.name,
          campaignId: campaign.id,
          nextSessionDateObj: session.nextSessionDate ? new Date(session.nextSessionDate) : null,
        }))
    )
    .filter(session => session.nextSessionDateObj !== null)
    .sort((a, b) => (a.nextSessionDateObj?.getTime() || 0) - (b.nextSessionDateObj?.getTime() || 0))
    .slice(0, 5);

  if (upcomingSessionsWithCampaign.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <CalendarClock className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Prochaines Sessions</h2>
        </div>
        <p className="text-gray-600 text-center py-8">Aucune session prévue pour le moment</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-6">
        <CalendarClock className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900">Prochaines Sessions</h2>
      </div>

      <div className="space-y-4">
        {upcomingSessionsWithCampaign.map((session, idx) => (
          <div
            key={`${session.id}-${idx}`}
            className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100 hover:border-blue-300 transition duration-200"
          >
            <div className="text-2xl">🎲</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-lg truncate">
                {session.campaignName}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Session {session.number}
              </p>
              {session.nextSessionTheme && (
                <p className="text-sm text-blue-700 font-medium mt-2">
                  🎯 {session.nextSessionTheme}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                📅 {session.nextSessionDateObj?.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}