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
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { toPlainValue } from '@/lib/firestore-plain';
import { Post, PostStatus } from '@/models/types';
import { slugifyPostTitle } from '@/lib/post-utils';
import { NotificationService } from '@/services/notification-service';

async function ensureUniqueSlug(baseSlug: string, currentId?: string) {
  const fallback = baseSlug || `post-${Date.now()}`;
  const q = query(collection(db, 'posts'), where('slug', '==', fallback), limit(10));
  const snapshot = await getDocs(q);
  const conflict = snapshot.docs.find((item) => item.id !== currentId);

  if (!conflict) {
    return fallback;
  }

  return `${fallback}-${Date.now().toString().slice(-6)}`;
}

function requireAuthenticatedUser() {
  if (!auth.currentUser) {
    throw new Error('Usuário não autenticado');
  }

  return auth.currentUser;
}

export const PostService = {
  async getPublishedPosts(): Promise<Post[]> {
    const q = query(collection(db, 'posts'), where('status', '==', 'published'), limit(50));
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((postDoc) => toPlainValue({ id: postDoc.id, ...postDoc.data() } as Post))
      .sort((a, b) => (b.publishedAt?.seconds || 0) - (a.publishedAt?.seconds || 0));
  },

  async getPublishedPostBySlug(slug: string): Promise<Post | null> {
    const q = query(
      collection(db, 'posts'),
      where('slug', '==', slug),
      where('status', '==', 'published'),
      limit(1),
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return toPlainValue({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Post);
  },

  async getMyPosts(): Promise<Post[]> {
    const user = requireAuthenticatedUser();
    const q = query(collection(db, 'posts'), where('authorId', '==', user.uid), limit(100));
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((postDoc) => toPlainValue({ id: postDoc.id, ...postDoc.data() } as Post))
      .sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
  },

  async getPostById(id: string): Promise<Post | null> {
    const snapshot = await getDoc(doc(db, 'posts', id));
    if (!snapshot.exists()) return null;
    return toPlainValue({ id: snapshot.id, ...snapshot.data() } as Post);
  },

  async createDraft(input: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImageUrl?: string;
    tags?: string[];
  }): Promise<string> {
    const user = requireAuthenticatedUser();
    const uniqueSlug = await ensureUniqueSlug(slugifyPostTitle(input.slug || input.title));

    const docRef = await addDoc(collection(db, 'posts'), {
      authorId: user.uid,
      authorName: user.displayName || 'Membro Skillsy',
      authorEmail: user.email || '',
      title: input.title,
      slug: uniqueSlug,
      excerpt: input.excerpt,
      content: input.content,
      coverImageUrl: input.coverImageUrl || '',
      tags: input.tags || [],
      status: 'draft',
      isFeatured: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  },

  async updateOwnPost(
    id: string,
    input: {
      title: string;
      slug: string;
      excerpt: string;
      content: string;
      coverImageUrl?: string;
      tags?: string[];
    },
  ): Promise<void> {
    const uniqueSlug = await ensureUniqueSlug(slugifyPostTitle(input.slug || input.title), id);
    await updateDoc(doc(db, 'posts', id), {
      title: input.title,
      slug: uniqueSlug,
      excerpt: input.excerpt,
      content: input.content,
      coverImageUrl: input.coverImageUrl || '',
      tags: input.tags || [],
      updatedAt: serverTimestamp(),
    });
  },

  async submitForReview(id: string): Promise<void> {
    const user = requireAuthenticatedUser();
    const post = await this.getPostById(id);

    await updateDoc(doc(db, 'posts', id), {
      status: 'pending_review',
      updatedAt: serverTimestamp(),
      rejectionReason: '',
    });

    await NotificationService.createNotification({
      title: 'Novo artigo para revisão',
      message: `${user.email || 'Um usuário'} enviou "${post?.title || 'um artigo'}" para revisão.`,
      type: 'system',
      read: false,
      link: '/admin/artigos',
    });
  },

  async deleteOwnDraft(id: string): Promise<void> {
    await deleteDoc(doc(db, 'posts', id));
  },

  async getAllPostsForAdmin(): Promise<Post[]> {
    const q = query(collection(db, 'posts'), orderBy('updatedAt', 'desc'), limit(200));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((postDoc) =>
      toPlainValue({ id: postDoc.id, ...postDoc.data() } as Post),
    );
  },

  async reviewPost(input: {
    id: string;
    status: Extract<PostStatus, 'published' | 'rejected'>;
    rejectionReason?: string;
    isFeatured?: boolean;
  }): Promise<void> {
    const user = requireAuthenticatedUser();
    const payload: Record<string, unknown> = {
      status: input.status,
      reviewedAt: serverTimestamp(),
      reviewedBy: user.uid,
      updatedAt: serverTimestamp(),
      isFeatured: input.isFeatured ?? false,
    };

    if (input.status === 'published') {
      payload.publishedAt = serverTimestamp();
      payload.rejectionReason = '';
    } else {
      payload.rejectionReason = input.rejectionReason || '';
    }

    await updateDoc(doc(db, 'posts', input.id), payload);
  },
};
