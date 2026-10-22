import { toPlainValue } from '@skillsy/shared/firestore-plain';
import type { CommunityRecommendation, Rating, UserProfile } from '@skillsy/shared/types';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore';

import { db } from './firebase';

// Same transactions as UserService on the site: firestore.rules check that
// ratingSum/reviewCount and recommendationCount move by exactly one review or
// one recommendation, so the documents must match field for field.

const seconds = (value: unknown) =>
  value && typeof value === 'object' && 'seconds' in value ? Number(value.seconds) : 0;

export async function getRatings(toId: string) {
  const snapshot = await getDocs(query(collection(db, 'ratings'), where('toId', '==', toId)));
  return snapshot.docs
    .map((item) => toPlainValue({ id: item.id, ...item.data() }) as Rating)
    .sort((a, b) => seconds(b.createdAt) - seconds(a.createdAt));
}

export async function submitRating(fromId: string, toId: string, score: number, comment?: string) {
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    throw new Error('Escolha de 1 a 5 estrelas.');
  }
  const normalizedComment = comment?.trim();

  await runTransaction(db, async (transaction) => {
    const voteRef = doc(db, 'users', fromId, 'votes', toId);
    if ((await transaction.get(voteRef)).exists()) {
      throw new Error(
        'Você já avaliou este profissional. Cada membro pode registrar uma avaliação.'
      );
    }
    const publicProfileRef = doc(db, 'public_profiles', toId);
    const [author, target] = await Promise.all([
      transaction.get(doc(db, 'users', fromId)),
      transaction.get(publicProfileRef),
    ]);
    const authorName = (author.data() as Partial<UserProfile> | undefined)?.name?.trim();
    if (!authorName) throw new Error('Informe seu nome no perfil antes de avaliar.');
    const profile = target.data() as Partial<UserProfile> | undefined;
    if (
      !profile ||
      profile.isProvider !== true ||
      profile.isBlocked === true ||
      profile.isDeleted === true
    ) {
      throw new Error('Este perfil não está disponível para avaliações.');
    }
    const count = profile.reviewCount || 0;
    if (count > 0 && typeof profile.ratingSum !== 'number') {
      throw new Error(
        'As avaliações deste perfil estão sendo atualizadas. Tente novamente mais tarde.'
      );
    }

    transaction.set(voteRef, { providerId: toId, votedAt: serverTimestamp() });
    transaction.set(doc(db, 'ratings', `${fromId}_${toId}`), {
      toId,
      fromId,
      authorName,
      score,
      ...(normalizedComment ? { comment: normalizedComment } : {}),
      createdAt: serverTimestamp(),
    });
    transaction.update(publicProfileRef, {
      ratingSum: (profile.ratingSum || 0) + score,
      reviewCount: count + 1,
    });
  });
}

export async function getRecommendations(professionalId: string, maxItems = 8) {
  const snapshot = await getDocs(
    query(
      collection(db, 'public_profiles', professionalId, 'recommendations'),
      orderBy('createdAt', 'desc'),
      limit(maxItems)
    )
  );
  return snapshot.docs.map((item) => toPlainValue(item.data()) as CommunityRecommendation);
}

export async function hasRecommended(professionalId: string, recommenderId: string) {
  const snapshot = await getDoc(
    doc(db, 'public_profiles', professionalId, 'recommendations', recommenderId)
  );
  return snapshot.exists();
}

/** Adds or removes the member's recommendation; returns true when added. */
export async function toggleRecommendation(
  recommenderId: string,
  professionalId: string,
  recommender: { name: string; photoURL?: string }
) {
  if (recommenderId === professionalId) throw new Error('Você não pode indicar o próprio perfil.');
  const publicProfileRef = doc(db, 'public_profiles', professionalId);
  const recommendationRef = doc(
    db,
    'public_profiles',
    professionalId,
    'recommendations',
    recommenderId
  );

  return runTransaction(db, async (transaction) => {
    const [profileSnapshot, recommendationSnapshot] = await Promise.all([
      transaction.get(publicProfileRef),
      transaction.get(recommendationRef),
    ]);
    const profile = profileSnapshot.data() as Partial<UserProfile> | undefined;
    if (
      !profile ||
      profile.isProvider !== true ||
      profile.isBlocked === true ||
      profile.isDeleted === true
    ) {
      throw new Error('Este profissional não está disponível para indicações.');
    }
    const count = Math.max(0, profile.recommendationCount ?? 0);
    if (recommendationSnapshot.exists()) {
      transaction.delete(recommendationRef);
      transaction.update(publicProfileRef, { recommendationCount: Math.max(0, count - 1) });
      return false;
    }
    transaction.set(recommendationRef, {
      recommenderId,
      recommenderName: recommender.name || 'Membro Skillsy',
      recommenderPhotoURL: recommender.photoURL || '',
      createdAt: serverTimestamp(),
    });
    transaction.update(publicProfileRef, { recommendationCount: count + 1 });
    return true;
  });
}
