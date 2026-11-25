import { getCatalogMetadata, PublicServiceCatalog } from "@/components/profile/public-service-catalog";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return getCatalogMetadata(id, true, true);
}

export default async function CompanyProductsPage({ params }: Props) {
  const { id } = await params;
  return <PublicServiceCatalog id={id} companyPage allProducts />;
}
