// pages/api/img.js
// Proxy seguro: descarga imágenes de Drive usando el service account
// y las sirve al browser — así no necesitas compartir los archivos públicamente

import { google } from "googleapis";

const SERVICE_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Missing id" });

  try {
    const auth = new google.auth.JWT({
      email: SERVICE_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth });

    // Obtener el archivo como stream
    const response = await drive.files.get(
      { fileId: id, alt: "media" },
      { responseType: "stream" }
    );

    // Reenviar headers de tipo de contenido
    const contentType = response.headers["content-type"] || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");

    response.data.pipe(res);
  } catch (err) {
    console.error("Image proxy error:", err.message);
    res.status(500).json({ error: "Could not load image" });
  }
}
