import { deriveMemberVerification } from "./member-verification";
import { TERMS_VERSION } from "./terms";

/**
 * users/{uid} for a member signing in for the first time, minus createdAt
 * (each SDK writes its own server timestamp). Same document the site's
 * UserService.createProfile writes for a new member: role "user", empty
 * stats (startsWithEmptyStats in firestore.rules) and no public profile.
 * Signing up accepts the current Terms of Use; termsAcceptedAt is also a
 * server timestamp the caller adds.
 */
export function newMemberProfile(user: {
  uid: string;
  name?: string | null;
  email?: string | null;
  photoURL?: string | null;
}) {
  const verification = deriveMemberVerification({});
  return {
    uid: user.uid,
    name: user.name?.trim().slice(0, 100) || "Membro Skillsy",
    email: user.email || "",
    photoURL: user.photoURL || "",
    isProvider: false,
    hasPublicProfile: false,
    role: "user" as const,
    contacts: [] as string[],
    memberVerified: verification.memberVerified,
    termsVersion: TERMS_VERSION,
  };
}

/** admin_notifications entry the site creates for every new member. */
export function newMemberNotification(name: string) {
  return {
    title: "Novo Usuário Cadastrado",
    message: `${name || "Um novo membro"} acabou de se juntar à plataforma Skillsy.`,
    type: "new_user" as const,
    read: false,
    link: "/admin/usuarios",
  };
}
