import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { auth, storage } from './firebase';

/** Folders under users/{uid}/ that storage.rules accept (same as the site). */
export type ImageKind = 'avatar' | 'banner' | 'gallery' | 'posts';

// Same sizes as the site's lib/image-upload.ts.
const MAX_SIDE: Record<ImageKind, number> = {
  avatar: 512,
  banner: 1600,
  gallery: 1280,
  posts: 1600,
};
const ASPECT: Partial<Record<ImageKind, [number, number]>> = { avatar: [1, 1], banner: [16, 9] };

/** Opens the gallery; returns the chosen image's uri, or null if cancelled. */
export async function pickImage(kind: ImageKind) {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: Boolean(ASPECT[kind]),
    aspect: ASPECT[kind],
    quality: 1,
  });
  return result.canceled ? null : result.assets[0];
}

/** Resizes to the kind's limit, converts to WebP and uploads to
 * users/{uid}/{kind}/; returns the download URL. */
export async function uploadImage(
  asset: { uri: string; width: number; height: number },
  kind: ImageKind
) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Entre na sua conta para enviar imagens.');

  const max = MAX_SIDE[kind];
  const context = ImageManipulator.manipulate(asset.uri);
  if (asset.width > max || asset.height > max) {
    context.resize(asset.width >= asset.height ? { width: max } : { height: max });
  }
  const image = await context.renderAsync();
  const result = await image.saveAsync({ format: SaveFormat.WEBP, compress: 0.8 });

  const blob = await (await fetch(result.uri)).blob();
  const name = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}.webp`;
  const fileRef = ref(storage, `users/${uid}/${kind}/${name}`);
  await uploadBytes(fileRef, blob, {
    contentType: 'image/webp',
    cacheControl: 'public, max-age=31536000, immutable',
  });
  return getDownloadURL(fileRef);
}
