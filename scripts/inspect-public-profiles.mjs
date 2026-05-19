import { execFileSync } from "node:child_process";
import firebaseConfig from "../firebase-applet-config.json" with { type: "json" };

const projectId = firebaseConfig.projectId;
const databaseId = firebaseConfig.firestoreDatabaseId || "(default)";
const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents`;
const pageSize = 100;

function parseArgs(argv) {
  const options = {
    limit: 20,
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

  return 0;
}

function normalizeDocument(document) {
  const fields = document.fields || {};
  return {
    id: document.name.split("/").pop(),
    uid: getString(fields, "uid"),
    name: getString(fields, "name"),
    category: getString(fields, "category"),
    companyName: getString(fields, "companyName"),
    isProvider: getBoolean(fields, "isProvider"),
    isBlocked: getBoolean(fields, "isBlocked"),
    isDeleted: getBoolean(fields, "isDeleted"),
    rating: getNumber(fields, "rating"),
    reviewCount: getNumber(fields, "reviewCount"),
  };
}

function sortFeatured(items) {
  return [...items].sort((a, b) => {
    if (b.rating !== a.rating) {
      return b.rating - a.rating;
    }

    if (b.reviewCount !== a.reviewCount) {
      return b.reviewCount - a.reviewCount;
    }

    return a.name.localeCompare(b.name, "pt-BR");
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const token = options.token || readAccessToken();
  const documents = await listDocuments("public_profiles", token);
  const profiles = documents.map(normalizeDocument);

  const visibleProviders = sortFeatured(
    profiles.filter(
      (profile) =>
        profile.isProvider &&
        !profile.isBlocked &&
        !profile.isDeleted,
    ),
  ).slice(0, options.limit);

  console.log(`public_profiles total: ${profiles.length}`);
  console.log(`public_profiles visiveis como provider: ${visibleProviders.length}`);

  if (visibleProviders.length === 0) {
    console.log("Nenhum provider publico visivel encontrado.");
    return;
  }

  console.table(
    visibleProviders.map((profile) => ({
      uid: profile.uid || profile.id,
      name: profile.name,
      category: profile.category || "-",
      companyName: profile.companyName || "-",
      rating: profile.rating,
      reviewCount: profile.reviewCount,
      isProvider: profile.isProvider,
      isBlocked: profile.isBlocked,
      isDeleted: profile.isDeleted,
    })),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
