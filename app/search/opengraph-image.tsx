import { ImageResponse } from "next/og";
import { OG_BRAND, ogContentType, ogSize } from "@/lib/og-image-templates";

export const alt = "Skillsy - Busca de profissionais";
export const size = ogSize;
export const contentType = ogContentType;

const categories = [
  "Tecnologia",
  "Vendas",
  "Aulas",
  "Doméstico",
  "Marcenaria",
  "Construção Civil",
];

const results = [
  {
    name: "Rafael Lima",
    service: "Aulas particulares de inglês",
    meta: "Campinas, SP • Nota 4.9",
  },
  {
    name: "Fernanda Costa",
    service: "Serviços domésticos e organização",
    meta: "Sorocaba, SP • Nota 5.0",
  },
  {
    name: "João Victor",
    service: "Marcenaria sob medida",
    meta: "Jundiaí, SP • Nota 4.8",
  },
];

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: "28px",
          background: OG_BRAND.bg,
          color: OG_BRAND.text,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            overflow: "hidden",
            borderRadius: "34px",
            background: OG_BRAND.cardBg,
            border: OG_BRAND.cardBorder,
            boxShadow: OG_BRAND.cardShadow,
          }}
        >
          <div
            style={{
              width: "34%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              padding: "30px 24px",
              background:
                "linear-gradient(180deg, rgba(246,250,255,1) 0%, rgba(255,255,255,1) 100%)",
              borderRight: "1px solid #E2E8F0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: OG_BRAND.primary,
                  color: "#ffffff",
                  fontSize: "28px",
                  fontWeight: 800,
                }}
              >
                S
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "3px",
                }}
              >
                <div style={{ fontSize: "24px", fontWeight: 800 }}>Skillsy</div>
                <div style={{ fontSize: "16px", color: "#64748B" }}>Busca pública</div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                borderRadius: "999px",
                background: OG_BRAND.primaryPill,
                color: OG_BRAND.primaryPillText,
                padding: "10px 14px",
                fontSize: "15px",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              Filtros e categorias
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginTop: "6px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                  padding: "16px",
                  borderRadius: "20px",
                  background: OG_BRAND.panelBg,
                  border: OG_BRAND.panelBorder,
                }}
              >
                <div style={{ ...OG_BRAND.eyebrow, fontSize: "14px" }}>
                  LOCALIZAÇÃO
                </div>
                <div style={{ fontSize: "18px", fontWeight: 700 }}>
                  Campinas, São Paulo
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                {categories.map((category) => (
                  <div
                    key={category}
                    style={{
                      borderRadius: "999px",
                      padding: "9px 12px",
                      background: OG_BRAND.chipBg,
                      color: OG_BRAND.primary,
                      fontSize: "14px",
                      fontWeight: 700,
                    }}
                  >
                    {category}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              width: "66%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                padding: "30px 32px 20px",
                background: OG_BRAND.heroBlue,
                color: "#ffffff",
              }}
            >
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 16px",
                  borderRadius: "20px",
                  background: OG_BRAND.whiteOverlay,
                  border: OG_BRAND.whiteOverlayBorder,
                }}
              >
                <div style={{ fontSize: "20px", color: "rgba(255,255,255,0.88)" }}>
                  Buscar profissionais...
                </div>
                <div style={{ fontSize: "20px", fontWeight: 800 }}>⌕</div>
              </div>
              <div
                style={{
                  fontSize: "42px",
                  lineHeight: 1.06,
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  maxWidth: "690px",
                }}
              >
                Encontre profissionais por categoria, localização e confiança
              </div>
              <div
                style={{
                  fontSize: "21px",
                  lineHeight: 1.34,
                  color: "rgba(255,255,255,0.86)",
                  maxWidth: "620px",
                }}
              >
                Uma miniatura que se parece com a experiência de busca real da
                plataforma, com filtros e resultados.
              </div>
            </div>

            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                padding: "18px 24px 24px",
                background: "#ffffff",
              }}
            >
              {results.map((result) => (
                <div
                  key={result.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "18px",
                    padding: "16px 18px",
                    borderRadius: "22px",
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "999px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: OG_BRAND.primarySoft,
                        color: OG_BRAND.primary,
                        fontSize: "22px",
                        fontWeight: 800,
                      }}
                    >
                      {result.name.charAt(0)}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <div style={{ fontSize: "20px", fontWeight: 800 }}>
                        {result.name}
                      </div>
                      <div style={{ fontSize: "17px", color: "#475569" }}>
                        {result.service}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      color: "#64748B",
                      fontWeight: 700,
                    }}
                  >
                    {result.meta}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
