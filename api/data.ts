
import { put, list } from '@vercel/blob';

const DB_FILENAME = 'authex_db_v1.json';

export const config = {
  runtime: 'nodejs',
};

// Helper para obtener la base de datos actual desde el servidor
async function getLatestDB() {
  const { blobs } = await list();
  const dbBlob = blobs.find(b => b.pathname === DB_FILENAME);
  if (!dbBlob) return { users: [], shifts: [] };
  
  const response = await fetch(dbBlob.url, { cache: 'no-store' });
  if (!response.ok) return { users: [], shifts: [] };
  return await response.json();
}

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const data = await getLatestDB();
      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: 'Fetch failed', details: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { action, payload } = req.body;
      if (!action || !payload) {
        return res.status(400).json({ error: 'Missing action or payload' });
      }

      // LEER (En el servidor es mucho más rápido)
      const currentData = await getLatestDB();

      // MODIFICAR (Lógica centralizada)
      if (action === 'SAVE_USER') {
        const index = currentData.users.findIndex((u: any) => u.id === payload.id);
        if (index > -1) currentData.users[index] = payload;
        else currentData.users.push(payload);
      } 
      else if (action === 'DELETE_USER') {
        currentData.users = currentData.users.filter((u: any) => u.id !== payload.id);
        currentData.shifts = currentData.shifts.filter((s: any) => s.userId !== payload.id);
      }
      else if (action === 'SAVE_SHIFT') {
        const index = currentData.shifts.findIndex((s: any) => s.id === payload.id);
        if (index > -1) currentData.shifts[index] = payload;
        else currentData.shifts.push(payload);
      }

      // ESCRIBIR
      const { url } = await put(DB_FILENAME, JSON.stringify(currentData), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
      });

      return res.status(200).json({ success: true, url });
    } catch (error: any) {
      console.error("API Error:", error);
      return res.status(500).json({ error: 'Save failed', details: error.message });
    }
  }

  return res.status(405).end();
}
