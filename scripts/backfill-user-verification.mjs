import { execFileSync } from "node:child_process";
import firebaseConfig from "../firebase-applet-config.json" with { type: "json" };

const projectId = firebaseConfig.projectId;
const databaseId = firebaseConfig.firestoreDatabaseId || "(default)";
const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents`;
const pageSize = 100;

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

  if (typeof field?.stringValue === "string" && /^\d{4}$/.test(field.stringValue.trim())) {
    return Number(field.stringValue.trim());
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

function buildVerificationPatch(fields) {
  const patch = {};
  const normalizedBaptismYear = readNumberField(fields.baptismYear);
  const memberVerified = computeMemberVerified(fields);
  const membershipYears = computeMembershipYears(fields);

  if (
    normalizedBaptismYear !== undefined &&
    fields.baptismYear?.integerValue !== String(normalizedBaptismYear)
  ) {
    patch.baptismYear = { integerValue: String(normalizedBaptismYear) };
  }

  if (fields.memberVerified?.booleanValue !== memberVerified) {
    patch.memberVerified = { booleanValue: memberVerified };
  }

  if (membershipYears === undefined) {
    if (fields.membershipYears !== undefined) {
      patch.membershipYears = null;
    }
  } else if (fields.membershipYears?.integerValue !== String(membershipYears)) {
    patch.membershipYears = { integerValue: String(membershipYears) };
  }

  return patch;
}

async function* listUserDocuments(token, limit) {
  let pageToken = "";
  let yielded = 0;

  while (true) {
    const params = new URLSearchParams({ pageSize: String(pageSize) });
    if (pageToken) {
      params.set("pageToken", pageToken);
    }

    const payload = await firestoreRequest(`/users?${params.toString()}`, { token });
    const documents = payload.documents || [];

    for (const document of documents) {
      yield document;
      yielded += 1;
      if (limit !== undefined && yielded >= limit) {
        return;
      }
    }

    if (!payload.nextPageToken) {
      return;
    }

    pageToken = payload.nextPageToken;
  }
}

function buildPatchPayload(fieldsPatch) {
  const fields = {};
  const updateMask = [];

  for (const [fieldName, fieldValue] of Object.entries(fieldsPatch)) {
    updateMask.push(`updateMask.fieldPaths=${encodeURIComponent(fieldName)}`);
    if (fieldValue !== null) {
      fields[fieldName] = fieldValue;
    }
  }

  return {
    body: JSON.stringify({ fields }),
    query: updateMask.join("&"),
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const token = options.token || readAccessToken();

  let scanned = 0;
  let changed = 0;

  for await (const userDocument of listUserDocuments(token, options.limit)) {
    scanned += 1;
    const userId = getDocumentId(userDocument.name);
    const fields = userDocument.fields || {};
    const patch = buildVerificationPatch(fields);
    const patchEntries = Object.entries(patch);

    if (patchEntries.length === 0) {
      continue;
    }

    changed += 1;

    const summary = {
      userId,
      email: readStringField(fields.email),
      ward: readStringField(fields.ward),
      currentBaptismYear:
        fields.baptismYear?.integerValue ?? fields.baptismYear?.stringValue ?? null,
      nextMemberVerified:
        patch.memberVerified?.booleanValue ?? fields.memberVerified?.booleanValue ?? false,
      nextMembershipYears:
        patch.membershipYears === null
          ? null
          : patch.membershipYears?.integerValue ?? fields.membershipYears?.integerValue ?? null,
    };

    if (options.dryRun) {
      console.log("[dry-run]", JSON.stringify(summary));
      continue;
    }

    const { body, query } = buildPatchPayload(patch);
    await firestoreRequest(`/users/${encodeURIComponent(userId)}?${query}`, {
      token,
      method: "PATCH",
      body,
    });
    console.log("[updated]", JSON.stringify(summary));
  }

  console.log(
    JSON.stringify({
      scanned,
      changed,
      dryRun: options.dryRun,
      projectId,
      databaseId,
    }),
  );
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
