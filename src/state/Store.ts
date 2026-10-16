/**
 * In-memory data store backed by the Microwork API.
 *
 * The page-level components import the same names they used to (useStore,
 * updateCreator, searchCreators, addCampaign, …) so the rest of the app does
 * not need to know how the data is fetched. Mutators are async and return a
 * Promise; pages that need to wait should `await` and then call `refresh()`.
 *
 * State is held in module scope. Listeners (one per subscriber) get notified
 * after a refresh or a successful mutation, so screens re-render.
 */

import { useEffect, useState } from 'react';
import * as api from '../api/endpoints';
import type {
  AppNotification,
  BrandProfile,
  Campaign,
  CampaignStatus,
  ConnectedAccount,
  CreatorProfile,
  MyProposal,
  Niche,
  Platform,
  PortfolioLink,
  Proposal,
  ProposalStatus,
} from '../types';
import { isApiError } from '../api/client';

type Store = {
  creator: CreatorProfile | null;
  brand: BrandProfile | null;
  campaigns: Campaign[];
  /** Mixed list: brand-facing proposals (creator info embedded) or
   *  creator-facing "my applications" (campaign/brand info embedded). */
  proposals: Array<Proposal | MyProposal>;
  notifications: AppNotification[];
  connectedAccounts: ConnectedAccount[];
  loading: Record<string, boolean>;
  errors: Record<string, string | null>;
};

const empty: Store = {
  creator: null,
  brand: null,
  campaigns: [],
  proposals: [],
  notifications: [],
  connectedAccounts: [],
  loading: {},
  errors: {},
};

let state: Store = { ...empty };
const listeners = new Set<() => void>();
const pendingFetches = new Map<string, Promise<unknown>>();

const setState = (patch: Partial<Store>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

const setLoading = (key: string, value: boolean) => {
  setState({ loading: { ...state.loading, [key]: value } });
};

const setError = (key: string, value: string | null) => {
  setState({ errors: { ...state.errors, [key]: value } });
};

const runOnce = <T,>(key: string, fn: () => Promise<T>): Promise<T> => {
  const existing = pendingFetches.get(key);
  if (existing) return existing as Promise<T>;
  const p = fn().finally(() => pendingFetches.delete(key));
  pendingFetches.set(key, p);
  return p;
};

// --- Hook -------------------------------------------------------------------

export const useStore = () => {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return state;
};

// --- Creator / brand loaders ----------------------------------------------

export const loadCreatorProfile = () =>
  runOnce('creatorMe', async () => {
    setLoading('creatorMe', true);
    setError('creatorMe', null);
    try {
      const [me, portfolio, yt] = await Promise.all([
        api.fetchCreatorMe(),
        api.fetchPortfolio().catch(() => [] as PortfolioLink[]),
        api.fetchYouTubeStatus().catch(() => null),
      ]);
      const merged: CreatorProfile = { ...me, portfolio };
      if (yt && yt.connected) {
        const acc: ConnectedAccount = {
          id: 'yt',
          platform: 'YouTube',
          handle: 'YouTube channel',
          verified: !yt.needsReconnect,
          lastSyncedAt: yt.lastSyncedAt ?? new Date().toISOString(),
          status: yt.needsReconnect ? 'expired' : 'connected',
        };
        merged.connectedAccount = acc;
        setState({ connectedAccounts: [acc] });
      } else {
        setState({ connectedAccounts: [] });
      }
      setState({ creator: merged });
      return merged;
    } catch (err) {
      const msg = isApiError(err) ? err.message : 'Failed to load profile.';
      setError('creatorMe', msg);
      throw err;
    } finally {
      setLoading('creatorMe', false);
    }
  });

export const loadBrandProfile = () =>
  runOnce('brandMe', async () => {
    setLoading('brandMe', true);
    setError('brandMe', null);
    try {
      const brand = await api.fetchBrandMe();
      setState({ brand });
      return brand;
    } catch (err) {
      const msg = isApiError(err) ? err.message : 'Failed to load profile.';
      setError('brandMe', msg);
      throw err;
    } finally {
      setLoading('brandMe', false);
    }
  });

// --- Mutators (async) ------------------------------------------------------

export const updateCreator = async (
  patch: Partial<{
    fullName: string;
    bio: string;
    niche: Niche;
    primaryPlatform: Platform;
    location: string;
    ratePerPost: number;
    ratePerStory: number;
    ratePerVideo: number;
  }>,
): Promise<CreatorProfile | null> => {
  const cityCountry = patch.location?.split(',').map((s) => s.trim()) ?? [];
  const updated = await api.updateCreatorMe({
    fullName: patch.fullName,
    bio: patch.bio,
    niche: patch.niche,
    primaryPlatform: patch.primaryPlatform,
    city: cityCountry[0],
    country: cityCountry[1],
    ratePerPost: patch.ratePerPost,
    ratePerStory: patch.ratePerStory,
    ratePerVideo: patch.ratePerVideo,
  });
  const merged: CreatorProfile = { ...updated, portfolio: state.creator?.portfolio ?? [] };
  setState({ creator: merged });
  return merged;
};

export const setCreatorPortfolio = async (links: PortfolioLink[]): Promise<void> => {
  if (!state.creator) return;
  const existing = state.creator.portfolio;
  const incomingIds = new Set(links.map((l) => l.id));
  const toDelete = existing.filter((l) => !incomingIds.has(l.id) && /^\d+$/.test(l.id));
  for (const item of toDelete) {
    await api.deletePortfolioItem(item.id).catch(() => undefined);
  }
  // Add new ones (those whose id isn't a numeric backend id).
  const existingIds = new Set(existing.map((l) => l.id));
  const newItems = links.filter((l) => !existingIds.has(l.id) || !/^\d+$/.test(l.id));
  for (const item of newItems) {
    if (!item.url) continue;
    await api.addPortfolioItem({ url: item.url, caption: item.title });
  }
  const fresh = await api.fetchPortfolio();
  if (state.creator) setState({ creator: { ...state.creator, portfolio: fresh } });
};

export const updateBrand = async (
  patch: Partial<{ companyName: string; industry: string; website: string; about: string }>,
): Promise<BrandProfile | null> => {
  const updated = await api.updateBrandMe(patch);
  setState({ brand: updated });
  return updated;
};

// --- Campaigns -------------------------------------------------------------

export const addCampaign = async (c: {
  title: string;
  description: string;
  category: Niche;
  requiredPlatform: Platform;
  budgetPerCreator: number;
  applicationDeadline: string;
  deliverables: string;
  creatorsNeeded: number;
  minFollowers?: number;
}): Promise<Campaign> => {
  const created = await api.createCampaign({
    title: c.title,
    description: c.description,
    niche: c.category,
    platform: c.requiredPlatform,
    budget: c.budgetPerCreator,
    deadline: c.applicationDeadline,
    deliverables: c.deliverables,
    creatorsNeeded: c.creatorsNeeded,
    minFollowers: c.minFollowers,
  });
  setState({ campaigns: [created, ...state.campaigns] });
  return created;
};

export const updateCampaign = async (
  id: string,
  patch: Partial<{
    title: string;
    description: string;
    category: Niche;
    requiredPlatform: Platform;
    budgetPerCreator: number;
    applicationDeadline: string;
    deliverables: string;
    creatorsNeeded: number;
    minFollowers?: number;
  }>,
): Promise<Campaign | null> => {
  const idNum = Number(id);
  const updated = await api.updateCampaign(idNum, {
    title: patch.title,
    description: patch.description,
    niche: patch.category,
    platform: patch.requiredPlatform,
    budget: patch.budgetPerCreator,
    deadline: patch.applicationDeadline,
    deliverables: patch.deliverables,
    creatorsNeeded: patch.creatorsNeeded,
    minFollowers: patch.minFollowers,
  });
  setState({ campaigns: state.campaigns.map((c) => (c.id === id ? updated : c)) });
  return updated;
};

export const setCampaignStatus = async (id: string, status: CampaignStatus): Promise<void> => {
  const idNum = Number(id);
  let updated: Campaign;
  if (status === 'published') updated = await api.publishCampaign(idNum);
  else if (status === 'closed') updated = await api.closeCampaign(idNum);
  else throw new Error('Unsupported transition: ' + status);
  setState({ campaigns: state.campaigns.map((c) => (c.id === id ? updated : c)) });
};

export const deleteCampaign = async (id: string): Promise<void> => {
  await api.deleteCampaign(Number(id));
  setState({ campaigns: state.campaigns.filter((c) => c.id !== id) });
};

// --- Brand discovery (creator search) --------------------------------------

export const searchCreators = async (query: api.SearchCreatorsParams): Promise<CreatorProfile[]> => {
  return api.searchCreators(query);
};

// --- Proposals -------------------------------------------------------------

export const addProposal = async (
  campaignId: string,
  data: {
    coverMessage: string;
    proposedRate: number;
    portfolio: PortfolioLink[];
    relevantExperience: string;
  },
): Promise<MyProposal> => {
  await api.submitProposal({
    campaignId,
    coverMessage: data.coverMessage,
    proposedRate: data.proposedRate,
    portfolioLinks: data.portfolio,
    experienceNote: data.relevantExperience,
  });
  // Refresh the full list so we get the joined campaign metadata.
  const list = await loadMyProposals();
  const found = list.find((p) => p.campaignId === campaignId);
  return found ?? ({} as MyProposal);
};

export const updateProposalStatus = async (
  id: string,
  status: ProposalStatus,
  withdrawReason?: string,
): Promise<void> => {
  if (status === 'withdrawn') {
    await api.withdrawProposal(Number(id), withdrawReason);
    await loadMyProposals();
    return;
  }
  if (status === 'shortlisted') await api.shortlistProposal(Number(id));
  else if (status === 'accepted') await api.acceptProposal(Number(id));
  else if (status === 'rejected') await api.rejectProposal(Number(id));
  else throw new Error('Unsupported proposal status: ' + status);
};

// --- Lists -----------------------------------------------------------------

export const loadMyProposals = async (): Promise<MyProposal[]> => {
  setLoading('myProposals', true);
  setError('myProposals', null);
  try {
    const list = await api.listMyProposals();
    setState({ proposals: list });
    return list;
  } catch (err) {
    const msg = isApiError(err) ? err.message : 'Failed to load proposals.';
    setError('myProposals', msg);
    return [];
  } finally {
    setLoading('myProposals', false);
  }
};

export const loadCreatorCampaigns = async (filters: {
  q?: string;
  niche?: Niche;
  platform?: Platform;
  minBudget?: number;
  deadlineBefore?: string;
} = {}): Promise<Campaign[]> => {
  setLoading('creatorCampaigns', true);
  setError('creatorCampaigns', null);
  try {
    const list = await api.listCreatorCampaigns(filters);
    setState({ campaigns: list });
    return list;
  } catch (err) {
    const msg = isApiError(err) ? err.message : 'Failed to load campaigns.';
    setError('creatorCampaigns', msg);
    return [];
  } finally {
    setLoading('creatorCampaigns', false);
  }
};

export const loadBrandCampaigns = async (filter?: { status?: CampaignStatus }): Promise<Campaign[]> => {
  setLoading('brandCampaigns', true);
  setError('brandCampaigns', null);
  try {
    const list = await api.listBrandCampaigns(filter);
    setState({ campaigns: list });
    return list;
  } catch (err) {
    const msg = isApiError(err) ? err.message : 'Failed to load campaigns.';
    setError('brandCampaigns', msg);
    return [];
  } finally {
    setLoading('brandCampaigns', false);
  }
};

export const setBrandProposals = (proposals: Proposal[]) => {
  setState({ proposals: proposals as Array<Proposal | MyProposal> });
};

export const setCampaigns = (campaigns: Campaign[]) => setState({ campaigns });

// --- Notifications ---------------------------------------------------------

export const markNotificationRead = async (id: string): Promise<void> => {
  const updated = await api.markNotificationRead(Number(id));
  setState({
    notifications: state.notifications.map((n) => (n.id === id ? updated : n)),
  });
};

export const markAllNotificationsRead = async (): Promise<void> => {
  await api.markAllNotificationsRead();
  setState({
    notifications: state.notifications.map((n) => ({ ...n, read: true })),
  });
};

export const loadNotifications = async (): Promise<AppNotification[]> => {
  setLoading('notifications', true);
  setError('notifications', null);
  try {
    const { results } = await api.listNotifications();
    setState({ notifications: results });
    return results;
  } catch (err) {
    const msg = isApiError(err) ? err.message : 'Failed to load notifications.';
    setError('notifications', msg);
    return [];
  } finally {
    setLoading('notifications', false);
  }
};

export const pushNotification = (_n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
  // Local-only helper kept for UI. Real notifications arrive via the API.
};

// --- YouTube connection ----------------------------------------------------

export const connectYouTube = async (): Promise<void> => {
  const url = await api.startYouTubeConnect();
  window.location.assign(url);
};

export const disconnectYouTube = async (): Promise<void> => {
  await api.disconnectYouTube();
  setState({ connectedAccounts: [] });
  if (state.creator) {
    setState({ creator: { ...state.creator, connectedAccount: undefined, verified: false } });
  }
};

export const updateConnectedAccount = async (
  _id: string,
  _patch: Partial<ConnectedAccount>,
): Promise<void> => {
  // "Refresh" maps to the backend's POST /social/youtube/refresh/.
  await api.refreshYouTube().catch(() => undefined);
  // Pull the latest status afterwards.
  try {
    const yt = await api.fetchYouTubeStatus();
    if (yt.connected) {
      const acc: ConnectedAccount = {
        id: 'yt',
        platform: 'YouTube',
        handle: 'YouTube channel',
        verified: !yt.needsReconnect,
        lastSyncedAt: yt.lastSyncedAt ?? new Date().toISOString(),
        status: yt.needsReconnect ? 'expired' : 'connected',
      };
      setState({ connectedAccounts: [acc] });
    } else {
      setState({ connectedAccounts: [] });
    }
  } catch {
    /* ignore */
  }
};

// --- Helpers ---------------------------------------------------------------

export const profileCompletion = (c: CreatorProfile | null): number => {
  if (!c) return 0;
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
    if (typeof v === 'string') return v.trim().length > 0;
    if (Array.isArray(v)) return v.length > 0;
    return Boolean(v);
  }).length;
  return Math.round((filled / fields.length) * 100);
};

export const activeProposalsForCreator = () =>
  state.proposals.filter(
    (p) =>
      p.creatorId === state.creator?.id &&
      (p.status === 'pending' || p.status === 'shortlisted' || p.status === 'accepted'),
  );

// --- Test helpers (kept for parity, but no longer reset the store) ---------

export const resetStore = () => {
  state = { ...empty };
  listeners.forEach((l) => l());
};
