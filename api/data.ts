
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
      
      // Fetch con no-cache para evitar recibir errores HTML cacheados
      const response = await fetch(dbBlob.url, { cache: 'no-store' });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Blob URL returned ${response.status}: ${text.substring(0, 100)}`);
      }

      const text = await response.text();
      try {
        const data = JSON.parse(text);
        return res.status(200).json(data);
      } catch (parseError) {
        console.error("[API] El contenido del blob no es JSON válido:", text.substring(0, 200));
        throw new Error("Blob content is not a valid JSON");
      }
      
    } catch (error: any) {
      console.error("Error en GET /api/data:", error);
      return res.status(500).json({ 
        error: 'Failed to fetch data', 
        details: error.message 
      });
    }
  }

  // Manejo de escritura (POST)
  if (req.method === 'POST') {
    try {
      console.log("[API] Recibiendo datos para guardar...");
      const newData = req.body;
      
      if (!newData || typeof newData !== 'object') {
        return res.status(400).json({ error: 'Invalid data format' });
      }

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
