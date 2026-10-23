// Moves base64 images out of Firestore documents into Cloud Storage, keeping
// only the download URL in the document (same layout as lib/image-upload.ts:
// users/{uid}/{kind}/...). A profile with a gallery weighed over 1 MB.
//
//   node scripts/migrate-images-to-storage.mjs --dry-run   # only reports
//   node scripts/migrate-images-to-storage.mjs             # uploads and updates
//
// Fields: users and public_profiles (photoURL, bannerURL, gallery[].url),
// public_profiles/*/recommendations (recommenderPhotoURL), posts (coverImageUrl).
// Identical images (a photo in users and in public_profiles) upload once.
// Auth: GOOGLE_OAUTH_ACCESS_TOKEN, or the firebase CLI login on this machine.
import { createHash, randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import firebaseConfig from "../firebase-applet-config.json" with { type: "json" };

const DRY_RUN = process.argv.includes("--dry-run");
const project = firebaseConfig.projectId;
const bucket = firebaseConfig.storageBucket;
const root = `projects/${project}/databases/${firebaseConfig.firestoreDatabaseId}/documents`;
const api = "https://firestore.googleapis.com/v1";
const require = createRequire(import.meta.url);

// Same limits as lib/image-upload.ts.
const MAX_SIDE = { avatar: 512, banner: 1600, gallery: 1280, posts: 1600 };

let sharp = null;
try {
  sharp = require("sharp");
} catch {
  console.log("sharp não encontrado: as imagens sobem sem redimensionar.");
}

async function accessToken() {
  if (process.env.GOOGLE_OAUTH_ACCESS_TOKEN) return process.env.GOOGLE_OAUTH_ACCESS_TOKEN;
  const auth = require("firebase-tools/lib/auth.js");
  const { configstore } = require("firebase-tools/lib/configstore.js");
  const tokens = configstore.get("tokens");
  if (!tokens?.refresh_token) throw new Error("Run `npx firebase login` or set GOOGLE_OAUTH_ACCESS_TOKEN.");
  return (await auth.getAccessToken(tokens.refresh_token, [])).access_token;
}

const token = await accessToken();
async function call(url, { method = "GET", body, headers = {} } = {}) {
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...headers },
    body,
  });
  if (!res.ok) throw new Error(`${res.status} ${method} ${url}\n${(await res.text()).slice(0, 300)}`);
  return res.json();
}

async function listDocs(path) {
  const docs = [];
  let pageToken;
  do {
    const q = new URLSearchParams({ pageSize: "300" });
    if (pageToken) q.set("pageToken", pageToken);
    const r = await call(`${api}/${root}/${path}?${q}`);
    docs.push(...(r.documents || []));
    pageToken = r.nextPageToken;
  } while (pageToken);
  return docs;
}

const isDataUrl = (value) => typeof value === "string" && value.startsWith("data:image/");

// One upload per distinct image; returns the Storage download URL.
const uploaded = new Map();
let bytesBefore = 0;
let bytesAfter = 0;
async function toStorage(dataUrl, uid, kind) {
  const key = createHash("sha256").update(dataUrl).digest("hex");
  if (uploaded.has(key)) return uploaded.get(key);

  const [, mime, base64] = dataUrl.match(/^data:(image\/[a-z+]+);base64,(.*)$/s) || [];
  if (!base64) throw new Error(`Imagem em formato inesperado (${dataUrl.slice(0, 30)}…)`);
  let bytes = Buffer.from(base64, "base64");
  let contentType = mime;
  if (sharp) {
    bytes = await sharp(bytes)
      .rotate()
      .resize({ width: MAX_SIDE[kind], height: MAX_SIDE[kind], fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    contentType = "image/webp";
  }
  bytesBefore += dataUrl.length;
  bytesAfter += bytes.length;

  const extension = contentType === "image/jpeg" ? "jpg" : contentType.split("/")[1];
  const name = `users/${uid}/${kind}/${key.slice(0, 32)}.${extension}`;
  const downloadToken = randomUUID();
  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(name)}?alt=media&token=${downloadToken}`;

  if (!DRY_RUN) {
    const boundary = `skillsy-${randomUUID()}`;
    const metadata = {
      name,
      contentType,
      cacheControl: "public, max-age=31536000, immutable",
      metadata: { firebaseStorageDownloadTokens: downloadToken },
    };
    const body = Buffer.concat([
      Buffer.from(
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: ${contentType}\r\n\r\n`,
      ),
      bytes,
      Buffer.from(`\r\n--${boundary}--`),
    ]);
    await call(`https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=multipart`, {
      method: "POST",
      body,
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
    });
  }
  uploaded.set(key, url);
  return url;
}

// Rewrites the given top-level fields of one document; returns the field
// names it changed.
async function migrateDoc(doc, uid, plan) {
  const fields = {};
  for (const [field, kind] of Object.entries(plan)) {
    const value = doc.fields?.[field];
    if (!value) continue;
    if (field === "gallery") {
      const items = value.arrayValue?.values || [];
      if (!items.some((item) => isDataUrl(item.mapValue?.fields?.url?.stringValue))) continue;
      const next = [];
      for (const item of items) {
        const itemFields = { ...item.mapValue.fields };
        if (isDataUrl(itemFields.url?.stringValue)) {
          itemFields.url = { stringValue: await toStorage(itemFields.url.stringValue, uid, kind) };
        }
        next.push({ mapValue: { fields: itemFields } });
      }
      fields.gallery = { arrayValue: { values: next } };
    } else if (isDataUrl(value.stringValue)) {
      fields[field] = { stringValue: await toStorage(value.stringValue, uid, kind) };
    }
  }
  const changed = Object.keys(fields);
  if (changed.length && !DRY_RUN) {
    const mask = changed.map((field) => `updateMask.fieldPaths=${field}`).join("&");
    await call(`${api}/${doc.name}?${mask}&currentDocument.exists=true`, {
      method: "PATCH",
      body: JSON.stringify({ fields }),
      headers: { "Content-Type": "application/json" },
    });
  }
  return changed;
}

const PROFILE_FIELDS = { photoURL: "avatar", bannerURL: "banner", gallery: "gallery" };
const summary = [];
const docId = (doc) => doc.name.split("/").pop();

for (const collection of ["users", "public_profiles"]) {
  for (const doc of await listDocs(collection)) {
    const changed = await migrateDoc(doc, docId(doc), PROFILE_FIELDS);
    if (changed.length) summary.push(`${collection}/${docId(doc)}: ${changed.join(", ")}`);
    if (collection === "public_profiles") {
      for (const rec of await listDocs(`public_profiles/${docId(doc)}/recommendations`)) {
        const recommender = rec.fields?.recommenderId?.stringValue || docId(rec);
        const recChanged = await migrateDoc(rec, recommender, { recommenderPhotoURL: "avatar" });
        if (recChanged.length) summary.push(`public_profiles/${docId(doc)}/recommendations/${docId(rec)}: ${recChanged.join(", ")}`);
      }
    }
  }
}
for (const doc of await listDocs("posts")) {
  const author = doc.fields?.authorId?.stringValue;
  if (!author) continue;
  const changed = await migrateDoc(doc, author, { coverImageUrl: "posts" });
  if (changed.length) summary.push(`posts/${docId(doc)}: ${changed.join(", ")}`);
}

console.log(summary.join("\n") || "Nenhuma imagem em base64 encontrada.");
console.log(
  `${DRY_RUN ? "[simulação] " : ""}${summary.length} documentos, ${uploaded.size} imagens: ` +
    `${(bytesBefore / 1024).toFixed(0)} KB nos documentos → ${(bytesAfter / 1024).toFixed(0)} KB no Storage.`,
);
