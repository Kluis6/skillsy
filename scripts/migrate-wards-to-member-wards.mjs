// Moves the ward (ala/ramo) out of public_profiles, which anyone can read, into
// member_wards/{uid}, which only signed-in members can read (firestore.rules).
// The site and the new app already write it there; this script moves the
// wards saved before. Safe to run more than once.
//
//   node scripts/migrate-wards-to-member-wards.mjs --dry-run   # only lists
//   node scripts/migrate-wards-to-member-wards.mjs             # moves
//
// Authentication: the Firebase CLI session (npx firebase login), gcloud, or
// GOOGLE_OAUTH_ACCESS_TOKEN — the same as the other scripts in this folder.
import { execFileSync } from "node:child_process";
import firebaseConfig from "../firebase-applet-config.json" with { type: "json" };

const projectId = firebaseConfig.projectId;
const databaseId = firebaseConfig.firestoreDatabaseId || "(default)";
const root = `projects/${projectId}/databases/${databaseId}/documents`;
const api = `https://firestore.googleapis.com/v1/${root}`;
const dryRun = process.argv.includes("--dry-run");

function readAccessToken() {
  const envToken = process.env.GOOGLE_OAUTH_ACCESS_TOKEN || process.env.FIREBASE_ACCESS_TOKEN;
  if (envToken) return envToken;
  for (const args of [["auth", "print-access-token"], ["auth", "application-default", "print-access-token"]]) {
    try {
      const value = execFileSync("gcloud", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
      if (value) return value;
    } catch {
      // Try the next option.
    }
  }
  try {
    const value = execFileSync(
      "npx",
      [
        "-y", "-p", "firebase-tools@latest", "node", "-e",
        "const auth=require('firebase-tools/lib/auth');const api=require('firebase-tools/lib/apiv2');const account=auth.getGlobalDefaultAccount();if(!account)throw new Error('No Firebase account');auth.setActiveAccount({},account);api.getAccessToken().then(token=>process.stdout.write(token)).catch(error=>{console.error(error.message);process.exit(1)})",
      ],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
    if (value) return value;
  } catch {
    // No Firebase CLI session.
  }
  throw new Error("Sem token de acesso. Entre com `npx firebase login`, use gcloud ou defina GOOGLE_OAUTH_ACCESS_TOKEN.");
}

const token = readAccessToken();

async function request(url, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init.headers || {}) },
  });
  if (!response.ok) throw new Error(`Firestore ${response.status}: ${await response.text()}`);
  return response.json();
}

let moved = 0;
let pageToken = "";
do {
  const page = await request(`${api}/public_profiles?pageSize=100${pageToken ? `&pageToken=${pageToken}` : ""}`);
  for (const document of page.documents ?? []) {
    const uid = document.name.split("/").pop();
    const ward = document.fields?.ward?.stringValue?.trim() ?? "";
    if (!("ward" in (document.fields ?? {}))) continue;

    console.log(`${dryRun ? "[simulação] " : ""}${uid}: ${ward ? "move a ala" : "apaga ala vazia"}`);
    if (dryRun) continue;

    // One atomic commit: write member_wards (when there is a ward) and delete
    // the field from the public profile (update mask with no value).
    const writes = [];
    if (ward) {
      writes.push({
        update: {
          name: `${root}/member_wards/${uid}`,
          fields: { uid: { stringValue: uid }, ward: { stringValue: ward } },
        },
      });
    }
    writes.push({
      update: { name: document.name, fields: {} },
      updateMask: { fieldPaths: ["ward"] },
      currentDocument: { exists: true },
    });
    await request(`${api}:commit`, { method: "POST", body: JSON.stringify({ writes }) });
    moved += 1;
  }
  pageToken = page.nextPageToken ?? "";
} while (pageToken);

console.log(dryRun ? "Simulação concluída: nada foi alterado." : `${moved} perfil(is) atualizado(s).`);
