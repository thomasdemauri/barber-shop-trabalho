import { EMPTY_PREFERENCES, type UserPreferences, type UserPreferencesRepository } from '../domain/user-preferences.js';

export class GetPreferences {
  constructor(private readonly preferences: UserPreferencesRepository) {}

  async execute(userId: string): Promise<UserPreferences> {
    return (await this.preferences.findByUserId(userId)) ?? EMPTY_PREFERENCES;
  }
}

/** Partial update: only the sections present in the input are replaced. */
export class UpdatePreferences {
  constructor(private readonly preferences: UserPreferencesRepository) {}

  async execute(userId: string, changes: Partial<UserPreferences>): Promise<UserPreferences> {
    const current = (await this.preferences.findByUserId(userId)) ?? EMPTY_PREFERENCES;
    const next: UserPreferences = {
      haircut: changes.haircut !== undefined ? changes.haircut : current.haircut,
      notifications: changes.notifications !== undefined ? changes.notifications : current.notifications,
      payment: changes.payment !== undefined ? changes.payment : current.payment,
    };
    await this.preferences.save(userId, next);
    return next;
  }
}
