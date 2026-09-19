/* eslint-disable @next/next/no-img-element -- Satori (next/og) only renders plain <img>; next/image doesn't apply here. */
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ReactElement } from "react";
import { ImageResponse } from "next/og";
import sharp from "sharp";

// Share thumbnails (og:image) for public pages. Two layouts:
// - createPageOgImage: the page's hero image (or the default blue "S"
//   background) with a short text. Used by the home, the institutional
//   pages, posts/jobs and opportunities.
// - createProfileOgImage: the member's photo (or the default blue "S"
//   rectangle) with name and part of the bio.
// Both are served as JPEG: photographic PNGs weigh ~1MB and WhatsApp, the
// main sharing channel, often skips previews that large.

export const ogSize = {
  width: 1200,
  height: 630,
};

export const ogContentType = "image/jpeg";

const BRAND = {
  primary: "#0066FF",
  primaryDeep: "#0047B3",
  primaryLight: "#00A3FF",
  ink: "#001A41",
  muted: "#4B5563",
  surface: "#F5F9FF",
};

const DEFAULT_BACKGROUND = `linear-gradient(135deg, ${BRAND.primaryDeep} 0%, ${BRAND.primary} 55%, ${BRAND.primaryLight} 100%)`;

/** Hero images of the public pages. /api/og receives only one of these keys,
 * never a path, so it can't be made to read any other file. */
export const OG_HERO_IMAGES = {
  home: "/bannerhero.png",
  weareskillsy: "/Gemini_Generated_Image_d74ovcd74ovcd74o.png",
  join: "/Gemini_Generated_Image_c5bw8sc5bw8sc5bw.png",
  privacidade: "/Gemini_Generated_Image_8gh7rv8gh7rv8gh7.png",
  termos: "/Gemini_Generated_Image_sneeobsneeobsnee.png",
  donation: "/donate.png",
  artigosevagas: "/Gemini_Generated_Image_3hkj2c3hkj2c3hkj.png",
} as const;

export type OgHeroImage = keyof typeof OG_HERO_IMAGES;

export function isOgHeroImage(value: unknown): value is OgHeroImage {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(OG_HERO_IMAGES, value)
  );
}

export function truncateOgText(text: string, maxLength: number) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

// ---------------------------------------------------------------------------
// Image loading
// ---------------------------------------------------------------------------

const MAX_SOURCE_IMAGE_BYTES = 10 * 1024 * 1024;

// Same hosts next.config allows for next/image. User-controlled photo URLs are
// fetched server-side here, so anything else is refused.
const REMOTE_IMAGE_HOSTS = [/(^|\.)googleusercontent\.com$/, /(^|\.)picsum\.photos$/];

function isAllowedRemoteHost(hostname: string) {
  return REMOTE_IMAGE_HOSTS.some((pattern) => pattern.test(hostname));
}

type ImageBox = { width: number; height: number };

/** Resizes to the exact box and re-encodes as JPEG, so Satori always gets a
 * small image in a format it supports (profile photos can be WebP). */
async function toJpegDataUri(input: Buffer, { width, height }: ImageBox) {
  const output = await sharp(input)
    .rotate()
    .resize(width, height, { fit: "cover" })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();

  return `data:image/jpeg;base64,${output.toString("base64")}`;
}

export async function loadHeroOgImage(
  hero: OgHeroImage,
  box: ImageBox = ogSize,
): Promise<string | undefined> {
  try {
    const file = path.join(process.cwd(), "public", OG_HERO_IMAGES[hero]);
    return await toJpegDataUri(await readFile(file), box);
  } catch (error) {
    console.error(`OG image: failed to load hero "${hero}"`, error);
    return undefined;
  }
}

async function readRemoteImage(src: string): Promise<Buffer | undefined> {
  if (src.startsWith("data:image/")) {
    const comma = src.indexOf(",");
    if (comma === -1 || !src.slice(0, comma).endsWith(";base64")) {
      return undefined;
    }
    return Buffer.from(src.slice(comma + 1), "base64");
  }

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return undefined;
  }

  if (url.protocol !== "https:" || !isAllowedRemoteHost(url.hostname)) {
    return undefined;
  }

  const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!response.ok || !isAllowedRemoteHost(new URL(response.url).hostname)) {
    return undefined;
  }

  return Buffer.from(await response.arrayBuffer());
}

/** Loads a user-provided image (base64 data URI or allowed https URL).
 * Returns undefined on anything unusable so callers fall back to the default. */
export async function loadRemoteOgImage(
  src: string | undefined | null,
  box: ImageBox = ogSize,
): Promise<string | undefined> {
  const trimmed = src?.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    const input = await readRemoteImage(trimmed);
    if (!input || input.length === 0 || input.length > MAX_SOURCE_IMAGE_BYTES) {
      return undefined;
    }
    return await toJpegDataUri(input, box);
  } catch (error) {
    console.error("OG image: failed to load remote image", error);
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

async function renderOgResponse(element: ReactElement) {
  const png = Buffer.from(await new ImageResponse(element, ogSize).arrayBuffer());

  let body = png;
  let contentType = "image/png";
  try {
    body = await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    contentType = ogContentType;
  } catch (error) {
    console.error("OG image: JPEG conversion failed, serving PNG", error);
  }

  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}

function BrandRow({ tone }: { tone: "light" | "dark" }) {
  const onDark = tone === "light";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
      <div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: onDark ? "#ffffff" : BRAND.primary,
          color: onDark ? BRAND.primary : "#ffffff",
          fontSize: "30px",
          fontWeight: 900,
        }}
      >
        S
      </div>
      <div
        style={{
          display: "flex",
          fontSize: "30px",
          fontWeight: 700,
          color: onDark ? "#ffffff" : BRAND.ink,
        }}
      >
        Skillsy
      </div>
    </div>
  );
}

/** Same shield-check shape as the VerifiedMark shown after names in the app. */
function VerifiedShield({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={BRAND.primary}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

/** Same handshake shape as the CommunityFriendMark shown after names in the app. */
function FriendHandshake({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#059669"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m11 17 2 2a1 1 0 1 0 3-3" />
      <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
      <path d="m21 3 1 11h-2" />
      <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
      <path d="M3 4h8" />
    </svg>
  );
}

type PageOgOptions = {
  /** Already-loaded image (see loadHeroOgImage / loadRemoteOgImage). */
  image?: string;
  label: string;
  title: string;
  description: string;
};

export function createPageOgImage({
  image,
  label,
  title,
  description,
}: PageOgOptions) {
  return renderOgResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: DEFAULT_BACKGROUND,
        color: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      {image ? (
        <img
          src={image}
          alt=""
          width={ogSize.width}
          height={ogSize.height}
          style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            top: "115px",
            right: "80px",
            width: "400px",
            height: "400px",
            borderRadius: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.12)",
            border: "2px solid rgba(255,255,255,0.28)",
            fontSize: "290px",
            fontWeight: 900,
            color: "rgba(255,255,255,0.92)",
          }}
        >
          S
        </div>
      )}

      {image ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            background:
              "linear-gradient(90deg, rgba(0,26,65,0.94) 0%, rgba(0,26,65,0.8) 42%, rgba(0,26,65,0.25) 78%, rgba(0,26,65,0.05) 100%)",
          }}
        />
      ) : null}

      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
        }}
      >
        <BrandRow tone="light" />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            maxWidth: image ? "760px" : "620px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              borderRadius: "999px",
              padding: "8px 18px",
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.3)",
              fontSize: "20px",
              fontWeight: 700,
            }}
          >
            {truncateOgText(label, 44)}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "54px",
              fontWeight: 800,
              lineHeight: 1.06,
              letterSpacing: "-0.02em",
            }}
          >
            {truncateOgText(title, 90)}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "25px",
              lineHeight: 1.38,
              color: "rgba(255,255,255,0.9)",
            }}
          >
            {truncateOgText(description, 150)}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "22px",
            color: "rgba(255,255,255,0.8)",
          }}
        >
          skillsy.com.br
        </div>
      </div>
    </div>,
  );
}

const PROFILE_PHOTO_BOX = { width: 460, height: ogSize.height };

type ProfileOgOptions = {
  name: string;
  headline: string;
  bio?: string;
  location?: string;
  /** Already-loaded photo sized to PROFILE_PHOTO_BOX (loadProfileOgPhoto). */
  photo?: string;
  verified?: boolean;
  communityFriend?: boolean;
};

export function loadProfileOgPhoto(photoUrl: string | undefined | null) {
  return loadRemoteOgImage(photoUrl, PROFILE_PHOTO_BOX);
}

export function createProfileOgImage({
  name,
  headline,
  bio,
  location,
  photo,
  verified,
  communityFriend,
}: ProfileOgOptions) {
  const description =
    bio?.trim() || `${name} faz parte da comunidade Skillsy.`;

  return renderOgResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#ffffff",
        color: BRAND.ink,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          width: `${PROFILE_PHOTO_BOX.width}px`,
          height: "100%",
          display: "flex",
          background: DEFAULT_BACKGROUND,
        }}
      >
        {photo ? (
          <img
            src={photo}
            alt=""
            width={PROFILE_PHOTO_BOX.width}
            height={PROFILE_PHOTO_BOX.height}
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "300px",
              fontWeight: 900,
              color: "#ffffff",
            }}
          >
            S
          </div>
        )}
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 60px",
          background: BRAND.surface,
        }}
      >
        <BrandRow tone="dark" />

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                display: "flex",
                fontSize: "52px",
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}
            >
              {truncateOgText(name, 26)}
            </div>
            {verified ? (
              <VerifiedShield size={44} />
            ) : communityFriend ? (
              <FriendHandshake size={44} />
            ) : null}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "28px",
              fontWeight: 700,
              color: BRAND.primary,
            }}
          >
            {truncateOgText(headline, 44)}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "25px",
              lineHeight: 1.4,
              color: BRAND.muted,
            }}
          >
            {truncateOgText(description, 170)}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "22px",
            color: BRAND.muted,
          }}
        >
          <div style={{ display: "flex" }}>
            {truncateOgText(location || "Perfil público", 34)}
          </div>
          <div style={{ display: "flex" }}>skillsy.com.br</div>
        </div>
      </div>
    </div>,
  );
}
