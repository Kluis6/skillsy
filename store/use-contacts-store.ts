import { create } from 'zustand';

interface ContactsState {
  selectedContactId: string | null;
  searchQuery: string;
  setSelectedContactId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
}

export const useContactsStore = create<ContactsState>((set) => ({
  selectedContactId: null,
  searchQuery: '',
  setSelectedContactId: (id) => set({ selectedContactId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
