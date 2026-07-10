import { ImageResponse } from "next/og";
import { OG_BRAND, ogContentType, ogSize } from "@/lib/og-image-templates";

export const alt = "Skillsy - Participe do Skillsy";
export const size = ogSize;
export const contentType = ogContentType;

const benefits = [
  {
    title: "Confiança que aproxima",
    body: "Conexões com honestidade, respeito e bom atendimento.",
    toneBg: "#F0F7FF",
    toneText: "#0066FF",
  },
  {
    title: "Visibilidade na sua região",
    body: "Mostre seu trabalho para quem busca indicações confiáveis.",
    toneBg: "#FEF3C7",
    toneText: "#B45309",
  },
  {
    title: "Reputação com experiência real",
    body: "Avaliações que ajudam outras pessoas a decidir com segurança.",
    toneBg: "#FEE2E2",
    toneText: "#DC2626",
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
              width: "100%",
              height: "262px",
              display: "flex",
              justifyContent: "space-between",
              padding: "34px 36px",
              background: OG_BRAND.heroBlue,
              color: "#ffffff",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: "-34px",
                top: "-30px",
                width: "210px",
                height: "210px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.14)",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: "122px",
                bottom: "-58px",
                width: "170px",
                height: "170px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.12)",
              }}
            />

            <div
              style={{
                width: "62%",
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
                  <div style={{ fontSize: "28px", fontWeight: 800 }}>Skillsy</div>
                  <div
                    style={{
                      fontSize: "18px",
                      color: "rgba(255,255,255,0.84)",
                    }}
                  >
                    Participe do Skillsy
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
                  Cadastro público
                </div>
                <div
                  style={{
                    fontSize: "48px",
                    lineHeight: 1.04,
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    maxWidth: "620px",
                  }}
                >
                  Seu trabalho pode gerar oportunidades, confiança e apoio real
                </div>
                <div
                  style={{
                    fontSize: "22px",
                    lineHeight: 1.34,
                    color: "rgba(255,255,255,0.88)",
                    maxWidth: "600px",
                  }}
                >
                  Uma miniatura mais próxima do hero da página de convite, com
                  foco em visibilidade, reputação e conexões.
                </div>
              </div>
            </div>

            <div
              style={{
                width: "38%",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "flex-end",
              }}
            >
              <div
                style={{
                  padding: "16px 22px",
                  borderRadius: "999px",
                  background: "#ffffff",
                  color: OG_BRAND.primary,
                  fontSize: "20px",
                  fontWeight: 800,
                }}
              >
                Criar Minha Conta →
              </div>
            </div>
          </div>

          <div
            style={{
              width: "100%",
              height: "340px",
              display: "flex",
              gap: "18px",
              padding: "28px 32px 30px",
              background:
                "linear-gradient(180deg, rgba(246,250,255,1) 0%, rgba(255,255,255,1) 100%)",
            }}
          >
            <div
              style={{
                width: "42%",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                justifyContent: "space-between",
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
                  Por que participar
                </div>
                <div
                  style={{
                    fontSize: "34px",
                    fontWeight: 800,
                    lineHeight: 1.08,
                    color: "#0F172A",
                  }}
                >
                  Fortaleça talento, reputação e rede de apoio
                </div>
                <div
                  style={{
                    fontSize: "19px",
                    lineHeight: 1.35,
                    color: "#4B5563",
                  }}
                >
                  A página convida membros a divulgar trabalho, ganhar contexto
                  local e abrir espaço para oportunidades reais.
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    borderRadius: "12px",
                    padding: "18px",
                    background: "#F0F7FF",
                    border: "1px solid #E5E7EB",
                    fontSize: "18px",
                    color: "#001A41",
                    lineHeight: 1.32,
                  }}
                >
                  Mais do que criar um perfil, é abrir espaço para ser visto,
                  lembrado e recomendado com mais segurança.
                </div>
              </div>
            </div>

            <div
              style={{
                width: "58%",
                display: "flex",
                gap: "12px",
              }}
            >
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "14px",
                    padding: "20px 18px",
                    borderRadius: "16px",
                    background: "#ffffff",
                    border: "1px solid #E5E7EB",
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
                      background: benefit.toneBg,
                      color: benefit.toneText,
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
                      {benefit.title}
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        lineHeight: 1.32,
                        color: "#4B5563",
                      }}
                    >
                      {benefit.body}
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
