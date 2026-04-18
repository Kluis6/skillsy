import { 
  collection, 
  query, 
  getDocs, 
  where, 
  orderBy, 
  limit, 
  doc, 
  updateDoc, 
  addDoc,
  serverTimestamp,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'new_user' | 'system' | 'report';
  read: boolean;
  createdAt: any;
  link?: string;
}

export const NotificationService = {
  async getNotifications(limitCount: number = 20): Promise<AdminNotification[]> {
    try {
      const q = query(
        collection(db, 'admin_notifications'), 
        orderBy('createdAt', 'desc'), 
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminNotification));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  subscribeToNotifications(callback: (notifications: AdminNotification[]) => void) {
    const q = query(
      collection(db, 'admin_notifications'), 
      orderBy('createdAt', 'desc'), 
      limit(20)
    );
    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminNotification));
      callback(notifications);
    });
  },

  async markAsRead(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'admin_notifications', id);
      await updateDoc(docRef, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  async markAllAsRead(notifications: AdminNotification[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      notifications.filter(n => !n.read).forEach(n => {
        const docRef = doc(db, 'admin_notifications', n.id);
        batch.update(docRef, { read: true });
      });
      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  async createNotification(notification: Omit<AdminNotification, 'id' | 'createdAt'>): Promise<void> {
    try {
      await addDoc(collection(db, 'admin_notifications'), {
        ...notification,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }
};
