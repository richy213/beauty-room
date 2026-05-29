// pages/admin.js — CMS para Noreh Beauty Room
import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { upload } from "@vercel/blob/client";

const TABS = ["Hero", "Sobre mí", "Valores", "Servicios", "Especialidades", "Testimonios", "Social"];
const G = { bg:"#0d0c0b", surface:"#171512", border:"rgba(201,185,154,0.15)", gold:"#C9B99A", text:"#FAF8F5", muted:"#9A9490" };

function Field({ label, value, onChange, textarea, type = "text", hint }) {
  return (
    <div style={{ marginBottom: "1.4rem" }}>
      <label style={{ display:"block", fontSize:"0.55rem", letterSpacing:"0.3em", textTransform:"uppercase", color:G.gold, marginBottom:"0.4rem" }}>{label}</label>
      {hint && <p style={{ fontSize:"0.6rem", color:G.muted, marginBottom:"0.4rem" }}>{hint}</p>}
      {textarea ? (
        <textarea value={value||""} onChange={e=>onChange(e.target.value)} rows={4}
          style={{ width:"100%", background:G.surface, border:`1px solid ${G.border}`, color:G.text, padding:"0.7rem 0.9rem", fontSize:"0.78rem", lineHeight:1.7, resize:"vertical", outline:"none", fontFamily:"inherit" }}/>
      ) : (
        <input type={type} value={value||""} onChange={e=>onChange(e.target.value)}
          style={{ width:"100%", background:G.surface, border:`1px solid ${G.border}`, color:G.text, padding:"0.7rem 0.9rem", fontSize:"0.78rem", outline:"none", fontFamily:"inherit" }}/>
      )}
    </div>
  );
}

function ImageField({ label, value, onChange, hint }) {
  const fileRef = useRef();
  const [preview, setPreview] = useState(value);

  useEffect(() => { setPreview(value); }, [value]);

  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const blob = await upload(`noreh-admin/${Date.now()}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
        clientPayload: sessionStorage.getItem("nbr-admin-token") || "",
      });
      setPreview(blob.url);
      onChange(blob.url);
    } catch (err) {
      alert("Error subiendo imagen: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginBottom:"1.4rem" }}>
      <label style={{ display:"block", fontSize:"0.55rem", letterSpacing:"0.3em", textTransform:"uppercase", color:G.gold, marginBottom:"0.4rem" }}>{label}</label>
      {hint && <p style={{ fontSize:"0.6rem", color:G.muted, marginBottom:"0.4rem" }}>{hint}</p>}
      {preview && (
        <div style={{ marginBottom:"0.5rem", position:"relative", display:"inline-block" }}>
          <img src={preview} style={{ width:"160px", height:"120px", objectFit:"cover", border:`1px solid ${G.border}` }} onError={e=>e.target.style.display="none"} />
        </div>
      )}
      <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
        <input type="text" placeholder="URL de imagen..." value={value||""} onChange={e=>{ onChange(e.target.value); setPreview(e.target.value); }}
          style={{ flex:1, minWidth:"0", background:G.surface, border:`1px solid ${G.border}`, color:G.text, padding:"0.6rem 0.8rem", fontSize:"0.75rem", outline:"none", fontFamily:"inherit" }}/>
        <button onClick={()=>!uploading && fileRef.current?.click()} style={{ flexShrink:0, background:"rgba(201,185,154,0.12)", border:`1px solid ${G.border}`, color:G.gold, padding:"0.6rem 1rem", fontSize:"0.6rem", letterSpacing:"0.2em", cursor:uploading?"wait":"pointer", textTransform:"uppercase", opacity:uploading?0.5:1 }}>
          {uploading ? "Subiendo..." : "Subir"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile}/>
      </div>
    </div>
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [tab, setTab] = useState(0);
  const [content, setContent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const t = sessionStorage.getItem("nbr-admin-token");
    if (t) { setAuthed(true); loadContent(t); }
  }, []);

  const loadContent = async (token) => {
    const res = await fetch("/api/admin/content", { headers:{"x-admin-token":token} });
    const j = await res.json();
    setContent(j);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/admin/content", { headers:{"x-admin-token":pw} });
    if (res.ok) {
      sessionStorage.setItem("nbr-admin-token", pw);
      setAuthed(true);
      setContent(await res.json());
    } else { setPwErr("Contraseña incorrecta"); }
  };

  const save = async () => {
    setSaving(true); setMsg("");
    const token = sessionStorage.getItem("nbr-admin-token") || "";
    const res = await fetch("/api/admin/content", {
      method:"POST",
      headers:{ "Content-Type":"application/json", "x-admin-token":token },
      body: JSON.stringify(content)
    });
    setSaving(false);
    if (res.ok) { setMsg("✓ Guardado"); }
    else { setMsg("✗ Error al guardar"); }
    setTimeout(()=>setMsg(""), 4000);
  };

  const set = (path, val) => {
    setContent(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj = next;
      keys.slice(0,-1).forEach(k => { if(!obj[k]) obj[k]={}; obj = isNaN(parseInt(k)) ? obj[k] : obj[parseInt(k)]; });
      const last = keys[keys.length-1];
      if(!isNaN(parseInt(last)) && Array.isArray(obj)) obj[parseInt(last)] = val;
      else obj[last] = val;
      return next;
    });
  };

  const navStyle = (i) => ({
    padding:"0.6rem 1rem", fontSize:"0.55rem", letterSpacing:"0.2em", textTransform:"uppercase",
    cursor:"pointer", border:"none", whiteSpace:"nowrap",
    background: tab===i ? "rgba(201,185,154,0.15)" : "transparent",
    color: tab===i ? G.gold : G.muted,
    borderBottom: tab===i ? `1px solid ${G.gold}` : "1px solid transparent",
    transition:"all 0.2s", fontFamily:"inherit"
  });

  if (!authed) return (
    <div style={{ minHeight:"100vh", background:G.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Montserrat',sans-serif", padding:"1rem" }}>
      <Head><title>Admin — Noreh Beauty Room</title></Head>
      <form onSubmit={handleLogin} style={{ width:"100%", maxWidth:"360px", padding:"clamp(1.5rem,6vw,3rem)", background:G.surface, border:`1px solid ${G.border}` }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.8rem", color:G.gold, marginBottom:"0.3rem", fontStyle:"italic" }}>Noreh Beauty Room</div>
        <div style={{ fontSize:"0.5rem", letterSpacing:"0.4em", textTransform:"uppercase", color:G.muted, marginBottom:"2rem" }}>Panel de administración</div>
        <label style={{ fontSize:"0.55rem", letterSpacing:"0.3em", textTransform:"uppercase", color:G.muted, display:"block", marginBottom:"0.4rem" }}>Contraseña</label>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} autoFocus
          style={{ width:"100%", background:"#0d0c0b", border:`1px solid ${G.border}`, color:G.text, padding:"0.8rem", fontSize:"0.85rem", outline:"none", marginBottom:"0.6rem", fontFamily:"inherit" }}/>
        {pwErr && <p style={{ color:"#e88", fontSize:"0.65rem", marginBottom:"0.8rem" }}>{pwErr}</p>}
        <button type="submit" style={{ width:"100%", background:G.gold, color:"#0d0c0b", border:"none", padding:"0.9rem", fontSize:"0.6rem", letterSpacing:"0.25em", textTransform:"uppercase", cursor:"pointer", fontWeight:500, fontFamily:"inherit" }}>
          Entrar
        </button>
      </form>
    </div>
  );

  if (!content) return (
    <div style={{ minHeight:"100vh", background:G.bg, display:"flex", alignItems:"center", justifyContent:"center", color:G.muted, fontFamily:"'Montserrat',sans-serif", fontSize:"0.7rem", letterSpacing:"0.3em" }}>
      Cargando...
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:G.bg, fontFamily:"'Montserrat',sans-serif", color:G.text }}>
      <Head><title>Admin CMS — Noreh Beauty Room</title></Head>

      {/* Header */}
      <div className="adm-header" style={{ background:G.surface, borderBottom:`1px solid ${G.border}`, padding:"0.9rem 1.5rem", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"0.8rem", flexWrap:"wrap", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.1rem", color:G.gold, fontStyle:"italic", flexShrink:0 }}>Noreh Beauty Room</div>
        <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", flexWrap:"wrap" }}>
          {msg && <span style={{ fontSize:"0.6rem", color: msg.startsWith("✓") ? "#5D9" : "#E88" }}>{msg}</span>}
          <button onClick={save} disabled={saving}
            style={{ background:G.gold, color:"#0d0c0b", border:"none", padding:"0.55rem 1.2rem", fontSize:"0.55rem", letterSpacing:"0.2em", textTransform:"uppercase", cursor:"pointer", fontWeight:500, opacity:saving?0.6:1, fontFamily:"inherit", whiteSpace:"nowrap" }}>
            {saving ? "Guardando..." : "Guardar"}
          </button>
          <button onClick={()=>{sessionStorage.removeItem("nbr-admin-token");setAuthed(false);}}
            style={{ background:"transparent", border:`1px solid ${G.border}`, color:G.muted, padding:"0.55rem 0.9rem", fontSize:"0.55rem", letterSpacing:"0.2em", textTransform:"uppercase", cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
            Salir
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background:G.surface, borderBottom:`1px solid ${G.border}`, padding:"0 1rem", display:"flex", overflowX:"auto", scrollbarWidth:"none" }}>
        {TABS.map((t,i) => <button key={t} onClick={()=>setTab(i)} style={navStyle(i)}>{t}</button>)}
      </div>

      {/* Content */}
      <div style={{ maxWidth:"860px", margin:"0 auto", padding:"clamp(1.2rem,4vw,2.5rem) clamp(1rem,4vw,2rem)" }}>

        {/* HERO */}
        {tab===0 && (
          <div>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", color:G.gold, fontWeight:300, fontSize:"1.4rem", marginBottom:"1.5rem", fontStyle:"italic" }}>Hero — Primera sección</h2>
            <Field label="Texto superior (eyebrow)" value={content.hero?.eyebrow} onChange={v=>set("hero.eyebrow",v)}/>
            <Field label="Tagline" value={content.hero?.tagline} onChange={v=>set("hero.tagline",v)} hint="Ej: Arte · Elegancia · Exclusividad"/>
          </div>
        )}

        {/* ABOUT */}
        {tab===1 && (
          <div>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", color:G.gold, fontWeight:300, fontSize:"1.4rem", marginBottom:"1.5rem", fontStyle:"italic" }}>Sobre mí</h2>
            <ImageField label="Foto de perfil" value={content.about?.photo} onChange={v=>set("about.photo",v)} hint="Tu foto principal en la sección 'Sobre mí'"/>
            <Field label="Título" value={content.about?.title} onChange={v=>set("about.title",v)}/>
            <Field label="Cita destacada" value={content.about?.quote} onChange={v=>set("about.quote",v)} textarea/>
            <Field label="Biografía" value={content.about?.bio} onChange={v=>set("about.bio",v)} textarea/>
            <hr style={{ border:`none`, borderTop:`1px solid ${G.border}`, margin:"1.5rem 0" }}/>
            <p style={{ fontSize:"0.55rem", letterSpacing:"0.3em", textTransform:"uppercase", color:G.gold, marginBottom:"1rem" }}>Estadísticas</p>
            {content.about?.stats?.map((s,i) => (
              <div key={i} className="adm-grid-2" style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:"0.8rem", marginBottom:"0.8rem", alignItems:"end" }}>
                <Field label={`Número ${i+1}`} value={s.number} onChange={v=>set(`about.stats.${i}.number`,v)}/>
                <Field label={`Etiqueta ${i+1}`} value={s.label} onChange={v=>set(`about.stats.${i}.label`,v)}/>
              </div>
            ))}
          </div>
        )}

        {/* VALORES */}
        {tab===2 && (
          <div>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", color:G.gold, fontWeight:300, fontSize:"1.4rem", marginBottom:"1.5rem", fontStyle:"italic" }}>Valores</h2>
            {content.valores?.map((v,i) => (
              <div key={i} style={{ background:G.surface, border:`1px solid ${G.border}`, padding:"1.2rem", marginBottom:"1rem" }}>
                <p style={{ fontSize:"0.52rem", color:G.gold, letterSpacing:"0.3em", textTransform:"uppercase", marginBottom:"0.8rem" }}>Valor {i+1}</p>
                <Field label="Nombre" value={v.name} onChange={val=>set(`valores.${i}.name`,val)}/>
                <Field label="Descripción" value={v.desc} onChange={val=>set(`valores.${i}.desc`,val)} textarea/>
              </div>
            ))}
          </div>
        )}

        {/* SERVICIOS */}
        {tab===3 && (
          <div>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", color:G.gold, fontWeight:300, fontSize:"1.4rem", marginBottom:"1.5rem", fontStyle:"italic" }}>Servicios</h2>
            {content.servicios?.map((s,i) => (
              <div key={i} style={{ background:G.surface, border:`1px solid ${G.border}`, padding:"1.4rem", marginBottom:"1.2rem" }}>
                <p style={{ fontSize:"0.52rem", color:G.gold, letterSpacing:"0.3em", textTransform:"uppercase", marginBottom:"0.8rem" }}>Servicio {i+1}</p>
                <ImageField label="Foto del servicio" value={s.photo} onChange={v=>set(`servicios.${i}.photo`,v)}/>
                <div className="adm-grid-2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.8rem" }}>
                  <Field label="Categoría" value={s.category} onChange={v=>set(`servicios.${i}.category`,v)}/>
                  <Field label="Precio" value={s.price} onChange={v=>set(`servicios.${i}.price`,v)}/>
                </div>
                <Field label="Nombre del servicio" value={s.name} onChange={v=>set(`servicios.${i}.name`,v)}/>
                <Field label="Descripción" value={s.desc} onChange={v=>set(`servicios.${i}.desc`,v)} textarea/>
                <p style={{ fontSize:"0.52rem", color:G.muted, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:"0.5rem" }}>Características (una por línea)</p>
                <textarea value={(s.features||[]).join("\n")} onChange={e=>set(`servicios.${i}.features`, e.target.value.split("\n").filter(Boolean))} rows={3}
                  style={{ width:"100%", background:"#0d0c0b", border:`1px solid ${G.border}`, color:G.text, padding:"0.7rem", fontSize:"0.75rem", lineHeight:1.7, resize:"vertical", outline:"none", fontFamily:"inherit" }}/>
              </div>
            ))}
          </div>
        )}

        {/* ESPECIALIDADES */}
        {tab===4 && (
          <div>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", color:G.gold, fontWeight:300, fontSize:"1.4rem", marginBottom:"1.5rem", fontStyle:"italic" }}>Especialidades</h2>
            <ImageField label="Foto del banner (lado izquierdo)" value={content.especialidades?.photo} onChange={v=>set("especialidades.photo",v)}/>
            <hr style={{ border:"none", borderTop:`1px solid ${G.border}`, margin:"1.5rem 0" }}/>
            {content.especialidades?.items?.map((item,i) => (
              <div key={i} style={{ background:G.surface, border:`1px solid ${G.border}`, padding:"1.2rem", marginBottom:"1rem" }}>
                <div className="adm-grid-num" style={{ display:"grid", gridTemplateColumns:"80px 1fr", gap:"0.8rem", alignItems:"end" }}>
                  <Field label="Nº" value={item.num} onChange={v=>set(`especialidades.items.${i}.num`,v)}/>
                  <Field label="Nombre" value={item.name} onChange={v=>set(`especialidades.items.${i}.name`,v)}/>
                </div>
                <Field label="Descripción" value={item.desc} onChange={v=>set(`especialidades.items.${i}.desc`,v)} textarea/>
              </div>
            ))}
          </div>
        )}

        {/* TESTIMONIOS */}
        {tab===5 && (
          <div>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", color:G.gold, fontWeight:300, fontSize:"1.4rem", marginBottom:"1.5rem", fontStyle:"italic" }}>Testimonios</h2>
            {content.testimonios?.map((t,i) => (
              <div key={i} style={{ background:G.surface, border:`1px solid ${G.border}`, padding:"1.2rem", marginBottom:"1rem" }}>
                <p style={{ fontSize:"0.52rem", color:G.gold, letterSpacing:"0.3em", textTransform:"uppercase", marginBottom:"0.8rem" }}>Testimonio {i+1}</p>
                <Field label="Cita" value={t.quote} onChange={v=>set(`testimonios.${i}.quote`,v)} textarea/>
                <div className="adm-grid-2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.8rem" }}>
                  <Field label="Nombre" value={t.author} onChange={v=>set(`testimonios.${i}.author`,v)}/>
                  <Field label="Rol / descripción" value={t.role} onChange={v=>set(`testimonios.${i}.role`,v)}/>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SOCIAL */}
        {tab===6 && (
          <div>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", color:G.gold, fontWeight:300, fontSize:"1.4rem", marginBottom:"1.5rem", fontStyle:"italic" }}>Redes Sociales y Contacto</h2>
            <Field label="Instagram (URL completa)" value={content.social?.instagram} onChange={v=>set("social.instagram",v)}/>
            <Field label="TikTok (URL completa)" value={content.social?.tiktok} onChange={v=>set("social.tiktok",v)}/>
            <Field label="WhatsApp (URL wa.me)" value={content.social?.whatsapp} onChange={v=>set("social.whatsapp",v)}/>
          </div>
        )}

        {/* Save bottom */}
        <div style={{ marginTop:"3rem", paddingTop:"2rem", borderTop:`1px solid ${G.border}`, display:"flex", gap:"1rem", alignItems:"center", flexWrap:"wrap" }}>
          <button onClick={save} disabled={saving}
            style={{ background:G.gold, color:"#0d0c0b", border:"none", padding:"0.9rem 2.5rem", fontSize:"0.62rem", letterSpacing:"0.25em", textTransform:"uppercase", cursor:"pointer", fontWeight:500, opacity:saving?0.6:1, fontFamily:"inherit" }}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
          <a href="/" target="_blank" style={{ fontSize:"0.6rem", letterSpacing:"0.2em", color:G.muted, textDecoration:"none", textTransform:"uppercase" }}>
            Ver sitio →
          </a>
          {msg && <span style={{ fontSize:"0.65rem", color: msg.startsWith("✓") ? "#5D9" : "#E88" }}>{msg}</span>}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html:`
        *{box-sizing:border-box}
        .adm-header{flex-wrap:wrap}
        /* Tabs sin scrollbar visible */
        div[style*="overflowX"]::-webkit-scrollbar{display:none}

        /* Grids → 1 columna en móvil */
        @media(max-width:480px){
          .adm-grid-2{grid-template-columns:1fr!important}
          .adm-grid-num{grid-template-columns:1fr!important}
        }
      `}}/>
    </div>
  );
}
