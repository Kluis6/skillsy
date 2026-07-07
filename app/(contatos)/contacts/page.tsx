import { ContactsClient } from '@/components/contacts-client';
import { createPrivateMetadata } from '@/lib/public-metadata';

export const metadata = createPrivateMetadata({
  title: 'Meus Contatos',
  description: 'Área restrita para gerenciar seus contatos no Skillsy.',
});

export default function ContactsPage() {
  return <ContactsClient />;
}
