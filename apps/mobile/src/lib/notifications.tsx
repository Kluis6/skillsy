import type { UserNotification } from '@skillsy/shared/types';
import type { Href } from 'expo-router';
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { useAuth } from './auth';
import { db } from './firebase';

type NotificationsState = { items: UserNotification[]; unread: number };

const NotificationsContext = createContext<NotificationsState>({ items: [], unread: 0 });

/** One live listener on users/{uid}/notifications (the 20 newest, like the
 * site's bell), shared by the header bell and the Notificações screen. */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const uid = user?.uid;
  const [items, setItems] = useState<UserNotification[]>([]);

  useEffect(() => {
    if (!uid) return;
    return onSnapshot(
      query(collection(db, 'users', uid, 'notifications'), orderBy('createdAt', 'desc'), limit(20)),
      (snapshot) =>
        setItems(
          snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as UserNotification)
        ),
      (error) => console.warn('Notificações indisponíveis:', error)
    );
  }, [uid]);

  // Signed out: nothing to show, even before the listener above is dropped.
  const visible = uid ? items : [];
  const unread = visible.filter((item) => !item.read).length;

  return (
    <NotificationsContext.Provider value={{ items: visible, unread }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}

export function markNotificationRead(uid: string, id: string) {
  return updateDoc(doc(db, 'users', uid, 'notifications', id), { read: true });
}

export function markAllNotificationsRead(uid: string, items: UserNotification[]) {
  const batch = writeBatch(db);
  items
    .filter((item) => !item.read)
    .forEach((item) =>
      batch.update(doc(db, 'users', uid, 'notifications', item.id), { read: true })
    );
  return batch.commit();
}

/** Where a notification leads; push taps (push.ts) use the same routes. */
export function notificationRoute(type?: unknown, postSlug?: unknown): Href {
  if (type === 'post_published' && typeof postSlug === 'string' && postSlug) {
    return { pathname: '/artigo/[slug]', params: { slug: postSlug } };
  }
  // The 20-day reminder is about one of the user's own opportunities.
  return type === 'opportunity_follow_up'
    ? '/oportunidades?tab=minhas'
    : '/oportunidades?tab=mural';
}
