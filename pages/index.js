// pages/index.js
import Head from "next/head";
import { useState, useEffect, useRef } from "react";

// ── Galería fullscreen — carga imágenes on-demand ──────────
function Gallery({ category, onClose }) {
  const [images, setImages]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Carga las imágenes al abrir la galería (no en page load)
  useEffect(() => {
    setLoading(true);
    fetch(`/api/gallery/${category.id}`)
      .then(r => r.json())
      .then(data => { setImages(data.images || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [category.id]);

  return (
    <div style={{position:"fixed",inset:0,background:"#0A0A0A",zIndex:9999,display:"flex",flexDirection:"column",overflowY:"auto"}}>
      {/* Header */}
      <div style={{position:"sticky",top:0,background:"rgba(10,10,10,0.95)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(201,185,154,0.1)",padding:"1.2rem 2rem",display:"flex",justifyContent:"space-between",alignItems:"center",zIndex:10}}>
        <div>
          <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:"0.55rem",letterSpacing:"0.4em",textTransform:"uppercase",color:"rgba(201,185,154,0.5)",marginBottom:"0.2rem"}}>Portfolio</div>
          <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"1.6rem",fontWeight:300,color:"#C9B99A",fontStyle:"italic"}}>{category.name}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"1.5rem"}}>
          <span style={{fontFamily:"'Montserrat',sans-serif",fontSize:"0.55rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"rgba(201,185,154,0.3)"}}>{category.count} looks</span>
          <button onClick={onClose} style={{fontFamily:"'Montserrat',sans-serif",fontSize:"0.55rem",letterSpacing:"0.3em",textTransform:"uppercase",color:"#C9B99A",background:"none",border:"1px solid rgba(201,185,154,0.3)",padding:"0.6rem 1.2rem",cursor:"pointer"}}>Cerrar ✕</button>
        </div>
      </div>

      {/* Skeleton de carga */}
      {loading && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:"3px",padding:"3px"}}>
          {Array.from({length: Math.min(category.count, 12)}).map((_,i) => (
            <div key={i} style={{aspectRatio:"2/3",background:"#1a1510",animation:"galSkeleton 1.4s ease-in-out infinite",animationDelay:`${i*0.05}s`}}/>
          ))}
        </div>
      )}

      {/* Grid de fotos */}
      {!loading && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:"3px",padding:"3px"}}>
          {images.map((img, i) => (
            <div key={img.id} onClick={() => setLightbox(i)}
              style={{aspectRatio:"2/3",overflow:"hidden",cursor:"pointer",background:"#1a1510",position:"relative"}}>
              <img src={img.thumb} alt={img.name} loading="lazy"
                style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.5s ease",display:"block"}}
                onMouseOver={e=>e.target.style.transform="scale(1.05)"}
                onMouseOut={e=>e.target.style.transform="scale(1)"}/>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && images[lightbox] && (
        <div onClick={()=>setLightbox(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.97)",zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <img src={images[lightbox].url} style={{maxWidth:"92vw",maxHeight:"92vh",objectFit:"contain"}} onClick={e=>e.stopPropagation()}/>
          <button onClick={()=>setLightbox(null)} style={{position:"fixed",top:"1.5rem",right:"1.5rem",background:"none",border:"none",color:"#C9B99A",fontSize:"1.5rem",cursor:"pointer"}}>✕</button>
          {lightbox > 0 && <button onClick={e=>{e.stopPropagation();setLightbox(lightbox-1)}} style={{position:"fixed",left:"1.5rem",top:"50%",transform:"translateY(-50%)",background:"none",border:"1px solid rgba(201,185,154,0.3)",color:"#C9B99A",padding:"1rem",cursor:"pointer",fontFamily:"'Montserrat',sans-serif",fontSize:"0.6rem"}}>←</button>}
          {lightbox < images.length-1 && <button onClick={e=>{e.stopPropagation();setLightbox(lightbox+1)}} style={{position:"fixed",right:"1.5rem",top:"50%",transform:"translateY(-50%)",background:"none",border:"1px solid rgba(201,185,154,0.3)",color:"#C9B99A",padding:"1rem",cursor:"pointer",fontFamily:"'Montserrat',sans-serif",fontSize:"0.6rem"}}>→</button>}
        </div>
      )}
    </div>
  );
}

// ── Menú Orbital (sección portfolio) ────────────────────────
function OrbitalPortfolio({ categories }) {
  const [current, setCurrent] = useState(0);
  const [openGallery, setOpenGallery] = useState(null);
  const [angle, setAngle] = useState(0);
  const N = categories.length;
  const RADIUS = 210;
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartAngle = useRef(0);
  function selectIndex(i) { setCurrent(i); setAngle(-(i/N)*Math.PI*2); }
  function getNodePos(i) {
    const a = (i/N)*Math.PI*2 - Math.PI/2 + angle;
    return { x: 260+Math.cos(a)*RADIUS, y: 260+Math.sin(a)*RADIUS };
  }
  function onMouseDown(e) { isDragging.current=true; dragStartX.current=e.clientX||e.touches?.[0]?.clientX; dragStartAngle.current=angle; e.preventDefault(); }
  function onMouseMove(e) {
    if (!isDragging.current) return;
    const x=e.clientX||e.touches?.[0]?.clientX; const dx=x-dragStartX.current;
    const newAngle=dragStartAngle.current+(dx/280)*Math.PI; setAngle(newAngle);
    const step=(Math.PI*2)/N; const idx=(((Math.round(-newAngle/step)%N)+N)%N);
    if (idx!==current) setCurrent(idx);
  }
  function onMouseUp() {
    if (!isDragging.current) return; isDragging.current=false;
    const step=(Math.PI*2)/N; const idx=(((Math.round(-angle/step)%N)+N)%N); selectIndex(idx);
  }
  useEffect(() => {
    const timer=setInterval(()=>{ if (!isDragging.current) selectIndex((current+1)%N); },4000);
    return ()=>clearInterval(timer);
  },[current,N]);
  const cat=categories[current];
  if (openGallery) return <Gallery category={openGallery} onClose={()=>setOpenGallery(null)}/>;
  return (
    <div style={{width:"100%",background:"#0A0A0A",padding:"6rem 0",overflow:"hidden"}}>
      <div style={{textAlign:"center",marginBottom:"3rem"}}>
        <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:"0.55rem",letterSpacing:"0.5em",textTransform:"uppercase",color:"rgba(201,185,154,0.6)",marginBottom:"0.5rem"}}>Portfolio curado</div>
        <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"clamp(2rem,5vw,3.5rem)",fontWeight:300,color:"#C9B99A",fontStyle:"italic"}}>Colecciones</div>
      </div>
      <div className="orbital-desktop">
        <svg viewBox="0 0 520 520" style={{display:"block",margin:"0 auto",cursor:"grab",overflow:"visible",userSelect:"none",width:"min(520px,92vw)",height:"auto"}}
          onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
          onTouchStart={onMouseDown} onTouchMove={onMouseMove} onTouchEnd={onMouseUp}>
          {[520,380,220].map(s=><circle key={s} cx="260" cy="260" r={s/2} fill="none" stroke="rgba(201,185,154,0.06)" strokeWidth="1"/>)}
          {categories.map((cat,i)=>{
            const pos=getNodePos(i); const isActive=i===current;
            return (
              <g key={cat.id} onClick={()=>{ isActive ? setOpenGallery(cat) : selectIndex(i); }} style={{cursor:"pointer"}}>
                <rect x={pos.x-36} y={pos.y-45} width="72" height="90" rx="4"
                  fill={isActive?"rgba(201,185,154,0.12)":"rgba(201,185,154,0.03)"}
                  stroke={isActive?"rgba(201,185,154,0.7)":"rgba(201,185,154,0.15)"}
                  strokeWidth={isActive?"1":"0.5"}/>
                {cat.cover?<image href={cat.cover} x={pos.x-35} y={pos.y-44} width="70" height="88" preserveAspectRatio="xMidYMid slice" clipPath={`url(#clip-${i})`}/>
                  :<text x={pos.x} y={pos.y+10} textAnchor="middle" fill="rgba(201,185,154,0.2)" fontFamily="'Cormorant Garamond',serif" fontSize="28" fontStyle="italic">{cat.name[0]}</text>}
                <defs><clipPath id={`clip-${i}`}><rect x={pos.x-35} y={pos.y-44} width="70" height="88" rx="3"/></clipPath></defs>
              </g>
            );
          })}
          <g onClick={()=>setOpenGallery(cat)} style={{cursor:"pointer"}}>
            <rect x="185" y="175" width="150" height="170" rx="4" fill="rgba(10,10,10,0.8)" stroke="rgba(201,185,154,0.35)" strokeWidth="1"/>
            {cat?.cover&&<><defs><clipPath id="clip-center"><rect x="186" y="176" width="148" height="168" rx="3"/></clipPath></defs><image href={cat.cover} x="186" y="176" width="148" height="168" preserveAspectRatio="xMidYMid slice" clipPath="url(#clip-center)"/></>}
            <rect x="185" y="295" width="150" height="50" rx="0" fill="rgba(10,10,10,0.92)"/>
            <text x="260" y="314" textAnchor="middle" fontFamily="'Montserrat',sans-serif" fontSize="7.5" letterSpacing="3" fill="rgba(201,185,154,0.7)">{cat?.name?.toUpperCase()}</text>
            <text x="260" y="332" textAnchor="middle" fontFamily="'Montserrat',sans-serif" fontSize="6.5" letterSpacing="2" fill="rgba(201,185,154,0.45)">{cat?.count} looks · ver colección</text>
          </g>
          {[[-1,-1],[1,-1],[-1,1],[1,1]].map(([sx,sy],i)=>(
            <g key={i}>
              <line x1={260+sx*75} y1={260+sy*85+sy*(-sy>0?0:10)} x2={260+sx*75} y2={260+sy*85+sy*(-sy>0?0:10)+sy*10} stroke="rgba(201,185,154,0.4)" strokeWidth="1"/>
              <line x1={260+sx*75} y1={260+sy*85} x2={260+sx*75+sx*10} y2={260+sy*85} stroke="rgba(201,185,154,0.4)" strokeWidth="1"/>
            </g>
          ))}
        </svg>
      </div>
      <div className="orbital-mobile" style={{display:"flex",overflowX:"auto",gap:"10px",padding:"0 1.5rem 1rem",scrollSnapType:"x mandatory",scrollbarWidth:"none"}}>
        {categories.map((cat,i)=>(
          <div key={cat.id} onClick={()=>{setCurrent(i);setOpenGallery(cat);}}
            style={{minWidth:"160px",height:"210px",flexShrink:0,position:"relative",border:`1px solid ${i===current?"rgba(201,185,154,0.7)":"rgba(201,185,154,0.15)"}`,scrollSnapAlign:"start",cursor:"pointer",overflow:"hidden",background:"#1a1510"}}>
            {cat.cover&&<img src={cat.thumb} alt={cat.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>}
            <div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(to top,rgba(0,0,0,0.9),transparent)",padding:"1rem 0.8rem 0.6rem"}}>
              <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:"0.45rem",letterSpacing:"0.25em",textTransform:"uppercase",color:"rgba(201,185,154,0.6)",marginBottom:"0.2rem"}}>{cat.count} looks</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1rem",color:"#FAF8F5",fontWeight:300,fontStyle:"italic"}}>{cat.name}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="orbital-desktop" style={{textAlign:"center",marginTop:"3rem"}}>
        <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:"0.55rem",letterSpacing:"0.3em",textTransform:"uppercase",color:"rgba(201,185,154,0.6)",marginBottom:"0.5rem"}}>{current+1} / {N}</div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2rem",fontWeight:300,color:"#C9B99A",fontStyle:"italic",marginBottom:"0.3rem"}}>{cat?.name}</div>
        <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:"0.55rem",letterSpacing:"0.2em",color:"rgba(201,185,154,0.45)",marginBottom:"2rem"}}>{cat?.count} looks en esta colección</div>
        <button onClick={()=>setOpenGallery(cat)} style={{fontFamily:"'Montserrat',sans-serif",fontSize:"0.6rem",letterSpacing:"0.25em",textTransform:"uppercase",color:"#0A0A0A",background:"#C9B99A",border:"none",padding:"1rem 2.5rem",cursor:"pointer",transition:"background 0.3s"}}
          onMouseOver={e=>e.target.style.background="#C4A035"} onMouseOut={e=>e.target.style.background="#C9B99A"}>
          Explorar colección →
        </button>
        <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:"0.45rem",letterSpacing:"0.25em",textTransform:"uppercase",color:"rgba(201,185,154,0.15)",marginTop:"1rem"}}>Desliza para rotar · Toca la imagen para abrir</div>
      </div>
      <style dangerouslySetInnerHTML={{__html:`
        .orbital-desktop{display:block!important}
        .orbital-mobile{display:none!important}
        .orbital-mobile::-webkit-scrollbar{display:none}
      `}}/>
    </div>
  );
}

// ── Página principal ────────────────────────────────────────
export default function Home({ categories: initialCategories, siteContent }) {
  const [theme, setTheme] = useState("dark");
  const [scrolled, setScrolled] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [orbState, setOrbState] = useState({ outer:[], inner:[], outerSize:0, innerSize:0 });
  const [testimonioIdx, setTestimonioIdx] = useState(0);
  const [testimonioVisible, setTestimonioVisible] = useState(true);
  // Fallback: si getStaticProps falló, carga categorías client-side
  const [categories, setCategories] = useState(initialCategories || []);
  const [error, setError] = useState(null);
  const cursorRef = useRef(null);
  const isDark = theme === "dark";

  // Social links from siteContent with fallbacks
  const socialLinks = {
    instagram: siteContent?.social?.instagram || "https://www.instagram.com/noreh_mejia",
    tiktok:    siteContent?.social?.tiktok    || "https://www.tiktok.com/@norehmejia1",
    whatsapp:  siteContent?.social?.whatsapp  || "https://wa.me/message/3DWX7EA3RBP3J1",
  };

  // Gradient placeholders for orbital (beauty tones)
  const orbGrads = [
    "radial-gradient(ellipse at 35% 65%,#3d1f20 0%,#1a0a0b 60%,#0a0607 100%)",
    "radial-gradient(ellipse at 65% 35%,#2a1230 0%,#130618 60%,#080607 100%)",
    "radial-gradient(ellipse at 30% 60%,#3d2a10 0%,#1a1205 60%,#080706 100%)",
    "radial-gradient(ellipse at 70% 70%,#2a0f20 0%,#120610 60%,#070606 100%)",
    "radial-gradient(ellipse at 50% 50%,#3d1a25 0%,#1a0c12 60%,#080607 100%)",
    "radial-gradient(ellipse at 40% 40%,#3d3020 0%,#1a1510 60%,#080807 100%)",
    "radial-gradient(ellipse at 60% 65%,#3d1a15 0%,#1a0c08 60%,#080706 100%)",
    "radial-gradient(ellipse at 35% 45%,#2a0a15 0%,#120508 60%,#070506 100%)",
    "radial-gradient(ellipse at 55% 35%,#3d2810 0%,#1a1508 60%,#080707 100%)",
    "radial-gradient(ellipse at 45% 55%,#2d1f15 0%,#150f08 60%,#070707 100%)",
  ];
  const orbLabels = ["Bridal Glam","Editorial","Soft Glam","Night Glam","Nupcial","Quinceañera","Glam","Sesión","Look Creativo","Belleza"];

  const stockMakeupPhotos = [
    "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=300&q=80",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&q=80",
    "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=300&q=80",
    "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=300&q=80",
    "https://images.unsplash.com/photo-1560869713-da86a9ec0744?w=300&q=80",
    "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=300&q=80",
    "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=300&q=80",
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&q=80",
    "https://images.unsplash.com/photo-1583241800698-e8ab01830a52?w=300&q=80",
    "https://images.unsplash.com/photo-1457972851104-4fd469440bf9?w=300&q=80",
  ];

  const orbData = (() => {
    const items = [];
    for (let i = 0; i < 10; i++) {
      const cat = categories[i];
      items.push({
        id: cat ? cat.id : `ph-${i}`,
        src: cat ? (cat.thumb || cat.cover || stockMakeupPhotos[i]) : stockMakeupPhotos[i],
        label: cat ? cat.name : orbLabels[i],
        grad: orbGrads[i],
      });
    }
    return { outer: items.slice(0,6), inner: items.slice(6,10) };
  })();

  // Compute orbital pixel positions
  useEffect(() => {
    function compute() {
      const vmin = Math.min(window.innerWidth, window.innerHeight);
      const outerR = Math.min(vmin * 0.33, 270);
      const innerR = Math.min(vmin * 0.21, 175);
      const iw = Math.min(window.innerWidth * 0.082, 108);
      const ih = iw * 1.42;
      const buildItems = (data, r) => data.map((d, i) => {
        const a = (2 * Math.PI * i / data.length) - Math.PI / 2;
        return { ...d, x: r + r * Math.cos(a) - iw/2, y: r + r * Math.sin(a) - ih/2, iw, ih };
      });
      setOrbState({
        outer: buildItems(orbData.outer, outerR),
        inner: buildItems(orbData.inner, innerR),
        outerSize: outerR * 2,
        innerSize: innerR * 2,
      });
    }
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // Si las categorías no llegaron en build, las cargamos client-side
  useEffect(() => {
    if ((initialCategories || []).length === 0) {
      fetch("/api/portfolio")
        .then(r => r.json())
        .then(data => setCategories(data.categories || []))
        .catch(() => setError("No se pudo cargar el portfolio"));
    }
  }, []);

  useEffect(() => {
    // Default always dark — ignore system preference
    const saved = localStorage.getItem("nbr-theme");
    setTheme(saved || "dark");

    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });

    const t = setTimeout(() => setLoaded(true), 2600);

    const onMove = (e) => {
      if (!cursorRef.current) return;
      cursorRef.current.style.left = e.clientX + "px";
      cursorRef.current.style.top = e.clientY + "px";
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const hover = !!el?.closest("a,button,[data-cur]");
      cursorRef.current.classList.toggle("cur-hover", hover);
    };
    document.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(t);
      document.removeEventListener("mousemove", onMove);
    };
  }, []);

  // Testimonio auto-advance
  const testimonios = siteContent?.testimonios || [
    { quote: "Noreh transformó completamente mi look para la boda. Cada detalle fue perfecto y duró toda la noche.", author: "Valentina R.", role: "Novia · Boda de lujo" },
    { quote: "El maquillaje editorial que hizo para mi sesión fotográfica superó todas mis expectativas. Arte puro.", author: "Daniela M.", role: "Modelo Editorial" },
    { quote: "Profesionalismo, puntualidad y un resultado espectacular. La recomiendo sin dudar.", author: "Sofía L.", role: "Quinceañera · Event Glam" },
  ];
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonioVisible(false);
      setTimeout(() => {
        setTestimonioIdx(prev => (prev + 1) % testimonios.length);
        setTestimonioVisible(true);
      }, 400);
    }, 5200);
    return () => clearInterval(interval);
  }, [testimonios.length]);

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    setTheme(next); localStorage.setItem("nbr-theme", next);
  };

  const colors = {
    bg:      isDark ? "#0A0A0A" : "#FAF8F5",
    surface: isDark ? "#111010" : "#F5F0EB",
    text:    isDark ? "#FAF8F5" : "#0A0A0A",
    muted:   isDark ? "#A09890" : "#7A7470",
    ch:      "#C9B99A",
    gold:    "#C4A035",
  };

  const featuredCats = categories.slice(0,4);
  const pgrd = [
    "linear-gradient(145deg,#1a1208 0%,#2d1f0e 40%,#1a1208 100%)",
    "linear-gradient(145deg,#12100a 0%,#261a0c 40%,#12100a 100%)",
    "linear-gradient(145deg,#0e0c08 0%,#1e1609 40%,#0e0c08 100%)",
    "linear-gradient(145deg,#161208 0%,#231a0a 40%,#161208 100%)",
  ];

  // Servicios data
  const serviciosFallback = [
    { category:"Nupcial", name:"Maquillaje Nupcial", price:"Desde $3,500", description:"El día más importante de tu vida merece perfección. Prueba incluida, resultado duradero que aguanta emociones y cámara.", features:["Prueba previa incluida","Maquillaje de larga duración","Asistencia el día del evento","Asesoría de color personalizada"] },
    { category:"Eventos", name:"Glam Completo", price:"Desde $1,800", description:"Looks de alto impacto para eventos de gala, alfombra roja y ocasiones especiales que merecen ser recordadas.", features:["Looks personalizados","Técnicas HD y airbrush","Pestañas incluidas","Retoques de noche"] },
    { category:"Editorial", name:"Maquillaje Editorial", price:"Desde $2,200", description:"Para sesiones fotográficas, campañas y proyectos creativos donde el maquillaje se convierte en arte.", features:["Conceptualización del look","Trabajo con directores creativos","Multiple looks por sesión","Apto para todos los formatos"] },
  ];
  const serviciosData = [0,1,2].map(i => ({
    ...serviciosFallback[i],
    ...(siteContent?.servicios?.[i] || {}),
  }));
  const serviciosFotos = [
    "https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=600&q=80",
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80",
    "https://images.unsplash.com/photo-1583241475880-083f84372725?w=600&q=80",
  ];

  // Valores data
  const valoresFallback = [
    { icon:"clock", name:"Puntualidad", desc:"Tu tiempo es sagrado. Llegamos preparadas, trabajamos con precisión." },
    { icon:"star",  name:"Calidad",     desc:"Productos de primera línea y técnicas actualizadas en cada servicio." },
    { icon:"heart", name:"Enfoque",     desc:"Atención individualizada. Cada look está diseñado solo para ti." },
    { icon:"shield",name:"Flexibilidad",desc:"Nos adaptamos a tu estilo, presupuesto y visión del momento perfecto." },
  ];
  const valoresData = (siteContent?.valores || valoresFallback);

  // Especialidades data
  const especialidadesFallback = {
    photo: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80",
    items: [
      { number:"01", name:"Maquillaje Nupcial de Lujo",   desc:"Bodas de alto perfil con maquillaje impecable que dura toda la celebración." },
      { number:"02", name:"Editorial & Campañas",          desc:"Colaboraciones con fotógrafos, marcas y directores de arte." },
      { number:"03", name:"Eventos de Gala",               desc:"Alfombra roja, quinceañeras y eventos sociales de élite." },
      { number:"04", name:"Maquillaje Artístico Creativo", desc:"Expresión sin límites para proyectos de arte, teatro y contenido digital." },
    ],
  };
  const especialidadesData = { ...especialidadesFallback, ...(siteContent?.especialidades || {}) };

  // SVG Icons helpers
  const iconClock = <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#C9B99A" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>;
  const iconStar  = <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#C9B99A" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
  const iconHeart = <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#C9B99A" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
  const iconShield= <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#C9B99A" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
  function getValorIcon(icon) {
    if (icon === "clock")  return iconClock;
    if (icon === "star")   return iconStar;
    if (icon === "heart")  return iconHeart;
    if (icon === "shield") return iconShield;
    return iconStar;
  }

  const igIcon = (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="20" height="20" rx="5"/>
      <circle cx="12" cy="12" r="4.5"/>
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/>
    </svg>
  );
  const ttIcon = (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.53V6.75a4.84 4.84 0 01-1.01-.06z"/>
    </svg>
  );
  const waIcon = (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );

  return (
    <>
      <Head>
        <title>Noreh Beauty Room — Luxury Makeup Artist · CDMX</title>
        <meta name="description" content="Artista de maquillaje de lujo en Ciudad de México. Especialista en maquillaje nupcial, editorial y glam."/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Montserrat:wght@200;300;400;500&display=swap" rel="stylesheet"/>
      </Head>

      {/* ── CURSOR ── */}
      <div ref={cursorRef} className="nbr-cur" />

      {/* ── LOADER ── */}
      <div className={`nbr-loader${loaded?" nbr-loader--out":""}`}
        style={{background: isDark ? "#080807" : "#FAF8F5"}} suppressHydrationWarning>
        <img src={isDark ? "/logo-blanco.png" : "/logo-dark.png"} alt="Noreh Beauty Room"
          style={{height:"clamp(180px,30vw,340px)",width:"auto",objectFit:"contain",
            animation:"ldFadeUp 0.9s ease both"}}/>
        <div style={{width:"180px",height:"1px",background:"rgba(201,185,154,0.18)",overflow:"hidden",marginTop:"1.5rem"}}>
          <div className="nbr-loader-bar"/>
        </div>
        <p style={{fontFamily:"'Montserrat',sans-serif",fontSize:"0.48rem",letterSpacing:"0.5em",
          textTransform:"uppercase",color: isDark ? "rgba(201,185,154,0.35)" : "rgba(10,10,10,0.35)",marginTop:"1.2rem",
          animation:"ldFadeUp 0.9s 0.3s ease both"}}>
          Luxury Makeup Artist
        </p>
      </div>

      {/* ── WHATSAPP FLOAT ── */}
      <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer"
        className="nbr-wa" aria-label="WhatsApp - Agenda tu cita">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="#fff" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        <span className="nbr-wa-label">Agenda tu cita</span>
      </a>

      <div style={{background:colors.bg,color:colors.text,fontFamily:"'Montserrat',sans-serif",
        transition:"background 0.6s,color 0.6s",overflowX:"hidden"}}>

        {/* ── NAV ── */}
        <nav style={{
          position:"fixed",top:0,left:0,right:0,zIndex:500,
          padding:scrolled?"0.8rem 2.5rem":"1.2rem 2.5rem",
          background:scrolled?(isDark?"rgba(8,8,7,0.92)":"rgba(250,248,245,0.92)"):"transparent",
          backdropFilter:scrolled?"blur(24px)":"none",
          borderBottom:scrolled?"1px solid rgba(201,185,154,0.08)":"1px solid transparent",
          display:"flex",alignItems:"center",justifyContent:"space-between",
          transition:"all 0.5s cubic-bezier(0.16,1,0.3,1)",
          animation:"ldFadeUp 0.8s 3s ease both"
        }}>
          <a href="#" style={{display:"flex",alignItems:"center",textDecoration:"none"}}>
            <img src={isDark?"/logo-blanco.png":"/logo-dark.png"} alt="Noreh Beauty Room"
              style={{height:"68px",width:"auto",objectFit:"contain",transition:"opacity 0.5s"}}/>
          </a>
          <div style={{display:"flex",gap:"2.5rem"}} className="nav-links-desktop">
            {[["Sobre mí","#sobre-mí"],["Servicios","#servicios"],["Portfolio","#portfolio"],["Contacto","#contacto"]].map(([l,href])=>(
              <a key={l} href={href} style={{fontSize:"0.6rem",letterSpacing:"0.25em",textTransform:"uppercase",
                color:isDark?"rgba(250,248,245,0.65)":"rgba(10,10,10,0.6)",textDecoration:"none",
                transition:"color 0.3s",fontWeight:300,cursor:"crosshair"}}
                onMouseOver={e=>e.target.style.color=colors.ch}
                onMouseOut={e=>e.target.style.color=isDark?"rgba(250,248,245,0.65)":"rgba(10,10,10,0.6)"}
              >{l}</a>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"1rem"}}>
            <div onClick={toggleTheme} data-cur style={{width:"42px",height:"21px",background:"rgba(201,185,154,0.15)",border:"1px solid rgba(201,185,154,0.3)",borderRadius:"11px",cursor:"pointer",position:"relative"}}>
              <div style={{position:"absolute",top:"3px",left:isDark?"23px":"3px",width:"13px",height:"13px",background:colors.ch,borderRadius:"50%",transition:"left 0.4s cubic-bezier(0.16,1,0.3,1)"}}/>
            </div>
            <a href={socialLinks.whatsapp} target="_blank" style={{fontSize:"0.58rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"#0A0A0A",background:colors.ch,padding:"0.65rem 1.4rem",cursor:"crosshair",textDecoration:"none",fontWeight:500,transition:"background 0.3s",whiteSpace:"nowrap"}}
              onMouseOver={e=>e.target.style.background=colors.gold}
              onMouseOut={e=>e.target.style.background=colors.ch}>Reservar</a>
            <button onClick={()=>setMenuOpen(!menuOpen)} className="hamburger"
              style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",gap:"5px",padding:"4px"}}>
              <span style={{width:"22px",height:"1px",background:colors.ch,display:"block",transition:"all 0.3s",transform:menuOpen?"rotate(45deg) translate(4px,4px)":"none"}}/>
              <span style={{width:"22px",height:"1px",background:colors.ch,display:"block",transition:"all 0.3s",opacity:menuOpen?0:1}}/>
              <span style={{width:"22px",height:"1px",background:colors.ch,display:"block",transition:"all 0.3s",transform:menuOpen?"rotate(-45deg) translate(4px,-4px)":"none"}}/>
            </button>
          </div>
        </nav>

        {/* Mobile overlay */}
        {menuOpen && (
          <div style={{position:"fixed",inset:0,zIndex:499,background:isDark?"rgba(8,8,7,0.97)":"rgba(250,248,245,0.97)",backdropFilter:"blur(20px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"2.5rem"}}>
            {[["Sobre mí","#sobre-mí"],["Servicios","#servicios"],["Portfolio","#portfolio"],["Contacto","#contacto"]].map(([l,href])=>(
              <a key={l} href={href} onClick={()=>setMenuOpen(false)}
                style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2.5rem",fontWeight:300,fontStyle:"italic",color:colors.ch,textDecoration:"none",letterSpacing:"0.05em"}}>{l}</a>
            ))}
          </div>
        )}

        {/* ── HERO ── */}
        <section style={{height:"100vh",minHeight:"600px",background:"#080807",position:"relative",overflow:"hidden",cursor:"crosshair"}}>

          {/* Animated background orbs */}
          <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 80% 60% at 50% 50%,#1a1410 0%,#080807 70%)"}}>
            {[
              {style:{width:"60vw",height:"60vw",top:"-10%",left:"-10%",background:"radial-gradient(circle,#2d1a0a 0%,transparent 70%)",animationDelay:"0s"}},
              {style:{width:"50vw",height:"50vw",bottom:"-10%",right:"-5%",background:"radial-gradient(circle,#1a0a1a 0%,transparent 70%)",animationDelay:"-4s"}},
              {style:{width:"40vw",height:"40vw",top:"30%",left:"30%",background:"radial-gradient(circle,#1a150a 0%,transparent 70%)",animationDelay:"-8s"}},
            ].map((o,i)=>(
              <div key={i} style={{position:"absolute",borderRadius:"50%",filter:"blur(80px)",animation:"orbFloat 12s ease-in-out infinite",...o.style}}/>
            ))}
          </div>

          {/* Gradient cinematic bars */}
          <div style={{position:"absolute",inset:0,zIndex:1,background:"linear-gradient(to bottom,rgba(8,8,7,0.45) 0%,transparent 22%,transparent 78%,rgba(8,8,7,0.65) 100%)",pointerEvents:"none"}}/>

          {/* Noise grain */}
          <div className="hero-noise" style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none",opacity:0.22}}/>

          {/* ── ORBITAL ── */}
          <div style={{position:"absolute",inset:0,zIndex:3,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
            {orbState.outerSize > 0 && <>
              <div style={{position:"absolute",width:orbState.outerSize+20,height:orbState.outerSize+20,borderRadius:"50%",border:"1px solid rgba(201,185,154,0.05)"}}/>
              <div style={{position:"absolute",width:orbState.innerSize+14,height:orbState.innerSize+14,borderRadius:"50%",border:"1px solid rgba(201,185,154,0.04)"}}/>
              <div style={{position:"absolute",width:8,height:8,borderRadius:"50%",background:"#C9B99A",opacity:0.35}}/>
            </>}

            {/* Outer ring */}
            {orbState.outerSize > 0 && (
              <div style={{position:"absolute",width:orbState.outerSize,height:orbState.outerSize,
                top:"50%",left:"50%",marginTop:-orbState.outerSize/2,marginLeft:-orbState.outerSize/2,
                animation:"orbitSpin 28s linear infinite"}}>
                {orbState.outer.map(item=>(
                  <div key={item.id} style={{position:"absolute",left:item.x,top:item.y,width:item.iw,height:item.ih,
                    animation:"orbitCtr 28s linear infinite",pointerEvents:"all",cursor:"crosshair"}}
                    className="orb-item">
                    <div className="orb-img-wrap" style={{width:"100%",height:"100%",overflow:"hidden",
                      border:"1px solid rgba(201,185,154,0.18)",background:item.grad,
                      boxShadow:"0 8px 40px rgba(0,0,0,0.55)"}}>
                      {item.src&&<img src={item.src} alt={item.label} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} onError={e=>{e.currentTarget.style.display="none"}}/>}
                    </div>
                    <div className="orb-label">{item.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Inner ring (reverse) */}
            {orbState.innerSize > 0 && (
              <div style={{position:"absolute",width:orbState.innerSize,height:orbState.innerSize,
                top:"50%",left:"50%",marginTop:-orbState.innerSize/2,marginLeft:-orbState.innerSize/2,
                animation:"orbitSpin 20s linear infinite reverse"}}>
                {orbState.inner.map(item=>(
                  <div key={item.id} style={{position:"absolute",left:item.x,top:item.y,width:item.iw,height:item.ih,
                    animation:"orbitCtr 20s linear infinite reverse",pointerEvents:"all",cursor:"crosshair"}}
                    className="orb-item">
                    <div className="orb-img-wrap" style={{width:"100%",height:"100%",overflow:"hidden",
                      border:"1px solid rgba(201,185,154,0.18)",background:item.grad,
                      boxShadow:"0 8px 40px rgba(0,0,0,0.55)"}}>
                      {item.src&&<img src={item.src} alt={item.label} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} onError={e=>{e.currentTarget.style.display="none"}}/>}
                    </div>
                    <div className="orb-label">{item.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Hero content (center) ── */}
          <div style={{position:"absolute",inset:0,zIndex:4,display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"center",textAlign:"center",pointerEvents:"none"}}>

            <p style={{fontFamily:"'Montserrat',sans-serif",fontSize:"0.58rem",letterSpacing:"0.5em",
              textTransform:"uppercase",color:"rgba(201,185,154,0.85)",marginBottom:"1.8rem",
              animation:"ldFadeUp 1s 2.7s ease both"}}>
              Ciudad de México · Luxury Makeup Artist
            </p>

            <div style={{pointerEvents:"all",animation:"ldFadeUp 1s 2.9s ease both"}}>
              <img src="/logo-blanco.png" alt="Noreh Beauty Room"
                style={{height:"clamp(200px,38vmin,400px)",width:"auto",objectFit:"contain",display:"block",margin:"0 auto"}}/>
            </div>

            <div style={{width:"120px",height:"1px",background:"linear-gradient(90deg,transparent,#C9B99A,transparent)",
              margin:"1.6rem auto",animation:"ldFadeIn 1s 3.1s ease both"}}/>

            <p style={{fontSize:"0.56rem",letterSpacing:"0.42em",textTransform:"uppercase",
              color:"rgba(201,185,154,0.42)",marginBottom:"2.8rem",
              animation:"ldFadeUp 1s 3.1s ease both"}}>
              Arte · Elegancia · Exclusividad
            </p>

            <div style={{display:"flex",gap:"1rem",justifyContent:"center",flexWrap:"wrap",
              pointerEvents:"all",animation:"ldFadeUp 1s 3.3s ease both"}}>
              <a href="#portfolio" style={{fontSize:"0.58rem",letterSpacing:"0.2em",textTransform:"uppercase",
                color:"#0A0A0A",background:"#C9B99A",border:"1px solid #C9B99A",
                padding:"0.9rem 2.2rem",cursor:"crosshair",textDecoration:"none",
                transition:"all 0.4s",fontWeight:500}}
                onMouseOver={e=>{e.target.style.background="transparent";e.target.style.color="#C9B99A"}}
                onMouseOut={e=>{e.target.style.background="#C9B99A";e.target.style.color="#0A0A0A"}}>
                Ver Portfolio
              </a>
              <a href={socialLinks.whatsapp} target="_blank" style={{fontSize:"0.58rem",letterSpacing:"0.2em",textTransform:"uppercase",
                color:"#C9B99A",background:"transparent",border:"1px solid rgba(201,185,154,0.4)",
                padding:"0.9rem 2.2rem",cursor:"crosshair",textDecoration:"none",transition:"all 0.4s"}}
                onMouseOver={e=>{e.target.style.borderColor="#C9B99A";e.target.style.background="rgba(201,185,154,0.07)"}}
                onMouseOut={e=>{e.target.style.borderColor="rgba(201,185,154,0.4)";e.target.style.background="transparent"}}>
                Reservar Cita
              </a>
            </div>
          </div>

          {/* Scroll indicator */}
          <div style={{position:"absolute",bottom:"2rem",left:"50%",transform:"translateX(-50%)",zIndex:5,
            display:"flex",flexDirection:"column",alignItems:"center",gap:"8px",
            animation:"ldFadeIn 1s 3.8s ease both"}}>
            <span style={{fontFamily:"'Montserrat',sans-serif",fontSize:"0.44rem",letterSpacing:"0.42em",
              textTransform:"uppercase",color:"rgba(201,185,154,0.3)"}}>Scroll</span>
            <div className="scroll-line"/>
          </div>
        </section>

        {/* ── MARQUEE ── */}
        <div style={{padding:"1.1rem 0",background:colors.ch,overflow:"hidden"}}>
          <div style={{display:"flex",whiteSpace:"nowrap",animation:"marquee 22s linear infinite"}}>
            {[...Array(2)].map((_,rep)=>(
              ["Bridal Glam","Editorial Makeup","Soft Glam","Luxury Beauty",
               "Photoshoot Ready","Social Events","Quinceañera","Night Glam"].map((t,i)=>(
                <span key={`${rep}-${i}`} style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"0.9rem",
                  letterSpacing:"0.2em",color:"rgba(10,10,10,0.85)",padding:"0 2.5rem",fontStyle:"italic"}}>
                  {t} <span style={{opacity:0.3,fontSize:"0.4rem",verticalAlign:"middle"}}>◆</span>
                </span>
              ))
            ))}
          </div>
        </div>

        {/* ── GALERÍA DESTACADA ── */}
        <section style={{background:"#0A0A0A",padding:"0",lineHeight:0}}>
          <div className="featured-grid" style={{display:"grid",gridTemplateColumns:"1.3fr 1fr 1fr",gridTemplateRows:"55vh 30vh",gap:"2px"}}>
            {/* Celda grande izquierda (2 filas) */}
            <div className="feat-cell" style={{gridRow:"1/3",position:"relative",overflow:"hidden",
              background:featuredCats[0]?.cover?"#1a1510":pgrd[0],cursor:"pointer"}}
              onClick={()=>document.getElementById("portfolio")?.scrollIntoView({behavior:"smooth"})}>
              {featuredCats[0]?.cover&&<img src={featuredCats[0].cover} alt={featuredCats[0].name} loading="lazy" fetchpriority="low" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>}
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.75) 0%,rgba(0,0,0,0.1) 50%,transparent 100%)"}}/>
              <div style={{position:"absolute",bottom:"2rem",left:"2rem",zIndex:2}}>
                <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:"0.5rem",letterSpacing:"0.3em",textTransform:"uppercase",color:"rgba(201,185,154,0.6)",marginBottom:"0.4rem"}}>{featuredCats[0]?`${featuredCats[0].count} looks`:"Bridal Glam"}</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.8rem",fontWeight:300,color:"#FAF8F5",fontStyle:"italic",lineHeight:1.1}}>{featuredCats[0]?.name||"Bridal Glam"}</div>
              </div>
              <div style={{position:"absolute",top:"1.5rem",right:"1.5rem",width:"32px",height:"32px",border:"1px solid rgba(201,185,154,0.35)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{color:"#C9B99A",fontSize:"0.9rem"}}>↗</span>
              </div>
            </div>
            {/* Celdas top/bottom */}
            {[1,2,3].map(i=>(
              i < 3 ? (
                <div key={i} className="feat-cell" style={{position:"relative",overflow:"hidden",
                  background:featuredCats[i]?.cover?"#1a1510":pgrd[i],cursor:"pointer"}}
                  onClick={()=>document.getElementById("portfolio")?.scrollIntoView({behavior:"smooth"})}>
                  {featuredCats[i]?.cover&&<img src={featuredCats[i].thumb||featuredCats[i].cover} alt={featuredCats[i].name} loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>}
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 55%)"}}/>
                  <div style={{position:"absolute",bottom:"1.2rem",left:"1.2rem",zIndex:2}}>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.2rem",fontWeight:300,color:"#FAF8F5",fontStyle:"italic"}}>{featuredCats[i]?.name||["Editorial","Soft Glam"][i-1]}</div>
                  </div>
                </div>
              ) : (
                <div key={i} style={{background:"#C9B99A",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"0.8rem",cursor:"pointer",padding:"1.5rem",transition:"background 0.3s"}}
                  onClick={()=>document.getElementById("portfolio")?.scrollIntoView({behavior:"smooth"})}
                  onMouseOver={e=>e.currentTarget.style.background="#C4A035"}
                  onMouseOut={e=>e.currentTarget.style.background="#C9B99A"}>
                  <div style={{width:"44px",height:"44px",border:"1px solid rgba(0,0,0,0.2)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <span style={{fontSize:"1.2rem",color:"#0A0A0A"}}>→</span>
                  </div>
                  <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:"0.5rem",letterSpacing:"0.28em",textTransform:"uppercase",color:"#0A0A0A",fontWeight:500,textAlign:"center",lineHeight:1.6}}>Ver todo el<br/>portfolio</div>
                </div>
              )
            ))}
          </div>
        </section>

        {/* ── VALORES ── */}
        <section style={{background:"#0A0A0A",padding:"8rem 0"}}>
          <div style={{maxWidth:"1100px",margin:"0 auto",padding:"0 3rem",display:"grid",gridTemplateColumns:"1fr 1.2fr",gap:"6rem",alignItems:"center"}} className="valores-grid">
            {/* Left column */}
            <div>
              <p style={{fontSize:"0.55rem",letterSpacing:"0.5em",textTransform:"uppercase",color:colors.ch,marginBottom:"1.2rem"}}>Lo que nos define</p>
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(2rem,4vw,3.2rem)",fontWeight:300,color:"#FAF8F5",marginBottom:"1.5rem",lineHeight:1.1}}>El valor de <em style={{color:colors.ch}}>cada look</em></h2>
              <div style={{width:"48px",height:"1px",background:"linear-gradient(90deg,#C9B99A,transparent)",marginBottom:"1.8rem"}}/>
              <p style={{fontSize:"0.72rem",lineHeight:2,color:colors.muted,fontWeight:300,letterSpacing:"0.04em",opacity:0.72}}>Cada sesión con Noreh es un compromiso total. Valores que guían cada pincelada y cada momento de trabajo.</p>
            </div>
            {/* Right column: 2x2 grid of cards */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
              {valoresData.map((v, idx) => (
                <div key={idx} className="valor-card"
                  style={{border:"1px solid rgba(201,185,154,0.12)",padding:"1.8rem",background:"#080807",transition:"border-color 0.35s",cursor:"default"}}>
                  <div style={{width:"38px",height:"38px",borderRadius:"50%",border:"1px solid rgba(201,185,154,0.35)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"1rem"}}>
                    {getValorIcon(v.icon)}
                  </div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.1rem",fontWeight:400,color:"#FAF8F5",marginBottom:"0.5rem"}}>{v.name}</div>
                  <div style={{fontSize:"0.62rem",lineHeight:1.8,color:colors.muted,fontWeight:300,opacity:0.72}}>{v.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SOBRE MÍ ── */}
        <section id="sobre-mí" style={{background:colors.surface,padding:"8rem 0"}}>
          <div style={{maxWidth:"1100px",margin:"0 auto",padding:"0 3rem",display:"grid",gridTemplateColumns:"1fr 1.2fr",gap:"6rem",alignItems:"center"}} className="about-grid">
            <div style={{position:"relative"}}>
              <div style={{aspectRatio:"3/4",background:isDark?"linear-gradient(145deg,#1a1510 0%,#0e0b07 100%)":"linear-gradient(145deg,#EDE8E2 0%,#D8CFC4 100%)",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(201,185,154,0.2)",position:"relative",overflow:"hidden"}}>
                {siteContent?.about?.photo ? (
                  <img src={siteContent.about.photo} alt="Noreh Mejía"
                    style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                ) : (
                  <>
                    <div style={{position:"absolute",inset:0,backgroundImage:"repeating-linear-gradient(45deg,transparent,transparent 20px,rgba(201,185,154,0.03) 20px,rgba(201,185,154,0.03) 21px)"}}/>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(6rem,15vw,11rem)",color:"rgba(201,185,154,0.07)",fontStyle:"italic",lineHeight:1,userSelect:"none"}}>N</div>
                    <div style={{position:"absolute",bottom:"1.5rem",left:0,right:0,textAlign:"center"}}>
                      <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:"0.46rem",letterSpacing:"0.3em",textTransform:"uppercase",color:"rgba(201,185,154,0.28)"}}>Fotografía próximamente</div>
                    </div>
                  </>
                )}
              </div>
              <div style={{position:"absolute",bottom:"-1rem",right:"-1rem",width:"55%",aspectRatio:"1",border:"1px solid rgba(201,185,154,0.1)",zIndex:-1}}/>
              <div style={{position:"absolute",top:"2rem",left:"-1px",background:colors.ch,padding:"0.5rem 1rem"}}>
                <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:"0.46rem",letterSpacing:"0.3em",textTransform:"uppercase",color:"#0A0A0A",fontWeight:500}}>Luxury MUA</div>
              </div>
            </div>
            <div>
              <p style={{fontSize:"0.55rem",letterSpacing:"0.5em",textTransform:"uppercase",color:colors.ch,marginBottom:"1.2rem"}}>Sobre la artista</p>
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(2rem,4vw,3.5rem)",fontWeight:300,lineHeight:1,color:colors.text,marginBottom:"1.8rem"}}>El arte de <em style={{color:colors.ch}}>transformar</em></h2>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.3rem",fontStyle:"italic",fontWeight:300,lineHeight:1.6,color:colors.text,marginBottom:"1.5rem",opacity:0.9}}>"El maquillaje no oculta — revela la versión más luminosa de ti misma."</p>
              <p style={{fontSize:"0.72rem",lineHeight:2,color:colors.muted,fontWeight:300,marginBottom:"1.2rem",letterSpacing:"0.04em",opacity:0.72}}>Noreh Mejía es una artista de maquillaje con sede en Ciudad de México, especializada en crear looks editoriales y de lujo que celebran la individualidad. Con años de experiencia en bodas de alto perfil, sesiones fotográficas editoriales y eventos de élite.</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.5rem",marginTop:"2.5rem",paddingTop:"2.5rem",borderTop:"1px solid rgba(201,185,154,0.15)"}}>
                {[["8+","Años de experiencia"],["500+","Novias maquilladas"],["100%","Satisfacción"],["CDMX","Y toda la República"]].map(([n,l])=>(
                  <div key={l}>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2.2rem",fontWeight:300,color:colors.ch,lineHeight:1}}>{n}</div>
                    <div style={{fontSize:"0.55rem",letterSpacing:"0.2em",textTransform:"uppercase",color:colors.muted,marginTop:"0.25rem"}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── SERVICIOS ENHANCED ── */}
        <section id="servicios" style={{background:colors.bg,padding:"8rem 0"}}>
          <div style={{maxWidth:"1200px",margin:"0 auto",padding:"0 3rem"}}>
            <div style={{textAlign:"center",maxWidth:"520px",margin:"0 auto 5rem"}}>
              <p style={{fontSize:"0.55rem",letterSpacing:"0.5em",textTransform:"uppercase",color:colors.ch,marginBottom:"1rem"}}>Servicios exclusivos</p>
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(2rem,4vw,3.5rem)",fontWeight:300,color:colors.text}}>Cada ocasión <em style={{color:colors.ch}}>merece</em> lo mejor</h2>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1.5rem"}} className="servicios-enhanced-grid">
              {serviciosData.map((svc, idx) => (
                <div key={idx} className="svc-card" style={{background:colors.bg,border:"1px solid rgba(201,185,154,0.1)",overflow:"hidden",transition:"border-color 0.35s,transform 0.35s",display:"flex",flexDirection:"column"}}>
                  {/* Photo */}
                  <div style={{aspectRatio:"4/3",overflow:"hidden",background:"#1a1510"}}>
                    <img
                      src={svc.photo || serviciosFotos[idx]}
                      alt={svc.name}
                      style={{width:"100%",height:"100%",objectFit:"cover",display:"block",transition:"transform 0.6s cubic-bezier(0.16,1,0.3,1)"}}
                      className="svc-photo"
                    />
                  </div>
                  {/* Body */}
                  <div style={{padding:"1.8rem",display:"flex",flexDirection:"column",flex:1}}>
                    <div style={{fontSize:"0.48rem",letterSpacing:"0.4em",textTransform:"uppercase",color:colors.ch,marginBottom:"0.6rem"}}>{svc.category}</div>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.4rem",fontWeight:400,color:colors.text,marginBottom:"0.4rem",lineHeight:1.2}}>{svc.name}</div>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1rem",fontStyle:"italic",color:colors.ch,marginBottom:"1rem"}}>{svc.price}</div>
                    <p style={{fontSize:"0.65rem",lineHeight:1.9,color:colors.muted,fontWeight:300,marginBottom:"1.2rem",opacity:0.72}}>{svc.description}</p>
                    {svc.features && (
                      <ul style={{listStyle:"none",marginBottom:"1.5rem",display:"flex",flexDirection:"column",gap:"0.4rem"}}>
                        {svc.features.map((f, fi) => (
                          <li key={fi} style={{fontSize:"0.6rem",color:colors.muted,display:"flex",alignItems:"center",gap:"0.55rem",opacity:0.72}}>
                            <span style={{width:"5px",height:"5px",borderRadius:"50%",background:colors.ch,flexShrink:0,display:"inline-block"}}/>
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div style={{marginTop:"auto"}}>
                      <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer"
                        style={{display:"inline-block",fontSize:"0.55rem",letterSpacing:"0.22em",textTransform:"uppercase",color:colors.ch,border:"1px solid rgba(201,185,154,0.35)",padding:"0.7rem 1.5rem",textDecoration:"none",transition:"all 0.3s",fontFamily:"'Montserrat',sans-serif"}}
                        onMouseOver={e=>{e.currentTarget.style.background="rgba(201,185,154,0.1)";e.currentTarget.style.borderColor=colors.ch;}}
                        onMouseOut={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="rgba(201,185,154,0.35)";}}>
                        Agendar →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ESPECIALIDADES ── */}
        <section style={{background:"#0A0A0A",minHeight:"600px",display:"grid",gridTemplateColumns:"1fr 1fr"}} className="especialidades-section">
          {/* Left: photo + overlay */}
          <div style={{position:"relative",overflow:"hidden",minHeight:"600px"}}>
            <img
              src={especialidadesData.photo}
              alt="Especialidades"
              style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",display:"block"}}
            />
            <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(8,8,7,0.82) 0%,rgba(8,8,7,0.55) 100%)"}}/>
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",justifyContent:"center",padding:"4rem"}}>
              <p style={{fontSize:"0.52rem",letterSpacing:"0.5em",textTransform:"uppercase",color:colors.ch,marginBottom:"1.2rem"}}>Especialidades</p>
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(2rem,3.5vw,3rem)",fontWeight:300,color:"#FAF8F5",marginBottom:"1.5rem",lineHeight:1.1}}>Donde el arte no tiene <em style={{color:colors.ch}}>límites</em></h2>
              <div style={{width:"48px",height:"1px",background:"linear-gradient(90deg,#C9B99A,transparent)",marginBottom:"1.8rem"}}/>
              <p style={{fontSize:"0.7rem",lineHeight:1.9,color:"rgba(250,248,245,0.72)",fontWeight:300,marginBottom:"2.5rem",maxWidth:"380px"}}>Dominamos cada estilo con precisión artística, desde la delicadeza nupcial hasta la audacia editorial.</p>
              <a href="#contacto"
                style={{display:"inline-block",fontSize:"0.56rem",letterSpacing:"0.22em",textTransform:"uppercase",color:"#0A0A0A",background:colors.ch,padding:"0.9rem 2rem",textDecoration:"none",fontFamily:"'Montserrat',sans-serif",fontWeight:500,transition:"background 0.3s",alignSelf:"flex-start"}}
                onMouseOver={e=>e.currentTarget.style.background=colors.gold}
                onMouseOut={e=>e.currentTarget.style.background=colors.ch}>
                Agendar sesión →
              </a>
            </div>
          </div>
          {/* Right: list */}
          <div style={{background:"#0d0c0b",display:"flex",flexDirection:"column",justifyContent:"center"}}>
            {especialidadesData.items.map((item, idx) => (
              <div key={idx} style={{padding:"2.2rem 3.5rem",borderBottom:idx < especialidadesData.items.length-1 ? "1px solid rgba(201,185,154,0.08)" : "none",transition:"background 0.3s"}}
                className="espec-item">
                <div style={{fontSize:"0.46rem",letterSpacing:"0.3em",color:"rgba(201,185,154,0.35)",marginBottom:"0.5rem",fontFamily:"'Montserrat',sans-serif"}}>{item.number}</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.3rem",fontWeight:400,color:"#FAF8F5",marginBottom:"0.4rem"}}>{item.name}</div>
                <div style={{fontSize:"0.62rem",lineHeight:1.8,color:colors.muted,fontWeight:300,opacity:0.72}}>{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PORTFOLIO ── */}
        <section id="portfolio">
          {categories.length > 0
            ? <OrbitalPortfolio categories={categories}/>
            : <div style={{background:"#0A0A0A",padding:"8rem 2rem",textAlign:"center"}}>
                <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.5rem",color:"rgba(201,185,154,0.5)",fontStyle:"italic"}}>{error||"Cargando portfolio..."}</p>
              </div>}
        </section>

        {/* ── TESTIMONIOS ── */}
        <section style={{background:"#0A0A0A",padding:"8rem 2rem",textAlign:"center"}}>
          <div style={{maxWidth:"720px",margin:"0 auto"}}>
            <p style={{fontSize:"0.52rem",letterSpacing:"0.5em",textTransform:"uppercase",color:colors.ch,marginBottom:"1.2rem"}}>Testimonios</p>
            <div style={{fontSize:"1.3rem",color:colors.ch,letterSpacing:"0.15em",marginBottom:"2.5rem"}}>★★★★★</div>
            <div style={{minHeight:"180px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",transition:"opacity 0.4s",opacity:testimonioVisible?1:0}}>
              <blockquote style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(1.2rem,2.5vw,1.8rem)",fontStyle:"italic",fontWeight:300,color:"#FAF8F5",lineHeight:1.6,marginBottom:"2rem",position:"relative",padding:"0 1rem"}}>
                <span style={{position:"absolute",top:"-0.5rem",left:"-0.5rem",fontFamily:"'Cormorant Garamond',serif",fontSize:"4rem",color:"rgba(201,185,154,0.12)",lineHeight:1,fontStyle:"normal"}}>"</span>
                {testimonios[testimonioIdx]?.quote}
                <span style={{position:"absolute",bottom:"-1.5rem",right:"-0.5rem",fontFamily:"'Cormorant Garamond',serif",fontSize:"4rem",color:"rgba(201,185,154,0.12)",lineHeight:1,fontStyle:"normal"}}>"</span>
              </blockquote>
              <div style={{marginTop:"1rem"}}>
                <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:"0.58rem",letterSpacing:"0.2em",textTransform:"uppercase",color:colors.ch,marginBottom:"0.2rem"}}>{testimonios[testimonioIdx]?.author}</div>
                <div style={{fontSize:"0.52rem",letterSpacing:"0.15em",textTransform:"uppercase",color:colors.muted,opacity:0.72}}>{testimonios[testimonioIdx]?.role}</div>
              </div>
            </div>
            {/* Navigation dots */}
            <div style={{display:"flex",justifyContent:"center",gap:"0.6rem",marginTop:"3rem"}}>
              {testimonios.map((_, di) => (
                <button key={di} onClick={()=>{setTestimonioVisible(false);setTimeout(()=>{setTestimonioIdx(di);setTestimonioVisible(true);},300);}}
                  style={{width:di===testimonioIdx?"24px":"8px",height:"8px",borderRadius:"4px",border:"none",background:di===testimonioIdx?colors.ch:"rgba(201,185,154,0.2)",cursor:"pointer",transition:"all 0.4s",padding:0}}/>
              ))}
            </div>
          </div>
        </section>

        {/* ── CONTACTO ── */}
        <section id="contacto" style={{background:"#0A0A0A",padding:"9rem 2rem"}}>
          <div style={{maxWidth:"660px",margin:"0 auto",textAlign:"center"}}>
            <p style={{fontFamily:"'Montserrat',sans-serif",fontSize:"0.52rem",letterSpacing:"0.5em",
              textTransform:"uppercase",color:colors.ch,marginBottom:"1.2rem"}}>
              Agenda tu sesión
            </p>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",
              fontSize:"clamp(2.4rem,5.5vw,4.2rem)",fontWeight:300,
              color:colors.ch,marginBottom:"1.5rem",lineHeight:1.1}}>
              Tu momento <em>comienza aquí</em>
            </h2>
            <div style={{width:"80px",height:"1px",
              background:"linear-gradient(90deg,transparent,#C9B99A,transparent)",
              margin:"0 auto 2.2rem"}}/>
            <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.2rem",
              fontStyle:"italic",fontWeight:300,lineHeight:1.7,
              color:"rgba(250,248,245,0.72)",marginBottom:"3.5rem"}}>
              Escríbeme directamente y creamos juntas el look perfecto para tu ocasión especial.
            </p>

            {/* WhatsApp CTA principal */}
            <a href={socialLinks.whatsapp} target="_blank"
              rel="noopener noreferrer"
              style={{display:"inline-flex",alignItems:"center",gap:"0.9rem",
                fontSize:"0.62rem",letterSpacing:"0.22em",textTransform:"uppercase",
                color:"#fff",background:"#25D366",
                padding:"1.2rem 3.2rem",textDecoration:"none",
                fontFamily:"'Montserrat',sans-serif",fontWeight:500,
                transition:"all 0.35s",marginBottom:"3rem",
                boxShadow:"0 8px 32px rgba(37,211,102,0.25)"}}
              onMouseOver={e=>{e.currentTarget.style.background="#1da851";e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 14px 40px rgba(37,211,102,0.4)";}}
              onMouseOut={e=>{e.currentTarget.style.background="#25D366";e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 8px 32px rgba(37,211,102,0.25)";}}>
              {waIcon}
              Escribir por WhatsApp
            </a>

            {/* Redes sociales con iconos SVG */}
            <div style={{borderTop:"1px solid rgba(201,185,154,0.08)",paddingTop:"2.5rem"}}>
              <p style={{fontFamily:"'Montserrat',sans-serif",fontSize:"0.48rem",letterSpacing:"0.4em",
                textTransform:"uppercase",color:"rgba(201,185,154,0.2)",marginBottom:"1.6rem"}}>
                También en redes
              </p>
              <div style={{display:"flex",gap:"2rem",justifyContent:"center",alignItems:"center",flexWrap:"wrap"}}>
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                  style={{color:"rgba(201,185,154,0.35)",textDecoration:"none",transition:"color 0.3s",display:"flex",alignItems:"center",gap:"0.5rem"}}
                  onMouseOver={e=>e.currentTarget.style.color=colors.ch}
                  onMouseOut={e=>e.currentTarget.style.color="rgba(201,185,154,0.35)"}>
                  {igIcon}
                </a>
                <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer"
                  style={{color:"rgba(201,185,154,0.35)",textDecoration:"none",transition:"color 0.3s",display:"flex",alignItems:"center",gap:"0.5rem"}}
                  onMouseOver={e=>e.currentTarget.style.color=colors.ch}
                  onMouseOut={e=>e.currentTarget.style.color="rgba(201,185,154,0.35)"}>
                  {ttIcon}
                </a>
                <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer"
                  style={{color:"rgba(201,185,154,0.35)",textDecoration:"none",transition:"color 0.3s",display:"flex",alignItems:"center",gap:"0.5rem"}}
                  onMouseOver={e=>e.currentTarget.style.color=colors.ch}
                  onMouseOut={e=>e.currentTarget.style.color="rgba(201,185,154,0.35)"}>
                  {waIcon}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{background:"#050504",padding:"4rem 0 2rem",borderTop:"1px solid rgba(201,185,154,0.06)"}}>
          <div style={{maxWidth:"1100px",margin:"0 auto",padding:"0 3rem",display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:"4rem",marginBottom:"3rem"}} className="footer-grid">
            <div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.2rem",letterSpacing:"0.4em",color:colors.ch,textTransform:"uppercase",marginBottom:"0.8rem"}}>Noreh Beauty Room</div>
              <p style={{fontSize:"0.6rem",letterSpacing:"0.12em",color:"rgba(201,185,154,0.3)",fontWeight:300,lineHeight:1.8,textTransform:"uppercase"}}>Arte · Lujo · Transformación<br/>Ciudad de México</p>
            </div>
            <div>
              <p style={{fontSize:"0.5rem",letterSpacing:"0.4em",textTransform:"uppercase",color:"rgba(201,185,154,0.3)",marginBottom:"1.5rem"}}>Navegación</p>
              <div style={{display:"flex",flexDirection:"column",gap:"0.7rem"}}>
                {[["Sobre mí","#sobre-mí"],["Servicios","#servicios"],["Portfolio","#portfolio"],["Contacto","#contacto"]].map(([label,href])=>(
                  <a key={label} href={href}
                    style={{fontSize:"0.65rem",letterSpacing:"0.1em",color:"rgba(201,185,154,0.35)",textDecoration:"none",transition:"color 0.3s",fontWeight:300}}
                    onMouseOver={e=>e.target.style.color=colors.ch}
                    onMouseOut={e=>e.target.style.color="rgba(201,185,154,0.35)"}>{label}</a>
                ))}
              </div>
            </div>
            <div>
              <p style={{fontSize:"0.5rem",letterSpacing:"0.4em",textTransform:"uppercase",color:"rgba(201,185,154,0.3)",marginBottom:"1.5rem"}}>Redes</p>
              <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                  style={{color:"rgba(201,185,154,0.35)",textDecoration:"none",transition:"color 0.3s",display:"flex",alignItems:"center",gap:"0.6rem"}}
                  onMouseOver={e=>e.currentTarget.style.color=colors.ch}
                  onMouseOut={e=>e.currentTarget.style.color="rgba(201,185,154,0.35)"}>
                  {igIcon}
                  <span style={{fontSize:"0.6rem",letterSpacing:"0.1em",fontWeight:300}}>Instagram</span>
                </a>
                <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer"
                  style={{color:"rgba(201,185,154,0.35)",textDecoration:"none",transition:"color 0.3s",display:"flex",alignItems:"center",gap:"0.6rem"}}
                  onMouseOver={e=>e.currentTarget.style.color=colors.ch}
                  onMouseOut={e=>e.currentTarget.style.color="rgba(201,185,154,0.35)"}>
                  {ttIcon}
                  <span style={{fontSize:"0.6rem",letterSpacing:"0.1em",fontWeight:300}}>TikTok</span>
                </a>
                <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer"
                  style={{color:"rgba(201,185,154,0.35)",textDecoration:"none",transition:"color 0.3s",display:"flex",alignItems:"center",gap:"0.6rem"}}
                  onMouseOver={e=>e.currentTarget.style.color=colors.ch}
                  onMouseOut={e=>e.currentTarget.style.color="rgba(201,185,154,0.35)"}>
                  {waIcon}
                  <span style={{fontSize:"0.6rem",letterSpacing:"0.1em",fontWeight:300}}>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
          <div style={{maxWidth:"1100px",margin:"0 auto",padding:"2rem 3rem 0",borderTop:"1px solid rgba(201,185,154,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"0.5rem"}}>
            <span style={{fontSize:"0.52rem",letterSpacing:"0.15em",color:"rgba(201,185,154,0.15)",textTransform:"uppercase"}}>© 2025 Noreh Beauty Room</span>
            <span style={{fontSize:"0.52rem",letterSpacing:"0.15em",color:"rgba(201,185,154,0.15)",textTransform:"uppercase"}}>Ciudad de México</span>
          </div>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{__html:`
        *{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{overflow-x:hidden;cursor:crosshair}

        /* ── Cursor — oculto en dispositivos táctiles ── */
        @media(pointer:coarse){
          body{cursor:auto}
          .nbr-cur{display:none!important}
        }
        .nbr-cur{
          position:fixed;top:0;left:0;z-index:9999;
          width:8px;height:8px;
          background:#f0ede8;
          border-radius:50%;
          pointer-events:none;
          transform:translate(-50%,-50%);
          transition:width 0.2s,height 0.2s,background 0.2s;
          mix-blend-mode:difference;
        }
        .nbr-cur.cur-hover{width:38px;height:38px;}

        /* ── Loader ── */
        .nbr-loader{
          position:fixed;inset:0;z-index:2000;
          background:#080807;
          display:flex;flex-direction:column;
          align-items:center;justify-content:center;
          transition:opacity 0.9s ease,visibility 0.9s ease;
        }
        .nbr-loader--out{opacity:0;visibility:hidden;pointer-events:none;}
        .nbr-loader-bar{
          height:100%;width:0;
          background:#C9B99A;
          animation:ldBar 2.2s ease forwards 0.4s;
        }

        /* ── WhatsApp ── */
        .nbr-wa{
          position:fixed;bottom:2rem;right:2rem;z-index:800;
          display:flex;align-items:center;gap:0.6rem;
          background:#25D366;color:#fff;
          padding:0.8rem 1.3rem;border-radius:100px;
          text-decoration:none;
          font-family:'Montserrat',sans-serif;
          font-size:0.58rem;letter-spacing:0.12em;
          font-weight:500;text-transform:uppercase;
          box-shadow:0 8px 30px rgba(37,211,102,0.3);
          transition:transform 0.3s,box-shadow 0.3s;
        }
        .nbr-wa:hover{transform:scale(1.05) translateY(-2px);box-shadow:0 14px 40px rgba(37,211,102,0.45);}

        /* ── Orbital ── */
        @keyframes orbitSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes orbitCtr{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
        .orb-item .orb-img-wrap{
          filter:grayscale(55%) brightness(0.68);
          transition:filter 0.45s,transform 0.45s,border-color 0.45s;
        }
        .orb-item:hover .orb-img-wrap{
          filter:grayscale(0%) brightness(1.05);
          transform:scale(1.07);
          border-color:rgba(201,185,154,0.55)!important;
        }
        .orb-label{
          position:absolute;bottom:-22px;left:50%;transform:translateX(-50%);
          font-family:'Montserrat',sans-serif;
          font-size:0.4rem;letter-spacing:0.35em;
          color:#C9B99A;text-transform:uppercase;
          white-space:nowrap;opacity:0;transition:opacity 0.3s;
        }
        .orb-item:hover .orb-label{opacity:1;}

        /* ── Hero orbs ── */
        @keyframes orbFloat{
          0%{opacity:0;transform:scale(0.8) translate(0,0)}
          25%{opacity:1}
          50%{opacity:0.8;transform:scale(1.1) translate(3%,-3%)}
          75%{opacity:1}
          100%{opacity:0;transform:scale(0.9) translate(-2%,2%)}
        }

        /* ── Noise ── */
        .hero-noise{
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
          background-repeat:repeat;background-size:200px;
          animation:grain 0.6s steps(2) infinite;
        }
        @keyframes grain{
          0%,100%{transform:translate(0,0)}
          10%{transform:translate(-2%,-3%)}
          20%{transform:translate(3%,2%)}
          30%{transform:translate(-1%,4%)}
          40%{transform:translate(2%,-1%)}
          50%{transform:translate(-3%,2%)}
          60%{transform:translate(1%,-3%)}
          70%{transform:translate(3%,1%)}
          80%{transform:translate(-2%,3%)}
          90%{transform:translate(2%,2%)}
        }

        /* ── Scroll line ── */
        .scroll-line{
          width:1px;height:50px;
          background:linear-gradient(to bottom,rgba(201,185,154,0.6),transparent);
          animation:scrollLine 2s ease infinite;
        }
        @keyframes scrollLine{
          0%{transform:scaleY(0);transform-origin:top;opacity:1}
          50%{transform:scaleY(1);transform-origin:top;opacity:1}
          51%{transform-origin:bottom}
          100%{transform:scaleY(0);transform-origin:bottom;opacity:0}
        }

        /* ── Featured ── */
        .feat-cell img{transition:transform 0.8s cubic-bezier(0.16,1,0.3,1);}
        .feat-cell:hover img{transform:scale(1.06);}

        /* ── Valor card hover ── */
        .valor-card:hover{border-color:rgba(201,185,154,0.3)!important;}

        /* ── Servicio card hover ── */
        .svc-card:hover{border-color:rgba(201,185,154,0.3)!important;transform:translateY(-4px);}
        .svc-card:hover .svc-photo{transform:scale(1.05);}

        /* ── Especialidad item hover ── */
        .espec-item:hover{background:rgba(201,185,154,0.04)!important;}

        /* ── General animations ── */
        @keyframes ldFadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes galSkeleton{0%,100%{opacity:0.4}50%{opacity:0.8}}
        @keyframes ldFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes ldBar{to{width:100%}}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}

        /* ── Nav ── */
        .hamburger{display:none;}
        .nav-links-desktop{display:flex;}

        /* ── Responsive ── */
        @media(max-width:768px){
          .hamburger{display:flex!important;}
          .nav-links-desktop{display:none!important;}
          nav{padding:1rem 1.5rem!important;}
          .about-grid{grid-template-columns:1fr!important;gap:3rem!important;}
          .valores-grid{grid-template-columns:1fr!important;gap:3rem!important;}
          .servicios-enhanced-grid{grid-template-columns:1fr!important;}
          .especialidades-section{grid-template-columns:1fr!important;}
          .footer-grid{grid-template-columns:1fr!important;gap:2rem!important;}
          .featured-grid{grid-template-columns:1fr 1fr!important;grid-template-rows:40vw 40vw 40vw!important;}
          .featured-grid>div:first-child{grid-row:1/2!important;grid-column:1/3!important;}
          .nbr-wa-label{display:none;}
          .nbr-wa{padding:0.85rem!important;border-radius:50%!important;}
        }
        @media(max-width:480px){
          .featured-grid{grid-template-columns:1fr!important;grid-template-rows:repeat(5,55vw)!important;}
          .featured-grid>div:first-child{grid-column:1/2!important;}
        }
      `}}/>
    </>
  );
}

export async function getStaticProps() {
  let siteContent = {};
  let categories  = [];

  try {
    const { readContent } = await import("../lib/content");
    siteContent = await readContent();
  } catch(e) {}

  try {
    const { getPortfolio } = await import("../lib/drive");
    categories = await getPortfolio();
  } catch(err) {
    console.error("Build portfolio error:", err.message);
  }

  // Aplicar orden y visibilidad definidos en el admin
  const featuredIds = siteContent?.portfolio?.featured;
  if (featuredIds && featuredIds.length > 0) {
    const ordered = featuredIds.map(id => categories.find(c => c.id === id)).filter(Boolean);
    const hidden  = new Set(siteContent?.portfolio?.hidden || []);
    categories = ordered.filter(c => !hidden.has(c.id));
  }

  return {
    props: { categories, siteContent },
    revalidate: 3600,
  };
}
