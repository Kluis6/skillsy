// Firestore security rules tests. Run with `npm run test:rules`, which starts
// the Firestore emulator (requires Java) and executes this file with node:test.
import { readFileSync } from "node:fs";
import { after, before, beforeEach, describe, test } from "node:test";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  deleteDoc,
  deleteField,
  doc,
  collection,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  setLogLevel,
  Timestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

const PROVIDER = "provider";
const LEGACY_PROVIDER = "legacy";
const RATER = "rater";
const RECOMMENDER = "recommender";
const BLOCKED = "blocked";
const ADMIN = "admin";

let env;

// Denied writes are the expected outcome of many tests; keep the SDK quiet.
setLogLevel("silent");

function userDoc(uid, overrides = {}) {
  return {
    uid,
    name: `Nome ${uid}`,
    email: `${uid}@example.com`,
    isProvider: false,
    role: "user",
    createdAt: Timestamp.now(),
    ...overrides,
  };
}

function publicProfileDoc(uid, overrides = {}) {
  return { uid, name: `Nome ${uid}`, isProvider: true, ...overrides };
}

function dbAs(uid, token = {}) {
  return env
    .authenticatedContext(uid, {
      email: `${uid}@example.com`,
      email_verified: true,
      ...token,
    })
    .firestore();
}

// Mirrors UserService.submitRating: vote + rating with a deterministic id +
// aggregate update, all in one atomic write.
function rate(db, { raterId = RATER, targetId = PROVIDER, score, ratingId, aggregate }) {
  const batch = writeBatch(db);
  batch.set(doc(db, "users", raterId, "votes", targetId), {
    providerId: targetId,
    votedAt: serverTimestamp(),
  });
  batch.set(doc(db, "ratings", ratingId ?? `${raterId}_${targetId}`), {
    toId: targetId,
    fromId: raterId,
    authorName: `Nome ${raterId}`,
    score,
    createdAt: serverTimestamp(),
  });
  if (aggregate) {
    batch.update(doc(db, "public_profiles", targetId), aggregate);
  }
  return batch.commit();
}

before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-skillsy",
    firestore: { rules: readFileSync("firestore.rules", "utf8") },
  });
});

after(async () => {
  await env?.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await Promise.all([
      setDoc(doc(db, "users", PROVIDER), userDoc(PROVIDER, { isProvider: true, rating: 4, reviewCount: 2 })),
      setDoc(doc(db, "users", RATER), userDoc(RATER)),
      setDoc(doc(db, "users", RECOMMENDER), userDoc(RECOMMENDER)),
      setDoc(doc(db, "users", BLOCKED), userDoc(BLOCKED, { isBlocked: true })),
      setDoc(doc(db, "users", ADMIN), userDoc(ADMIN, { role: "admin" })),
      setDoc(
        doc(db, "public_profiles", PROVIDER),
        publicProfileDoc(PROVIDER, { rating: 4, ratingSum: 8, reviewCount: 2, recommendationCount: 1 }),
      ),
      setDoc(
        doc(db, "public_profiles", LEGACY_PROVIDER),
        publicProfileDoc(LEGACY_PROVIDER, { rating: 4.5, reviewCount: 3 }),
      ),
      setDoc(doc(db, "public_profiles", PROVIDER, "recommendations", RATER), {
        recommenderId: RATER,
        recommenderName: `Nome ${RATER}`,
        createdAt: Timestamp.now(),
      }),
    ]);
  });
});

describe("users: leitura", () => {
  test("dono lê o próprio documento", async () => {
    await assertSucceeds(getDoc(doc(dbAs(PROVIDER), "users", PROVIDER)));
  });

  test("outro membro não lê dados privados", async () => {
    await assertFails(getDoc(doc(dbAs(RATER), "users", PROVIDER)));
  });

  test("email igual mas não verificado não dá acesso", async () => {
    const attacker = dbAs("attacker", { email: `${PROVIDER}@example.com`, email_verified: false });
    await assertFails(getDoc(doc(attacker, "users", PROVIDER)));
  });

  test("email igual e verificado dá acesso (vínculo de perfil pré-cadastrado)", async () => {
    const owner = dbAs("new-uid", { email: `${PROVIDER}@example.com`, email_verified: true });
    await assertSucceeds(getDoc(doc(owner, "users", PROVIDER)));
  });
});

test("o dono não grava Ala/Ramo num perfil público novo nem existente", async () => {
  const newUid = "new-public-provider";
  const newProfile = doc(dbAs(newUid), "public_profiles", newUid);
  await assertFails(setDoc(newProfile, publicProfileDoc(newUid, { ward: "Ala Centro" })));
  await assertSucceeds(setDoc(newProfile, publicProfileDoc(newUid)));

  const currentProfile = doc(dbAs(PROVIDER), "public_profiles", PROVIDER);
  await assertFails(updateDoc(currentProfile, { ward: "Ala Centro" }));
});

test("a galeria privada e pública aceita até cinco fotos e descrições de até 200 caracteres", async () => {
  const db = dbAs(PROVIDER);
  const image = { url: "https://example.test/foto.webp", description: "x".repeat(200) };
  const gallery = Array.from({ length: 5 }, () => image);

  for (const collectionName of ["users", "public_profiles"]) {
    const profile = doc(db, collectionName, PROVIDER);
    await assertSucceeds(updateDoc(profile, { gallery }));
    await assertFails(updateDoc(profile, { gallery: [...gallery, image] }));
    await assertFails(updateDoc(profile, { gallery: [{ ...image, description: "x".repeat(201) }] }));
    await assertFails(updateDoc(profile, { gallery: [...gallery.slice(0, 4), { url: 123 }] }));
    await assertSucceeds(updateDoc(profile, { gallery: [] }));
  }
});

test("bio da empresa aceita texto opcional de até 500 caracteres somente nas escritas autorizadas", async () => {
  const uid = "company-bio-provider";
  const owner = dbAs(uid);
  const companyBio = "x".repeat(500);
  for (const [collectionName, buildDoc] of [
    ["users", userDoc],
    ["public_profiles", publicProfileDoc],
  ]) {
    const ref = doc(owner, collectionName, uid);
    await assertFails(setDoc(ref, buildDoc(uid, { isProvider: true, companyBio: companyBio + "x" })));
    await assertSucceeds(setDoc(ref, buildDoc(uid, { isProvider: true, companyBio })));
    await assertFails(updateDoc(ref, { companyBio: companyBio + "x" }));
    await assertFails(updateDoc(ref, { companyBio: { text: "Inválido" } }));
    await assertFails(updateDoc(doc(dbAs(RATER), collectionName, uid), { companyBio: "Terceiro" }));
    await assertSucceeds(updateDoc(ref, { companyBio: deleteField() }));
  }
});

test("logo e capa da empresa aceitam apenas nomes de arquivos válidos gravados pelo dono", async () => {
  const uid = "company-images-provider";
  const owner = dbAs(uid);
  const logo = "12345678-1234-1234-1234-123456789abc.webp";
  const cover = "01234567-0123-0123-0123-0123456789ab.jpg";
  for (const [collectionName, buildDoc] of [
    ["users", userDoc],
    ["public_profiles", publicProfileDoc],
  ]) {
    const ref = doc(owner, collectionName, uid);
    await assertFails(setDoc(ref, buildDoc(uid, { isProvider: true, companyLogoImageName: "../avatar/a.jpg" })));
    await assertSucceeds(setDoc(ref, buildDoc(uid, { isProvider: true, companyLogoImageName: logo })));
    await assertSucceeds(updateDoc(ref, { companyBannerImageName: cover }));
    await assertFails(updateDoc(ref, { companyBannerImageName: { name: cover } }));
    await assertFails(updateDoc(doc(dbAs(RATER), collectionName, uid), { companyLogoImageName: cover }));
    await assertSucceeds(updateDoc(ref, { companyLogoImageName: deleteField() }));
  }
});

test("a disponibilidade privada e pública aceita somente dias da semana do formulário", async () => {
  const db = dbAs(PROVIDER);
  const week = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  for (const collectionName of ["users", "public_profiles"]) {
    const profile = doc(db, collectionName, PROVIDER);
    await assertSucceeds(updateDoc(profile, { availability: week }));
    await assertFails(updateDoc(profile, { availability: [...week, "Seg"] }));
    await assertFails(updateDoc(profile, { availability: ["Seg", "Feriado"] }));
    await assertSucceeds(updateDoc(profile, { availability: [] }));
  }
});

test("o perfil público completo pode ser salvo com cinco fotos", async () => {
  const profile = doc(dbAs(PROVIDER), "public_profiles", PROVIDER);
  const details = {
    name: "Profissional Completo",
    photoURL: "https://example.test/avatar.webp",
    bannerURL: "https://example.test/capa.webp",
    bio: "Perfil completo.",
    category: "Cozinha",
    serviceType: "Confeitaria",
    publicCity: "São Paulo",
    publicState: "SP",
    memberVerified: true,
    communityFriend: false,
    searchTokens: ["profissional", "confeitaria"],
    companyName: "Empresa",
    companyBio: "Uma empresa da comunidade.",
    companyLogoImageName: "12345678-1234-1234-1234-123456789abc.webp",
    companyBannerImageName: "01234567-0123-0123-0123-0123456789ab.jpg",
    gallery: Array.from({ length: 5 }, (_, index) => ({
      url: `https://example.test/${index}.webp`,
      description: "x".repeat(200),
    })),
    availability: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
    serviceHours: "08h às 18h",
    whatsapp: "11999999999",
    instagram: "profissional",
    facebook: "https://example.test/facebook",
    linkedin: "https://example.test/linkedin",
    website: "https://example.test",
    phone: "11998888888",
    phones: ["11998888888"],
    isBlocked: false,
    isDeleted: false,
    createdAt: Timestamp.now(),
    language: "pt",
    country: "BR",
  };
  await assertSucceeds(setDoc(profile, details, { merge: true }));
  const newUid = "complete-new-provider";
  const newProfile = doc(dbAs(newUid), "public_profiles", newUid);
  await assertSucceeds(setDoc(newProfile, { ...publicProfileDoc(newUid), ...details }));
});

describe("catálogo de produtos", () => {
  const revision = "a".repeat(36);
  const nextRevision = "b".repeat(36);
  const product = { name: "Bolo", description: "Chocolate\ncom morango", revision };
  const catalog = (db, uid = PROVIDER) => collection(db, "public_profiles", uid, "products");
  const item = (db, id = "1", uid = PROVIDER) => doc(catalog(db, uid), id);

  test("o anunciante pode criar sem foto nem preço, editar e excluir", async () => {
    const ownerItem = item(dbAs(PROVIDER));
    const visitorItem = item(env.unauthenticatedContext().firestore());

    await assertSucceeds(setDoc(ownerItem, product));
    await assertSucceeds(getDocs(catalog(env.unauthenticatedContext().firestore())));
    await assertSucceeds(getDoc(visitorItem));
    await assertSucceeds(updateDoc(ownerItem, {
      revision: nextRevision,
      priceCents: 0,
      imageName: `${revision}.webp`,
    }));
    await assertSucceeds(deleteDoc(ownerItem));
  });

  test("somente o próprio anunciante ativo pode publicar e alterar", async () => {
    const ownerItem = item(dbAs(PROVIDER));
    await assertSucceeds(setDoc(ownerItem, product));
    await assertFails(setDoc(item(dbAs(RATER), "2", RATER), product));
    await assertFails(setDoc(item(dbAs(RATER), "2"), product));
    await assertFails(updateDoc(item(dbAs(RATER)), { name: "Alterado", revision: nextRevision }));
    await assertFails(deleteDoc(item(dbAs(RATER))));

    await env.withSecurityRulesDisabled((context) =>
      updateDoc(doc(context.firestore(), "users", PROVIDER), { isBlocked: true }),
    );
    await assertFails(setDoc(item(dbAs(PROVIDER), "2"), product));
    await assertFails(updateDoc(ownerItem, { name: "Alterado", revision: nextRevision }));
    await assertFails(getDocs(catalog(env.unauthenticatedContext().firestore())));
  });

  test("um perfil privado mantém seu catálogo acessível somente ao dono", async () => {
    await env.withSecurityRulesDisabled((context) =>
      updateDoc(doc(context.firestore(), "users", PROVIDER), { hasPublicProfile: false }),
    );
    await assertSucceeds(setDoc(item(dbAs(PROVIDER)), product));
    await assertSucceeds(getDocs(catalog(dbAs(PROVIDER))));
    await assertFails(getDocs(catalog(env.unauthenticatedContext().firestore())));
  });

  test("valida campos obrigatórios e opcionais também nas atualizações", async () => {
    const ownerItem = item(dbAs(PROVIDER));
    for (const invalid of [
      { name: "" }, { name: "  \n" }, { name: "x".repeat(101) },
      { description: "" }, { description: "x".repeat(1001) },
      { priceCents: -1 }, { priceCents: 1.5 }, { priceCents: "200" },
      { imageName: "https://example.com/other.webp" }, { imageName: [`${revision}.webp`] },
      { ownerId: RATER },
    ]) {
      await assertFails(setDoc(ownerItem, { ...product, ...invalid }));
    }
    await assertSucceeds(setDoc(ownerItem, product));
    await assertFails(updateDoc(ownerItem, { description: deleteField(), revision: nextRevision }));
    await assertFails(updateDoc(ownerItem, { name: "Sem revisão nova" }));
  });

  test("o catálogo tem exatamente 50 posições possíveis", async () => {
    const db = dbAs(PROVIDER);
    const batch = writeBatch(db);
    for (let slot = 1; slot <= 50; slot++) {
      batch.set(item(db, String(slot)), product);
    }
    await assertSucceeds(batch.commit());
    for (const invalid of ["0", "01", "51", "produto-extra"]) {
      await assertFails(setDoc(item(db, invalid), product));
    }
    await assertSucceeds(updateDoc(item(db, "50"), { name: "Último produto", revision: nextRevision }));
  });
});

describe("admin", () => {
  beforeEach(async () => {
    await env.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, "public_profiles", "hidden"), publicProfileDoc("hidden", { isBlocked: true }));
      await setDoc(doc(db, "public_profiles", "member"), publicProfileDoc("member", { isProvider: false }));
      await setDoc(doc(db, "public_profiles", "member", "recommendations", RATER), {
        recommenderId: RATER,
        recommenderName: `Nome ${RATER}`,
        createdAt: Timestamp.now(),
      });
    });
  });

  test("admin lista todos os perfis públicos, inclusive os ocultos", async () => {
    await assertSucceeds(getDocs(collection(dbAs(ADMIN), "public_profiles")));
  });

  test("membro comum não lê perfil oculto", async () => {
    await assertFails(getDoc(doc(dbAs(RATER), "public_profiles", "hidden")));
  });

  test("admin lê indicações de qualquer perfil (recálculo e limpeza)", async () => {
    await assertSucceeds(getDocs(collection(dbAs(ADMIN), "public_profiles", "member", "recommendations")));
    await assertFails(getDocs(collection(dbAs(RATER), "public_profiles", "member", "recommendations")));
  });
});

describe("agregados: dono não altera os próprios números", () => {
  test("dono atualiza campos comuns do users", async () => {
    await assertSucceeds(updateDoc(doc(dbAs(PROVIDER), "users", PROVIDER), { name: "Novo nome" }));
  });

  test("dono não altera rating/reviewCount em users", async () => {
    await assertFails(updateDoc(doc(dbAs(PROVIDER), "users", PROVIDER), { rating: 5 }));
    await assertFails(updateDoc(doc(dbAs(PROVIDER), "users", PROVIDER), { reviewCount: 99 }));
  });

  test("dono atualiza campos comuns do perfil público", async () => {
    await assertSucceeds(updateDoc(doc(dbAs(PROVIDER), "public_profiles", PROVIDER), { bio: "Nova bio" }));
  });

  test("dono não altera agregados do perfil público", async () => {
    const db = dbAs(PROVIDER);
    await assertFails(updateDoc(doc(db, "public_profiles", PROVIDER), { ratingSum: 10 }));
    await assertFails(updateDoc(doc(db, "public_profiles", PROVIDER), { reviewCount: 50 }));
    await assertFails(updateDoc(doc(db, "public_profiles", PROVIDER), { rating: 5 }));
    await assertFails(updateDoc(doc(db, "public_profiles", PROVIDER), { recommendationCount: 100 }));
  });

  test("novo usuário não nasce com nota", async () => {
    const db = dbAs("newbie");
    await assertFails(setDoc(doc(db, "users", "newbie"), userDoc("newbie", { rating: 5, reviewCount: 10 })));
    await assertSucceeds(setDoc(doc(db, "users", "newbie"), userDoc("newbie")));
  });

  test("perfil público novo não nasce com agregados", async () => {
    const db = dbAs(RATER);
    await assertFails(setDoc(doc(db, "public_profiles", RATER), publicProfileDoc(RATER, { ratingSum: 50, reviewCount: 10 })));
    await assertSucceeds(setDoc(doc(db, "public_profiles", RATER), publicProfileDoc(RATER)));
  });
});

describe("avaliações", () => {
  test("avaliação válida soma a nota e incrementa a contagem", async () => {
    await assertSucceeds(rate(dbAs(RATER), { score: 5, aggregate: { ratingSum: 13, reviewCount: 3 } }));
  });

  test("não aceita soma inflada ou reduzida", async () => {
    await assertFails(rate(dbAs(RATER), { score: 5, aggregate: { ratingSum: 20, reviewCount: 3 } }));
    await assertFails(rate(dbAs(RATER), { score: 1, aggregate: { ratingSum: 2, reviewCount: 3 } }));
  });

  test("não aceita pular a contagem", async () => {
    await assertFails(rate(dbAs(RATER), { score: 5, aggregate: { ratingSum: 13, reviewCount: 10 } }));
  });

  test("não aceita alterar a média gravada junto", async () => {
    await assertFails(rate(dbAs(RATER), { score: 5, aggregate: { ratingSum: 13, reviewCount: 3, rating: 1 } }));
  });

  test("não aceita avaliação sem atualizar o agregado", async () => {
    await assertFails(rate(dbAs(RATER), { score: 5 }));
  });

  test("id da avaliação precisa ser {avaliador}_{prestador}", async () => {
    await assertFails(
      rate(dbAs(RATER), { score: 5, ratingId: "random-id", aggregate: { ratingSum: 13, reviewCount: 3 } }),
    );
  });

  test("não avalia duas vezes o mesmo prestador", async () => {
    const db = dbAs(RATER);
    await assertSucceeds(rate(db, { score: 5, aggregate: { ratingSum: 13, reviewCount: 3 } }));
    await assertFails(rate(db, { score: 5, aggregate: { ratingSum: 18, reviewCount: 4 } }));
  });

  test("não avalia o próprio perfil", async () => {
    await assertFails(
      rate(dbAs(PROVIDER), { raterId: PROVIDER, score: 5, aggregate: { ratingSum: 13, reviewCount: 3 } }),
    );
  });

  test("usuário bloqueado não avalia", async () => {
    await assertFails(
      rate(dbAs(BLOCKED), { raterId: BLOCKED, score: 1, aggregate: { ratingSum: 9, reviewCount: 3 } }),
    );
  });

  test("perfil antigo sem ratingSum não recebe avaliação até ser migrado", async () => {
    await assertFails(
      rate(dbAs(RATER), { targetId: LEGACY_PROVIDER, score: 5, aggregate: { ratingSum: 5, reviewCount: 4 } }),
    );
  });

  test("primeira avaliação de um perfil sem avaliações", async () => {
    await env.withSecurityRulesDisabled((context) =>
      setDoc(doc(context.firestore(), "public_profiles", "fresh"), publicProfileDoc("fresh")),
    );
    await assertSucceeds(
      rate(dbAs(RATER), { targetId: "fresh", score: 4, aggregate: { ratingSum: 4, reviewCount: 1 } }),
    );
  });
});

describe("indicações", () => {
  function recommendation(recommenderId) {
    return {
      recommenderId,
      recommenderName: `Nome ${recommenderId}`,
      createdAt: serverTimestamp(),
    };
  }

  test("indicação incrementa a contagem em 1", async () => {
    const db = dbAs(RECOMMENDER);
    const batch = writeBatch(db);
    batch.set(doc(db, "public_profiles", PROVIDER, "recommendations", RECOMMENDER), recommendation(RECOMMENDER));
    batch.update(doc(db, "public_profiles", PROVIDER), { recommendationCount: 2 });
    await assertSucceeds(batch.commit());
  });

  test("indicação sem atualizar a contagem é rejeitada", async () => {
    const db = dbAs(RECOMMENDER);
    await assertFails(
      setDoc(doc(db, "public_profiles", PROVIDER, "recommendations", RECOMMENDER), recommendation(RECOMMENDER)),
    );
  });

  test("não infla a contagem de indicações", async () => {
    const db = dbAs(RECOMMENDER);
    const batch = writeBatch(db);
    batch.set(doc(db, "public_profiles", PROVIDER, "recommendations", RECOMMENDER), recommendation(RECOMMENDER));
    batch.update(doc(db, "public_profiles", PROVIDER), { recommendationCount: 10 });
    await assertFails(batch.commit());
  });

  test("não indica em nome de outra pessoa", async () => {
    const db = dbAs(RECOMMENDER);
    const batch = writeBatch(db);
    batch.set(doc(db, "public_profiles", PROVIDER, "recommendations", "someone-else"), recommendation("someone-else"));
    batch.update(doc(db, "public_profiles", PROVIDER), { recommendationCount: 2 });
    await assertFails(batch.commit());
  });

  test("remover a indicação decrementa a contagem em 1", async () => {
    const db = dbAs(RATER);
    const batch = writeBatch(db);
    batch.delete(doc(db, "public_profiles", PROVIDER, "recommendations", RATER));
    batch.update(doc(db, "public_profiles", PROVIDER), { recommendationCount: 0 });
    await assertSucceeds(batch.commit());
  });

  test("admin remove indicações (limpeza de perfis de teste)", async () => {
    await assertSucceeds(deleteDoc(doc(dbAs(ADMIN), "public_profiles", PROVIDER, "recommendations", RATER)));
  });

  test("remover a indicação sem decrementar é rejeitado", async () => {
    await assertFails(deleteDoc(doc(dbAs(RATER), "public_profiles", PROVIDER, "recommendations", RATER)));
  });
});

describe("users: edição do próprio perfil", () => {
  // A filled-in profile: before the update rule checked only changed keys,
  // re-validating every stored field went over Firestore's limit of 1000
  // expressions per rule and complete profiles could not be saved at all.
  const COMPLETE = "completo";
  const completeProfile = userDoc(COMPLETE, {
    photoURL: "https://example.com/foto.webp",
    bannerURL: "https://example.com/capa.webp",
    bio: "Marceneiro há 16 anos.",
    category: "Marcenaria",
    isProvider: true,
    hasPublicProfile: true,
    contacts: ["a", "b", "c", "d", "e", "f"],
    whatsapp: "21999990000",
    phone: "2133330000",
    instagram: "@marcenaria",
    facebook: "fb.com/marcenaria",
    linkedin: "linkedin.com/in/marcenaria",
    website: "https://marcenaria.example.com",
    serviceType: "Marceneiro",
    location: "Belford Roxo, RJ",
    ward: "Ala Centro",
    companyName: "Marcenaria Exemplo",
    gallery: [1, 2, 3, 4, 5].map((n) => ({ url: `https://example.com/${n}.webp`, description: `Foto ${n}` })),
    rating: 0,
    reviewCount: 0,
    experienceYears: 16,
    baptismYear: 2008,
    memberVerified: true,
    membershipYears: 18,
    communityFriend: false,
    availability: ["Seg", "Ter", "Qua", "Qui", "Sex"],
    serviceHours: "8h às 18h",
    businessState: "RJ",
    showPublicLocation: true,
  });

  beforeEach(async () => {
    await env.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "users", COMPLETE), completeProfile);
    });
  });

  test("perfil completo pode ser salvo pelo dono", async () => {
    await assertSucceeds(updateDoc(doc(dbAs(COMPLETE), "users", COMPLETE), { bio: "Nova bio" }));
  });

  function newAdvertiserFields() {
    const { uid, email, createdAt, role, rating, reviewCount, ...details } = completeProfile;
    return {
      ...details,
      name: "Anunciante de Teste",
      category: "Cozinha",
      serviceType: "Pizzaria",
      companyName: "Pizzaria de Teste",
      companyBio: "Pizza artesanal preparada no dia.",
      companyLogoImageName: "12345678-1234-1234-1234-123456789abc.webp",
      companyBannerImageName: "01234567-0123-0123-0123-0123456789ab.jpg",
      availability: ["Seg", "Qua", "Qui", "Sex", "Sáb"],
      businessAddress: "Rua de Teste",
      businessAddressNumber: "10",
      businessNeighborhood: "Centro",
      businessComplement: "Loja 1",
      language: "pt",
    };
  }

  test("membro pode ativar o anúncio e preencher várias seções num único salvamento", async () => {
    const db = dbAs(RATER);
    const profile = doc(db, "users", RATER);
    const changes = newAdvertiserFields();
    const batch = writeBatch(db);
    batch.set(doc(profile, "profile_validation", "gallery"), {
      gallery: changes.gallery,
      validatedAt: serverTimestamp(),
    });
    batch.update(profile, changes);
    await assertSucceeds(batch.commit());
  });

  test("a validação da galeria exige fotos válidas e pertence ao titular", async () => {
    const { gallery } = newAdvertiserFields();
    const validationPath = ["users", RATER, "profile_validation", "gallery"];
    await assertFails(setDoc(doc(dbAs(PROVIDER), ...validationPath), {
      gallery,
      validatedAt: serverTimestamp(),
    }));

    const db = dbAs(RATER);
    const invalid = [{ url: "https://example.com/foto.webp", description: "x".repeat(201) }];
    const batch = writeBatch(db);
    batch.set(doc(db, ...validationPath), { gallery: invalid, validatedAt: serverTimestamp() });
    batch.update(doc(db, "users", RATER), { ...newAdvertiserFields(), gallery: invalid });
    await assertFails(batch.commit());
  });

  test("dono cancela a própria conta completa", async () => {
    // Mirrors UserService.cancelOwnAccount: flags + deleted personal data.
    const removed = Object.fromEntries(
      ["photoURL", "bannerURL", "bio", "category", "contacts", "location", "whatsapp", "instagram",
        "facebook", "linkedin", "website", "serviceType", "phone", "ward", "companyName", "gallery",
        "availability", "serviceHours", "membershipYears", "businessState"].map((key) => [key, deleteField()]),
    );
    await assertSucceeds(
      updateDoc(doc(dbAs(COMPLETE), "users", COMPLETE), {
        name: "Conta desativada",
        isProvider: false,
        hasPublicProfile: false,
        memberVerified: false,
        isDeleted: true,
        deletedByUser: true,
        deletedAt: serverTimestamp(),
        ...removed,
      }),
    );
  });

  test("os limites continuam valendo para o que muda", async () => {
    const db = dbAs(COMPLETE);
    await assertFails(updateDoc(doc(db, "users", COMPLETE), { bio: "x".repeat(2100) }));
    await assertFails(updateDoc(doc(db, "users", COMPLETE), { category: "Inventada" }));
    await assertFails(updateDoc(doc(db, "users", COMPLETE), { role: "admin" }));
    await assertFails(updateDoc(doc(db, "users", COMPLETE), { campoDesconhecido: 1 }));
  });
});

describe("users: aparelhos para push", () => {
  const TOKEN = "fcm-token:abc_123";
  const device = (overrides = {}) => ({ token: TOKEN, platform: "android", updatedAt: serverTimestamp(), ...overrides });

  test("dono registra, lê e remove o próprio aparelho", async () => {
    const ref = doc(dbAs(PROVIDER), "users", PROVIDER, "devices", TOKEN);
    await assertSucceeds(setDoc(ref, device()));
    await assertSucceeds(setDoc(ref, device()));
    await assertSucceeds(getDoc(ref));
    await assertSucceeds(deleteDoc(ref));
  });

  test("ninguém registra ou lê aparelho de outra pessoa", async () => {
    const ref = doc(dbAs(RATER), "users", PROVIDER, "devices", TOKEN);
    await assertFails(setDoc(ref, device()));
    await assertFails(getDoc(ref));
  });

  test("o documento só guarda o próprio token, a plataforma e a data", async () => {
    const db = dbAs(PROVIDER);
    const ref = doc(db, "users", PROVIDER, "devices", TOKEN);
    await assertFails(setDoc(ref, device({ token: "outro" })));
    await assertFails(setDoc(ref, device({ platform: "web" })));
    await assertFails(setDoc(ref, device({ updatedAt: Timestamp.now() })));
    await assertFails(setDoc(ref, device({ extra: true })));
  });
});

describe("support_messages: Fale conosco", () => {
  const MESSAGE = { name: "Visitante", email: "visitante@example.com", message: "Olá!", read: false };

  beforeEach(async () => {
    await env.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "support_messages", "m1"), { ...MESSAGE, createdAt: Timestamp.now() });
    });
  });

  test("visitante sem conta envia mensagem, mas não lê", async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertSucceeds(setDoc(doc(db, "support_messages", "m2"), { ...MESSAGE, createdAt: serverTimestamp() }));
    await assertFails(getDoc(doc(db, "support_messages", "m1")));
  });

  test("só admin lê e marca como lida ou não lida", async () => {
    await assertFails(getDocs(collection(dbAs(RATER), "support_messages")));
    await assertFails(updateDoc(doc(dbAs(RATER), "support_messages", "m1"), { read: true }));
    const admin = dbAs(ADMIN);
    await assertSucceeds(getDocs(collection(admin, "support_messages")));
    await assertSucceeds(updateDoc(doc(admin, "support_messages", "m1"), { read: true }));
    await assertSucceeds(updateDoc(doc(admin, "support_messages", "m1"), { read: false }));
  });

  test("admin não altera o conteúdo da mensagem", async () => {
    await assertFails(updateDoc(doc(dbAs(ADMIN), "support_messages", "m1"), { message: "outra" }));
  });
});

describe("users: termos de uso e bloqueio", () => {
  test("cadastro registra a versão e a data do aceite dos termos", async () => {
    const db = dbAs("novo");
    await assertSucceeds(
      setDoc(doc(db, "users", "novo"), {
        ...userDoc("novo", { createdAt: serverTimestamp() }),
        termsVersion: "2026-10-27",
        termsAcceptedAt: serverTimestamp(),
      }),
    );
  });

  test("ninguém se cadastra com data de aceite inventada nem com motivo de bloqueio", async () => {
    const db = dbAs("novo");
    await assertFails(setDoc(doc(db, "users", "novo"), { ...userDoc("novo"), termsAcceptedAt: Timestamp.fromMillis(0) }));
    await assertFails(setDoc(doc(db, "users", "novo"), { ...userDoc("novo"), blockedReason: "x" }));
  });

  test("dono aceita uma versão nova dos termos", async () => {
    await assertSucceeds(
      updateDoc(doc(dbAs(RATER), "users", RATER), { termsVersion: "2027-01-01", termsAcceptedAt: serverTimestamp() }),
    );
    await assertFails(
      updateDoc(doc(dbAs(RATER), "users", RATER), { termsAcceptedAt: Timestamp.fromMillis(0) }),
    );
  });

  test("só o admin registra o motivo do bloqueio", async () => {
    const block = { isBlocked: true, blockedReason: "Perfil falso", blockedAt: serverTimestamp() };
    await assertFails(updateDoc(doc(dbAs(RATER), "users", RATER), { blockedReason: "x" }));
    await assertSucceeds(updateDoc(doc(dbAs(ADMIN), "users", RATER), block));
    // The blocked owner can still read the reason, but not erase it.
    await assertSucceeds(getDoc(doc(dbAs(RATER), "users", RATER)));
    await assertFails(updateDoc(doc(dbAs(RATER), "users", RATER), { blockedReason: "" }));
  });

  test("perfil com aceite e motivo gravados continua editável pelo dono", async () => {
    await env.withSecurityRulesDisabled(async (context) => {
      await updateDoc(doc(context.firestore(), "users", RATER), {
        termsVersion: "2026-10-27",
        termsAcceptedAt: Timestamp.now(),
        blockedReason: "Revisado",
        blockedAt: Timestamp.now(),
      });
    });
    await assertSucceeds(updateDoc(doc(dbAs(RATER), "users", RATER), { name: "Nome novo" }));
  });
});

describe("idioma e país do conteúdo", () => {
  const VERIFIED = "verified";
  const opportunity = (overrides = {}) => ({
    authorId: RATER,
    authorName: "Nome rater",
    authorWhatsApp: "21999999999",
    category: "Limpeza",
    title: "Preciso de limpeza",
    description: "Limpeza completa de um apartamento de dois quartos.",
    city: "Rio de Janeiro",
    neighborhood: "Centro",
    state: "RJ",
    urgency: "normal",
    status: "active",
    createdAt: Timestamp.now(),
    expiresAt: Timestamp.fromMillis(Date.now() + 86_400_000),
    ...overrides,
  });
  const post = (overrides = {}) => ({
    authorId: VERIFIED,
    authorName: "Nome verified",
    authorEmail: `${VERIFIED}@example.com`,
    category: "article",
    title: "Um artigo de teste",
    slug: "um-artigo-de-teste",
    excerpt: "",
    content: "Conteúdo de teste com mais de quarenta caracteres para valer.",
    status: "draft",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    ...overrides,
  });

  beforeEach(async () => {
    await env.withSecurityRulesDisabled(async (context) => {
      await setDoc(
        doc(context.firestore(), "users", VERIFIED),
        userDoc(VERIFIED, { memberVerified: true, ward: "Ala Centro", baptismYear: 2010 }),
      );
    });
  });

  test("oportunidade aceita idioma e país válidos, ou nenhum", async () => {
    const db = dbAs(RATER);
    await assertSucceeds(setDoc(doc(db, "opportunities", "o1"), opportunity()));
    await assertSucceeds(setDoc(doc(db, "opportunities", "o2"), opportunity({ language: "en", country: "US" })));
    await assertFails(setDoc(doc(db, "opportunities", "o3"), opportunity({ language: "fr" })));
    await assertFails(setDoc(doc(db, "opportunities", "o4"), opportunity({ country: "Brasil" })));
  });

  test("artigo aceita idioma válido", async () => {
    const db = dbAs(VERIFIED);
    await assertSucceeds(setDoc(doc(db, "posts", "p1"), post({ language: "es" })));
    await assertFails(setDoc(doc(db, "posts", "p2"), post({ slug: "outro-artigo", language: "de" })));
  });

  test("perfil (users e público) aceita idioma válido", async () => {
    const db = dbAs(PROVIDER);
    await assertSucceeds(updateDoc(doc(db, "users", PROVIDER), { language: "en" }));
    await assertFails(updateDoc(doc(db, "users", PROVIDER), { language: "xx" }));
    await assertSucceeds(updateDoc(doc(db, "public_profiles", PROVIDER), { language: "es" }));
    await assertFails(updateDoc(doc(db, "public_profiles", PROVIDER), { country: "brasil" }));
  });
});

describe("ala: só para quem está logado", () => {
  test("membro logado lê a ala; visitante sem conta não", async () => {
    await env.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "member_wards", PROVIDER), { uid: PROVIDER, ward: "Ala Centro" });
    });
    await assertSucceeds(getDoc(doc(dbAs(RATER), "member_wards", PROVIDER)));
    await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), "member_wards", PROVIDER)));
  });

  test("dono grava e apaga a própria ala; ninguém grava a de outra pessoa", async () => {
    const own = dbAs(PROVIDER);
    await assertSucceeds(setDoc(doc(own, "member_wards", PROVIDER), { uid: PROVIDER, ward: "Ala Centro" }));
    await assertFails(setDoc(doc(own, "member_wards", PROVIDER), { uid: PROVIDER, ward: "" }));
    await assertFails(setDoc(doc(own, "member_wards", PROVIDER), { uid: PROVIDER, ward: "Ala", extra: true }));
    await assertFails(setDoc(doc(dbAs(RATER), "member_wards", PROVIDER), { uid: PROVIDER, ward: "Outra" }));
    await assertSucceeds(deleteDoc(doc(own, "member_wards", PROVIDER)));
  });

  test("admin grava a ala de qualquer membro", async () => {
    await assertSucceeds(setDoc(doc(dbAs(ADMIN), "member_wards", RATER), { uid: RATER, ward: "Ala Norte" }));
  });

  test("perfil público pode perder o campo ala (gravação com merge apaga)", async () => {
    await env.withSecurityRulesDisabled(async (context) => {
      await updateDoc(doc(context.firestore(), "public_profiles", PROVIDER), { ward: "Ala Centro" });
    });
    await assertSucceeds(updateDoc(doc(dbAs(PROVIDER), "public_profiles", PROVIDER), { ward: deleteField() }));
  });
});

describe("idioma de preferência", () => {
  test("dono escolhe pt, en ou es", async () => {
    const db = dbAs(RATER);
    await assertSucceeds(updateDoc(doc(db, "users", RATER), { preferredLanguage: "es" }));
    await assertFails(updateDoc(doc(db, "users", RATER), { preferredLanguage: "fr" }));
    await assertFails(updateDoc(doc(dbAs(RECOMMENDER), "users", RATER), { preferredLanguage: "en" }));
  });

  test("cadastro novo já pode vir com o idioma", async () => {
    const NEW = "novo";
    await assertSucceeds(setDoc(doc(dbAs(NEW), "users", NEW), userDoc(NEW, { preferredLanguage: "en" })));
  });
});
