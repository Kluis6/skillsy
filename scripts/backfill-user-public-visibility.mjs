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

function getBooleanField(fields, fieldName) {
  return fields?.[fieldName]?.booleanValue === true;
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

async function publicProfileExists(userId, token) {
  try {
    await firestoreRequest(`/public_profiles/${userId}`, {
      method: "GET",
      token,
    });
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes("(404)")) {
      return false;
    }
    throw error;
  }
}

function buildVisibilityPatch(fields, hasPublicProfile) {
  if (fields.hasPublicProfile?.booleanValue === hasPublicProfile) {
    return null;
  }

  return {
    hasPublicProfile: {
      booleanValue: hasPublicProfile,
    },
  };
}

async function patchUserVisibility(userId, fieldsPatch, token) {
  const query = "updateMask.fieldPaths=hasPublicProfile";
  return firestoreRequest(`/users/${userId}?${query}`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ fields: fieldsPatch }),
  });
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
    const currentIsProvider = getBooleanField(fields, "isProvider");
    const existsPublicProfile = await publicProfileExists(userId, token);
    const nextHasPublicProfile = existsPublicProfile || currentIsProvider;
    const patch = buildVisibilityPatch(fields, nextHasPublicProfile);

    if (!patch) {
      continue;
    }

    changed += 1;

    if (options.dryRun) {
      console.log(
        `[dry-run] would set users/${userId}.hasPublicProfile=${nextHasPublicProfile} ` +
          `(publicProfile=${existsPublicProfile}, isProvider=${currentIsProvider})`,
      );
      continue;
    }

    await patchUserVisibility(userId, patch, token);
    console.log(
      `Updated users/${userId}.hasPublicProfile=${nextHasPublicProfile} ` +
        `(publicProfile=${existsPublicProfile}, isProvider=${currentIsProvider})`,
    );
  }

  if (options.dryRun) {
    console.log(`Dry run completed. ${scanned} user(s) scanned, ${changed} would be updated.`);
    return;
  }

  console.log(`Backfill completed. ${scanned} user(s) scanned, ${changed} updated.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
