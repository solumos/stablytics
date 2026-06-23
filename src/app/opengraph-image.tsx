import { ImageResponse } from "next/og";
import { totalCompanies } from "@/data/companies";
import { SITE_NAME } from "@/lib/site";

export const alt = "Stablytics — The Stablecoin Market Map";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GROUP_COLORS = ["#10b981", "#0ea5e9", "#8b5cf6", "#f59e0b", "#f43f5e"];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          color: "#ffffff",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: "#10b981",
              display: "flex",
            }}
          />
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700 }}>{SITE_NAME}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 78, fontWeight: 800, lineHeight: 1.05 }}>
            The Stablecoin Market Map
          </div>
          <div style={{ display: "flex", fontSize: 34, color: "#a3a3a3" }}>
            {totalCompanies} companies building the stablecoin economy
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {GROUP_COLORS.map((c) => (
            <div key={c} style={{ width: 86, height: 10, borderRadius: 5, background: c }} />
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
