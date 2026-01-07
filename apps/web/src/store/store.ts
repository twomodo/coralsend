import { create } from 'zustand';

// File transfer item
export interface FileTransfer {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'pending' | 'transferring' | 'completed' | 'error';
  direction: 'send' | 'receive';
  timestamp: number;
}

// Peer info
export interface PeerInfo {
  id: string;
  joinedAt: number;
}

// Connection status
export type ConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'waiting-peer'
  | 'peer-joined'
  | 'connected'
  | 'transferring'
  | 'completed'
  | 'error'
  | 'disconnected';

interface AppState {
  // Connection
  roomId: string | null;
  role: 'sender' | 'receiver' | null;
  status: ConnectionStatus;
  peer: PeerInfo | null;

  // Files
  files: FileTransfer[];
  currentFileId: string | null;

  // Error
  error: string | null;

  // Actions
  setRoomId: (id: string | null) => void;
  setRole: (role: 'sender' | 'receiver' | null) => void;
  setStatus: (status: ConnectionStatus) => void;
  setPeer: (peer: PeerInfo | null) => void;
  setError: (error: string | null) => void;

  // File actions
  addFile: (file: Omit<FileTransfer, 'id' | 'progress' | 'status' | 'timestamp'>) => string;
  updateFileProgress: (id: string, progress: number) => void;
  updateFileStatus: (id: string, status: FileTransfer['status']) => void;
  setCurrentFile: (id: string | null) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;

  // Reset
  reset: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  roomId: null,
  role: null,
  status: 'idle',
  peer: null,
  files: [],
  currentFileId: null,
  error: null,

  // Connection actions
  setRoomId: (id) => set({ roomId: id }),
  setRole: (role) => set({ role }),
  setStatus: (status) => set({ status }),
  setPeer: (peer) => set({ peer }),
  setError: (error) => set({ error }),

  // File actions
  addFile: (file) => {
    const id = generateId();
    const newFile: FileTransfer = {
      ...file,
      id,
      progress: 0,
      status: 'pending',
      timestamp: Date.now(),
    };
    set((state) => ({ files: [...state.files, newFile] }));
    return id;
  },

  updateFileProgress: (id, progress) => {
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, progress } : f
      ),
    }));
  },

  updateFileStatus: (id, status) => {
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, status } : f
      ),
    }));
  },

  setCurrentFile: (id) => set({ currentFileId: id }),

  removeFile: (id) => {
    set((state) => ({
      files: state.files.filter((f) => f.id !== id),
      currentFileId: state.currentFileId === id ? null : state.currentFileId,
    }));
  },

  clearFiles: () => set({ files: [], currentFileId: null }),

  // Reset everything
  reset: () => set({
    roomId: null,
    role: null,
    status: 'idle',
    peer: null,
    files: [],
    currentFileId: null,
    error: null,
  }),
}));

// Selectors
export const selectCurrentFile = (state: AppState) =>
  state.files.find((f) => f.id === state.currentFileId);

export const selectActiveTransfers = (state: AppState) =>
  state.files.filter((f) => f.status === 'transferring' || f.status === 'pending');

export const selectCompletedTransfers = (state: AppState) =>
  state.files.filter((f) => f.status === 'completed');
