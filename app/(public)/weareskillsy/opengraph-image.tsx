import { ImageResponse } from "next/og";
import { OG_BRAND, ogContentType, ogSize } from "@/lib/og-image-templates";

export const alt = "Skillsy - O que é o Skillsy";
export const size = ogSize;
export const contentType = ogContentType;

const principles = [
  {
    title: "Crescimento",
    body: "Abrir espaço para talentos locais e oportunidades reais.",
    toneBg: "#FEE2E2",
    toneText: "#DC2626",
  },
  {
    title: "Serviço",
    body: "Fortalecer ajuda prática e responsabilidade na comunidade.",
    toneBg: "#FEF3C7",
    toneText: "#B45309",
  },
  {
    title: "Confiança",
    body: "Facilitar conexões mais seguras, claras e respeitosas.",
    toneBg: "#DBEAFE",
    toneText: "#1D4ED8",
  },
];

const highlights = [
  "Uma plataforma de conexões",
  "Visibilidade para talentos",
  "Apoio mútuo com propósito",
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
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: "34px",
            background: OG_BRAND.cardBg,
            border: OG_BRAND.cardBorder,
            boxShadow: OG_BRAND.cardShadow,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "258px",
              display: "flex",
              justifyContent: "space-between",
              padding: "34px 36px",
              background: OG_BRAND.heroDark,
              color: "#ffffff",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: "-42px",
                top: "-26px",
                width: "220px",
                height: "220px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.10)",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: "112px",
                bottom: "-60px",
                width: "176px",
                height: "176px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.08)",
              }}
            />

            <div
              style={{
                width: "64%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                zIndex: 1,
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
                    width: "64px",
                    height: "64px",
                    borderRadius: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#ffffff",
                    color: OG_BRAND.primary,
                    fontSize: "30px",
                    fontWeight: 800,
                  }}
                >
                  S
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <div style={{ fontSize: "28px", fontWeight: 800 }}>Skillsy</div>
                  <div
                    style={{
                      fontSize: "18px",
                      color: "rgba(255,255,255,0.84)",
                    }}
                  >
                    Missão, valores e visão
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignSelf: "flex-start",
                    borderRadius: "999px",
                    background: OG_BRAND.whiteOverlay,
                    padding: "10px 16px",
                    fontSize: "16px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  Sobre o projeto
                </div>
                <div
                  style={{
                    fontSize: "47px",
                    lineHeight: 1.04,
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    maxWidth: "640px",
                  }}
                >
                  Talentos, confiança e serviços transformados em conexões reais
                </div>
                <div
                  style={{
                    fontSize: "22px",
                    lineHeight: 1.34,
                    color: "rgba(255,255,255,0.88)",
                    maxWidth: "610px",
                  }}
                >
                  Uma miniatura que se aproxima do hero institucional e dos
                  pilares apresentados na página.
                </div>
              </div>
            </div>

            <div
              style={{
                width: "36%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "flex-end",
                gap: "10px",
                zIndex: 1,
              }}
            >
              {highlights.map((item) => (
                <div
                  key={item}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "999px",
                    background: "rgba(255,255,255,0.14)",
                    color: "#ffffff",
                    fontSize: "16px",
                    fontWeight: 700,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              width: "100%",
              height: "344px",
              display: "flex",
              gap: "18px",
              padding: "28px 32px 30px",
              background:
                "linear-gradient(180deg, rgba(246,250,255,1) 0%, rgba(255,255,255,1) 100%)",
            }}
          >
            <div
              style={{
                width: "44%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    ...OG_BRAND.eyebrow,
                  }}
                >
                  O que o Skillsy é
                </div>
                <div
                  style={{
                    fontSize: "34px",
                    fontWeight: 800,
                    lineHeight: 1.08,
                    color: "#0F172A",
                  }}
                >
                  Uma iniciativa para aproximar pessoas com mais contexto e apoio
                </div>
                <div
                  style={{
                    fontSize: "19px",
                    lineHeight: 1.35,
                    color: "#475569",
                  }}
                >
                  A página institucional apresenta missão, valores e a forma
                  como a plataforma quer fortalecer relações de confiança.
                </div>
              </div>

              <div
                style={{
                  borderRadius: "22px",
                  padding: "18px",
                  background: OG_BRAND.panelBg,
                  border: OG_BRAND.panelBorder,
                  fontSize: "18px",
                  color: "#334155",
                  lineHeight: 1.32,
                }}
              >
                Mais do que um diretório, o Skillsy nasce para facilitar o
                encontro entre quem precisa de ajuda e quem pode servir com seu
                trabalho.
              </div>
            </div>

            <div
              style={{
                width: "56%",
                display: "flex",
                gap: "12px",
              }}
            >
              {principles.map((principle) => (
                <div
                  key={principle.title}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "14px",
                    padding: "20px 18px",
                    borderRadius: "24px",
                    background: "#ffffff",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
                  }}
                >
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: principle.toneBg,
                      color: principle.toneText,
                      fontSize: "24px",
                      fontWeight: 800,
                    }}
                  >
                    •
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: 800,
                        lineHeight: 1.16,
                        color: "#0F172A",
                      }}
                    >
                      {principle.title}
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        lineHeight: 1.32,
                        color: "#475569",
                      }}
                    >
                      {principle.body}
                    </div>
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
