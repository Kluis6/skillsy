import { Metadata } from 'next';
import { ContactsClient } from '@/components/contacts-client';

export const metadata: Metadata = {
  title: 'Meus Contatos',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ContactsPage() {
  return <ContactsClient />;
}
