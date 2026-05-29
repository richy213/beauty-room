// lib/drive.js
import { google } from "googleapis";

const FOLDER_ID     = process.env.GOOGLE_DRIVE_FOLDER_ID;
const SERVICE_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY   = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

// Caché en memoria (se resetea al redesplegar)
let portfolioCache    = null;
let portfolioCacheTime = null;
const catImageCache   = new Map(); // folderId → images[]
const CACHE_MS = (parseInt(process.env.CACHE_MINUTES) || 60) * 60 * 1000;

function auth() {
  return new google.auth.JWT({
    email: SERVICE_EMAIL,
    key: PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
}

// Devuelve la URL más rápida para thumbnails.
// thumbnailLink = CDN de Google (~30KB JPEG pre-generado, muy rápido)
function thumbUrl(file, size) {
  if (file.thumbnailLink) {
    return file.thumbnailLink.replace(/=s\d+$/, `=s${size}`);
  }
  return `https://drive.google.com/thumbnail?id=${file.id}&sz=w${size}`;
}

// getPortfolio — devuelve categorías SIN imágenes (carga rápida de página)
// Las imágenes se cargan on-demand por getCategoryImages()
export async function getPortfolio() {
  if (portfolioCache && portfolioCacheTime && Date.now() - portfolioCacheTime < CACHE_MS) {
    return portfolioCache;
  }

  const drive = google.drive({ version: "v3", auth: auth() });

  const foldersRes = await drive.files.list({
    q: `'${FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id,name)",
    orderBy: "name",
  });

  const folders = foldersRes.data.files || [];

  // Una sola llamada por carpeta: obtenemos cover y conteo juntos
  const categories = await Promise.all(
    folders.map(async (folder) => {
      const res = await drive.files.list({
        q: `'${folder.id}' in parents and (mimeType contains 'image/') and trashed=false`,
        fields: "files(id,name,thumbnailLink)",
        orderBy: "name",
        pageSize: 200,
      });
      const all = res.data.files || [];
      const cover = all[0];

      return {
        id:    folder.id,
        name:  folder.name,
        cover: cover ? thumbUrl(cover, 800) : null,
        thumb: cover ? thumbUrl(cover, 400) : null,
        count: all.length,
        images: [], // vacío — se cargan on-demand
      };
    })
  );

  const result = categories.filter((c) => c.count > 0);
  portfolioCache    = result;
  portfolioCacheTime = Date.now();
  return result;
}

// getCategoryImages — todas las imágenes de una carpeta (on-demand)
export async function getCategoryImages(folderId) {
  if (catImageCache.has(folderId)) return catImageCache.get(folderId);

  const drive = google.drive({ version: "v3", auth: auth() });

  const res = await drive.files.list({
    q: `'${folderId}' in parents and (mimeType contains 'image/') and trashed=false`,
    fields: "files(id,name,thumbnailLink)",
    orderBy: "name",
    pageSize: 200,
  });

  const images = (res.data.files || []).map((img) => ({
    id:    img.id,
    name:  img.name,
    url:   `/api/img?id=${img.id}`,
    thumb: thumbUrl(img, 600),
  }));

  catImageCache.set(folderId, images);
  return images;
}

export function clearCache() {
  portfolioCache    = null;
  portfolioCacheTime = null;
  catImageCache.clear();
}
