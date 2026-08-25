import { useEffect, useRef } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/models/types";
import { toPlainValue } from "@/lib/firestore-plain";

export function useRealtimeProfiles(
  providers: UserProfile[],
  onUpdate: (updatedProviders: UserProfile[]) => void,
) {
  const unsubscribesRef = useRef<(() => void)[]>([]);
  const profilesMapRef = useRef<Map<string, UserProfile>>(
    new Map(providers.map((p) => [p.uid, p])),
  );

  useEffect(() => {
    // Update the map with current providers
    profilesMapRef.current = new Map(providers.map((p) => [p.uid, p]));

    // Unsubscribe from all previous listeners
    unsubscribesRef.current.forEach((unsubscribe) => unsubscribe());
    unsubscribesRef.current = [];

    // Subscribe to changes for each provider
    providers.forEach((provider) => {
      try {
        const unsubscribe = onSnapshot(
          doc(db, "public_profiles", provider.uid),
          (docSnapshot) => {
            if (docSnapshot.exists()) {
              const plainData = toPlainValue(
                docSnapshot.data() as UserProfile,
              ) as Partial<UserProfile>;
              // Update with the latest data from Firestore, preserving existing fields
              const existingProfile =
                profilesMapRef.current.get(provider.uid) || provider;
              const updatedData = {
                ...existingProfile,
                ...plainData,
              };
              profilesMapRef.current.set(provider.uid, updatedData);
              // Notify parent of updates
              onUpdate(Array.from(profilesMapRef.current.values()));
            }
          },
          (error) => {
            console.error(`Error listening to profile ${provider.uid}:`, error);
          },
        );

        unsubscribesRef.current.push(unsubscribe);
      } catch (error) {
        console.error(`Failed to set up listener for ${provider.uid}:`, error);
      }
    });

    return () => {
      // Cleanup: unsubscribe from all listeners
      unsubscribesRef.current.forEach((unsubscribe) => unsubscribe());
      unsubscribesRef.current = [];
    };
  }, [providers.length, JSON.stringify(providers.map((p) => p.uid))]);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      unsubscribesRef.current.forEach((unsubscribe) => unsubscribe());
      unsubscribesRef.current = [];
    };
  }, []);
}
