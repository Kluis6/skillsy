// Copies every document (including subcollections, even under deleted
// parents) from the old free-tier database to the new (default) database.
//
//   node scripts/migrate-firestore-database.mjs --dry-run   # only counts
//   node scripts/migrate-firestore-database.mjs             # copies
//
// Auth: GOOGLE_OAUTH_ACCESS_TOKEN, or the firebase CLI login on this machine.
// Reads from the source count against its quota (~6.5 MB today, ~1.7k units).
import { createRequire } from "node:module";
import firebaseConfig from "../firebase-applet-config.json" with { type: "json" };

const SOURCE_DB = "ai-studio-e9c18d7d-4bd5-4d82-861f-0db605e4639a";
const TARGET_DB = "(default)";
const DRY_RUN = process.argv.includes("--dry-run");
const project = firebaseConfig.projectId;
const root = (db) => `projects/${project}/databases/${db}/documents`;
const api = "https://firestore.googleapis.com/v1";

async function accessToken() {
  if (process.env.GOOGLE_OAUTH_ACCESS_TOKEN) return process.env.GOOGLE_OAUTH_ACCESS_TOKEN;
  const require = createRequire(import.meta.url);
  const auth = require("firebase-tools/lib/auth.js");
  const { configstore } = require("firebase-tools/lib/configstore.js");
  const tokens = configstore.get("tokens");
  if (!tokens?.refresh_token) throw new Error("Run `npx firebase login` or set GOOGLE_OAUTH_ACCESS_TOKEN.");
  return (await auth.getAccessToken(tokens.refresh_token, [])).access_token;
}

const token = await accessToken();
async function call(url, body) {
  const res = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${res.status} ${url}\n${(await res.text()).slice(0, 300)}`);
  return res.json();
}

async function collectionIds(parent) {
  const ids = [];
  let pageToken;
  do {
    const r = await call(`${api}/${parent}:listCollectionIds`, { pageSize: 300, pageToken });
    ids.push(...(r.collectionIds || []));
    pageToken = r.nextPageToken;
  } while (pageToken);
  return ids;
}

// showMissing also returns "phantom" parents that only exist because they
// have subcollections (e.g. votes of a deleted user).
async function listDocs(parent, collectionId) {
  const docs = [];
  let pageToken;
  do {
    const q = new URLSearchParams({ pageSize: "300", showMissing: "true" });
    if (pageToken) q.set("pageToken", pageToken);
    const r = await call(`${api}/${parent}/${collectionId}?${q}`);
    docs.push(...(r.documents || []));
    pageToken = r.nextPageToken;
  } while (pageToken);
  return docs;
}

const toCopy = [];
const counts = {};
async function walk(parent, label) {
  for (const id of await collectionIds(parent)) {
    const path = label ? `${label}/*/${id}` : id;
    for (const doc of await listDocs(parent, id)) {
      if (doc.fields || doc.createTime) {
        toCopy.push(doc);
        counts[path] = (counts[path] || 0) + 1;
      }
      await walk(doc.name, path);
    }
  }
}

console.log(`Lendo ${SOURCE_DB}...`);
await walk(root(SOURCE_DB), "");
console.log(JSON.stringify(counts, null, 2));
console.log(`Total: ${toCopy.length} documentos.`);
if (DRY_RUN) process.exit(0);

const writes = toCopy.map((doc) => ({
  update: { name: doc.name.replace(root(SOURCE_DB), root(TARGET_DB)), fields: doc.fields || {} },
}));
for (let i = 0; i < writes.length; i += 400) {
  await call(`${api}/${root(TARGET_DB)}:batchWrite`, { writes: writes.slice(i, i + 400) });
  console.log(`Gravados ${Math.min(i + 400, writes.length)}/${writes.length}`);
}

// Verify: the same paths must exist in the target with the same field sets.
let missing = 0;
for (const doc of toCopy) {
  const target = doc.name.replace(root(SOURCE_DB), root(TARGET_DB));
  const r = await fetch(`${api}/${target}?mask.fieldPaths=__name__`, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) { missing += 1; console.log("FALTANDO:", target); }
}
console.log(missing ? `${missing} documentos faltando.` : "Conferência OK: todos os documentos estão no banco novo.");
