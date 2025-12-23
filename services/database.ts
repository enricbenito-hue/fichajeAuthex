
import { User, Shift } from '../types';

export const db = {
  async _fetchData(): Promise<{ users: User[], shifts: Shift[] }> {
    try {
      const res = await fetch('/api/data', { method: 'GET', cache: 'no-store' });
      if (!res.ok) throw new Error("Fallo al obtener datos");
      return await res.json();
    } catch (e) {
      console.error("[DB] Error en fetch:", e);
      return { users: [], shifts: [] };
    }
  },

  async _performAction(action: string, payload: any): Promise<void> {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }
  },

  async getAllUsers(): Promise<User[]> {
    const { users } = await this._fetchData();
    return users;
  },

  async saveUser(user: User): Promise<void> {
    await this._performAction('SAVE_USER', user);
  },

  async deleteUser(userId: string): Promise<void> {
    await this._performAction('DELETE_USER', { id: userId });
  },

  async getUserShifts(userId: string): Promise<Shift[]> {
    const { shifts } = await this._fetchData();
    return shifts.filter(s => s.userId === userId);
  },

  async getAllGlobalShifts(): Promise<Shift[]> {
    const { shifts } = await this._fetchData();
    return shifts;
  },

  async saveShift(shift: Shift): Promise<void> {
    await this._performAction('SAVE_SHIFT', shift);
  }
};
