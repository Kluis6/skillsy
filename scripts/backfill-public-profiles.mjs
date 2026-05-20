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
  "location",
  "ward",
  "companyName",
  "gallery",
  "rating",
  "reviewCount",
  "experienceYears",
  "memberVerified",
  "membershipYears",
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

  throw new Error(
    "Unable to obtain an access token. Set GOOGLE_OAUTH_ACCESS_TOKEN or install gcloud and login.",
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
    case "memberVerified":
      return booleanValue(computeMemberVerified(fields));
    case "membershipYears": {
      const value = computeMembershipYears(fields);
      return value === undefined ? undefined : { integerValue: String(value) };
    }
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
  const users = await listUsers(token, options.limit);

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
