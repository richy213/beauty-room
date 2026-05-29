// pages/api/gallery/[id].js
// Carga imágenes de una categoría on-demand (cuando el usuario abre la galería)
import { getCategoryImages } from "../../../lib/drive";

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Missing id" });

  try {
    const images = await getCategoryImages(id);
    // Cache 1 hora en CDN / browser
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=600");
    res.status(200).json({ images });
  } catch (err) {
    console.error("Gallery load error:", err.message);
    res.status(500).json({ error: err.message, images: [] });
  }
}
