import { useState, useCallback, useEffect } from 'react';
import { UserService } from '@/services/user-service';
import { UserProfile } from '@/models/types';

export function useContactsController(profile: UserProfile | null, activeTab: string) {
  const [savedContacts, setSavedContacts] = useState<UserProfile[]>([]);

  useEffect(() => {
    let isMounted = true;
    const contactsLength = profile?.contacts?.length || 0;

    if (activeTab === 'contacts' && contactsLength > 0) {
      const fetch = async () => {
        try {
          const data = await UserService.getContacts(profile!.contacts);
          if (isMounted) setSavedContacts(data);
        } catch (error) {
          console.error('Error fetching contacts:', error);
        }
      };
      fetch();
    } else if (contactsLength === 0) {
      // Use a microtask to avoid "synchronous setState in effect" warning
      Promise.resolve().then(() => {
        if (isMounted) setSavedContacts([]);
      });
    }

    return () => { isMounted = false; };
  }, [activeTab, profile]);

  return {
    savedContacts
  };
}
