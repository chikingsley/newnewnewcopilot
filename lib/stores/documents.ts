import { create } from 'zustand'
import { type Document } from '@/lib/types/document'

interface DocumentStore {
  documents: Document[]
  selectedId: string | null
  expandedIds: Set<string>
  currentProject: string | null
  setDocuments: (documents: Document[]) => void
  selectDocument: (id: string | null) => void
  toggleExpanded: (id: string) => void
  addDocument: (document: Document) => void
  resetDocuments: () => void
}

export const useStore = create<DocumentStore>((set) => ({
  documents: [],
  selectedId: null,
  expandedIds: new Set(['1']),
  currentProject: null,
  setDocuments: (documents) => set({ documents }),
  selectDocument: (id) => set({ selectedId: id }),
  toggleExpanded: (id) =>
    set((state) => {
      const newExpandedIds = new Set(state.expandedIds)
      if (newExpandedIds.has(id)) {
        newExpandedIds.delete(id)
      } else {
        newExpandedIds.add(id)
      }
      return { expandedIds: newExpandedIds }
    }),
  addDocument: (document) =>
    set((state) => ({
      documents: [...state.documents, document],
      expandedIds: new Set([...state.expandedIds, document.id]),
    })),
  resetDocuments: () => set({ documents: [], selectedId: null, expandedIds: new Set(['1']) }),
}))