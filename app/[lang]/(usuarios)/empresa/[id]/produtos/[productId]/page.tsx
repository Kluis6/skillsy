import { getProductMetadata, PublicProductDetails, type ProductDetailsPageProps } from "@/components/profile/public-product-details";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ProductDetailsPageProps) {
  return getProductMetadata(await params, true);
}

export default async function CompanyProductPage({ params }: ProductDetailsPageProps) {
  return <PublicProductDetails {...await params} companyPage />;
}
