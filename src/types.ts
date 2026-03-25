export type UserRole = 'patient' | 'clinician';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  goalWeight?: number;
  startWeight?: number;
  points?: number;
  streak?: number;
  lastCheckIn?: string;
  createdAt: string;
  photoURL?: string;
  phase?: 'Phase 1' | 'Phase 2' | 'Maintenance';
  onboardingComplete?: boolean;
  focusAreas?: string[];
  clinicianRole?: string;
  organisation?: string;
  notifications?: {
    morningReminder: boolean;
    weeklySummary: boolean;
    teamMessages: boolean;
    goalAlerts: boolean;
  };
  referralSource?: string;
}

export interface WeightLog {
  id?: string;
  uid: string;
  weight: number;
  timestamp: string;
}

export interface DailyCheckIn {
  id?: string;
  uid: string;
  mood: number;
  hungerLevel: number;
  cravings: boolean;
  notes?: string;
  timestamp: string;
}

export interface FoodLog {
  id?: string;
  uid: string;
  mealName: string;
  photoUrl?: string;
  moodRating: number;
  hungerBefore: number;
  hungerAfter: number;
  timestamp: string;
}

export interface Badge {
  id?: string;
  uid: string;
  type: string;
  earnedAt: string;
}
