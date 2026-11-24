import { getProductMetadata, PublicProductDetails, type ProductDetailsPageProps } from "@/components/profile/public-product-details";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ProductDetailsPageProps) {
  return getProductMetadata(await params, false);
}

export default async function ProfileProductPage({ params }: ProductDetailsPageProps) {
  return <PublicProductDetails {...await params} companyPage={false} />;
}
