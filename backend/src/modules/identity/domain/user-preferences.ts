export type HaircutPreferences = { style: string; beard: string; notes: string };
export type NotificationPreferences = {
  confirmation: boolean;
  reminder: boolean;
  promotions: boolean;
  cancellation: boolean;
  news: boolean;
};
export type PaymentPreferences = { preferredMethod: string; pixKey: string };

export type UserPreferences = {
  haircut: HaircutPreferences | null;
  notifications: NotificationPreferences | null;
  payment: PaymentPreferences | null;
};

export const EMPTY_PREFERENCES: UserPreferences = { haircut: null, notifications: null, payment: null };

export interface UserPreferencesRepository {
  findByUserId(userId: string): Promise<UserPreferences | null>;
  save(userId: string, preferences: UserPreferences): Promise<void>;
}
