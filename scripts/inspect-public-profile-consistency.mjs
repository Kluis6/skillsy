import { execFileSync } from "node:child_process";
import firebaseConfig from "../firebase-applet-config.json" with { type: "json" };

const projectId = firebaseConfig.projectId;
const databaseId = firebaseConfig.firestoreDatabaseId || "(default)";
const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents`;
const pageSize = 100;

function parseArgs(argv) {
  const options = {
    limit: 50,
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

function getDocumentId(documentName) {
  return documentName.split("/").pop();
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

function normalizeUser(document) {
  const fields = document.fields || {};
  return {
    id: getDocumentId(document.name),
    uid: getString(fields, "uid") || getDocumentId(document.name),
    name: getString(fields, "name") || "Sem nome",
    email: getString(fields, "email"),
    isProvider: getBoolean(fields, "isProvider"),
    hasPublicProfileField: fields.hasPublicProfile?.booleanValue,
    isBlocked: getBoolean(fields, "isBlocked"),
    isDeleted: getBoolean(fields, "isDeleted"),
    rating: getNumber(fields, "rating"),
    reviewCount: getNumber(fields, "reviewCount"),
  };
}

function normalizePublicProfile(document) {
  const fields = document.fields || {};
  return {
    id: getDocumentId(document.name),
    uid: getString(fields, "uid") || getDocumentId(document.name),
    name: getString(fields, "name") || "Sem nome",
    isProvider: getBoolean(fields, "isProvider"),
    isBlocked: getBoolean(fields, "isBlocked"),
    isDeleted: getBoolean(fields, "isDeleted"),
    rating: getNumber(fields, "rating"),
    reviewCount: getNumber(fields, "reviewCount"),
  };
}

function summarizeRows(rows, limit) {
  return rows.slice(0, limit).map((row) => ({
    uid: row.uid,
    name: row.name,
    email: row.email || "-",
    isProvider: row.isProvider,
    hasPublicProfile: row.hasPublicProfile,
    publicProfileExists: row.publicProfileExists,
    rating: row.rating ?? "-",
    reviewCount: row.reviewCount ?? "-",
    issue: row.issue,
  }));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const token = options.token || readAccessToken();

  const [userDocuments, publicDocuments] = await Promise.all([
    listDocuments("users", token),
    listDocuments("public_profiles", token),
  ]);

  const users = userDocuments.map(normalizeUser);
  const publicProfiles = publicDocuments.map(normalizePublicProfile);
  const publicByUid = new Map(publicProfiles.map((profile) => [profile.uid, profile]));

  const missingPublicProfiles = [];
  const unexpectedPublicProfiles = [];
  const mismatchedVisibility = [];
  const ratingRisk = [];

  for (const user of users) {
    const publicProfile = publicByUid.get(user.uid);
    const publicProfileExists = Boolean(publicProfile);
    const hasPublicProfile =
      typeof user.hasPublicProfileField === "boolean"
        ? user.hasPublicProfileField
        : user.isProvider;

    if (hasPublicProfile && !publicProfileExists) {
      missingPublicProfiles.push({
        ...user,
        hasPublicProfile,
        publicProfileExists,
        issue: "hasPublicProfile sem public_profiles",
      });
    }

    if (
      typeof user.hasPublicProfileField === "boolean" &&
      user.hasPublicProfileField !== publicProfileExists
    ) {
      mismatchedVisibility.push({
        ...user,
        hasPublicProfile: user.hasPublicProfileField,
        publicProfileExists,
        issue: "campo hasPublicProfile divergente da existencia real",
      });
    }

    if (
      user.isProvider &&
      !publicProfileExists &&
      !user.isBlocked &&
      !user.isDeleted
    ) {
      ratingRisk.push({
        ...user,
        hasPublicProfile,
        publicProfileExists,
        issue: "provider ativo sem public_profiles",
      });
    }
  }

  for (const publicProfile of publicProfiles) {
    const user = users.find((item) => item.uid === publicProfile.uid);
    if (!user) {
      unexpectedPublicProfiles.push({
        uid: publicProfile.uid,
        name: publicProfile.name,
        email: "",
        isProvider: publicProfile.isProvider,
        hasPublicProfile: true,
        publicProfileExists: true,
        rating: publicProfile.rating,
        reviewCount: publicProfile.reviewCount,
        issue: "public_profiles sem documento correspondente em users",
      });
      continue;
    }

    const hasPublicProfile =
      typeof user.hasPublicProfileField === "boolean"
        ? user.hasPublicProfileField
        : user.isProvider;

    if (!hasPublicProfile && publicProfile) {
      unexpectedPublicProfiles.push({
        uid: publicProfile.uid,
        name: publicProfile.name,
        email: user.email,
        isProvider: publicProfile.isProvider,
        hasPublicProfile,
        publicProfileExists: true,
        rating: publicProfile.rating,
        reviewCount: publicProfile.reviewCount,
        issue: "public_profiles existe mas usuario nao deveria estar publico",
      });
    }
  }

  console.log(`users total: ${users.length}`);
  console.log(`public_profiles total: ${publicProfiles.length}`);
  console.log("");
  console.log(`hasPublicProfile sem public_profiles: ${missingPublicProfiles.length}`);
  console.log(`public_profiles inesperados: ${unexpectedPublicProfiles.length}`);
  console.log(`divergencias do campo hasPublicProfile: ${mismatchedVisibility.length}`);
  console.log(`risco para rating/busca: ${ratingRisk.length}`);

  if (missingPublicProfiles.length > 0) {
    console.log("");
    console.log("Usuarios que deveriam ter public_profiles mas nao tem:");
    console.table(summarizeRows(missingPublicProfiles, options.limit));
  }

  if (unexpectedPublicProfiles.length > 0) {
    console.log("");
    console.log("public_profiles inesperados:");
    console.table(summarizeRows(unexpectedPublicProfiles, options.limit));
  }

  if (mismatchedVisibility.length > 0) {
    console.log("");
    console.log("Divergencias entre hasPublicProfile e existencia do documento publico:");
    console.table(summarizeRows(mismatchedVisibility, options.limit));
  }

  if (ratingRisk.length > 0) {
    console.log("");
    console.log("Providers ativos com risco para rating/busca:");
    console.table(summarizeRows(ratingRisk, options.limit));
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
