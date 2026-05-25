import { execFileSync } from "node:child_process";
import firebaseConfig from "../firebase-applet-config.json" with { type: "json" };

const projectId = firebaseConfig.projectId;
const databaseId = firebaseConfig.firestoreDatabaseId || "(default)";
const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents`;
const pageSize = 100;

function parseArgs(argv) {
  const options = {
    limit: 50,
    uid: undefined,
    email: undefined,
    token: process.env.GOOGLE_OAUTH_ACCESS_TOKEN || process.env.FIREBASE_ACCESS_TOKEN,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--limit") {
      const next = argv[index + 1];
      if (!next) {
        throw new Error("Missing value for --limit");
      }
      options.limit = Number(next);
      index += 1;
      continue;
    }

    if (arg === "--token") {
      const next = argv[index + 1];
      if (!next) {
        throw new Error("Missing value for --token");
      }
      options.token = next;
      index += 1;
      continue;
    }

    if (arg === "--uid") {
      const next = argv[index + 1];
      if (!next) {
        throw new Error("Missing value for --uid");
      }
      options.uid = next;
      index += 1;
      continue;
    }

    if (arg === "--email") {
      const next = argv[index + 1];
      if (!next) {
        throw new Error("Missing value for --email");
      }
      options.email = next.toLowerCase();
      index += 1;
    }
  }

  return options;
}

function readAccessToken() {
  const envToken = process.env.GOOGLE_OAUTH_ACCESS_TOKEN || process.env.FIREBASE_ACCESS_TOKEN;
  if (envToken) {
    return envToken;
  }

  const commands = [
    ["gcloud", ["auth", "print-access-token"]],
    ["gcloud", ["auth", "application-default", "print-access-token"]],
  ];

  for (const [command, args] of commands) {
    try {
      const value = execFileSync(command, args, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();

      if (value) {
        return value;
      }
    } catch {
      // Try the next option.
    }
  }

  throw new Error(
    "Unable to obtain an access token. Set GOOGLE_OAUTH_ACCESS_TOKEN or install gcloud and login.",
  );
}

async function firestoreRequest(path, init = {}) {
  const token = init.token || readAccessToken();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Firestore request failed (${response.status}): ${body}`);
  }

  return response.json();
}

async function listDocuments(collectionName, token) {
  const documents = [];
  let nextPageToken = "";

  while (true) {
    const query = new URLSearchParams({
      pageSize: String(pageSize),
    });

    if (nextPageToken) {
      query.set("pageToken", nextPageToken);
    }

    const payload = await firestoreRequest(`/${collectionName}?${query.toString()}`, {
      method: "GET",
      token,
    });

    documents.push(...(payload.documents || []));

    if (!payload.nextPageToken) {
      return documents;
    }

    nextPageToken = payload.nextPageToken;
  }
}

function getString(fields, key) {
  return fields?.[key]?.stringValue || "";
}

function getBoolean(fields, key) {
  return fields?.[key]?.booleanValue === true;
}

function getNumber(fields, key) {
  const integerValue = fields?.[key]?.integerValue;
  const doubleValue = fields?.[key]?.doubleValue;

  if (integerValue !== undefined) {
    return Number(integerValue);
  }

  if (doubleValue !== undefined) {
    return Number(doubleValue);
  }

  return undefined;
}

function normalizeDocument(document) {
  const fields = document.fields || {};
  const baptismYear = getNumber(fields, "baptismYear");
  const ward = getString(fields, "ward");
  const memberVerified = getBoolean(fields, "memberVerified");
  const computedVerified = Boolean(
    ward.trim() &&
      typeof baptismYear === "number" &&
      Number.isFinite(baptismYear) &&
      baptismYear >= 1830 &&
      baptismYear <= new Date().getFullYear(),
  );

  return {
    id: document.name.split("/").pop(),
    uid: getString(fields, "uid"),
    name: getString(fields, "name"),
    email: getString(fields, "email"),
    ward: ward || "-",
    baptismYear: baptismYear ?? "-",
    memberVerified,
    computedVerified,
    isProvider: getBoolean(fields, "isProvider"),
    isBlocked: getBoolean(fields, "isBlocked"),
    isDeleted: getBoolean(fields, "isDeleted"),
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const token = options.token || readAccessToken();
  const documents = await listDocuments("users", token);
  let users = documents.map(normalizeDocument);

  if (options.uid) {
    users = users.filter((user) => user.id === options.uid || user.uid === options.uid);
  }

  if (options.email) {
    users = users.filter((user) => user.email.toLowerCase() === options.email);
  }

  users = users.slice(0, options.limit);

  console.log(`users total: ${documents.length}`);
  console.table(users);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
