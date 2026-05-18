import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://skillsy.com.br";
const siteName = "Skillsy";

type PublicMetadataOptions = {
  title: string;
  description: string;
  path: string;
  imageTitle?: string;
  imageDescription?: string;
  imageLabel?: string;
  keywords?: string[];
};

function createOgImageUrl({
  title,
  description,
  label,
}: {
  title: string;
  description: string;
  label?: string;
}) {
  const params = new URLSearchParams({
    title,
    description,
  });

  if (label) {
    params.set("label", label);
  }

  return `/api/og?${params.toString()}`;
}

export function createPublicMetadata({
  title,
  description,
  path,
  imageTitle,
  imageDescription,
  imageLabel,
  keywords,
}: PublicMetadataOptions): Metadata {
  const socialImage = createOgImageUrl({
    title: imageTitle ?? title,
    description: imageDescription ?? description,
    label: imageLabel,
  });

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: path,
      siteName,
      title: `${title} | ${siteName}`,
      description,
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: `${title} | ${siteName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
      description,
      images: [socialImage],
    },
  };
}

export function getPublicBaseUrl() {
  return baseUrl;
}
