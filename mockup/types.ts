export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Player {
  userId: string;
  email: string;
  name: string;
  joinedAt: Date;
}

export interface Session {
  id: string;
  campaignId: string;
  number: number;
  sessionDate: Date;
  summary: string;
  privateNotes: string;
  publicNotes: string;
  hasPrivateNotes: boolean;
  isPublished: boolean;
  nextSessionDate?: Date;
  nextSessionTheme: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  universe: string;
  masterId: string;
  players: Player[];
  sessions: Session[];
  createdAt: Date;
  updatedAt: Date;
}