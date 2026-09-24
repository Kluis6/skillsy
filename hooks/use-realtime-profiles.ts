import { useEffect, useRef } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/models/types";
import { toPlainValue } from "@/lib/firestore-plain";
import { getAverageRating } from "@/services/user-service";

export function useRealtimeProfiles(
  providers: UserProfile[],
  onUpdate: (updatedProviders: UserProfile[]) => void,
) {
  // Latest values for the listeners, without resubscribing on every render.
  const providersRef = useRef(providers);
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => {
    providersRef.current = providers;
    onUpdateRef.current = onUpdate;
  });

  // Resubscribe only when the set of listed profiles changes.
  const uidsKey = providers.map((provider) => provider.uid).join(",");

  useEffect(() => {
    const uids = uidsKey ? uidsKey.split(",") : [];
    const profiles = new Map(
      providersRef.current.map((provider) => [provider.uid, provider]),
    );

    const unsubscribes = uids.map((uid) =>
      onSnapshot(
        doc(db, "public_profiles", uid),
        (docSnapshot) => {
          if (!docSnapshot.exists()) return;
          const data = toPlainValue(
            docSnapshot.data() as UserProfile,
          ) as Partial<UserProfile>;
          // Keep the fields the listing already had and derive the average
          // from ratingSum, like the services do (the stored rating may be stale).
          profiles.set(uid, {
            ...profiles.get(uid),
            ...data,
            rating: getAverageRating(data),
          } as UserProfile);
          onUpdateRef.current(Array.from(profiles.values()));
        },
        (error) => {
          console.error(`Error listening to profile ${uid}:`, error);
        },
      ),
    );

    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, [uidsKey]);
}
