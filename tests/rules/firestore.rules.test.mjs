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
  doc,
  getDoc,
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
