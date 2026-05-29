// pages/api/admin/content.js
import fs from "fs";
import path from "path";

const CONTENT_PATH = path.join(process.cwd(), "public", "site-content.json");
const ADMIN_TOKEN = process.env.ADMIN_PASSWORD || "noreh2025";

function checkAuth(req) {
  return req.headers["x-admin-token"] === ADMIN_TOKEN;
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const raw = fs.readFileSync(CONTENT_PATH, "utf8");
      res.status(200).json(JSON.parse(raw));
    } catch {
      res.status(200).json({});
    }
    return;
  }

  if (req.method === "POST") {
    if (!checkAuth(req)) {
      return res.status(401).json({ error: "No autorizado" });
    }
    try {
      const content = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      fs.writeFileSync(CONTENT_PATH, JSON.stringify(content, null, 2), "utf8");
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
