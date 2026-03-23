import { ImageResponse } from "next/og";
import { getProductBySlug } from "@/lib/products";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ProductOgImage({
  params,
}: {
  params: { locale: string; segment: string };
}) {
  const product = getProductBySlug(params.segment);
  const isAr = params.locale === "ar";


  const productName = isAr ? product?.nameAr : product?.nameEn;
  const brand = product?.brand ?? "";
  const model = product?.modelNumber ?? "";
  const category = product?.category ?? "";

  const title = product
    ? `${brand} ${model}`
    : "Ahmed Dawod";

  const subtitle = product
    ? (productName ?? model)
    : isAr ? "رولمان البلي الأصلي" : "Genuine Ball Bearings";

  const tagline = isAr
    ? "أحمد داود · رولمان البلي الأصلي · مصر"
    : "Ahmed Dawod · Genuine Bearings · Egypt";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%",
          display: "flex", flexDirection: "column",
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #1d4ed8 100%)",
          position: "relative", overflow: "hidden", fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Background bearing circles */}
        <div style={{ position:"absolute", top:-160, right:-160, width:500, height:500, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.06)", display:"flex" }} />
        <div style={{ position:"absolute", top:-100, right:-100, width:380, height:380, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.04)", display:"flex" }} />
        <div style={{ position:"absolute", bottom:-120, left:-80, width:400, height:400, borderRadius:"50%", border:"2px solid rgba(245,158,11,0.08)", display:"flex" }} />

        {/* Bearing illustration top-right */}
        <div style={{ position:"absolute", top:40, right:60, display:"flex", opacity:0.12 }}>
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="90" stroke="white" strokeWidth="10"/>
            <circle cx="100" cy="100" r="70" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="8 5"/>
            {[0,1,2,3,4,5,6,7].map(i => {
              const a = (i/8)*2*Math.PI;
              return <circle key={i} cx={100+70*Math.cos(a)} cy={100+70*Math.sin(a)} r="9" fill="white" strokeWidth="2" stroke="white"/>;
            })}
            <circle cx="100" cy="100" r="35" stroke="white" strokeWidth="6"/>
            <circle cx="100" cy="100" r="14" fill="white"/>
          </svg>
        </div>

        {/* Content */}
        <div style={{ display:"flex", flexDirection:"column", justifyContent:"center", height:"100%", padding:"60px 80px", gap:0 }}>
          {/* Brand tag */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>⚙️</div>
            <span style={{ fontSize:16, fontWeight:700, color:"rgba(255,255,255,0.6)", letterSpacing:"0.08em", textTransform:"uppercase" }}>
              Ahmed Dawod Bearings
            </span>
          </div>

          {/* Product model — large */}
          <div style={{ fontSize:80, fontWeight:900, color:"#ffffff", letterSpacing:"-2px", lineHeight:1, display:"flex", marginBottom:16 }}>
            {title}
          </div>

          {/* Product name */}
          <div style={{ fontSize:32, color:"rgba(255,255,255,0.75)", fontWeight:600, lineHeight:1.3, display:"flex", marginBottom:24 }}>
            {subtitle}
          </div>

          {/* Category + divider */}
          {category && (
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:32 }}>
              <div style={{ width:40, height:3, background:"#f59e0b", borderRadius:2 }} />
              <span style={{ fontSize:18, color:"rgba(255,255,255,0.5)", fontWeight:500 }}>{category}</span>
            </div>
          )}

          {/* Bottom strip */}
          <div style={{ display:"flex", gap:16, marginTop:"auto" }}>
            {["SKF","NSK","NTN","FAG","HIWIN","TIMKEN"].map(b => (
              <div key={b} style={{ fontSize:14, fontWeight:700, color:"rgba(255,255,255,0.35)", letterSpacing:"1px", display:"flex" }}>{b}</div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <div style={{ position:"absolute", bottom:30, right:80, fontSize:15, color:"rgba(255,255,255,0.3)", display:"flex" }}>
          {tagline}
        </div>
      </div>
    ),
    { ...size }
  );
}
