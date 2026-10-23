import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import type { ReportReason } from '@skillsy/shared/reporting';

import { auth, db } from './firebase';

/** Same document and admin notice as UserService.submitUserReport on the site
 * (firestore.rules: isValidReport). */
export async function submitProfileReport(data: {
  reportedUserId: string;
  reportedUserName: string;
  reason: ReportReason;
  details: string;
}) {
  const user = auth.currentUser;
  if (!user) throw new Error('Entre na sua conta para denunciar.');
  await addDoc(collection(db, 'reports'), {
    reportedUserId: data.reportedUserId,
    reportedUserName: data.reportedUserName.slice(0, 100),
    reporterId: user.uid,
    reporterEmail: user.email || '',
    reason: data.reason,
    details: data.details.trim().slice(0, 1000),
    status: 'new',
    createdAt: serverTimestamp(),
  });
  try {
    await addDoc(collection(db, 'admin_notifications'), {
      title: 'Nova denúncia de perfil',
      message: `${user.email || 'Um usuário'} denunciou o perfil de ${data.reportedUserName || data.reportedUserId}.`,
      type: 'report',
      read: false,
      link: '/admin/usuarios',
      createdAt: serverTimestamp(),
    });
  } catch {
    // The report is saved; the admin notice is a courtesy.
  }
}
