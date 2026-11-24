import {
  collection,
  doc,
  getDocFromServer,
  getDocsFromServer,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  type DocumentData,
  type DocumentSnapshot,
  type QuerySnapshot,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MAX_PRODUCTS, productRatingTotals, type CatalogProduct, type ProductDetails, type ProductRatingScore } from "@/lib/product-catalog";

const slots = Array.from({ length: MAX_PRODUCTS }, (_, index) => String(index + 1));

function products(uid: string) {
  return collection(db, "public_profiles", uid, "products");
}

function readProducts(snapshot: QuerySnapshot<DocumentData>): CatalogProduct[] {
  return snapshot.docs
    .map((item) => ({ ...(item.data() as Omit<CatalogProduct, "id">), id: item.id }))
    .sort((first, second) => Number(first.id) - Number(second.id));
}

function ratingScore(snapshot: DocumentSnapshot, productCreatedAt: string | undefined): number {
  const vote = snapshot.data() as { productCreatedAt: Timestamp; score: number } | undefined;
  return vote && productCreatedAt && vote.productCreatedAt.valueOf() === productCreatedAt ? vote.score : 0;
}

export class CatalogError extends Error {
  constructor(readonly reason: "limit" | "stale") {
    super(reason);
  }
}

export const ProductService = {
  async getPublic(uid: string, productId: string): Promise<CatalogProduct | null> {
    if (!slots.includes(productId)) return null;

    const item = await getDocFromServer(doc(products(uid), productId));
    return item.exists() ? { ...(item.data() as Omit<CatalogProduct, "id">), id: item.id } : null;
  },

  async listPublic(uid: string) {
    return readProducts(await getDocsFromServer(products(uid)));
  },

  async getOwnRating(uid: string, productId: string, raterId: string, createdAt: string | undefined) {
    if (!createdAt) return 0;

    const vote = doc(products(uid), productId, "votes", raterId);
    return ratingScore(await getDocFromServer(vote), createdAt);
  },

  async rate(uid: string, product: Pick<CatalogProduct, "id" | "revision">, raterId: string, score: ProductRatingScore) {
    const item = doc(products(uid), product.id);
    const vote = doc(item, "votes", raterId);

    return runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(item);
      const saved = snapshot.data() as Omit<CatalogProduct, "id"> | undefined;
      if (!saved || saved.revision !== product.revision) throw new CatalogError("stale");

      const previousScore = ratingScore(await transaction.get(vote), saved.createdAt?.valueOf());
      const totals = productRatingTotals(saved);
      if (score === previousScore) return totals;

      const createdAt = saved.createdAt ?? serverTimestamp();
      const nextTotals = {
        ratingSum: totals.ratingSum + score - previousScore,
        ratingCount: totals.ratingCount + (previousScore === 0 ? 1 : 0),
      };
      transaction.update(item, { ...nextTotals, createdAt });
      transaction.set(vote, { score, productCreatedAt: createdAt });
      return nextTotals;
    });
  },

  watch(uid: string, receive: (items: CatalogProduct[]) => void, onError: (error: Error) => void) {
    return onSnapshot(products(uid), (snapshot) => receive(readProducts(snapshot)), onError);
  },

  async save(uid: string, details: ProductDetails, items: CatalogProduct[], current?: CatalogProduct) {
    const catalog = products(uid);
    const revision = crypto.randomUUID();
    if (current) {
      const item = doc(catalog, current.id);
      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(item);
        const saved = snapshot.data() as Omit<CatalogProduct, "id"> | undefined;
        if (!saved || saved.revision !== current.revision) throw new CatalogError("stale");
        transaction.set(item, {
          ...details,
          ...(saved.createdAt ? { ...productRatingTotals(saved), createdAt: saved.createdAt } : {}),
          revision,
        });
      });
      return;
    }

    const occupied = new Set(items.map((item) => item.id));
    const candidates = slots.filter((id) => !occupied.has(id));
    await runTransaction(db, async (transaction) => {
      for (const id of candidates) {
        const item = doc(catalog, id);
        // Concurrent additions retry against the latest version of this slot.
        if (!(await transaction.get(item)).exists()) {
          transaction.set(item, { ...details, revision });
          return;
        }
      }
      throw new CatalogError("limit");
    });
  },

  async remove(uid: string, current: CatalogProduct) {
    const item = doc(products(uid), current.id);
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(item);
      if (snapshot.data()?.revision !== current.revision) throw new CatalogError("stale");
      transaction.delete(item);
    });
  },
};
