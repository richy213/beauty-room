// lib/content.js — lectura/escritura del CMS usando Vercel Blob en producción
import { put, list } from "@vercel/blob";
import fs from "fs";
import path from "path";

const LOCAL_PATH = path.join(process.cwd(), "public", "site-content.json");
const BLOB_PATH  = "noreh-admin/site-content.json";

export async function readContent() {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list({ prefix: "noreh-admin/site-content" });
      if (blobs.length > 0) {
        const res = await fetch(blobs[0].url + "?t=" + Date.now());
        if (res.ok) return await res.json();
      }
    } catch {}
  }
  try {
    return JSON.parse(fs.readFileSync(LOCAL_PATH, "utf8"));
  } catch {
    return {};
  }
}

export async function writeContent(content) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN no configurado");
  }
  try {
    await put(BLOB_PATH, JSON.stringify(content, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
  } catch (err) {
    // Re-throw with full details so the admin can show them
    throw new Error(`Blob error: ${err.message}`);
  }
}
