import React, { useState } from 'react';
import { Campaign } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SessionCalendarProps {
  campaigns: Campaign[];
}

export function SessionCalendar({ campaigns }: SessionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  // Collect all sessions with their campaign info
  const sessionsWithCampaign = campaigns.flatMap(campaign =>
    campaign.sessions.map(session => ({
      ...session,
      campaignName: campaign.name,
      campaignId: campaign.id,
    }))
  );

  // Group sessions by date
  const sessionsByDate = new Map<string, typeof sessionsWithCampaign>();
  sessionsWithCampaign.forEach(session => {
    const dateKey = new Date(session.sessionDate).toISOString().split('T')[0];
    if (!sessionsByDate.has(dateKey)) {
      sessionsByDate.set(dateKey, []);
    }
    sessionsByDate.get(dateKey)!.push(session);
  });

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days: (number | null)[] = Array(firstDay).fill(null);
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">📅 Calendrier des Sessions</h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="px-4 py-2 text-gray-900 font-semibold min-w-max capitalize">
            {monthName}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dateStr = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            day
          ).toISOString().split('T')[0];

          const sessionsOnDay = sessionsByDate.get(dateStr) || [];
          const isToday = new Date(dateStr).getTime() === today.getTime();
          const isPast = new Date(dateStr) < today;

          return (
            <div
              key={day}
              className={`aspect-square rounded-lg border-2 p-2 transition duration-200 ${
                isToday
                  ? 'bg-blue-100 border-blue-500'
                  : sessionsOnDay.length > 0
                  ? 'bg-green-50 border-green-300 hover:border-green-500'
                  : 'border-gray-200 hover:border-gray-300'
              } ${isPast && !isToday ? 'opacity-50' : ''}`}
            >
              <div className="text-sm font-semibold text-gray-900 mb-1">
                {day}
              </div>
              {sessionsOnDay.length > 0 && (
                <div className="space-y-1">
                  {sessionsOnDay.slice(0, 2).map((session, idx) => (
                    <div
                      key={`${session.id}-${idx}`}
                      className="text-xs bg-green-600 text-white px-1.5 py-0.5 rounded truncate"
                      title={`${session.campaignName} - Session ${session.number}`}
                    >
                      {session.campaignName.length > 10
                        ? session.campaignName.substring(0, 10) + '...'
                        : session.campaignName}
                    </div>
                  ))}
                  {sessionsOnDay.length > 2 && (
                    <div className="text-xs text-gray-600 px-1.5">
                      +{sessionsOnDay.length - 2} autre{sessionsOnDay.length - 2 > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sessionsWithCampaign.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-semibold text-gray-900 mb-4">📍 Prochaines Sessions</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {sessionsWithCampaign
              .filter(s => new Date(s.sessionDate) >= today)
              .sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime())
              .slice(0, 10)
              .map((session, idx) => (
                <div
                  key={`${session.id}-${idx}`}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200"
                >
                  <div className="text-xl">🎲</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {session.campaignName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Session {session.number} - {new Date(session.sessionDate).toLocaleDateString('fr-FR', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {sessionsWithCampaign.length === 0 && (
        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-gray-600">Aucune session planifiée pour le moment</p>
        </div>
      )}
    </div>
  );
}