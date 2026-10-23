import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { router } from 'expo-router';
import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { useAuth } from './auth';
import { db } from './firebase';

// Same channel id the Functions put in every message (functions/index.js).
const CHANNEL_ID = 'oportunidades';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// The FCM token registered by this install, so signing out removes it.
let registeredToken: { uid: string; token: string } | null = null;

function deviceRef(uid: string, token: string) {
  return doc(db, 'users', uid, 'devices', token);
}

async function saveToken(uid: string, token: string) {
  registeredToken = { uid, token };
  await setDoc(deviceRef(uid, token), { token, platform: Platform.OS, updatedAt: serverTimestamp() });
}

async function registerDevice(uid: string) {
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Oportunidades',
    importance: AndroidImportance.HIGH,
  });
  const { granted } = await Notifications.requestPermissionsAsync();
  if (!granted) return;
  const { data } = await Notifications.getDevicePushTokenAsync();
  await saveToken(uid, String(data));
}

/** Call before signOut: the rules only let the owner delete the token. */
export async function unregisterDevice() {
  const current = registeredToken;
  registeredToken = null;
  if (current) await deleteDoc(deviceRef(current.uid, current.token)).catch(() => {});
}

// A new opportunity opens the mural; the 20-day reminder is about one of the
// user's own, so it opens "Minhas oportunidades".
function openNotification(response: Notifications.NotificationResponse | null) {
  if (response?.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
  const { type } = response.notification.request.content.data ?? {};
  router.navigate(
    type === 'opportunity_follow_up' ? '/oportunidades?tab=minhas' : '/oportunidades?tab=mural'
  );
  Notifications.clearLastNotificationResponse();
}

/** Registers this phone for the signed-in user and opens tapped notifications. */
export function usePushNotifications() {
  const { user } = useAuth();
  const uid = user?.uid;

  useEffect(() => {
    if (!uid) return;
    registerDevice(uid).catch((error) => console.warn('Push não registrado:', error));
    const subscription = Notifications.addPushTokenListener(({ data }) => {
      saveToken(uid, String(data)).catch(() => {});
    });
    return () => subscription.remove();
  }, [uid]);

  useEffect(() => {
    openNotification(Notifications.getLastNotificationResponse());
    const subscription = Notifications.addNotificationResponseReceivedListener(openNotification);
    return () => subscription.remove();
  }, []);
}
