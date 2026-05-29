// pages/api/admin/content.js
import { readContent, writeContent } from "../../../lib/content";

const ADMIN_TOKEN = process.env.ADMIN_PASSWORD || "noreh2025";

function checkAuth(req) {
  return req.headers["x-admin-token"] === ADMIN_TOKEN;
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    if (!checkAuth(req)) return res.status(401).json({ error: "No autorizado" });
    try {
      res.status(200).json(await readContent());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  if (req.method === "POST") {
    if (!checkAuth(req)) return res.status(401).json({ error: "No autorizado" });
    try {
      const content = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      await writeContent(content);
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
