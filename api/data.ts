
import { put, list } from '@vercel/blob';

const DB_FILENAME = 'authex_db_v1.json';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: any, res: any) {
  // Manejo de lectura (GET)
  if (req.method === 'GET') {
    try {
      console.log("[API] Listando blobs...");
      const { blobs } = await list();
      const dbBlob = blobs.find(b => b.pathname === DB_FILENAME);
      
      if (!dbBlob) {
        console.log("[API] No se encontró DB, devolviendo estado inicial.");
        return res.status(200).json({ users: [], shifts: [] });
      }

      console.log("[API] Recuperando datos desde:", dbBlob.url);
      const response = await fetch(dbBlob.url);
      const data = await response.json();
      return res.status(200).json(data);
    } catch (error: any) {
      console.error("Error en GET /api/data:", error);
      return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
    }
  }

  // Manejo de escritura (POST)
  if (req.method === 'POST') {
    try {
      console.log("[API] Recibiendo datos para guardar...");
      const newData = req.body;
      
      if (!newData) {
        return res.status(400).json({ error: 'Body missing' });
      }

      // IMPORTANTE: addRandomSuffix: false + allowOverwrite: true 
      // permite que el archivo funcione como una base de datos de un solo archivo.
      const { url } = await put(DB_FILENAME, JSON.stringify(newData), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
      });

      console.log("[API] Datos actualizados con éxito en:", url);
      return res.status(200).json({ success: true, url });
    } catch (error: any) {
      console.error("Error en POST /api/data:", error);
      return res.status(500).json({ error: 'Failed to save data', details: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
