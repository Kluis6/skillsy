import { ImageResponse } from "next/og";

export const ogSize = {
  width: 1200,
  height: 630,
};

export const ogContentType = "image/png";

export const OG_BRAND = {
  bg: "radial-gradient(circle at top left, #dbeafe 0%, #eef6ff 38%, #ffffff 100%)",
  cardBg: "#ffffff",
  cardBorder: "1px solid rgba(191,219,254,0.9)",
  cardShadow: "0 18px 60px rgba(0, 26, 65, 0.10)",
  heroBlue: "linear-gradient(120deg, #1D4ED8 0%, #2563EB 42%, #60A5FA 100%)",
  heroBlueAlt: "linear-gradient(160deg, #0066FF 0%, #3B82F6 44%, #93C5FD 100%)",
  heroDark: "linear-gradient(120deg, #0F172A 0%, #1E3A8A 42%, #2563EB 100%)",
  surface: "linear-gradient(180deg, rgba(246,250,255,1) 0%, rgba(255,255,255,1) 100%)",
  surfaceSoft:
    "linear-gradient(180deg, rgba(240,247,255,0.98) 0%, rgba(255,255,255,1) 100%)",
  primary: "#1D4ED8",
  primaryStrong: "#0066FF",
  primarySoft: "#DBEAFE",
  primaryPill: "#E0F2FE",
  primaryPillText: "#0369A1",
  text: "#0F172A",
  muted: "#475569",
  subtle: "#64748B",
  panelBg: "#F8FAFC",
  panelBorder: "1px solid #E2E8F0",
  chipBg: "#EFF6FF",
  whiteOverlay: "rgba(255,255,255,0.16)",
  whiteOverlayBorder: "1px solid rgba(255,255,255,0.2)",
  eyebrow: {
    fontSize: "17px",
    fontWeight: 800,
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: "0.16em",
  },
} as const;

export function truncateOgText(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

type MarketingCard = {
  title: string;
  description: string;
};

type MarketingOgOptions = {
  badge: string;
  title: string;
  description: string;
  kicker?: string;
  accentFrom?: string;
  accentTo?: string;
  surfaceTint?: string;
  sideHeading: string;
  sideBody: string;
  cards?: MarketingCard[];
};

export function createMarketingOgImage({
  badge,
  title,
  description,
  kicker = "Skillsy",
  accentFrom = "#0066FF",
  accentTo = "#93C5FD",
  surfaceTint = "#E0F2FE",
  sideHeading,
  sideBody,
  cards = [],
}: MarketingOgOptions) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: "32px",
          background: OG_BRAND.bg,
          color: "#001A41",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            borderRadius: "36px",
            background: OG_BRAND.cardBg,
            border: OG_BRAND.cardBorder,
            boxShadow: OG_BRAND.cardShadow,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "56%",
              padding: "42px",
              background: OG_BRAND.surfaceSoft,
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
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    width: "68px",
                    height: "68px",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: accentFrom,
                    color: "#ffffff",
                    fontSize: "32px",
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
                  <div style={{ fontSize: "28px", fontWeight: 700 }}>Skillsy</div>
                  <div style={{ fontSize: "18px", color: "#4B5563" }}>
                    {kicker}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignSelf: "flex-start",
                  borderRadius: "999px",
                  background: surfaceTint,
                  color: OG_BRAND.primaryPillText,
                  padding: "10px 18px",
                  fontSize: "18px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                {badge}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                }}
              >
                <div
                  style={{
                    fontSize: "54px",
                    lineHeight: 1.04,
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {truncateOgText(title, 110)}
                </div>
                <div
                  style={{
                    fontSize: "25px",
                    lineHeight: 1.35,
                    color: "#4B5563",
                  }}
                >
                  {truncateOgText(description, 200)}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "#6B7280",
                fontSize: "19px",
              }}
            >
              <div>skillsy.com.br</div>
              <div>Perfis públicos • Comunidade • Confiança</div>
            </div>
          </div>

          <div
            style={{
              width: "44%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "32px",
              background: `linear-gradient(160deg, ${accentFrom} 0%, ${OG_BRAND.primary} 44%, ${accentTo} 100%)`,
              color: "#ffffff",
            }}
          >
            <div
              style={{
                alignSelf: "flex-start",
                borderRadius: "999px",
                padding: "10px 16px",
                background: "rgba(255,255,255,0.18)",
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
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  padding: "24px",
                  borderRadius: "28px",
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.22)",
                }}
              >
                <div style={{ fontSize: "30px", fontWeight: 700, lineHeight: 1.2 }}>
                  {truncateOgText(sideHeading, 60)}
                </div>
                <div
                  style={{
                    fontSize: "21px",
                    lineHeight: 1.35,
                    color: "rgba(255,255,255,0.88)",
                  }}
                >
                  {truncateOgText(sideBody, 120)}
                </div>
              </div>

              {cards.length ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {cards.slice(0, 3).map((card) => (
                    <div
                      key={card.title}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        padding: "16px 18px",
                        borderRadius: "22px",
                        background: "rgba(255,255,255,0.12)",
                        border: "1px solid rgba(255,255,255,0.16)",
                      }}
                    >
                      <div style={{ fontSize: "20px", fontWeight: 700 }}>
                        {truncateOgText(card.title, 42)}
                      </div>
                      <div
                        style={{
                          fontSize: "16px",
                          lineHeight: 1.3,
                          color: "rgba(255,255,255,0.86)",
                        }}
                      >
                        {truncateOgText(card.description, 72)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    ),
    ogSize,
  );
}

type ProfileOgOptions = {
  name: string;
  serviceType?: string;
  category?: string;
  location?: string;
  companyName?: string;
  bio?: string;
  rating?: number;
  reviewCount?: number;
  photoUrl?: string;
  verified?: boolean;
};

export function createProfileOgImage({
  name,
  serviceType,
  category,
  location,
  companyName,
  bio,
  rating,
  reviewCount,
  photoUrl,
  verified,
}: ProfileOgOptions) {
  const headline = serviceType || category || "Membro da comunidade";
  const description =
    bio?.trim() ||
    `${name} faz parte da comunidade Skillsy e pode ser encontrado por meio do perfil público.`;
  const hasPhoto = Boolean(photoUrl?.trim());
  const ratingLabel =
    typeof rating === "number"
      ? `${rating.toFixed(1)} de 5`
      : "Sem avaliações";
  const reviewLabel =
    typeof reviewCount === "number" && reviewCount > 0
      ? `${reviewCount} avaliações`
      : "Perfil novo";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: "32px",
          background: OG_BRAND.bg,
          color: "#001A41",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            borderRadius: "36px",
            background: OG_BRAND.cardBg,
            border: OG_BRAND.cardBorder,
            boxShadow: OG_BRAND.cardShadow,
          }}
        >
          <div
            style={{
              width: "46%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "34px",
              background: OG_BRAND.heroDark,
              color: "#ffffff",
            }}
          >
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                borderRadius: "999px",
                padding: "10px 16px",
                background: "rgba(255,255,255,0.18)",
                fontSize: "18px",
                fontWeight: 700,
              }}
            >
              Perfil público
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              {hasPhoto ? (
                <img
                  src={photoUrl}
                  alt={name}
                  style={{
                    width: "100%",
                    height: "300px",
                    borderRadius: "30px",
                    objectFit: "cover",
                    border: "8px solid rgba(255,255,255,0.92)",
                    background: OG_BRAND.primary,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "300px",
                    borderRadius: "30px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: OG_BRAND.primaryStrong,
                    border: "8px solid rgba(255,255,255,0.92)",
                    color: "#ffffff",
                    fontSize: "148px",
                    fontWeight: 900,
                    lineHeight: 1,
                  }}
                >
                  S
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  padding: "22px",
                  borderRadius: "26px",
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.22)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: "37px",
                    lineHeight: 1.08,
                    fontWeight: 800,
                  }}
                >
                  {truncateOgText(name, 42)}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: "21px",
                    lineHeight: 1.3,
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  {truncateOgText(headline, 64)}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginTop: "4px",
                  }}
                >
                  {location ? (
                    <div
                      style={{
                        display: "flex",
                        borderRadius: "999px",
                        padding: "8px 13px",
                        background: "rgba(255,255,255,0.16)",
                        fontSize: "16px",
                        fontWeight: 700,
                      }}
                    >
                      {truncateOgText(location, 32)}
                    </div>
                  ) : null}
                  {category ? (
                    <div
                      style={{
                        display: "flex",
                        borderRadius: "999px",
                        padding: "8px 13px",
                        background: "rgba(255,255,255,0.16)",
                        fontSize: "16px",
                        fontWeight: 700,
                      }}
                    >
                      {truncateOgText(category, 28)}
                    </div>
                  ) : null}
                </div>
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
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "18px",
                    color: "rgba(255,255,255,0.88)",
                  }}
                >
                  <div>{reviewLabel}</div>
                  <div>{ratingLabel}</div>
                </div>
            </div>
          </div>

          <div
            style={{
              width: "54%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "42px",
              background: OG_BRAND.surfaceSoft,
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
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    width: "68px",
                    height: "68px",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#0066FF",
                    color: "#ffffff",
                    fontSize: "32px",
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
                  <div style={{ fontSize: "28px", fontWeight: 700 }}>Skillsy</div>
                  <div style={{ fontSize: "18px", color: "#4B5563" }}>
                    Rede de confiança entre membros
                  </div>
                </div>
              </div>

              {verified ? (
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
                    textTransform: "uppercase",
                  }}
                >
                  Membro verificado
                </div>
              ) : null}

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "50px",
                    lineHeight: 1.04,
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {truncateOgText(headline, 72)}
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    lineHeight: 1.35,
                    color: "#4B5563",
                  }}
                >
                  {truncateOgText(description, 220)}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  marginTop: "6px",
                }}
              >
                {companyName ? (
                  <div
                    style={{
                      display: "flex",
                      alignSelf: "flex-start",
                      borderRadius: "20px",
                      padding: "12px 16px",
                      background: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      fontSize: "18px",
                      color: "#1F2937",
                    }}
                  >
                    Atua em {truncateOgText(companyName, 34)}
                  </div>
                ) : null}
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  {verified ? (
                    <div
                      style={{
                        display: "flex",
                        borderRadius: "999px",
                        background: "#E0F2FE",
                        color: "#0369A1",
                        padding: "10px 16px",
                        fontSize: "17px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                      }}
                    >
                      Membro verificado
                    </div>
                  ) : null}
                  {location ? (
                    <div
                      style={{
                        display: "flex",
                        borderRadius: "999px",
                        background: "#F1F5F9",
                        color: "#475569",
                        padding: "10px 16px",
                        fontSize: "17px",
                        fontWeight: 600,
                      }}
                    >
                      {truncateOgText(location, 28)}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "#6B7280",
                fontSize: "19px",
              }}
            >
              <div>{truncateOgText(location || "Perfil público na comunidade", 44)}</div>
              <div>skillsy.com.br</div>
            </div>
          </div>
        </div>
      </div>
    ),
    ogSize,
  );
}
