import { toPlainValue } from '@skillsy/shared/firestore-plain';
import type { Post } from '@skillsy/shared/types';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';

import { db } from './firebase';

const seconds = (value: unknown) =>
  value && typeof value === 'object' && 'seconds' in value ? Number(value.seconds) : 0;

/** Same query as PostService.getPublishedPosts on the site: newest first,
 * featured ones ahead. */
export async function getPublishedPosts() {
  const snapshot = await getDocs(
    query(collection(db, 'posts'), where('status', '==', 'published'), limit(50))
  );
  return snapshot.docs
    .map((item) => toPlainValue({ id: item.id, ...item.data() }) as Post)
    .sort(
      (a, b) =>
        Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)) ||
        seconds(b.publishedAt) - seconds(a.publishedAt)
    );
}

export async function getPublishedPostBySlug(slug: string) {
  const snapshot = await getDocs(
    query(
      collection(db, 'posts'),
      where('slug', '==', slug),
      where('status', '==', 'published'),
      limit(1)
    )
  );
  const first = snapshot.docs[0];
  return first ? (toPlainValue({ id: first.id, ...first.data() }) as Post) : null;
}
