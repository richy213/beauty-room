// pages/api/admin/revalidate.js — fuerza regeneración ISR inmediata tras guardar
const ADMIN_TOKEN = process.env.ADMIN_PASSWORD || "noreh2025";

export default async function handler(req, res) {
  if (req.headers["x-admin-token"] !== ADMIN_TOKEN) {
    return res.status(401).json({ error: "No autorizado" });
  }
  try {
    await res.revalidate("/");
    res.status(200).json({ revalidated: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
