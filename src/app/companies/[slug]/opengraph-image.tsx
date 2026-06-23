import { ImageResponse } from "next/og";
import { companies, getCompany, validCategories } from "@/data/companies";
import { CATEGORY_MAP, GROUP_MAP } from "@/data/taxonomy";
import { SITE_NAME } from "@/lib/site";

export const alt = "Company profile on Stablytics — The Stablecoin Market Map";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Prerender an OG image for every company at build time.
export function generateStaticParams() {
  return companies.map((c) => ({ slug: c.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCompany(slug);
  // Normalize to ASCII-friendly punctuation so glyphs always render.
  const ascii = (s: string) =>
    s.replace(/[—–]/g, "-").replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
  const name = ascii(c?.name ?? SITE_NAME);
  const tagline = ascii(c?.tagline ?? "The Stablecoin Market Map");
  const cats = c ? validCategories(c).map((k) => CATEGORY_MAP[k]).filter(Boolean) : [];
  const accent = cats[0] ? GROUP_MAP[cats[0].group]?.accent ?? "#10b981" : "#10b981";

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
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 26, color: "#a3a3a3" }}>
          <div style={{ width: 16, height: 16, borderRadius: 5, background: accent, display: "flex" }} />
          <div style={{ display: "flex" }}>{SITE_NAME}</div>
          <div style={{ width: 4, height: 4, borderRadius: 2, background: "#666", display: "flex" }} />
          <div style={{ display: "flex" }}>The Stablecoin Market Map</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 800, lineHeight: 1.0 }}>{name}</div>
          <div style={{ display: "flex", fontSize: 38, color: "#d4d4d4", lineHeight: 1.2 }}>{tagline}</div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {cats.slice(0, 4).map((cat) => (
            <div
              key={cat.key}
              style={{
                display: "flex",
                fontSize: 24,
                padding: "8px 18px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.06)",
                color: accent,
                border: `1px solid ${accent}`,
              }}
            >
              {cat.label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
