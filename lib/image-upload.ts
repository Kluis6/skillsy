import imageCompression from "browser-image-compression";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, storage } from "@/lib/firebase";

/** Folders under users/{uid}/ that storage.rules accept. */
export type ImageKind = "avatar" | "banner" | "gallery" | "posts";

// Images live in Cloud Storage and documents keep only the download URL:
// base64 inside documents made a profile with a gallery weigh over 1 MB.
const LIMITS: Record<ImageKind, { maxWidthOrHeight: number; maxSizeMB: number }> = {
  avatar: { maxWidthOrHeight: 512, maxSizeMB: 0.15 },
  banner: { maxWidthOrHeight: 1600, maxSizeMB: 0.35 },
  gallery: { maxWidthOrHeight: 1280, maxSizeMB: 0.3 },
  posts: { maxWidthOrHeight: 1600, maxSizeMB: 0.4 },
};

/** storage.rules reject files over 2 MB. */
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

async function compress(file: File, kind: ImageKind): Promise<Blob> {
  const options = { ...LIMITS[kind], fileType: "image/webp", initialQuality: 0.82 };
  try {
    return await imageCompression(file, { ...options, useWebWorker: true });
  } catch {
    try {
      return await imageCompression(file, { ...options, useWebWorker: false });
    } catch {
      if (file.size <= MAX_UPLOAD_BYTES) return file;
      throw new Error(
        "Não foi possível comprimir a imagem. Tente uma foto JPG, PNG ou WEBP menor.",
      );
    }
  }
}

/** Compresses the image, uploads it to users/{uid}/{kind}/ and returns its URL. */
export async function uploadImage(file: File, kind: ImageKind): Promise<string> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Entre na sua conta para enviar imagens.");

  const blob = await compress(file, kind);
  const contentType = blob.type || file.type;
  const extension = contentType.split("/")[1] === "jpeg" ? "jpg" : contentType.split("/")[1];
  const fileRef = ref(storage, `users/${uid}/${kind}/${crypto.randomUUID()}.${extension}`);
  await uploadBytes(fileRef, blob, {
    contentType,
    // Each upload gets a new name, so browsers and the app can cache forever.
    cacheControl: "public, max-age=31536000, immutable",
  });
  return getDownloadURL(fileRef);
}
