
import { User, Shift } from '../types';

export const db = {
  async getAllUsers(): Promise<User[]> {
    try {
      const res = await fetch('/api/data?type=users', { cache: 'no-store' });
      const data = await res.json();
      return data.users || [];
    } catch (e) {
      console.error("[DB] Error fetching users:", e);
      return [];
    }
  },

  async getUserShifts(userId: string): Promise<Shift[]> {
    try {
      const res = await fetch(`/api/data?type=shifts&userId=${userId}`, { cache: 'no-store' });
      const data = await res.json();
      return data.shifts || [];
    } catch (e) {
      console.error("[DB] Error fetching user shifts:", e);
      return [];
    }
  },

  async getAllGlobalShifts(): Promise<Shift[]> {
    try {
      const res = await fetch('/api/data?type=admin_all', { cache: 'no-store' });
      const data = await res.json();
      return data.shifts || [];
    } catch (e) {
      console.error("[DB] Error fetching global data:", e);
      return [];
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

  async saveUser(user: User): Promise<void> {
    await this._performAction('SAVE_USER', user);
  },

  async deleteUser(userId: string): Promise<void> {
    await this._performAction('DELETE_USER', { id: userId });
  },

  async saveShift(shift: Shift): Promise<void> {
    await this._performAction('SAVE_SHIFT', shift);
  }
};
