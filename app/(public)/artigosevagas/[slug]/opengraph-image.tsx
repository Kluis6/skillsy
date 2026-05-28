import { ImageResponse } from "next/og";
import { PostService } from "@/services/post-service";
import { getPostExcerpt, POST_CATEGORY_LABELS } from "@/lib/post-utils";
import { OG_BRAND } from "@/lib/og-image-templates";

export const runtime = "nodejs";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

type ImageProps = {
  params: Promise<{ slug: string }>;
};

export default async function Image({ params }: ImageProps) {
  const { slug } = await params;
  const post = await PostService.getPublishedPostBySlug(slug);

  const title = truncate(post?.title || "Skillsy", 110);
  const description = truncate(
    post ? getPostExcerpt(post) : "Conteúdo público da comunidade Skillsy.",
    200,
  );
  const category = post ? POST_CATEGORY_LABELS[post.category] : "Publicação";
  const author = truncate(post?.authorName || "Comunidade Skillsy", 42);
  const coverImageUrl = post?.coverImageUrl?.trim();
  const isJob = post?.category === "job";
  const categoryBg = isJob ? "#DCFCE7" : "#FEF3C7";
  const categoryColor = isJob ? "#166534" : "#92400E";

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
            flexDirection: "column",
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
              position: "relative",
              width: "100%",
              height: "276px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: OG_BRAND.heroBlueAlt,
            }}
          >
            {coverImageUrl ? (
              <img
                src={coverImageUrl}
                alt={title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "flex-end",
                  padding: "30px",
                  color: "#ffffff",
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
                    maxWidth: "430px",
                  }}
                >
                  <div style={{ fontSize: "30px", fontWeight: 700, lineHeight: 1.2 }}>
                    {category} da comunidade
                  </div>
                  <div
                    style={{
                      fontSize: "21px",
                      lineHeight: 1.35,
                      color: "rgba(255,255,255,0.88)",
                    }}
                  >
                    Conteúdo público compartilhável com capa, resumo e contexto
                    visual da própria página.
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "100%",
              height: "354px",
              padding: "34px 38px",
              background:
                OG_BRAND.surfaceSoft,
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
                  justifyContent: "space-between",
                  alignItems: "center",
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
                      width: "58px",
                      height: "58px",
                      borderRadius: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: OG_BRAND.primaryStrong,
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
                      gap: "4px",
                    }}
                  >
                    <div style={{ fontSize: "24px", fontWeight: 700 }}>Skillsy</div>
                    <div style={{ fontSize: "16px", color: "#4B5563" }}>
                      {category} da comunidade
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      borderRadius: "999px",
                      background: categoryBg,
                      color: categoryColor,
                      padding: "10px 16px",
                      fontSize: "16px",
                      fontWeight: 700,
                    }}
                  >
                    {category}
                  </div>
                  {post?.isFeatured ? (
                    <div
                      style={{
                        borderRadius: "999px",
                        background: "#E0F2FE",
                        color: "#0369A1",
                        padding: "10px 16px",
                        fontSize: "16px",
                        fontWeight: 700,
                      }}
                    >
                      Destaque
                    </div>
                  ) : null}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "46px",
                    lineHeight: 1.06,
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    color: "#0F172A",
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    fontSize: "23px",
                    lineHeight: 1.35,
                    color: "#475569",
                  }}
                >
                  {description}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "#6B7280",
                fontSize: "18px",
              }}
            >
              <div>por {author}</div>
              <div>/artigosevagas/{truncate(slug, 30)}</div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
