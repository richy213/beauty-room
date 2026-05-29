// pages/api/admin/upload.js
import fs from "fs";
import path from "path";

export const config = { api: { bodyParser: { sizeLimit: "10mb" } } };

const ADMIN_TOKEN = process.env.ADMIN_PASSWORD || "noreh2025";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  if (req.headers["x-admin-token"] !== ADMIN_TOKEN) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const { filename, data } = req.body;
  if (!filename || !data) return res.status(400).json({ error: "Missing filename or data" });

  const safe = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, "_");
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const base64 = data.replace(/^data:image\/\w+;base64,/, "");
  fs.writeFileSync(path.join(uploadsDir, safe), Buffer.from(base64, "base64"));

  res.status(200).json({ url: `/uploads/${safe}` });
}
