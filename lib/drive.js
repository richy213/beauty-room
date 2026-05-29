// lib/drive.js
// Conexión segura con Google Drive usando cuenta de servicio
// La private_key NUNCA llega al navegador — solo corre en el servidor

import { google } from "googleapis";

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;
const SERVICE_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

// Cache en memoria del servidor (se resetea al redesplegar)
let memoryCache = null;
let memoryCacheTime = null;
const CACHE_MS = (parseInt(process.env.CACHE_MINUTES) || 60) * 60 * 1000;

function getAuthClient() {
  return new google.auth.JWT({
    email: SERVICE_EMAIL,
    key: PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
}

export async function getPortfolio() {
  // Devuelve caché si es reciente
  if (memoryCache && memoryCacheTime && Date.now() - memoryCacheTime < CACHE_MS) {
    return memoryCache;
  }

  const auth = getAuthClient();
  const drive = google.drive({ version: "v3", auth });

  // 1. Obtener subcarpetas (= categorías del portfolio)
  const foldersRes = await drive.files.list({
    q: `'${FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id,name)",
    orderBy: "name",
  });

  const folders = foldersRes.data.files || [];

  // 2. Para cada carpeta, obtener sus imágenes en paralelo
  const categories = await Promise.all(
    folders.map(async (folder) => {
      const imagesRes = await drive.files.list({
        q: `'${folder.id}' in parents and (mimeType='image/jpeg' or mimeType='image/png' or mimeType='image/webp') and trashed=false`,
        fields: "files(id,name,thumbnailLink)",
        orderBy: "name",
        pageSize: 50,
      });

      const images = imagesRes.data.files || [];

      return {
        id: folder.id,
        name: folder.name,
        // URL pública para mostrar la imagen
        cover: images[0] ? driveImageUrl(images[0].id, 600) : null,
        thumb: images[0] ? driveImageUrl(images[0].id, 300) : null,
        count: images.length,
        images: images.map((img) => ({
          id: img.id,
          name: img.name,
          url: driveImageUrl(img.id, 1200),
          thumb: driveImageUrl(img.id, 400),
        })),
      };
    })
  );

  const result = categories.filter((c) => c.count > 0);

  // Guardar en caché
  memoryCache = result;
  memoryCacheTime = Date.now();

  return result;
}

// URL para mostrar imágenes — usa el proxy del servidor (no requiere archivos públicos)
export function driveImageUrl(fileId, size = 800) {
  return `/api/img?id=${fileId}`;
}

// Forzar actualización del caché (útil para el botón de refresh)
export function clearCache() {
  memoryCache = null;
  memoryCacheTime = null;
}
