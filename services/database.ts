
import { User, Shift } from '../types';

export const db = {
  async _fetchData(): Promise<{ users: User[], shifts: Shift[] }> {
    console.log("[DB] Iniciando fetch de datos desde /api/data...");
    try {
      const res = await fetch('/api/data', { cache: 'no-store' });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText || 'Fallo en la respuesta'}`);
      }
      const data = await res.json();
      console.log("[DB] Datos recibidos con éxito:", { users: data.users?.length, shifts: data.shifts?.length });
      return {
        users: data.users || [],
        shifts: data.shifts || []
      };
    } catch (e) {
      console.error("[DB] Error crítico al recuperar datos:", e);
      return { users: [], shifts: [] };
    }
  },

  async _saveData(data: { users: User[], shifts: Shift[] }): Promise<void> {
    console.log("[DB] Intentando guardar cambios en la nube...");
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText || 'Fallo al guardar'}`);
      }
      console.log("[DB] Cambios guardados correctamente.");
    } catch (e) {
      console.error("[DB] Error al persistir datos:", e);
      throw e;
    }
  },

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
    data.shifts = data.shifts.filter(s => s.userId !== userId);
    await this._saveData(data);
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
