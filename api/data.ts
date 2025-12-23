
import { put, list, del } from '@vercel/blob';

const USERS_FILE = 'authex_users_v2.json';
const SHIFT_PREFIX = 'authex_shifts_v2_';

export const config = {
  runtime: 'nodejs',
};

async function getFileContent(pathname: string, fallback: any = []) {
  const { blobs } = await list();
  const blob = blobs.find(b => b.pathname === pathname);
  if (!blob) return fallback;
  
  const response = await fetch(blob.url, { cache: 'no-store' });
  if (!response.ok) return fallback;
  return await response.json();
}

export default async function handler(req: any, res: any) {
  const { method, query, body } = req;

  if (method === 'GET') {
    try {
      const { type, userId } = query;

      // Caso 1: Solo usuarios
      if (type === 'users') {
        const users = await getFileContent(USERS_FILE, []);
        return res.status(200).json({ users });
      }

      // Caso 2: Turnos de un usuario específico
      if (type === 'shifts' && userId) {
        const shifts = await getFileContent(`${SHIFT_PREFIX}${userId}.json`, []);
        return res.status(200).json({ shifts });
      }

      // Caso 3: Carga global para Admin (Carga paralela)
      if (type === 'admin_all') {
        const users = await getFileContent(USERS_FILE, []);
        const { blobs } = await list();
        const shiftBlobs = blobs.filter(b => b.pathname.startsWith(SHIFT_PREFIX));
        
        const allShiftsResults = await Promise.all(
          shiftBlobs.map(async (b) => {
            const r = await fetch(b.url, { cache: 'no-store' });
            return r.ok ? await r.json() : [];
          })
        );
        
        const shifts = allShiftsResults.flat();
        return res.status(200).json({ users, shifts });
      }

      return res.status(400).json({ error: 'Invalid query parameters' });
    } catch (error: any) {
      return res.status(500).json({ error: 'Fetch failed', details: error.message });
    }
  }

  if (method === 'POST') {
    try {
      const { action, payload } = body;
      
      if (action === 'SAVE_USER') {
        const users = await getFileContent(USERS_FILE, []);
        const index = users.findIndex((u: any) => u.id === payload.id);
        if (index > -1) users[index] = payload;
        else users.push(payload);
        
        await put(USERS_FILE, JSON.stringify(users), {
          access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json'
        });
      } 
      else if (action === 'SAVE_SHIFT') {
        const filename = `${SHIFT_PREFIX}${payload.userId}.json`;
        const shifts = await getFileContent(filename, []);
        const index = shifts.findIndex((s: any) => s.id === payload.id);
        if (index > -1) shifts[index] = payload;
        else shifts.push(payload);
        
        await put(filename, JSON.stringify(shifts), {
          access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json'
        });
      }
      else if (action === 'DELETE_USER') {
        // Borrar de la lista de usuarios
        const users = await getFileContent(USERS_FILE, []);
        const filteredUsers = users.filter((u: any) => u.id !== payload.id);
        await put(USERS_FILE, JSON.stringify(filteredUsers), {
          access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json'
        });
        
        // Intentar borrar su archivo de turnos si existe
        const { blobs } = await list();
        const userShiftBlob = blobs.find(b => b.pathname === `${SHIFT_PREFIX}${payload.id}.json`);
        if (userShiftBlob) {
          await del(userShiftBlob.url);
        }
      }

      return res.status(200).json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: 'Action failed', details: error.message });
    }
  }

  return res.status(405).end();
}
