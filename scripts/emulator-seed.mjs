// Fills the local emulators with a copy of production, for `npm run dev:local`.
//
// The first run reads every document of the production database once (one
// read per document) and caches it in .emulator-data/seed.json. Later runs
// only use that file; pass --refresh to download a new copy.
//
// Every user with an e-mail also gets an Auth emulator account with the same
// uid, so you can sign in locally with that e-mail and the password below.
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import firebaseConfig from "../firebase-applet-config.json" with { type: "json" };

const LOCAL_PASSWORD = "skillsy123";
const CACHE = new URL("../.emulator-data/seed.json", import.meta.url);
const project = firebaseConfig.projectId;
const database = firebaseConfig.firestoreDatabaseId;
const prodRoot = `projects/${project}/databases/${database}/documents`;
const firestoreEmulator = "http://127.0.0.1:8080/v1";
const authEmulator = `http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/projects/${project}`;

async function call(url, { token, body } = {}) {
  const res = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${res.status} ${url}\n${(await res.text()).slice(0, 300)}`);
  return res.json();
}

async function productionToken() {
  if (process.env.GOOGLE_OAUTH_ACCESS_TOKEN) return process.env.GOOGLE_OAUTH_ACCESS_TOKEN;
  const require = createRequire(import.meta.url);
  const auth = require("firebase-tools/lib/auth.js");
  const { configstore } = require("firebase-tools/lib/configstore.js");
  const tokens = configstore.get("tokens");
  if (!tokens?.refresh_token) throw new Error("Run `npx firebase login` or set GOOGLE_OAUTH_ACCESS_TOKEN.");
  return (await auth.getAccessToken(tokens.refresh_token, [])).access_token;
}

async function downloadProduction() {
  const token = await productionToken();
  const api = "https://firestore.googleapis.com/v1";
  const docs = [];

  async function walk(parent) {
    let collectionIds = [];
    let pageToken;
    do {
      const r = await call(`${api}/${parent}:listCollectionIds`, { token, body: { pageSize: 300, pageToken } });
      collectionIds.push(...(r.collectionIds || []));
      pageToken = r.nextPageToken;
    } while (pageToken);

    for (const id of collectionIds) {
      pageToken = undefined;
      do {
        const q = new URLSearchParams({ pageSize: "300", showMissing: "true" });
        if (pageToken) q.set("pageToken", pageToken);
        const r = await call(`${api}/${parent}/${id}?${q}`, { token });
        for (const doc of r.documents || []) {
          if (doc.fields || doc.createTime) {
            docs.push({ path: doc.name.slice(prodRoot.length + 1), fields: doc.fields || {} });
          }
          await walk(doc.name);
        }
        pageToken = r.nextPageToken;
      } while (pageToken);
    }
  }

  await walk(prodRoot);
  mkdirSync(new URL(".", CACHE), { recursive: true });
  writeFileSync(CACHE, JSON.stringify(docs));
  return docs;
}

const refresh = process.argv.includes("--refresh");
const docs = !refresh && existsSync(CACHE)
  ? JSON.parse(readFileSync(CACHE, "utf8"))
  : await downloadProduction();

const localRoot = `projects/${project}/databases/${database}/documents`;
for (let i = 0; i < docs.length; i += 400) {
  await call(`${firestoreEmulator}/${localRoot}:batchWrite`, {
    token: "owner",
    body: {
      writes: docs.slice(i, i + 400).map((doc) => ({
        update: { name: `${localRoot}/${doc.path}`, fields: doc.fields },
      })),
    },
  });
}

let accounts = 0;
for (const doc of docs) {
  const [collection, uid, ...rest] = doc.path.split("/");
  const email = doc.fields.email?.stringValue;
  if (collection !== "users" || rest.length || !email) continue;
  try {
    await call(`${authEmulator}/accounts`, {
      token: "owner",
      body: {
        localId: uid,
        email,
        password: LOCAL_PASSWORD,
        emailVerified: true,
        displayName: doc.fields.displayName?.stringValue || doc.fields.name?.stringValue,
      },
    });
  } catch (error) {
    // Re-seeding emulators that are already running: the account exists.
    if (!String(error.message).includes("DUPLICATE_LOCAL_ID")) throw error;
  }
  accounts += 1;
}

console.log(`Emuladores prontos: ${docs.length} documentos e ${accounts} contas (senha local: ${LOCAL_PASSWORD}).`);
