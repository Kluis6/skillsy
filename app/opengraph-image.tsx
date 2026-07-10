import { ImageResponse } from "next/og";
import { OG_BRAND, ogContentType, ogSize } from "@/lib/og-image-templates";

export const alt = "Skillsy - Rede de profissionais e serviços de confiança";
export const size = ogSize;
export const contentType = ogContentType;

const categoryChips = [
  "Tecnologia",
  "Design",
  "Aulas",
  "Marcenaria",
  "Doméstico",
  "Construção Civil",
];

const providerCards = [
  {
    name: "Marina Souza",
    service: "Design e identidade visual",
    rating: "5.0",
    location: "Campinas, SP",
  },
  {
    name: "Carlos Mendes",
    service: "Reformas e manutenção",
    rating: "4.9",
    location: "Curitiba, PR",
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
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: "16px",
            background: OG_BRAND.cardBg,
            border: OG_BRAND.cardBorder,
            boxShadow: OG_BRAND.cardShadow,
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "250px",
              display: "flex",
              padding: "34px 36px",
              background: OG_BRAND.heroBlue,
              color: "#ffffff",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: "-40px",
                top: "-36px",
                width: "220px",
                height: "220px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.14)",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: "120px",
                bottom: "-54px",
                width: "180px",
                height: "180px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.12)",
              }}
            />
            <div
              style={{
                width: "58%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
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
                    borderRadius: "16px",
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
                  <div style={{ display: "flex", fontSize: "28px", fontWeight: 800 }}>
                    Skillsy
                  </div>
                  <div
                    style={{
                      display: "flex",
                      fontSize: "18px",
                      color: "rgba(255,255,255,0.82)",
                    }}
                  >
                    Network entre membros
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
                    fontSize: "17px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  Página inicial
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: "50px",
                    lineHeight: 1.04,
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                  }}
                >
                  Encontre profissionais e serviços com mais confiança
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: "23px",
                    lineHeight: 1.34,
                    color: "rgba(255,255,255,0.88)",
                    maxWidth: "560px",
                  }}
                >
                  Uma home focada em descoberta de talentos, categorias e perfis
                  públicos compartilháveis.
                </div>
              </div>
            </div>

            <div
              style={{
                width: "42%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "flex-end",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "370px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.16)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  fontSize: "18px",
                }}
              >
                <div style={{ display: "flex" }}>Buscar profissionais...</div>
                <div style={{ display: "flex", fontWeight: 700 }}>⌕</div>
              </div>
            </div>
          </div>

          <div
            style={{
              width: "100%",
              height: "352px",
              display: "flex",
              padding: "28px 32px 30px",
              gap: "22px",
              background:
                "linear-gradient(180deg, rgba(246,250,255,1) 0%, rgba(255,255,255,1) 100%)",
            }}
          >
            <div
              style={{
                width: "40%",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  ...OG_BRAND.eyebrow,
                }}
              >
                Categorias populares
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                {categoryChips.map((chip) => (
                  <div
                    key={chip}
                    style={{
                      borderRadius: "999px",
                      padding: "10px 14px",
                      background: OG_BRAND.chipBg,
                      color: OG_BRAND.primary,
                      fontSize: "16px",
                      fontWeight: 700,
                    }}
                  >
                    {chip}
                  </div>
                ))}
              </div>
              <div
                style={{
                  marginTop: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    padding: "18px",
                    borderRadius: "12px",
                    background: OG_BRAND.panelBg,
                    border: OG_BRAND.panelBorder,
                  }}
                >
                  <div style={{ display: "flex", fontSize: "18px", fontWeight: 800 }}>
                    Busca contextual
                  </div>
                  <div style={{ display: "flex", fontSize: "16px", color: "#4B5563", lineHeight: 1.3 }}>
                    Combine categoria, região e reputação para encontrar ajuda
                    com mais clareza.
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    padding: "18px",
                    borderRadius: "12px",
                    background: OG_BRAND.panelBg,
                    border: OG_BRAND.panelBorder,
                  }}
                >
                  <div style={{ display: "flex", fontSize: "18px", fontWeight: 800 }}>
                    Rede de confiança
                  </div>
                  <div style={{ display: "flex", fontSize: "16px", color: "#4B5563", lineHeight: 1.3 }}>
                    Transforme indicação em conexão prática entre membros.
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                width: "60%",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  ...OG_BRAND.eyebrow,
                }}
              >
                Perfis em destaque
              </div>
              {providerCards.map((card) => (
                <div
                  key={card.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "20px 22px",
                    borderRadius: "16px",
                    background: "#ffffff",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "999px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: OG_BRAND.primarySoft,
                        color: OG_BRAND.primary,
                        fontSize: "24px",
                        fontWeight: 800,
                      }}
                    >
                      {card.name.charAt(0)}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <div style={{ display: "flex", fontSize: "22px", fontWeight: 800 }}>
                        {card.name}
                      </div>
                      <div style={{ display: "flex", fontSize: "18px", color: "#4B5563" }}>
                        {card.service}
                      </div>
                      <div style={{ display: "flex", fontSize: "16px", color: "#4B5563" }}>
                        {card.location}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        borderRadius: "999px",
                        padding: "8px 14px",
                        background: "#F0F7FF",
                        color: "#0066FF",
                        fontSize: "15px",
                        fontWeight: 700,
                      }}
                    >
                      Membro verificado
                    </div>
                    <div
                      style={{
                        display: "flex",
                        fontSize: "20px",
                        fontWeight: 800,
                        color: "#0066FF",
                      }}
                    >
                      Nota {card.rating}
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
