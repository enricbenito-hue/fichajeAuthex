
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  createdAt: string;
}

export interface Shift {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  startLocation?: {
    latitude: number;
    longitude: number;
  };
  endLocation?: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
  aiSummary?: string;
}

export type AuthStatus = 'unauthenticated' | 'loading' | 'authenticated';
