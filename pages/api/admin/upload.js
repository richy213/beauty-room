// pages/api/admin/upload.js
import { handleUpload } from "@vercel/blob/client";

const ADMIN_TOKEN = process.env.ADMIN_PASSWORD || "noreh2025";

export default async function handler(req, res) {
  try {
    const body = await handleUpload({
      body: req.body, // Pages Router requiere pasar el body explícito
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (clientPayload !== ADMIN_TOKEN) {
          throw new Error("No autorizado");
        }
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
        };
      },
      onUploadCompleted: async () => {},
    });
    return res.json(body);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}
