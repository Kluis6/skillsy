import { NotFoundPage } from '@/components/not-found-page';
import { getT } from '@/lib/i18n/server';

// notFound() inside a page (profile or article that doesn't exist).
export default async function NotFound() {
  return <NotFoundPage t={await getT()} />;
}
