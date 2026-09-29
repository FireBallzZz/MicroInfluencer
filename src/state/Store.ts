import { useEffect, useState, useCallback } from 'react';
import {
  seedBrand,
  seedCampaigns,
  seedConnectedYouTube,
  seedCreator,
  seedNotifications,
  seedProposals,
  discoverableCreators,
} from '../data/seed';
import type {
  AppNotification,
  Campaign,
  CampaignStatus,
  ConnectedAccount,
  CreatorProfile,
  BrandProfile,
  PortfolioLink,
  Proposal,
  ProposalStatus,
} from '../types';

type Store = {
  creator: CreatorProfile;
  brand: BrandProfile;
  campaigns: Campaign[];
  proposals: Proposal[];
  notifications: AppNotification[];
  connectedAccounts: ConnectedAccount[];
};

const STORAGE_KEY = 'microinf_store_v1';

const initial: Store = {
  creator: seedCreator,
  brand: seedBrand,
  campaigns: seedCampaigns,
  proposals: seedProposals,
  notifications: seedNotifications,
  connectedAccounts: [seedConnectedYouTube],
};

let listeners: Array<() => void> = [];
let state: Store = (() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Store;
  } catch {}
  return initial;
})();

const persist = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
};

const setState = (next: Store) => {
  state = next;
  persist();
  listeners.forEach((l) => l());
};

export const resetStore = () => {
  state = initial;
  persist();
  listeners.forEach((l) => l());
};

export const useStore = () => {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.push(l);
    return () => {
      listeners = listeners.filter((x) => x !== l);
    };
  }, []);
  return state;
};

// --- Creators ---
export const updateCreator = (patch: Partial<CreatorProfile>) => {
  setState({ ...state, creator: { ...state.creator, ...patch } });
};

export const setCreatorPortfolio = (links: PortfolioLink[]) => {
  setState({ ...state, creator: { ...state.creator, portfolio: links } });
};

export const searchCreators = (query: {
  keyword?: string;
  niche?: string;
  platform?: string;
  location?: string;
  minFollowers?: number;
  maxFollowers?: number;
  minEngagement?: number;
}): CreatorProfile[] => {
  return discoverableCreators.filter((c) => {
    if (query.keyword) {
      const k = query.keyword.toLowerCase();
      const hay = `${c.fullName} ${c.bio} ${c.niche} ${c.location}`.toLowerCase();
      if (!hay.includes(k)) return false;
    }
    if (query.niche && c.niche !== query.niche) return false;
    if (query.platform && c.primaryPlatform !== query.platform) return false;
    if (query.location && !c.location.toLowerCase().includes(query.location.toLowerCase()))
      return false;
    if (query.minFollowers && c.followers < query.minFollowers) return false;
    if (query.maxFollowers && c.followers > query.maxFollowers) return false;
    if (query.minEngagement && c.engagementRate < query.minEngagement) return false;
    return true;
  });
};

// --- Brand ---
export const updateBrand = (patch: Partial<BrandProfile>) => {
  setState({ ...state, brand: { ...state.brand, ...patch } });
};

// --- Campaigns ---
export const addCampaign = (c: Omit<Campaign, 'id' | 'createdAt' | 'status'>): Campaign => {
  const created: Campaign = {
    ...c,
    id: 'camp_' + Math.random().toString(36).slice(2, 8),
    createdAt: new Date().toISOString(),
    status: 'draft',
  };
  setState({ ...state, campaigns: [created, ...state.campaigns] });
  return created;
};

export const updateCampaign = (id: string, patch: Partial<Campaign>) => {
  setState({
    ...state,
    campaigns: state.campaigns.map((c) => (c.id === id ? { ...c, ...patch } : c)),
  });
};

export const setCampaignStatus = (id: string, status: CampaignStatus) => {
  updateCampaign(id, { status });
};

export const deleteCampaign = (id: string) => {
  setState({ ...state, campaigns: state.campaigns.filter((c) => c.id !== id) });
};

// --- Proposals ---
export const addProposal = (
  campaignId: string,
  data: Omit<Proposal, 'id' | 'submittedAt' | 'status' | 'campaignId' | 'creatorId' | 'creatorName' | 'creatorNiche' | 'creatorPlatform' | 'creatorFollowers' | 'creatorEngagement'>
): Proposal => {
  const creator = state.creator;
  const created: Proposal = {
    ...data,
    id: 'prop_' + Math.random().toString(36).slice(2, 8),
    campaignId,
    creatorId: creator.id,
    creatorName: creator.fullName,
    creatorNiche: creator.niche,
    creatorPlatform: creator.primaryPlatform,
    creatorFollowers: creator.followers,
    creatorEngagement: creator.engagementRate,
    status: 'pending',
    submittedAt: new Date().toISOString(),
  };
  setState({ ...state, proposals: [created, ...state.proposals] });
  return created;
};

export const updateProposalStatus = (id: string, status: ProposalStatus, withdrawReason?: string) => {
  setState({
    ...state,
    proposals: state.proposals.map((p) =>
      p.id === id ? { ...p, status, withdrawReason: withdrawReason ?? p.withdrawReason } : p
    ),
  });
};

// --- Connected accounts ---
export const updateConnectedAccount = (id: string, patch: Partial<ConnectedAccount>) => {
  setState({
    ...state,
    connectedAccounts: state.connectedAccounts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
  });
};

export const connectYouTube = () => {
  const existing = state.connectedAccounts.find((a) => a.platform === 'YouTube');
  if (existing) {
    updateConnectedAccount(existing.id, {
      status: 'connected',
      verified: true,
      lastSyncedAt: new Date().toISOString(),
    });
  } else {
    const acc: ConnectedAccount = {
      id: 'acc_yt_' + Math.random().toString(36).slice(2, 8),
      platform: 'YouTube',
      handle: 'Avery Makes',
      verified: true,
      lastSyncedAt: new Date().toISOString(),
      status: 'connected',
    };
    setState({ ...state, connectedAccounts: [...state.connectedAccounts, acc] });
  }
};

export const disconnectYouTube = () => {
  setState({
    ...state,
    connectedAccounts: state.connectedAccounts.filter((a) => a.platform !== 'YouTube'),
  });
};

// --- Notifications ---
export const markNotificationRead = (id: string) => {
  setState({
    ...state,
    notifications: state.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    ),
  });
};

export const markAllNotificationsRead = () => {
  setState({
    ...state,
    notifications: state.notifications.map((n) => ({ ...n, read: true })),
  });
};

export const pushNotification = (
  n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>
) => {
  const note: AppNotification = {
    ...n,
    id: 'n_' + Math.random().toString(36).slice(2, 8),
    createdAt: new Date().toISOString(),
    read: false,
  };
  setState({ ...state, notifications: [note, ...state.notifications] });
};

// --- Helpers ---
export const profileCompletion = (c: CreatorProfile): number => {
  const fields: Array<keyof CreatorProfile> = [
    'fullName',
    'bio',
    'niche',
    'primaryPlatform',
    'location',
    'ratePerPost',
    'ratePerStory',
    'ratePerVideo',
    'followers',
    'engagementRate',
  ];
  const filled = fields.filter((f) => {
    const v = c[f] as unknown;
    if (typeof v === 'number') return v > 0;
    return Boolean(v);
  }).length;
  return Math.round((filled / fields.length) * 100);
};

export const activeProposalsForCreator = () =>
  state.proposals.filter(
    (p) => p.creatorId === state.creator.id && (p.status === 'pending' || p.status === 'shortlisted' || p.status === 'accepted')
  );

export const useSimulatedLoading = (ms = 350) => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return [loading, setLoading] as const;
};

export const useLocalState = <T,>(key: string, initial: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem('microinf_local_' + key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  const set = useCallback(
    (v: T) => {
      setValue(v);
      try {
        localStorage.setItem('microinf_local_' + key, JSON.stringify(v));
      } catch {}
    },
    [key]
  );
  return [value, set] as const;
};
