import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toPlainValue } from '@/lib/firestore-plain';
import { UserNotification } from '@/models/types';

export const UserNotificationService = {
  subscribe(userId: string, callback: (items: UserNotification[]) => void) {
    const notificationQuery = query(
      collection(db, 'users', userId, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(20),
    );

    return onSnapshot(notificationQuery, (snapshot) => {
      callback(snapshot.docs.map((item) => toPlainValue({ id: item.id, ...item.data() }) as UserNotification));
    });
  },

  async markAsRead(userId: string, notificationId: string) {
    await updateDoc(doc(db, 'users', userId, 'notifications', notificationId), { read: true });
  },
};
