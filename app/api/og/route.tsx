import { ImageResponse } from "next/og";

export const runtime = "edge";

const size = {
  width: 1200,
  height: 630,
};

function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = truncate(
    searchParams.get("title") || "Skillsy",
    90,
  );
  const description = truncate(
    searchParams.get("description") ||
      "Conectando talentos, serviços e confiança em uma comunidade mais próxima.",
    180,
  );
  const label = truncate(searchParams.get("label") || "Compartilhe o Skillsy", 48);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: "40px",
          background:
            "radial-gradient(circle at top left, #dbeafe 0%, #f8fbff 36%, #ffffff 100%)",
          color: "#001A41",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            borderRadius: "36px",
            overflow: "hidden",
            background: "#ffffff",
            boxShadow: "0 18px 60px rgba(0, 26, 65, 0.10)",
            border: "1px solid rgba(191, 219, 254, 0.8)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "62%",
              padding: "44px",
              background:
                "linear-gradient(180deg, rgba(240,247,255,0.98) 0%, rgba(255,255,255,1) 100%)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "18px",
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
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "74px",
                    height: "74px",
                    borderRadius: "22px",
                    background: "#0066FF",
                    color: "#ffffff",
                    fontSize: "34px",
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
                  <div style={{ fontSize: "30px", fontWeight: 700 }}>Skillsy</div>
                  <div style={{ fontSize: "19px", color: "#4B5563" }}>
                    Network entre membros
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignSelf: "flex-start",
                  borderRadius: "999px",
                  background: "#E0F2FE",
                  color: "#0369A1",
                  padding: "10px 18px",
                  fontSize: "18px",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {label}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                  maxWidth: "590px",
                }}
              >
                <div
                  style={{
                    fontSize: "58px",
                    lineHeight: 1.05,
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    fontSize: "27px",
                    lineHeight: 1.35,
                    color: "#4B5563",
                  }}
                >
                  {description}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "18px",
                fontSize: "20px",
                color: "#6B7280",
              }}
            >
              <div>skillsy.com.br</div>
              <div>Perfis públicos • Conexões de confiança • Comunidade</div>
            </div>
          </div>

          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "38%",
              padding: "34px",
              background:
                "linear-gradient(160deg, #0066FF 0%, #3B82F6 44%, #93C5FD 100%)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-50px",
                right: "-10px",
                width: "220px",
                height: "220px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.16)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-44px",
                left: "-30px",
                width: "200px",
                height: "200px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.14)",
              }}
            />

            <div
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignSelf: "flex-start",
                  borderRadius: "999px",
                  padding: "10px 16px",
                  background: "rgba(255,255,255,0.18)",
                  color: "#ffffff",
                  fontSize: "18px",
                  fontWeight: 700,
                }}
              >
                Preview social
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  padding: "24px",
                  borderRadius: "28px",
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  color: "#ffffff",
                  backdropFilter: "blur(6px)",
                }}
              >
                <div style={{ fontSize: "30px", fontWeight: 700, lineHeight: 1.2 }}>
                  Mais visibilidade para páginas públicas
                </div>
                <div
                  style={{
                    fontSize: "21px",
                    lineHeight: 1.35,
                    color: "rgba(255,255,255,0.88)",
                  }}
                >
                  Links com miniatura grande, título legível e descrição pronta
                  para WhatsApp, LinkedIn, X e outras redes.
                </div>
              </div>
            </div>

            <div
              style={{
                position: "relative",
                display: "flex",
                gap: "14px",
                alignItems: "flex-end",
              }}
            >
              <div
                style={{
                  width: "112px",
                  height: "150px",
                  borderRadius: "30px 30px 0 0",
                  background: "rgba(255,255,255,0.92)",
                }}
              />
              <div
                style={{
                  width: "132px",
                  height: "220px",
                  borderRadius: "36px 36px 0 0",
                  background: "rgba(255,255,255,0.95)",
                }}
              />
              <div
                style={{
                  width: "96px",
                  height: "122px",
                  borderRadius: "24px 24px 0 0",
                  background: "rgba(255,255,255,0.8)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
