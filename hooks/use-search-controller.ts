import { useState, useCallback, useEffect } from 'react';
import { UserService } from '@/services/user-service';
import { UserProfile } from '@/models/types';

export function useSearchController() {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState<{ city: string; state: string } | null>(null);
  const [providers, setProviders] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);

  const fetchInitialProviders = useCallback(async () => {
    try {
      const data = await UserService.getProviders(6);
      setProviders(data);
    } catch (error) {
      console.error('Error fetching initial providers:', error);
    }
  }, []);

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setSearching(true);
    try {
      const filtered = await UserService.searchProviders(searchTerm, locationFilter || undefined);
      setProviders(filtered);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setSearching(false);
    }
  }, [searchTerm, locationFilter]);

  useEffect(() => {
    let isMounted = true;

    const performSearch = async () => {
      if (locationFilter) {
        setSearching(true);
        try {
          const filtered = await UserService.searchProviders(searchTerm, locationFilter);
          if (isMounted) setProviders(filtered);
        } catch (error) {
          console.error('Error searching:', error);
        } finally {
          if (isMounted) setSearching(false);
        }
      } else if (!searchTerm) {
        try {
          const data = await UserService.getProviders(6);
          if (isMounted) setProviders(data);
        } catch (error) {
          console.error('Error fetching initial providers:', error);
        }
      }
    };

    performSearch();

    return () => { isMounted = false; };
  }, [locationFilter, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    locationFilter,
    setLocationFilter,
    providers,
    searching,
    handleSearch,
    fetchInitialProviders
  };
}
