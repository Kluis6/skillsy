import { toPlainValue } from '@skillsy/shared/firestore-plain';
import { getPostExcerpt, slugifyPostTitle } from '@skillsy/shared/post-utils';
import type { Post, PostCategory, PostStatus } from '@skillsy/shared/types';
import type { User } from '@firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore';

import { db } from './firebase';

// Writing and moderating articles/jobs, the same writes as the site's
// services/post-service.ts (firestore.rules: isValidPost,
// authorCanManageOwnPost). Members publish their own posts directly; admins
// can reject (takes it down with a reason), publish again or feature it.

export type PostInput = {
  category: PostCategory;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  tags: string[];
};

const seconds = (value: unknown) =>
  value && typeof value === 'object' && 'seconds' in value ? Number(value.seconds) : 0;

// Same shape as posts.ts; tags and coverImageUrl may be missing on old posts.
const toPost = (id: string, data: DocumentData) => toPlainValue({ id, ...data }) as Post;

/** Published posts by anyone, or any of the author's own, may not reuse a
 * slug: the article page is found by it. */
async function uniqueSlug(uid: string, title: string, currentId?: string) {
  const base = slugifyPostTitle(title) || `post-${Date.now()}`;
  const [published, own] = await Promise.all([
    getDocs(
      query(
        collection(db, 'posts'),
        where('slug', '==', base),
        where('status', '==', 'published'),
        limit(10)
      )
    ),
    getDocs(
      query(
        collection(db, 'posts'),
        where('slug', '==', base),
        where('authorId', '==', uid),
        limit(10)
      )
    ),
  ]);
  const taken = [...published.docs, ...own.docs].some((item) => item.id !== currentId);
  return taken ? `${base}-${Date.now().toString().slice(-6)}` : base;
}

const fields = (input: PostInput) => ({
  category: input.category,
  title: input.title.trim(),
  excerpt: input.excerpt.trim() || getPostExcerpt(input),
  content: input.content.trim(),
  coverImageUrl: input.coverImageUrl,
  tags: input.tags,
});

export async function getMyPosts(uid: string) {
  const snapshot = await getDocs(
    query(collection(db, 'posts'), where('authorId', '==', uid), limit(100))
  );
  return snapshot.docs
    .map((item) => toPost(item.id, item.data()))
    .sort((a, b) => seconds(b.updatedAt) - seconds(a.updatedAt));
}

export async function getPost(id: string) {
  const snapshot = await getDoc(doc(db, 'posts', id));
  return snapshot.exists() ? toPost(snapshot.id, snapshot.data()) : null;
}

/** Creates a draft, or saves changes to an existing post (any status). */
export async function savePost(user: User, authorName: string, input: PostInput, existing?: Post) {
  if (existing?.id) {
    // Once published, the address stays: shared links and the alerts every
    // member got point to it. Drafts follow the title.
    const slug = existing.publishedAt
      ? existing.slug
      : await uniqueSlug(user.uid, input.title, existing.id);
    await updateDoc(doc(db, 'posts', existing.id), {
      ...fields(input),
      slug,
      updatedAt: serverTimestamp(),
    });
    return existing.id;
  }
  const slug = await uniqueSlug(user.uid, input.title);
  const created = await addDoc(collection(db, 'posts'), {
    authorId: user.uid,
    authorName: authorName || user.displayName || 'Membro Skillsy',
    authorEmail: user.email || '',
    ...fields(input),
    slug,
    status: 'draft',
    isFeatured: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return created.id;
}

/** Puts the author's post on the site (and tells the admins, like the site). */
export async function publishOwnPost(user: User, post: Post) {
  await updateDoc(doc(db, 'posts', post.id!), {
    status: 'published',
    updatedAt: serverTimestamp(),
    rejectionReason: '',
    ...(post.publishedAt ? {} : { publishedAt: serverTimestamp() }),
  });
  await addDoc(collection(db, 'admin_notifications'), {
    title: 'Nova publicação',
    message: `${user.email || 'Um usuário'} publicou "${post.title}".`,
    type: 'system',
    read: false,
    link: `/artigosevagas/${post.slug}`,
    createdAt: serverTimestamp(),
  }).catch(() => {});
}

export function deleteOwnPost(id: string) {
  return deleteDoc(doc(db, 'posts', id));
}

export async function getAllPostsForAdmin() {
  const snapshot = await getDocs(
    query(collection(db, 'posts'), orderBy('updatedAt', 'desc'), limit(200))
  );
  return snapshot.docs.map((item) => toPost(item.id, item.data()));
}

/** Admin decision, same fields as PostService.reviewPost on the site. */
export function reviewPost(
  adminUid: string,
  input: {
    id: string;
    status: Extract<PostStatus, 'published' | 'rejected'>;
    rejectionReason?: string;
    isFeatured: boolean;
  }
) {
  return updateDoc(doc(db, 'posts', input.id), {
    status: input.status,
    reviewedAt: serverTimestamp(),
    reviewedBy: adminUid,
    updatedAt: serverTimestamp(),
    isFeatured: input.isFeatured,
    ...(input.status === 'published'
      ? { publishedAt: serverTimestamp(), rejectionReason: '' }
      : { rejectionReason: input.rejectionReason ?? '' }),
  });
}
