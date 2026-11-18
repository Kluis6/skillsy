import {
  collection,
  doc,
  getDocsFromServer,
  onSnapshot,
  runTransaction,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MAX_PRODUCTS, type CatalogProduct, type ProductDetails } from "@/lib/product-catalog";

const slots = Array.from({ length: MAX_PRODUCTS }, (_, index) => String(index + 1));

function products(uid: string) {
  return collection(db, "public_profiles", uid, "products");
}

function readProducts(snapshot: QuerySnapshot<DocumentData>): CatalogProduct[] {
  return snapshot.docs
    .map((item) => ({ ...(item.data() as Omit<CatalogProduct, "id">), id: item.id }))
    .sort((first, second) => Number(first.id) - Number(second.id));
}

export class CatalogError extends Error {
  constructor(readonly reason: "limit" | "stale") {
    super(reason);
  }
}

export const ProductService = {
  async listPublic(uid: string) {
    return readProducts(await getDocsFromServer(products(uid)));
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
        if (snapshot.data()?.revision !== current.revision) throw new CatalogError("stale");
        transaction.set(item, { ...details, revision });
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
