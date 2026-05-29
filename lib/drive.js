// lib/drive.js
import { google } from "googleapis";

const FOLDER_ID   = process.env.GOOGLE_DRIVE_FOLDER_ID;
const SERVICE_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

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

// Obtiene la URL de thumbnail más rápida disponible.
// thumbnailLink de la API → CDN lh3.googleusercontent.com (JPEG pre-generado, ~30KB)
// Fallback → drive.google.com/thumbnail (más lento para DNG/RAW)
function thumbUrl(file, size) {
  if (file.thumbnailLink) {
    // thumbnailLink tiene formato: https://lh3.googleusercontent.com/...=s220
    // Cambiamos el parámetro de tamaño al valor deseado
    return file.thumbnailLink.replace(/=s\d+$/, `=s${size}`);
  }
  return `https://drive.google.com/thumbnail?id=${file.id}&sz=w${size}`;
}

export async function getPortfolio() {
  if (memoryCache && memoryCacheTime && Date.now() - memoryCacheTime < CACHE_MS) {
    return memoryCache;
  }

  const auth = getAuthClient();
  const drive = google.drive({ version: "v3", auth });

  // 1. Subcarpetas = categorías
  const foldersRes = await drive.files.list({
    q: `'${FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id,name)",
    orderBy: "name",
  });

  const folders = foldersRes.data.files || [];

  // 2. Imágenes de cada carpeta en paralelo
  const categories = await Promise.all(
    folders.map(async (folder) => {
      const imagesRes = await drive.files.list({
        q: `'${folder.id}' in parents and (mimeType contains 'image/') and trashed=false`,
        fields: "files(id,name,thumbnailLink,mimeType)",
        orderBy: "name",
        pageSize: 50,
      });

      const images = imagesRes.data.files || [];

      return {
        id: folder.id,
        name: folder.name,
        cover: images[0] ? thumbUrl(images[0], 800)  : null,
        thumb: images[0] ? thumbUrl(images[0], 400)  : null,
        count: images.length,
        images: images.map((img) => ({
          id:    img.id,
          name:  img.name,
          url:   `/api/img?id=${img.id}`,   // proxy para lightbox (full-size)
          thumb: thumbUrl(img, 600),          // CDN rápido para la cuadrícula
        })),
      };
    })
  );

  const result = categories.filter((c) => c.count > 0);
  memoryCache = result;
  memoryCacheTime = Date.now();
  return result;
}

export function clearCache() {
  memoryCache = null;
  memoryCacheTime = null;
}
