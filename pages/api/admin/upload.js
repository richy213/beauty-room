// pages/api/admin/upload.js
// Client upload: el archivo va directo del browser a Vercel Blob (sin límite de 4.5 MB)
import { handleUpload } from "@vercel/blob/client";

const ADMIN_TOKEN = process.env.ADMIN_PASSWORD || "noreh2025";

export default async function handler(req, res) {
  try {
    const body = await handleUpload({
      request: req,
      response: res,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // clientPayload contiene el token del admin enviado desde el browser
        if (clientPayload !== ADMIN_TOKEN) {
          throw new Error("No autorizado");
        }
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
        };
      },
      onUploadCompleted: async () => {},
    });
    return res.status(200).json(body);
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
}
