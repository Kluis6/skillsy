// Cloud Storage security rules tests. Run with `npm run test:rules`, which
// starts the Storage emulator next to Firestore.
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import { deleteObject, getBytes, listAll, ref, uploadBytes } from "firebase/storage";

const OWNER = "owner";
const OTHER = "other";
const IMAGE = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);
const webp = { contentType: "image/webp" };

let env;

before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-skillsy",
    storage: { rules: readFileSync("storage.rules", "utf8") },
  });
});

after(async () => {
  await env?.cleanup();
});

const storageFor = (uid) =>
  uid ? env.authenticatedContext(uid).storage() : env.unauthenticatedContext().storage();

describe("imagens dos membros", () => {
  test("o dono envia uma imagem para a própria pasta", async () => {
    for (const kind of ["avatar", "banner", "gallery", "posts"]) {
      await assertSucceeds(uploadBytes(ref(storageFor(OWNER), `users/${OWNER}/${kind}/a.webp`), IMAGE, webp));
    }
  });

  test("ninguém grava na pasta de outro membro", async () => {
    await assertFails(uploadBytes(ref(storageFor(OTHER), `users/${OWNER}/avatar/b.webp`), IMAGE, webp));
    await assertFails(uploadBytes(ref(storageFor(null), `users/${OWNER}/avatar/c.webp`), IMAGE, webp));
  });

  test("só imagens JPG, PNG ou WEBP", async () => {
    await assertFails(
      uploadBytes(ref(storageFor(OWNER), `users/${OWNER}/avatar/d.svg`), IMAGE, { contentType: "image/svg+xml" })
    );
    await assertFails(
      uploadBytes(ref(storageFor(OWNER), `users/${OWNER}/avatar/e.pdf`), IMAGE, { contentType: "application/pdf" })
    );
  });

  test("arquivos de 2 MB ou mais são recusados", async () => {
    const big = new Uint8Array(2 * 1024 * 1024);
    await assertFails(uploadBytes(ref(storageFor(OWNER), `users/${OWNER}/gallery/f.webp`), big, webp));
  });

  test("pastas fora da lista são recusadas", async () => {
    await assertFails(uploadBytes(ref(storageFor(OWNER), `users/${OWNER}/docs/g.webp`), IMAGE, webp));
    await assertFails(uploadBytes(ref(storageFor(OWNER), `outros/${OWNER}/h.webp`), IMAGE, webp));
  });

  test("qualquer pessoa lê as imagens publicadas", async () => {
    await env.withSecurityRulesDisabled(async (context) => {
      await uploadBytes(ref(context.storage(), `users/${OWNER}/avatar/public.webp`), IMAGE, webp);
    });
    await assertSucceeds(getBytes(ref(storageFor(null), `users/${OWNER}/avatar/public.webp`)));
  });
});

describe("fotos dos produtos", () => {
  test("o dono envia e remove a foto e visitantes baixam pela URL do catálogo", async () => {
    const path = `users/${OWNER}/products/${"a".repeat(36)}.webp`;
    const ownerFile = ref(storageFor(OWNER), path);
    await assertFails(uploadBytes(ref(storageFor(OTHER), path), IMAGE, webp));
    await assertSucceeds(uploadBytes(ownerFile, IMAGE, webp));
    await assertFails(uploadBytes(ownerFile, IMAGE, webp));
    await assertFails(listAll(ref(storageFor(null), `users/${OWNER}/products`)));
    await assertFails(deleteObject(ref(storageFor(OTHER), path)));

    const host = process.env.FIREBASE_STORAGE_EMULATOR_HOST;
    const response = await fetch(`http://${host}/v0/b/${ownerFile.bucket}/o/${encodeURIComponent(path)}?alt=media`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "image/webp");
    assert.deepEqual(new Uint8Array(await response.arrayBuffer()), IMAGE);
    await assertSucceeds(deleteObject(ownerFile));
  });

  test("recusa nomes e tipos de arquivo inválidos", async () => {
    const storage = storageFor(OWNER);
    await assertFails(uploadBytes(ref(storage, `users/${OWNER}/products/nome.webp`), IMAGE, webp));
    const file = ref(storage, `users/${OWNER}/products/${"b".repeat(36)}.webp`);
    await assertFails(uploadBytes(file, IMAGE, { contentType: "application/pdf" }));
    await assertFails(uploadBytes(file, new Uint8Array(2 * 1024 * 1024), webp));
  });
});

test("empresa tem logo e capa públicas em arquivos separados gravados apenas pelo dono", async () => {
  const storage = storageFor(OWNER);
  const filename = "12345678-1234-1234-1234-123456789abc.webp";
  for (const kind of ["company-logo", "company-banner"]) {
    const folder = `users/${OWNER}/${kind}`;
    const path = `${folder}/${filename}`;
    const ownerFile = ref(storage, path);
    await assertFails(uploadBytes(ref(storageFor(OTHER), path), IMAGE, webp));
    await assertFails(uploadBytes(ref(storage, `${folder}/nome.webp`), IMAGE, webp));
    await assertFails(uploadBytes(ownerFile, IMAGE, { contentType: "image/svg+xml" }));
    await assertSucceeds(uploadBytes(ownerFile, IMAGE, webp));
    await assertFails(uploadBytes(ownerFile, IMAGE, webp));
    await assertSucceeds(getBytes(ref(storageFor(null), path)));
    await assertFails(listAll(ref(storageFor(null), folder)));
    await assertFails(deleteObject(ref(storageFor(OTHER), path)));
    await assertSucceeds(deleteObject(ownerFile));
  }
});
