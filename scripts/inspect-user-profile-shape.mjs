import { execFileSync } from "node:child_process";
import firebaseConfig from "../firebase-applet-config.json" with { type: "json" };

const projectId = firebaseConfig.projectId;
const databaseId = firebaseConfig.firestoreDatabaseId || "(default)";
const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents`;
const currentYear = new Date().getFullYear();

const USER_ALLOWED_FIELDS = new Set([
  "id",
  "uid",
  "name",
  "email",
  "photoURL",
  "bannerURL",
  "bio",
  "category",
  "isProvider",
  "hasPublicProfile",
  "role",
  "contacts",
  "whatsapp",
  "instagram",
  "facebook",
  "linkedin",
  "website",
  "serviceType",
  "phone",
  "phones",
  "location",
  "ward",
  "companyName",
  "gallery",
  "rating",
  "reviewCount",
  "experienceYears",
  "baptismYear",
  "memberVerified",
  "membershipYears",
  "isBlocked",
  "isDeleted",
  "deletedByUser",
  "deletedAt",
  "createdAt",
  "socialLinks",
  "availability",
  "serviceHours",
  "businessAddress",
  "businessAddressNumber",
  "businessNeighborhood",
  "businessState",
  "businessComplement",
]);

const PUBLIC_ALLOWED_FIELDS = new Set([
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
  "baptismYear",
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
]);

const VALID_CATEGORIES = new Set([
  "Tecnologia",
  "Design",
  "Marketing",
  "Consultoria",
  "Vendas",
  "Aulas",
  "Cozinha",
  "Doméstico",
  "Limpeza",
  "Marcenaria",
  "Manutenção",
  "Construção Civil",
  "Beleza",
  "Educação",
  "Saúde",
  "Eventos",
  "Jurídico",
  "Financeiro",
  "Assistência",
  "Reformas",
  "Automotivo",
  "Moda",
  "Bem Estar",
  "Pet Care",
  "Fotografia",
  "Música",
  "Idiomas",
  "Esportes",
  "Festas",
  "Transporte",
  "Outros",
]);

const VALID_AVAILABILITY = new Set(["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]);

function parseArgs(argv) {
  const options = {
    uid: undefined,
    token: process.env.GOOGLE_OAUTH_ACCESS_TOKEN || process.env.FIREBASE_ACCESS_TOKEN,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--uid") {
      const next = argv[index + 1];
      if (!next) throw new Error("Missing value for --uid");
      options.uid = next;
      index += 1;
      continue;
    }

    if (arg === "--token") {
      const next = argv[index + 1];
      if (!next) throw new Error("Missing value for --token");
      options.token = next;
      index += 1;
    }
  }

  if (!options.uid) {
    throw new Error("Use --uid <userId>");
  }

  return options;
}

function readAccessToken() {
  const envToken = process.env.GOOGLE_OAUTH_ACCESS_TOKEN || process.env.FIREBASE_ACCESS_TOKEN;
  if (envToken) return envToken;

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

      if (value) return value;
    } catch {
      // noop
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

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Firestore request failed (${response.status}): ${body}`);
  }

  return response.json();
}

function unwrapField(field) {
  if (!field || typeof field !== "object") return undefined;
  if ("stringValue" in field) return field.stringValue;
  if ("booleanValue" in field) return field.booleanValue === true;
  if ("integerValue" in field) return Number(field.integerValue);
  if ("doubleValue" in field) return Number(field.doubleValue);
  if ("timestampValue" in field) return field.timestampValue;
  if ("nullValue" in field) return null;
  if ("mapValue" in field) {
    const next = {};
    const entries = Object.entries(field.mapValue?.fields || {});
    for (const [key, value] of entries) {
      next[key] = unwrapField(value);
    }
    return next;
  }
  if ("arrayValue" in field) {
    return (field.arrayValue?.values || []).map(unwrapField);
  }
  return undefined;
}

function summarizeFieldValue(value) {
  if (typeof value === "string") {
    return { type: "string", length: value.length, preview: value.slice(0, 80) };
  }
  if (typeof value === "number") {
    return { type: "number", value };
  }
  if (typeof value === "boolean") {
    return { type: "boolean", value };
  }
  if (value === null) {
    return { type: "null" };
  }
  if (Array.isArray(value)) {
    return { type: "array", size: value.length };
  }
  if (value && typeof value === "object") {
    return { type: "object", keys: Object.keys(value) };
  }
  if (value === undefined) {
    return { type: "undefined" };
  }
  return { type: typeof value };
}

function hasVerificationData(data) {
  return (
    typeof data.ward === "string" &&
    data.ward.trim().length > 0 &&
    typeof data.baptismYear === "number" &&
    Number.isFinite(data.baptismYear) &&
    data.baptismYear >= 1830 &&
    data.baptismYear <= 2100
  );
}

function isTimestampLikeValue(value) {
  return typeof value === "string" && value.includes("T");
}

function validateCommon(data, allowedFields, mode, expectedUid) {
  const issues = [];
  const keys = Object.keys(data);

  const unexpected = keys.filter((key) => !allowedFields.has(key));
  if (unexpected.length > 0) {
    issues.push(`${mode}: campos inesperados: ${unexpected.join(", ")}`);
  }

  if (data.uid !== expectedUid) {
    issues.push(`${mode}: uid diferente do id do documento (${data.uid} != ${expectedUid})`);
  }

  if (typeof data.name !== "string" || data.name.length === 0 || data.name.length > 100) {
    issues.push(`${mode}: name invalido`);
  }

  if (typeof data.isProvider !== "boolean") {
    issues.push(`${mode}: isProvider invalido`);
  }

  const stringChecks = [
    ["photoURL", 1000000],
    ["bannerURL", 1000000],
    ["bio", 2000],
    ["serviceType", 200],
    ["location", 200],
    ["ward", 200],
    ["companyName", 200],
    ["serviceHours", 200],
    ["whatsapp", 30],
    ["instagram", 100],
    ["facebook", 100],
    ["linkedin", 100],
    ["website", 200],
    ["phone", 30],
  ];

  for (const [field, maxLength] of stringChecks) {
    if (
      field in data &&
      data[field] !== null &&
      data[field] !== undefined &&
      (typeof data[field] !== "string" || data[field].length > maxLength)
    ) {
      issues.push(`${mode}: ${field} invalido`);
    }
  }

  if (
    "category" in data &&
    data.category !== null &&
    data.category !== undefined &&
    (typeof data.category !== "string" || !VALID_CATEGORIES.has(data.category))
  ) {
    issues.push(`${mode}: category invalida`);
  }

  if ("availability" in data && data.availability !== null && data.availability !== undefined) {
    if (!Array.isArray(data.availability) || data.availability.length > 7) {
      issues.push(`${mode}: availability invalido`);
    } else if (data.availability.some((item) => typeof item !== "string" || !VALID_AVAILABILITY.has(item))) {
      issues.push(`${mode}: availability contem itens invalidos`);
    }
  }

  if ("gallery" in data && data.gallery !== null && data.gallery !== undefined) {
    if (!Array.isArray(data.gallery) || data.gallery.length > 5) {
      issues.push(`${mode}: gallery invalida`);
    } else {
      for (const item of data.gallery) {
        if (!item || typeof item !== "object" || typeof item.url !== "string" || item.url.length === 0) {
          issues.push(`${mode}: gallery contem item invalido`);
          break;
        }
        if ("description" in item && item.description !== null && typeof item.description !== "string") {
          issues.push(`${mode}: gallery.description invalido`);
          break;
        }
      }
    }
  }

  if ("createdAt" in data && data.createdAt !== undefined && !isTimestampLikeValue(data.createdAt)) {
    issues.push(`${mode}: createdAt invalido`);
  }

  if ("deletedAt" in data && data.deletedAt !== undefined && data.deletedAt !== null && !isTimestampLikeValue(data.deletedAt)) {
    issues.push(`${mode}: deletedAt invalido`);
  }

  if ("memberVerified" in data && data.memberVerified !== undefined && typeof data.memberVerified !== "boolean") {
    issues.push(`${mode}: memberVerified invalido`);
  }

  if (
    "membershipYears" in data &&
    data.membershipYears !== undefined &&
    data.membershipYears !== null &&
    (typeof data.membershipYears !== "number" || data.membershipYears < 0 || data.membershipYears > 300)
  ) {
    issues.push(`${mode}: membershipYears invalido`);
  }

  const verified = hasVerificationData(data);
  if (verified && data.memberVerified !== true) {
    issues.push(`${mode}: memberVerified deveria ser true`);
  }
  if (!verified && data.memberVerified === true) {
    issues.push(`${mode}: memberVerified nao pode ser true sem ward+baptismYear validos`);
  }

  return issues;
}

function validateUser(data, expectedUid) {
  const issues = validateCommon(data, USER_ALLOWED_FIELDS, "users", expectedUid);

  if (typeof data.email !== "string" || data.email.length === 0) {
    issues.push("users: email invalido");
  }
  if (data.role !== "admin" && data.role !== "user") {
    issues.push("users: role invalido");
  }
  if ("hasPublicProfile" in data && data.hasPublicProfile !== undefined && typeof data.hasPublicProfile !== "boolean") {
    issues.push("users: hasPublicProfile invalido");
  }
  if ("isBlocked" in data && data.isBlocked !== undefined && typeof data.isBlocked !== "boolean") {
    issues.push("users: isBlocked invalido");
  }
  if ("isDeleted" in data && data.isDeleted !== undefined && typeof data.isDeleted !== "boolean") {
    issues.push("users: isDeleted invalido");
  }
  if ("deletedByUser" in data && data.deletedByUser !== undefined && typeof data.deletedByUser !== "boolean") {
    issues.push("users: deletedByUser invalido");
  }

  return issues;
}

function validatePublicProfile(data, expectedUid) {
  return validateCommon(data, PUBLIC_ALLOWED_FIELDS, "public_profiles", expectedUid);
}

function decodeDocument(document) {
  if (!document) return null;
  const rawFields = document.fields || {};
  const decoded = {};

  for (const [key, value] of Object.entries(rawFields)) {
    decoded[key] = unwrapField(value);
  }

  return decoded;
}

function printSummary(label, data) {
  if (!data) {
    console.log(`${label}: documento inexistente`);
    return;
  }

  console.log(`${label}:`);
  console.table(
    Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, JSON.stringify(summarizeFieldValue(value))]),
    ),
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const token = options.token || readAccessToken();
  const userDoc = await firestoreRequest(`/users/${options.uid}`, { method: "GET", token });
  const publicDoc = await firestoreRequest(`/public_profiles/${options.uid}`, { method: "GET", token });

  const userData = decodeDocument(userDoc);
  const publicData = decodeDocument(publicDoc);

  printSummary("users", userData);
  printSummary("public_profiles", publicData);

  const userIssues = userData ? validateUser(userData, options.uid) : ["users: documento nao encontrado"];
  const publicIssues = publicData ? validatePublicProfile(publicData, options.uid) : [];

  console.log("\nPossiveis incompatibilidades:");
  if (userIssues.length === 0 && publicIssues.length === 0) {
    console.log("Nenhuma incompatibilidade obvia encontrada pelos validadores locais.");
    return;
  }

  for (const issue of [...userIssues, ...publicIssues]) {
    console.log(`- ${issue}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
