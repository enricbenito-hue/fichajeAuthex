
import { put, list, head } from '@vercel/blob';

// Nombre del archivo de base de datos en el storage
const DB_FILENAME = 'authex_db_v1.json';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // Manejo de lectura (GET)
  if (req.method === 'GET') {
    try {
      const { blobs } = await list();
      const dbBlob = blobs.find(b => b.pathname === DB_FILENAME);
      
      if (!dbBlob) {
        return new Response(JSON.stringify({ users: [], shifts: [] }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      }

      const response = await fetch(dbBlob.url);
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to fetch data' }), { status: 500 });
    }
  }

  // Manejo de escritura (POST)
  if (req.method === 'POST') {
    try {
      const newData = await req.json();
      // El método put de Vercel Blob sobrescribirá el archivo si usamos el mismo pathname
      // y configuramos addRandomSuffix: false
      const { url } = await put(DB_FILENAME, JSON.stringify(newData), {
        access: 'public',
        addRandomSuffix: false,
      });

      return new Response(JSON.stringify({ success: true, url }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to save data' }), { status: 500 });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}
