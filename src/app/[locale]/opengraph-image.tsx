import { ImageResponse } from "next/og";

export const alt = "أحمد داود — دقة في الحركة، ثبات في الأداء";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)",
          position: "relative",
          overflow: "hidden",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
            display: "flex",
          }}
        />

        {/* Logo area */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 90,
            height: 90,
            borderRadius: 20,
            background: "rgba(255,255,255,0.12)",
            marginBottom: 24,
            border: "1.5px solid rgba(255,255,255,0.2)",
          }}
        >
          <div style={{ fontSize: 44, display: "flex" }}>⚙️</div>
        </div>

        {/* Brand name */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-1px",
            marginBottom: 8,
            display: "flex",
          }}
        >
          أحمد داود
        </div>

        {/* Slogan */}
        <div
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.75)",
            marginBottom: 32,
            display: "flex",
          }}
        >
          دقة في الحركة… ثبات في الأداء
        </div>

        {/* Divider */}
        <div
          style={{
            width: 60,
            height: 3,
            background: "#f59e0b",
            borderRadius: 2,
            marginBottom: 28,
            display: "flex",
          }}
        />

        {/* Description */}
        <div
          style={{
            fontSize: 20,
            color: "rgba(255,255,255,0.6)",
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.5,
            display: "flex",
          }}
        >
          رولمان البلي الأصلي · قطع غيار الماكينات · الماركات العالمية
        </div>

        {/* Bottom brand strip */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            display: "flex",
            gap: 20,
            alignItems: "center",
          }}
        >
          {["SKF", "NSK", "NTN", "FAG", "HIWIN", "TIMKEN"].map((b) => (
            <div
              key={b}
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "rgba(255,255,255,0.45)",
                letterSpacing: "1px",
                display: "flex",
              }}
            >
              {b}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
