// pages/api/portfolio.js
// Endpoint seguro: corre en el servidor, nunca expone credenciales al browser

import { getPortfolio, clearCache } from "../../lib/drive";

export default async function handler(req, res) {
  // Forzar actualización del caché con ?refresh=1
  if (req.query.refresh === "1") {
    clearCache();
  }

  try {
    const portfolio = await getPortfolio();

    // Cache HTTP de 1 hora en el browser / CDN de Vercel
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=600");
    res.status(200).json({ success: true, categories: portfolio });
  } catch (error) {
    console.error("Drive API error:", error.message);
    res.status(500).json({
      success: false,
      error: "No se pudo cargar el portfolio",
      categories: [],
    });
  }
}
