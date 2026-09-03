import { execFileSync } from "node:child_process";
import firebaseConfig from "../firebase-applet-config.json" with { type: "json" };

const projectId = firebaseConfig.projectId;
const databaseId = firebaseConfig.firestoreDatabaseId || "(default)";
const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents`;
const pageSize = 100;

const publicFieldNames = [
  "uid",
  "name",
  "photoURL",
  "bannerURL",
  "bio",
  "category",
  "isProvider",
  "serviceType",
  "publicCity",
  "publicState",
  "ward",
  "searchTokens",
  "companyName",
  "gallery",
  "rating",
  "reviewCount",
  "experienceYears",
  "availability",
  "serviceHours",
  "whatsapp",
  "instagram",
  "facebook",
  "linkedin",
  "website",
  "phone",
  "phones",
  "isBlocked",
  "isDeleted",
  "createdAt",
];

function parseArgs(argv) {
  const options = {
    dryRun: false,
    limit: undefined,
    uid: undefined,
    token: process.env.GOOGLE_OAUTH_ACCESS_TOKEN || process.env.FIREBASE_ACCESS_TOKEN,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg === "--limit") {
      const next = argv[index + 1];
      if (!next) {
        throw new Error("Missing value for --limit");
      }
      options.limit = Number(next);
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

    if (arg === "--token") {
      const next = argv[index + 1];
      if (!next) {
        throw new Error("Missing value for --token");
      }
      options.token = next;
      index += 1;
      continue;
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

  try {
    const firebaseCliToken = execFileSync(
      "npx",
      [
        "-y",
        "-p",
        "firebase-tools@latest",
        "node",
        "-e",
        "const auth=require('firebase-tools/lib/auth');const api=require('firebase-tools/lib/apiv2');const account=auth.getGlobalDefaultAccount();if(!account)throw new Error('No Firebase account');auth.setActiveAccount({},account);api.getAccessToken().then(token=>process.stdout.write(token)).catch(error=>{console.error(error.message);process.exit(1)})",
      ],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      },
    ).trim();

    if (firebaseCliToken) {
      return firebaseCliToken;
    }
  } catch {
    // Firebase CLI session is unavailable; report the actionable alternatives below.
  }

  throw new Error(
    "Unable to obtain an access token. Sign in with Firebase CLI, set GOOGLE_OAUTH_ACCESS_TOKEN, or install gcloud and login.",
  );
}

async function firestoreRequest(path, init = {}) {
  const token = init.token || readAccessToken();
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...(init.headers || {}),
  };

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Firestore request failed (${response.status}): ${body}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function getDocumentId(documentName) {
  return documentName.split("/").pop();
}

function cloneFieldValue(fieldValue) {
  return JSON.parse(JSON.stringify(fieldValue));
}

function stringValue(value) {
  return { stringValue: value };
}

function booleanValue(value) {
  return { booleanValue: value };
}

function arrayValue(values) {
  return {
    arrayValue: {
      values,
    },
  };
}

function readStringField(field) {
  return typeof field?.stringValue === "string" ? field.stringValue : "";
}

function toSearchTokens(...values) {
  const words = values
    .filter((value) => typeof value === "string")
    .flatMap((value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(/[^a-z0-9]+/))
    .filter((word) => word.length >= 2);

  const tokens = new Set();
  for (const word of words) {
    tokens.add(word);
    for (let length = 3; length < word.length; length += 1) {
      tokens.add(word.slice(0, length));
    }
  }
  return [...tokens].slice(0, 80);
}

function readNumberField(field) {
  if (typeof field?.integerValue === "string") {
    return Number(field.integerValue);
  }

  if (typeof field?.doubleValue === "number") {
    return field.doubleValue;
  }

  return undefined;
}

function computeMemberVerified(fields) {
  const ward = readStringField(fields.ward).trim();
  const baptismYear = readNumberField(fields.baptismYear);
  const currentYear = new Date().getFullYear();

  return Boolean(
    ward &&
      typeof baptismYear === "number" &&
      Number.isFinite(baptismYear) &&
      baptismYear >= 1830 &&
      baptismYear <= currentYear,
  );
}

function computeMembershipYears(fields) {
  const baptismYear = readNumberField(fields.baptismYear);
  const currentYear = new Date().getFullYear();

  if (
    typeof baptismYear !== "number" ||
    !Number.isFinite(baptismYear) ||
    baptismYear < 1830 ||
    baptismYear > currentYear
  ) {
    return undefined;
  }

  return currentYear - baptismYear;
}

function fallbackField(fieldName, userId, userDocument) {
  const fields = userDocument.fields || {};

  switch (fieldName) {
    case "uid":
      return cloneFieldValue(fields.uid || stringValue(userId));
    case "name":
      return cloneFieldValue(fields.name || stringValue("Membro Skillsy"));
    case "isProvider":
      return cloneFieldValue(fields.isProvider || booleanValue(false));
    case "isBlocked":
      return cloneFieldValue(fields.isBlocked || booleanValue(false));
    case "isDeleted":
      return cloneFieldValue(fields.isDeleted || booleanValue(false));
    case "createdAt":
      return cloneFieldValue(
        fields.createdAt || {
          timestampValue: userDocument.createTime,
        },
      );
    case "gallery":
    case "availability":
    case "phones":
      return arrayValue([]);
    default:
      return stringValue("");
  }
}

function buildPublicFields(userDocument) {
  const userId = getDocumentId(userDocument.name);
  const fields = userDocument.fields || {};
  const publicFields = {};

  for (const fieldName of publicFieldNames) {
    const sourceValue = fields[fieldName];
    publicFields[fieldName] = sourceValue
      ? cloneFieldValue(sourceValue)
      : fallbackField(fieldName, userId, userDocument);
  }

  // Mirrors getPublicCity/getPublicState in services/user-service.ts: city
  // and state are always public now, there's no opt-in gate any more.
  const location = readStringField(fields.location);
  const publicCity = location.split(",")[0]?.trim() || "";
  const explicitState = readStringField(fields.businessState).trim().toUpperCase();
  const inferredState = location.split(",").at(-1)?.trim().toUpperCase() || "";
  const publicState = /^[A-Z]{2}$/.test(explicitState || inferredState)
    ? explicitState || inferredState
    : "";
  publicFields.publicCity = stringValue(publicCity);
  publicFields.publicState = stringValue(publicState);
  publicFields.memberVerified = booleanValue(computeMemberVerified(fields));
  publicFields.searchTokens = arrayValue(
    toSearchTokens(
      readStringField(fields.name),
      readStringField(fields.category),
      readStringField(fields.serviceType),
      readStringField(fields.companyName),
      publicCity,
      publicState,
    ).map(stringValue),
  );

  return publicFields;
}

async function listUsers(token, limit) {
  const documents = [];
  let nextPageToken = "";

  while (true) {
    const query = new URLSearchParams({
      pageSize: String(pageSize),
    });

    if (nextPageToken) {
      query.set("pageToken", nextPageToken);
    }

    const payload = await firestoreRequest(`/users?${query.toString()}`, {
      method: "GET",
      token,
    });

    const current = payload.documents || [];
    documents.push(...current);

    if (limit && documents.length >= limit) {
      return documents.slice(0, limit);
    }

    if (!payload.nextPageToken) {
      return documents;
    }

    nextPageToken = payload.nextPageToken;
  }
}

async function writePublicProfile(token, userDocument, dryRun) {
  const userId = getDocumentId(userDocument.name);
  const fields = buildPublicFields(userDocument);

  if (dryRun) {
    return {
      userId,
      fields,
    };
  }

  await firestoreRequest(`/public_profiles/${userId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ fields }),
  });

  return {
    userId,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const token = options.token || readAccessToken();
  let users = await listUsers(token, options.limit);

  if (options.uid) {
    users = users.filter((userDocument) => getDocumentId(userDocument.name) === options.uid);
  }

  if (users.length === 0) {
    console.log("No user documents found in users collection.");
    return;
  }

  console.log(
    `Found ${users.length} user document(s) in projects/${projectId}/databases/${databaseId}.`,
  );

  let processed = 0;
  for (const userDocument of users) {
    const result = await writePublicProfile(token, userDocument, options.dryRun);
    processed += 1;

    if (options.dryRun) {
      console.log(`[dry-run] would backfill public_profiles/${result.userId}`);
    } else {
      console.log(`Backfilled public_profiles/${result.userId}`);
    }
  }

  if (options.dryRun) {
    console.log(`Dry run completed. ${processed} document(s) inspected.`);
    return;
  }

  console.log(`Backfill completed successfully. ${processed} public profile(s) updated.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
