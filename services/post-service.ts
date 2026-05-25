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
import { hasMembershipVerificationData } from '@/lib/member-verification';
import { Post, PostReport, PostStatus, UserProfile } from '@/models/types';
import { getPostExcerpt, slugifyPostTitle } from '@/lib/post-utils';
import { NotificationService } from '@/services/notification-service';
import { deriveMemberVerification, normalizeBaptismYear } from '@/lib/member-verification';

async function ensureUniqueSlug(baseSlug: string, currentId?: string) {
  const fallback = baseSlug || `post-${Date.now()}`;
  const user = requireAuthenticatedUser();
  const [publishedSnapshot, ownSnapshot] = await Promise.all([
    getDocs(
      query(
        collection(db, 'posts'),
        where('slug', '==', fallback),
        where('status', '==', 'published'),
        limit(10),
      ),
    ),
    getDocs(
      query(
        collection(db, 'posts'),
        where('slug', '==', fallback),
        where('authorId', '==', user.uid),
        limit(10),
      ),
    ),
  ]);

  const conflict = [...publishedSnapshot.docs, ...ownSnapshot.docs].find(
    (item) => item.id !== currentId,
  );

  if (!conflict) {
    return fallback;
  }

  return `${fallback}-${Date.now().toString().slice(-6)}`;
}

function toPostModel(data: Post) {
  return {
    ...toPlainValue(data),
    category: data.category || 'article',
    excerpt: data.excerpt || '',
    content: data.content || '',
    coverImageUrl: data.coverImageUrl || '',
    tags: data.tags || [],
    isFeatured: data.isFeatured || false,
  } as Post;
}

function requireAuthenticatedUser() {
  if (!auth.currentUser) {
    throw new Error('Usuário não autenticado');
  }

  return auth.currentUser;
}

async function getCurrentUserProfile() {
  const user = requireAuthenticatedUser();
  const snapshot = await getDoc(doc(db, 'users', user.uid));
  if (!snapshot.exists()) {
    throw new Error('Perfil do usuário não encontrado');
  }

  return toPlainValue({ uid: snapshot.id, ...snapshot.data() } as UserProfile);
}

function isVerifiedProfile(profile: UserProfile | null | undefined) {
  return Boolean(profile?.memberVerified) || hasMembershipVerificationData(profile);
}

async function syncLegacyVerificationFields(profile: UserProfile) {
  if (profile.memberVerified === true) {
    return profile;
  }

  const user = requireAuthenticatedUser();
  const updates: Record<string, unknown> = {};

  if (typeof profile.ward === 'string') {
    const trimmedWard = profile.ward.trim();
    if (trimmedWard && trimmedWard !== profile.ward) {
      updates.ward = trimmedWard;
    }
  }

  const normalizedBaptismYear = normalizeBaptismYear(profile.baptismYear);
  if (
    normalizedBaptismYear !== undefined &&
    normalizedBaptismYear !== profile.baptismYear
  ) {
    updates.baptismYear = normalizedBaptismYear;
  }

  const nextProfile = { ...profile, ...updates };
  const verification = deriveMemberVerification(nextProfile);
  if (verification.memberVerified && profile.memberVerified !== true) {
    updates.memberVerified = verification.memberVerified;
  }
  if (
    verification.memberVerified &&
    profile.membershipYears !== verification.membershipYears
  ) {
    updates.membershipYears = verification.membershipYears;
  }

  if (Object.keys(updates).length === 0) {
    return profile;
  }

  await updateDoc(doc(db, 'users', user.uid), updates);

  return {
    ...profile,
    ...updates,
  } as UserProfile;
}

async function requireVerifiedProfile() {
  const currentProfile = await getCurrentUserProfile();
  const profile = await syncLegacyVerificationFields(currentProfile);
  if (!isVerifiedProfile(profile)) {
    throw new Error('Apenas usuários verificados podem publicar');
  }

  return profile;
}

async function requireOwnPost(id: string) {
  const user = requireAuthenticatedUser();
  const post = await PostService.getPostById(id);

  if (!post) {
    throw new Error('Publicação não encontrada');
  }

  if (post.authorId !== user.uid) {
    throw new Error('Você não pode alterar esta publicação');
  }

  return post;
}

export const PostService = {
  async getPublishedPosts(): Promise<Post[]> {
    const q = query(collection(db, 'posts'), where('status', '==', 'published'), limit(50));
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((postDoc) => toPostModel({ id: postDoc.id, ...postDoc.data() } as Post))
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
    return toPostModel({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Post);
  },

  async getMyPosts(): Promise<Post[]> {
    const user = requireAuthenticatedUser();
    const q = query(collection(db, 'posts'), where('authorId', '==', user.uid), limit(100));
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((postDoc) => toPostModel({ id: postDoc.id, ...postDoc.data() } as Post))
      .sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
  },

  async getPostById(id: string): Promise<Post | null> {
    const snapshot = await getDoc(doc(db, 'posts', id));
    if (!snapshot.exists()) return null;
    return toPostModel({ id: snapshot.id, ...snapshot.data() } as Post);
  },

  async createDraft(input: {
    category: Post['category'];
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImageUrl?: string;
    tags?: string[];
  }): Promise<string> {
    const user = requireAuthenticatedUser();
    await requireVerifiedProfile();
    const uniqueSlug = await ensureUniqueSlug(slugifyPostTitle(input.slug || input.title));

    const docRef = await addDoc(collection(db, 'posts'), {
      authorId: user.uid,
      authorName: user.displayName || 'Membro Skillsy',
      authorEmail: user.email || '',
      category: input.category,
      title: input.title,
      slug: uniqueSlug,
      excerpt: input.excerpt || getPostExcerpt(input),
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
      category: Post['category'];
      title: string;
      slug: string;
      excerpt: string;
      content: string;
      coverImageUrl?: string;
      tags?: string[];
    },
  ): Promise<void> {
    await requireVerifiedProfile();
    await requireOwnPost(id);
    const uniqueSlug = await ensureUniqueSlug(slugifyPostTitle(input.slug || input.title), id);
    await updateDoc(doc(db, 'posts', id), {
      category: input.category,
      title: input.title,
      slug: uniqueSlug,
      excerpt: input.excerpt || getPostExcerpt(input),
      content: input.content,
      coverImageUrl: input.coverImageUrl || '',
      tags: input.tags || [],
      updatedAt: serverTimestamp(),
    });
  },

  async publishOwnPost(id: string): Promise<void> {
    const user = requireAuthenticatedUser();
    await requireVerifiedProfile();
    const post = await requireOwnPost(id);

    const payload: Record<string, unknown> = {
      status: 'published',
      updatedAt: serverTimestamp(),
      rejectionReason: '',
    };

    if (!post.publishedAt) {
      payload.publishedAt = serverTimestamp();
    }

    await updateDoc(doc(db, 'posts', id), payload);

    await NotificationService.createNotification({
      title: 'Nova publicação',
      message: `${user.email || 'Um usuário'} publicou "${post.title}".`,
      type: 'system',
      read: false,
      link: `/artigosevagas/${post.slug}`,
    });
  },

  async submitForReview(id: string): Promise<void> {
    await this.publishOwnPost(id);
  },

  async deleteOwnPost(id: string): Promise<void> {
    await requireOwnPost(id);
    await deleteDoc(doc(db, 'posts', id));
  },

  async getAllPostsForAdmin(): Promise<Post[]> {
    const q = query(collection(db, 'posts'), orderBy('updatedAt', 'desc'), limit(200));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((postDoc) =>
      toPostModel({ id: postDoc.id, ...postDoc.data() } as Post),
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

  async createReport(input: {
    postId: string;
    postTitle: string;
    postSlug: string;
    postAuthorId: string;
    reason: string;
    details?: string;
  }): Promise<void> {
    const user = requireAuthenticatedUser();

    if (user.uid === input.postAuthorId) {
      throw new Error('Você não pode denunciar sua própria publicação');
    }

    await addDoc(collection(db, 'post_reports'), {
      postId: input.postId,
      postTitle: input.postTitle,
      postSlug: input.postSlug,
      postAuthorId: input.postAuthorId,
      reporterId: user.uid,
      reporterEmail: user.email || '',
      reason: input.reason,
      details: input.details || '',
      status: 'new',
      createdAt: serverTimestamp(),
    } satisfies Omit<PostReport, 'id'>);

    await NotificationService.createNotification({
      title: 'Nova denúncia de publicação',
      message: `${user.email || 'Um usuário'} denunciou "${input.postTitle}".`,
      type: 'report',
      read: false,
      link: `/artigosevagas/${input.postSlug}`,
    });
  },
};
