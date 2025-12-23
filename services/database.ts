
import { User, Shift } from '../types';

// Ahora este servicio consume nuestra API Serverless que gestiona Vercel Blob
export const db = {
  async _fetchData(): Promise<{ users: User[], shifts: Shift[] }> {
    try {
      const res = await fetch('/api/data');
      if (!res.ok) throw new Error('Error al cargar datos');
      return await res.json();
    } catch (e) {
      console.error("Database fetch error:", e);
      return { users: [], shifts: [] };
    }
  },

  async _saveData(data: { users: User[], shifts: Shift[] }): Promise<void> {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al guardar datos');
    } catch (e) {
      console.error("Database save error:", e);
      throw e;
    }
  },

  // --- USUARIOS ---
  async getAllUsers(): Promise<User[]> {
    const { users } = await this._fetchData();
    return users;
  },

  async saveUser(user: User): Promise<void> {
    const data = await this._fetchData();
    const index = data.users.findIndex(u => u.id === user.id);
    if (index > -1) {
      data.users[index] = user;
    } else {
      data.users.push(user);
    }
    await this._saveData(data);
  },

  async deleteUser(userId: string): Promise<void> {
    const data = await this._fetchData();
    data.users = data.users.filter(u => u.id !== userId);
    // También limpiamos sus turnos por integridad
    data.shifts = data.shifts.filter(s => s.userId !== userId);
    await this._saveData(data);
  },

  // --- TURNOS (SHIFTS) ---
  async getUserShifts(userId: string): Promise<Shift[]> {
    const { shifts } = await this._fetchData();
    return shifts.filter(s => s.userId === userId);
  },

  async getAllGlobalShifts(): Promise<Shift[]> {
    const { shifts } = await this._fetchData();
    return shifts;
  },

  async saveShift(shift: Shift): Promise<void> {
    const data = await this._fetchData();
    const index = data.shifts.findIndex(s => s.id === shift.id);
    if (index > -1) {
      data.shifts[index] = shift;
    } else {
      data.shifts.push(shift);
    }
    await this._saveData(data);
  }
};
