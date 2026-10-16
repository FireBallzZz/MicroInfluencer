/**
 * Typed wrappers around the backend endpoints the UI needs.
 *
 * Each function maps the wire shape to the UI-facing types in src/types.ts and
 * src/state/Store.ts. Keep mappers in this file so screens never see raw API
 * field names.
 */

import { request } from './client';
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
  Role,
  User,
} from '../types';

// ----- Auth -----------------------------------------------------------------

export type LoginInput = { identifier: string; password: string };
export type RegisterInput = {
  role: Role;
  fullName: string;
  email: string;
  username: string;
  password: string;
  mobileNumber: string;
};

type ApiUser = {
  id: number;
  full_name: string;
  email: string;
  username: string;
  role: Role;
  mobile_number: string;
  email_verified: boolean;
  email_notifications_enabled?: boolean;
  profile_photo_url?: string | null;
};

export const mapUser = (u: ApiUser): User => ({
  id: String(u.id),
  role: u.role,
  fullName: u.full_name,
  email: u.email,
  username: u.username,
  mobile: u.mobile_number || undefined,
  avatarUrl: u.profile_photo_url ?? undefined,
  emailVerified: u.email_verified,
  emailNotificationsEnabled: u.email_notifications_enabled,
});

export async function login(input: LoginInput) {
  const data = await request<{ access: string; user: ApiUser }>('auth/login/', {
    method: 'POST',
    body: { identifier: input.identifier, password: input.password },
    anonymous: true,
  });
  return { access: data.access, user: mapUser(data.user) };
}

export async function register(input: RegisterInput) {
  const data = await request<ApiUser>('auth/register/', {
    method: 'POST',
    body: {
      role: input.role,
      full_name: input.fullName,
      email: input.email,
      username: input.username,
      password: input.password,
      mobile_number: input.mobileNumber,
    },
    anonymous: true,
  });
  return mapUser(data);
}

export async function logout() {
  await request('auth/logout/', { method: 'POST' });
}

export async function fetchMe(): Promise<User> {
  const data = await request<ApiUser>('auth/me/');
  return mapUser(data);
}

export async function requestPasswordReset(email: string) {
  return request<{ detail: string }>('auth/password-reset/request/', {
    method: 'POST',
    body: { email },
    anonymous: true,
  });
}

export async function confirmPasswordReset(input: { email: string; code: string; newPassword: string }) {
  return request<{ detail: string }>('auth/password-reset/confirm/', {
    method: 'POST',
    body: { email: input.email, code: input.code, new_password: input.newPassword },
    anonymous: true,
  });
}

// ----- Niche / platform mapping --------------------------------------------

/** Backend uses lowercase enum values. We expand the UI list to include the
 *  categories the seeded sample data and existing copy reference. */
export const NICHE_LABELS: Record<string, Niche> = {
  fitness: 'Fitness',
  tech: 'Tech',
  beauty: 'Beauty',
  food: 'Food',
  travel: 'Travel',
  other: 'Lifestyle',
  // UI-only niceties (the backend doesn't emit these today, but if a profile
  // ever comes back with one we map it onto a known UI chip):
  fashion: 'Fashion',
  gaming: 'Gaming',
  lifestyle: 'Lifestyle',
  finance: 'Finance',
  education: 'Education',
};

export const NICHE_OPTIONS: Niche[] = [
  'Fashion', 'Beauty', 'Fitness', 'Tech', 'Gaming', 'Food', 'Travel',
  'Lifestyle', 'Finance', 'Education',
];

/** Backend platforms already use the labels the UI shows. */
export const PLATFORM_LABELS: Record<string, Platform> = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
};

export const PLATFORM_OPTIONS: Platform[] = ['YouTube', 'Instagram', 'TikTok', 'Facebook'];

const labelToNiche = (label: string): Niche | undefined =>
  (Object.values(NICHE_LABELS) as string[]).includes(label) ? (label as Niche) : undefined;

export const nicheFromBackend = (v: string | null | undefined): Niche =>
  (v && NICHE_LABELS[v]) || 'Lifestyle';

export const platformFromBackend = (v: string | null | undefined): Platform =>
  (v && PLATFORM_LABELS[v]) || 'YouTube';

export const platformToBackend = (p: Platform): string => p.toLowerCase();

/** Backend uses one of the canonical Platform enum values. The UI select lets
 *  the user pick a label and we send the lowercase form back. */
export const nicheToBackend = (n: Niche): string => {
  for (const [k, v] of Object.entries(NICHE_LABELS)) {
    if (v === n) return k;
  }
  return 'other';
};

// ----- Creator profile (me) ------------------------------------------------

type ApiCreatorMe = {
  id: number;
  username: string;
  full_name: string;
  photo_url: string | null;
  bio: string;
  niche: string | null;
  primary_platform: string | null;
  city: string;
  country: string;
  rate_post: string | null;
  rate_story: string | null;
  rate_video: string | null;
  rating_avg: string | null;
  rating_count: number;
  completion_percent: number;
  stats: Array<{
    platform: string;
    handle_url: string | null;
    followers: number | null;
    engagement_rate: string | null;
    is_verified: boolean;
    is_outdated: boolean;
    last_synced_at: string | null;
  }>;
};

const numFrom = (v: string | null | undefined): number => {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const mapCreatorMe = (p: ApiCreatorMe): CreatorProfile => {
  const yt = p.stats.find((s) => s.platform === 'youtube');
  const followers = yt?.followers ?? 0;
  const engagement = yt ? numFrom(yt.engagement_rate) : 0;
  return {
    id: String(p.id),
    fullName: p.full_name,
    avatarUrl: p.photo_url ?? undefined,
    coverUrl: undefined,
    bio: p.bio,
    niche: nicheFromBackend(p.niche),
    primaryPlatform: platformFromBackend(p.primary_platform),
    location: [p.city, p.country].filter(Boolean).join(', '),
    ratePerPost: numFrom(p.rate_post),
    ratePerStory: numFrom(p.rate_story),
    ratePerVideo: numFrom(p.rate_video),
    followers,
    engagementRate: engagement,
    verified: !!yt?.is_verified,
    portfolio: [],
    // Best-effort: the verified flag is the YouTube verified status. The
    // dashboard reads it via the separate /social/youtube/ endpoint for the
    // more accurate "needs reconnect" / "expired" flags.
    connectedAccount: yt
      ? {
          id: 'yt',
          platform: 'YouTube',
          handle: (yt.handle_url ?? '').replace(/^https?:\/\//, '').replace(/^@/, ''),
          verified: yt.is_verified,
          lastSyncedAt: yt.last_synced_at ?? new Date().toISOString(),
          status: 'connected',
        }
      : undefined,
    ratingAvg: p.rating_avg !== null ? numFrom(p.rating_avg) : null,
    ratingCount: p.rating_count ?? 0,
  };
};

export const fetchCreatorMe = async (): Promise<CreatorProfile> => {
  const data = await request<ApiCreatorMe>('creators/me/');
  return mapCreatorMe(data);
};

export const updateCreatorMe = async (patch: Partial<{
  fullName: string;
  bio: string;
  niche: Niche;
  primaryPlatform: Platform;
  city: string;
  country: string;
  ratePerPost: number;
  ratePerStory: number;
  ratePerVideo: number;
}>): Promise<CreatorProfile> => {
  const body: Record<string, unknown> = {};
  if (patch.fullName !== undefined) body.full_name = patch.fullName;
  if (patch.bio !== undefined) body.bio = patch.bio;
  if (patch.niche !== undefined) body.niche = nicheToBackend(patch.niche);
  if (patch.primaryPlatform !== undefined) body.primary_platform = platformToBackend(patch.primaryPlatform);
  if (patch.city !== undefined) body.city = patch.city;
  if (patch.country !== undefined) body.country = patch.country;
  if (patch.ratePerPost !== undefined) body.rate_post = String(patch.ratePerPost);
  if (patch.ratePerStory !== undefined) body.rate_story = String(patch.ratePerStory);
  if (patch.ratePerVideo !== undefined) body.rate_video = String(patch.ratePerVideo);
  const data = await request<ApiCreatorMe>('creators/me/', { method: 'PATCH', body });
  return mapCreatorMe(data);
};

// ----- Portfolio ------------------------------------------------------------

export const fetchPortfolio = async (): Promise<PortfolioLink[]> => {
  const data = await request<Array<{ id: number; url: string; caption: string; source: string; created_at: string }>>(
    'creators/me/portfolio/',
  );
  return data.map((p) => ({ id: String(p.id), url: p.url, title: p.caption || undefined }));
};

export const addPortfolioItem = async (input: { url: string; caption?: string }): Promise<PortfolioLink> => {
  const data = await request<{ id: number; url: string; caption: string }>('creators/me/portfolio/', {
    method: 'POST',
    body: { url: input.url, caption: input.caption ?? '' },
  });
  return { id: String(data.id), url: data.url, title: data.caption || undefined };
};

export const deletePortfolioItem = async (id: string | number) => {
  await request(`creators/me/portfolio/${id}/`, { method: 'DELETE' });
};

// ----- Brand profile --------------------------------------------------------

type ApiBrandMe = {
  id: number;
  display_name: string;
  company_name: string;
  industry: string;
  website: string | null;
  logo_url: string | null;
  about: string;
};

export const mapBrandMe = (p: ApiBrandMe): BrandProfile => ({
  id: String(p.id),
  companyName: p.company_name || p.display_name,
  industry: p.industry,
  website: p.website ?? '',
  logoUrl: p.logo_url ?? undefined,
  coverUrl: undefined,
  about: p.about,
  size: undefined,
  headquarters: undefined,
  foundedYear: undefined,
});

export const fetchBrandMe = async (): Promise<BrandProfile> => {
  const data = await request<ApiBrandMe>('brands/me/');
  return mapBrandMe(data);
};

export const updateBrandMe = async (patch: Partial<{
  companyName: string;
  industry: string;
  website: string;
  about: string;
}>): Promise<BrandProfile> => {
  const body: Record<string, unknown> = {};
  if (patch.companyName !== undefined) body.company_name = patch.companyName;
  if (patch.industry !== undefined) body.industry = patch.industry;
  if (patch.website !== undefined) body.website = patch.website;
  if (patch.about !== undefined) body.about = patch.about;
  const data = await request<ApiBrandMe>('brands/me/', { method: 'PATCH', body });
  return mapBrandMe(data);
};

// ----- Creator directory ----------------------------------------------------

type ApiCreatorCard = {
  id: number;
  name: string;
  photo_url: string | null;
  niche: string | null;
  primary_platform: string | null;
  followers: number | null;
  engagement_rate: string | null;
  is_verified: boolean;
  rating_avg: string | null;
  rating_count: number;
};

export const mapCreatorCard = (c: ApiCreatorCard): CreatorProfile => ({
  id: String(c.id),
  fullName: c.name,
  avatarUrl: c.photo_url ?? undefined,
  coverUrl: undefined,
  bio: '',
  niche: nicheFromBackend(c.niche),
  primaryPlatform: platformFromBackend(c.primary_platform),
  location: '',
  ratePerPost: 0,
  ratePerStory: 0,
  ratePerVideo: 0,
  followers: c.followers ?? 0,
  engagementRate: c.engagement_rate ? numFrom(c.engagement_rate) : 0,
  verified: c.is_verified,
  portfolio: [],
});

export type SearchCreatorsParams = {
  q?: string;
  niche?: string;
  platform?: string;
  location?: string;
  minFollowers?: number;
  maxFollowers?: number;
  minEngagement?: number;
  minRate?: number;
  maxRate?: number;
  verifiedOnly?: boolean;
  /** One of: followers, -followers, engagement, -engagement, rate, -rate, rating, -rating. */
  ordering?: string;
};

const unwrapList = <T>(data: unknown): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && Array.isArray((data as { results?: unknown[] }).results)) {
    return (data as { results: T[] }).results;
  }
  return [];
};

export const searchCreators = async (p: SearchCreatorsParams = {}): Promise<CreatorProfile[]> => {
  const query: Record<string, string | number> = {};
  if (p.q) query.q = p.q;
  if (p.niche) query.niche = nicheToBackend(labelToNiche(p.niche) ?? ('Lifestyle' as Niche));
  if (p.platform) query.platform = platformToBackend(p.platform as Platform);
  if (p.location) query.location = p.location;
  if (p.minFollowers !== undefined) query.min_followers = p.minFollowers;
  if (p.maxFollowers !== undefined) query.max_followers = p.maxFollowers;
  if (p.minEngagement !== undefined) query.min_engagement = p.minEngagement;
  if (p.minRate !== undefined) query.min_rate = p.minRate;
  if (p.maxRate !== undefined) query.max_rate = p.maxRate;
  if (p.verifiedOnly) query.verified_only = 'true';
  if (p.ordering) query.ordering = p.ordering;
  const data = await request<ApiCreatorCard[] | { results: ApiCreatorCard[] }>('creators/', { query });
  return unwrapList<ApiCreatorCard>(data).map(mapCreatorCard);
};

type ApiCreatorDetail = ApiCreatorMe;

export const fetchCreatorDetail = async (id: string | number): Promise<CreatorProfile> => {
  const data = await request<ApiCreatorDetail>(`creators/${id}/`);
  return mapCreatorMe(data);
};

// ----- Brand detail ---------------------------------------------------------

export const fetchBrandDetail = async (id: string | number): Promise<BrandProfile> => {
  const data = await request<ApiBrandMe>(`brands/${id}/`);
  return mapBrandMe(data);
};

// ----- Campaigns ------------------------------------------------------------

type ApiCampaign = {
  id: number;
  title: string;
  description: string;
  niche: string;
  platform: string;
  budget: string;
  deadline: string;
  deliverables: string;
  creators_needed: number;
  min_followers: number | null;
  status: CampaignStatus;
  published_at: string | null;
  closed_at: string | null;
  created_at: string;
};

type ApiCampaignCard = {
  id: number;
  title: string;
  brand: { id: number; name: string; logo_url: string | null };
  niche: string;
  budget: string;
  platform: string;
  deadline: string;
  creators_needed: number;
  eligible: boolean;
};

type ApiCampaignDetail = ApiCampaignCard & {
  description: string;
  deliverables: string;
  min_followers: number | null;
  status: CampaignStatus;
  accepted_count: number;
  all_creators_selected: boolean;
  can_apply: boolean;
  apply_blocked_reason: string | null;
};

export const mapCampaignCard = (c: ApiCampaignCard): Campaign => ({
  id: String(c.id),
  brandId: String(c.brand.id),
  brandName: c.brand.name,
  title: c.title,
  description: '',
  category: nicheFromBackend(c.niche),
  requiredPlatform: platformFromBackend(c.platform),
  budgetPerCreator: numFrom(c.budget),
  applicationDeadline: c.deadline,
  deliverables: '',
  creatorsNeeded: c.creators_needed,
  minFollowers: undefined,
  status: 'published',
  createdAt: c.deadline,
});

export const mapCampaignDetail = (c: ApiCampaignDetail): Campaign => ({
  ...mapCampaignCard(c),
  description: c.description,
  deliverables: c.deliverables,
  minFollowers: c.min_followers ?? undefined,
  status: c.status,
});

export const mapBrandCampaign = (c: ApiCampaign): Campaign => ({
  id: String(c.id),
  brandId: '',
  brandName: '',
  title: c.title,
  description: c.description,
  category: nicheFromBackend(c.niche),
  requiredPlatform: platformFromBackend(c.platform),
  budgetPerCreator: numFrom(c.budget),
  applicationDeadline: c.deadline,
  deliverables: c.deliverables,
  creatorsNeeded: c.creators_needed,
  minFollowers: c.min_followers ?? undefined,
  status: c.status,
  createdAt: c.created_at,
});

export type CampaignListParams = { status?: CampaignStatus };

export const listBrandCampaigns = async (p: CampaignListParams = {}): Promise<Campaign[]> => {
  const query: Record<string, string> = {};
  if (p.status) query.status = p.status;
  const data = await request<ApiCampaign[] | { results: ApiCampaign[] }>('brand/campaigns/', { query });
  return unwrapList<ApiCampaign>(data).map(mapBrandCampaign);
};

export const listCreatorCampaigns = async (filters: {
  q?: string;
  niche?: Niche;
  platform?: Platform;
  minBudget?: number;
  deadlineBefore?: string;
} = {}): Promise<Campaign[]> => {
  const query: Record<string, string | number> = {};
  if (filters.q) query.search = filters.q;
  if (filters.niche) query.niche = nicheToBackend(filters.niche);
  if (filters.platform) query.platform = platformToBackend(filters.platform);
  if (filters.minBudget) query.min_budget = filters.minBudget;
  if (filters.deadlineBefore) query.deadline_before = filters.deadlineBefore;
  const data = await request<ApiCampaignCard[] | { results: ApiCampaignCard[] }>('campaigns/', { query });
  return unwrapList<ApiCampaignCard>(data).map(mapCampaignCard);
};

export const fetchCreatorCampaign = async (id: string | number): Promise<{
  campaign: Campaign;
  acceptedCount: number;
  allSelected: boolean;
  canApply: boolean;
  applyBlockedReason: string | null;
}> => {
  const data = await request<ApiCampaignDetail>(`campaigns/${id}/`);
  return {
    campaign: mapCampaignDetail(data),
    acceptedCount: data.accepted_count,
    allSelected: data.all_creators_selected,
    canApply: data.can_apply,
    applyBlockedReason: data.apply_blocked_reason,
  };
};

export const fetchBrandCampaign = async (id: string | number): Promise<Campaign> => {
  const data = await request<ApiCampaign>('brand/campaigns/' + id + '/');
  return mapBrandCampaign(data);
};

export type CreateCampaignInput = {
  title: string;
  description: string;
  niche: Niche;
  platform: Platform;
  budget: number;
  deadline: string; // ISO
  deliverables: string;
  creatorsNeeded: number;
  minFollowers?: number;
};

export const createCampaign = async (input: CreateCampaignInput): Promise<Campaign> => {
  const body: Record<string, unknown> = {
    title: input.title,
    description: input.description,
    niche: nicheToBackend(input.niche),
    platform: platformToBackend(input.platform),
    budget: input.budget,
    deadline: input.deadline,
    deliverables: input.deliverables,
    creators_needed: input.creatorsNeeded,
  };
  if (input.minFollowers !== undefined) body.min_followers = input.minFollowers;
  const data = await request<ApiCampaign>('brand/campaigns/', { method: 'POST', body });
  return mapBrandCampaign(data);
};

export const updateCampaign = async (
  id: string | number,
  patch: Partial<CreateCampaignInput>,
): Promise<Campaign> => {
  const body: Record<string, unknown> = {};
  if (patch.title !== undefined) body.title = patch.title;
  if (patch.description !== undefined) body.description = patch.description;
  if (patch.niche !== undefined) body.niche = nicheToBackend(patch.niche);
  if (patch.platform !== undefined) body.platform = platformToBackend(patch.platform);
  if (patch.budget !== undefined) body.budget = patch.budget;
  if (patch.deadline !== undefined) body.deadline = patch.deadline;
  if (patch.deliverables !== undefined) body.deliverables = patch.deliverables;
  if (patch.creatorsNeeded !== undefined) body.creators_needed = patch.creatorsNeeded;
  if (patch.minFollowers !== undefined) body.min_followers = patch.minFollowers;
  const data = await request<ApiCampaign>('brand/campaigns/' + id + '/', { method: 'PATCH', body });
  return mapBrandCampaign(data);
};

export const deleteCampaign = async (id: string | number) => {
  await request('brand/campaigns/' + id + '/', { method: 'DELETE' });
};

export const publishCampaign = async (id: string | number): Promise<Campaign> => {
  const data = await request<ApiCampaign>('brand/campaigns/' + id + '/publish/', { method: 'POST' });
  return mapBrandCampaign(data);
};

export const closeCampaign = async (id: string | number): Promise<Campaign> => {
  const data = await request<ApiCampaign>('brand/campaigns/' + id + '/close/', { method: 'POST' });
  return mapBrandCampaign(data);
};

// ----- Proposals ------------------------------------------------------------

type ApiProposal = {
  id: number;
  campaign_id: number;
  status: ProposalStatus;
  proposed_rate: string;
  cover_message: string;
  portfolio_links: string[];
  experience_note: string;
  withdrawal_reason: string | null;
  completed_at: string | null;
  created_at: string;
};

type ApiBrandProposal = {
  id: number;
  creator: {
    id: number;
    name: string;
    niche: string | null;
    platform: string | null;
    followers: number | null;
    engagement_rate: string | null;
    is_verified: boolean;
    rating_avg: string | null;
    rating_count: number;
  };
  proposed_rate: string;
  cover_message: string;
  portfolio_links: string[];
  experience_note: string;
  status: ProposalStatus;
  withdrawal_reason: string | null;
  profile_url: string;
  completed_at: string | null;
  created_at: string;
};

type ApiMyProposal = {
  id: number;
  status: ProposalStatus;
  proposed_rate: string;
  created_at: string;
  completed_at: string | null;
  withdrawal_reason: string | null;
  campaign: { id: number; title: string; status: CampaignStatus; brand: { id: number; name: string } };
};

const proposalPortfolioFrom = (links: string[]): PortfolioLink[] =>
  links.map((url, i) => ({ id: 'p' + i, url, title: undefined }));

const proposalPortfolioTo = (links: PortfolioLink[]): string[] =>
  links.map((l) => l.url).filter(Boolean);

export const mapMyProposal = (p: ApiMyProposal): MyProposal => ({
  id: String(p.id),
  campaignId: String(p.campaign.id),
  creatorId: '',
  creatorName: '',
  creatorNiche: 'Lifestyle',
  creatorPlatform: 'YouTube',
  creatorFollowers: 0,
  creatorEngagement: 0,
  coverMessage: '',
  proposedRate: numFrom(p.proposed_rate),
  portfolio: [],
  relevantExperience: '',
  status: p.status,
  submittedAt: p.created_at,
  withdrawReason: p.withdrawal_reason ?? undefined,
  completedAt: p.completed_at ?? undefined,
  campaignTitle: p.campaign.title,
  brandName: p.campaign.brand.name,
  brandId: String(p.campaign.brand.id),
  campaignStatus: p.campaign.status,
});

export const mapBrandProposal = (p: ApiBrandProposal): Proposal => ({
  id: String(p.id),
  campaignId: '',
  creatorId: String(p.creator.id),
  creatorName: p.creator.name,
  creatorNiche: nicheFromBackend(p.creator.niche),
  creatorPlatform: platformFromBackend(p.creator.platform),
  creatorFollowers: p.creator.followers ?? 0,
  creatorEngagement: p.creator.engagement_rate ? numFrom(p.creator.engagement_rate) : 0,
  coverMessage: p.cover_message,
  proposedRate: numFrom(p.proposed_rate),
  portfolio: proposalPortfolioFrom(p.portfolio_links ?? []),
  relevantExperience: p.experience_note ?? '',
  status: p.status,
  submittedAt: p.created_at,
  withdrawReason: p.withdrawal_reason ?? undefined,
  completedAt: p.completed_at ?? undefined,
});

export const listMyProposals = async (filter?: { status?: ProposalStatus }): Promise<MyProposal[]> => {
  const query: Record<string, string> = {};
  if (filter?.status) query.status = filter.status;
  const data = await request<ApiMyProposal[] | { results: ApiMyProposal[] }>('creators/me/proposals/', { query });
  return unwrapList<ApiMyProposal>(data).map(mapMyProposal);
};

export const listBrandCampaignProposals = async (
  campaignId: string | number,
  filter?: { status?: ProposalStatus },
): Promise<{ results: Proposal[]; acceptedCount: number; creatorsNeeded: number }> => {
  const query: Record<string, string> = {};
  if (filter?.status) query.status = filter.status;
  const data = await request<{
    count: number;
    next: string | null;
    previous: string | null;
    results: ApiBrandProposal[];
    accepted_count: number;
    creators_needed: number;
  }>('brand/campaigns/' + campaignId + '/proposals/', { query });
  return {
    results: data.results.map(mapBrandProposal),
    acceptedCount: data.accepted_count,
    creatorsNeeded: data.creators_needed,
  };
};

export const submitProposal = async (input: {
  campaignId: string | number;
  coverMessage: string;
  proposedRate: number;
  portfolioLinks: PortfolioLink[];
  experienceNote: string;
}): Promise<Proposal> => {
  const data = await request<ApiProposal>('campaigns/' + input.campaignId + '/proposals/', {
    method: 'POST',
    body: {
      cover_message: input.coverMessage,
      proposed_rate: input.proposedRate,
      portfolio_links: proposalPortfolioTo(input.portfolioLinks),
      experience_note: input.experienceNote,
    },
  });
  return mapMyProposal({
    id: data.id,
    status: data.status,
    proposed_rate: data.proposed_rate,
    created_at: data.created_at,
    completed_at: data.completed_at,
    withdrawal_reason: data.withdrawal_reason,
    campaign: { id: data.campaign_id, title: '', status: 'published', brand: { id: 0, name: '' } },
  });
};

export const withdrawProposal = async (id: string | number, reason?: string): Promise<void> => {
  await request('creators/me/proposals/' + id + '/withdraw/', {
    method: 'POST',
    body: { reason: reason ?? '' },
  });
};

export const shortlistProposal = async (id: string | number) =>
  request<{ id: number; status: ProposalStatus; accepted_count: number; creators_needed: number }>(
    'brand/proposals/' + id + '/shortlist/',
    { method: 'POST' },
  );

export const acceptProposal = async (id: string | number) =>
  request<{ id: number; status: ProposalStatus; accepted_count: number; creators_needed: number }>(
    'brand/proposals/' + id + '/accept/',
    { method: 'POST' },
  );

export const rejectProposal = async (id: string | number) =>
  request<{ id: number; status: ProposalStatus; accepted_count: number; creators_needed: number }>(
    'brand/proposals/' + id + '/reject/',
    { method: 'POST' },
  );

// ----- Notifications --------------------------------------------------------

type ApiNotification = {
  id: number;
  kind: string;
  message: string;
  payload: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
};

const NOTIF_KIND_TO_UI: Record<string, AppNotification['type']> = {
  proposal_shortlisted: 'proposal_shortlisted',
  proposal_accepted: 'proposal_accepted',
  proposal_rejected: 'proposal_rejected',
  proposal_received: 'proposal_received',
  proposal_withdrawn: 'proposal_withdrawn',
  account_reconnect: 'account_reconnect',
  slot_opened: 'slot_opened',
  campaign_closed: 'campaign_closed',
};

const kindToTitle = (kind: string): string => {
  const map: Record<string, string> = {
    proposal_shortlisted: 'You were shortlisted',
    proposal_accepted: 'Proposal accepted',
    proposal_rejected: 'Proposal rejected',
    proposal_received: 'New proposal received',
    proposal_withdrawn: 'A creator withdrew',
    account_reconnect: 'Reconnect your account',
    slot_opened: 'Slot opened',
    campaign_closed: 'Campaign closed',
  };
  return map[kind] ?? 'Update';
};

const kindToLink = (kind: string, payload: Record<string, unknown> | null): string | undefined => {
  if (!payload) return undefined;
  const id = payload.proposal_id ?? payload.campaign_id;
  if (kind === 'proposal_received' || kind === 'proposal_withdrawn' || kind === 'slot_opened' || kind === 'campaign_closed') {
    return id ? `/brand/campaigns/${id}/proposals` : '/brand/campaigns';
  }
  if (kind === 'proposal_shortlisted' || kind === 'proposal_accepted' || kind === 'proposal_rejected') {
    return id ? `/creator/applications/${id}` : '/creator/applications';
  }
  if (kind === 'account_reconnect') return '/creator/accounts';
  return undefined;
};

export const mapNotification = (n: ApiNotification): AppNotification => ({
  id: String(n.id),
  type: NOTIF_KIND_TO_UI[n.kind] ?? 'proposal_received',
  title: kindToTitle(n.kind),
  description: n.message,
  createdAt: n.created_at,
  read: n.is_read,
  link: kindToLink(n.kind, n.payload),
});

export const listNotifications = async (): Promise<{
  results: AppNotification[];
  unreadCount: number;
}> => {
  const data = await request<{
    count: number;
    next: string | null;
    previous: string | null;
    results: ApiNotification[];
    unread_count: number;
  }>('notifications/');
  return {
    results: data.results.map(mapNotification),
    unreadCount: data.unread_count,
  };
};

export const markNotificationRead = async (id: string | number) => {
  const data = await request<ApiNotification>('notifications/' + id + '/read/', { method: 'POST' });
  return mapNotification(data);
};

export const markAllNotificationsRead = async (): Promise<number> => {
  const data = await request<{ marked_read: number }>('notifications/read-all/', { method: 'POST' });
  return data.marked_read;
};

// ----- YouTube connection ---------------------------------------------------

export type YouTubeStatus = {
  connected: boolean;
  status: ConnectedAccount['status'] | null;
  needsReconnect: boolean;
  connectedAt: string | null;
  lastSyncedAt: string | null;
};

export const fetchYouTubeStatus = async (): Promise<YouTubeStatus> => {
  const data = await request<{
    connected: boolean;
    status: string | null;
    needs_reconnect: boolean;
    connected_at: string | null;
    last_synced_at: string | null;
  }>('social/youtube/');
  return {
    connected: data.connected,
    status: (data.status as ConnectedAccount['status']) ?? null,
    needsReconnect: data.needs_reconnect,
    connectedAt: data.connected_at,
    lastSyncedAt: data.last_synced_at,
  };
};

export const startYouTubeConnect = async (): Promise<string> => {
  const data = await request<{ authorization_url: string }>('social/youtube/connect/');
  return data.authorization_url;
};

export const refreshYouTube = async () => {
  await request('social/youtube/refresh/', { method: 'POST' });
};

export const disconnectYouTube = async () => {
  await request('social/youtube/', { method: 'DELETE' });
};

// ----- Email verification + Notification Settings (FR-24) ------------------

export const verifyEmail = async (code: string) => {
  const data = await request<ApiUser>('auth/email/verify/', {
    method: 'POST',
    body: { code },
  });
  return mapUser(data);
};

export const resendVerificationEmail = async (): Promise<{ detail: string }> => {
  return request<{ detail: string }>('auth/email/resend/', { method: 'POST' });
};

export type NotificationSettings = {
  emailEnabled: boolean;
  emailVerified: boolean;
};

export const fetchNotificationSettings = async (): Promise<NotificationSettings> => {
  const data = await request<{ email_enabled: boolean; email_verified: boolean }>(
    'settings/notifications/',
  );
  return { emailEnabled: data.email_enabled, emailVerified: data.email_verified };
};

export const updateNotificationSettings = async (
  patch: { emailEnabled?: boolean },
): Promise<NotificationSettings> => {
  const body: Record<string, unknown> = {};
  if (patch.emailEnabled !== undefined) body.email_enabled = patch.emailEnabled;
  const data = await request<{ email_enabled: boolean; email_verified: boolean }>(
    'settings/notifications/',
    { method: 'PATCH', body },
  );
  return { emailEnabled: data.email_enabled, emailVerified: data.email_verified };
};

// ----- Dashboards (FR-17, FR-18) -------------------------------------------

export type CreatorDashboardData = {
  profileCompletion: number;
  youtube: { connected: boolean; status: ConnectedAccount['status'] | null; needsReconnect: boolean; lastSyncedAt: string | null; isOutdated: boolean };
  availableCampaigns: Campaign[];
  applications: MyProposal[];
  acceptedCampaigns: MyProposal[];
  performance: { proposalsSent: number; accepted: number; acceptanceRate: number | null };
};

type ApiCreatorDashboard = {
  profile_completion: number;
  youtube: {
    connected: boolean;
    status: string | null;
    needs_reconnect: boolean;
    last_synced_at: string | null;
    is_outdated: boolean;
  };
  available_campaigns: ApiCampaignCard[];
  applications: ApiMyProposal[];
  accepted_campaigns: ApiMyProposal[];
  performance: { proposals_sent: number; accepted: number; acceptance_rate: number | null };
};

export const fetchCreatorDashboard = async (): Promise<CreatorDashboardData> => {
  const data = await request<ApiCreatorDashboard>('creators/me/dashboard/');
  return {
    profileCompletion: data.profile_completion,
    youtube: {
      connected: data.youtube.connected,
      status: (data.youtube.status as ConnectedAccount['status']) ?? null,
      needsReconnect: data.youtube.needs_reconnect,
      lastSyncedAt: data.youtube.last_synced_at,
      isOutdated: data.youtube.is_outdated,
    },
    availableCampaigns: data.available_campaigns.map(mapCampaignCard),
    applications: data.applications.map(mapMyProposal),
    acceptedCampaigns: data.accepted_campaigns.map(mapMyProposal),
    performance: {
      proposalsSent: data.performance.proposals_sent,
      accepted: data.performance.accepted,
      acceptanceRate: data.performance.acceptance_rate,
    },
  };
};

export type BrandDashboardData = {
  totalCampaigns: number;
  activeCampaigns: number;
  totalProposals: number;
  shortlistedCount: number;
  acceptedCount: number;
  campaigns: Array<{
    id: number;
    title: string;
    status: CampaignStatus;
    proposalsUrl: string;
    proposalCount: number;
    acceptedCount: number;
    creatorsNeeded: number;
  }>;
};

type ApiBrandDashboard = {
  total_campaigns: number;
  active_campaigns: number;
  total_proposals: number;
  shortlisted_count: number;
  accepted_count: number;
  campaigns: Array<{
    id: number;
    title: string;
    status: CampaignStatus;
    proposals_url: string;
    proposal_count: number;
    accepted_count: number;
    creators_needed: number;
  }>;
};

export const fetchBrandDashboard = async (): Promise<BrandDashboardData> => {
  const data = await request<ApiBrandDashboard>('brands/me/dashboard/');
  return {
    totalCampaigns: data.total_campaigns,
    activeCampaigns: data.active_campaigns,
    totalProposals: data.total_proposals,
    shortlistedCount: data.shortlisted_count,
    acceptedCount: data.accepted_count,
    campaigns: data.campaigns.map((c) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      proposalsUrl: c.proposals_url,
      proposalCount: c.proposal_count,
      acceptedCount: c.accepted_count,
      creatorsNeeded: c.creators_needed,
    })),
  };
};

// ----- Campaign analytics (FR-23) ------------------------------------------

export type CampaignMetrics = {
  views: number;
  funnel: { received: number; shortlisted: number; accepted: number; rejected: number; withdrawn: number };
  acceptedVsNeeded: { accepted: number; needed: number };
  avgProposedRate: number | null;
  budgetPerCreator: number;
  acceptanceRate: number | null;
};

export const fetchCampaignAnalytics = async (id: number | string): Promise<CampaignMetrics> => {
  const data = await request<{
    views: number;
    funnel: { received: number; shortlisted: number; accepted: number; rejected: number; withdrawn: number };
    accepted_vs_needed: { accepted: number; needed: number };
    avg_proposed_rate: string | null;
    budget_per_creator: string;
    acceptance_rate: number | null;
  }>('brand/campaigns/' + id + '/analytics/');
  return {
    views: data.views,
    funnel: data.funnel,
    acceptedVsNeeded: data.accepted_vs_needed,
    avgProposedRate: data.avg_proposed_rate ? numFrom(data.avg_proposed_rate) : null,
    budgetPerCreator: numFrom(data.budget_per_creator),
    acceptanceRate: data.acceptance_rate,
  };
};

// ----- Deliverables + completion (FR-20) -----------------------------------

export type Deliverable = {
  id: number;
  postUrl: string;
  platform: Platform;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type CampaignDeliverableRow = {
  proposalId: number;
  creator: { id: number; name: string };
  completedAt: string | null;
  deliverables: Deliverable[];
};

const mapDeliverable = (d: { id: number; post_url: string; platform: string; note: string; created_at: string; updated_at: string }): Deliverable => ({
  id: d.id,
  postUrl: d.post_url,
  platform: platformFromBackend(d.platform),
  note: d.note,
  createdAt: d.created_at,
  updatedAt: d.updated_at,
});

export const listMyDeliverables = async (proposalId: number | string): Promise<Deliverable[]> => {
  const data = await request<Array<{ id: number; post_url: string; platform: string; note: string; created_at: string; updated_at: string }>>(
    'creators/me/proposals/' + proposalId + '/deliverables/',
  );
  return data.map(mapDeliverable);
};

export const addDeliverable = async (
  proposalId: number | string,
  input: { postUrl: string; platform: Platform; note?: string },
): Promise<Deliverable> => {
  const data = await request<{ id: number; post_url: string; platform: string; note: string; created_at: string; updated_at: string }>(
    'creators/me/proposals/' + proposalId + '/deliverables/',
    { method: 'POST', body: { post_url: input.postUrl, platform: platformToBackend(input.platform), note: input.note ?? '' } },
  );
  return mapDeliverable(data);
};

export const updateDeliverable = async (
  proposalId: number | string,
  deliverableId: number | string,
  patch: { postUrl?: string; platform?: Platform; note?: string },
): Promise<Deliverable> => {
  const body: Record<string, unknown> = {};
  if (patch.postUrl !== undefined) body.post_url = patch.postUrl;
  if (patch.platform !== undefined) body.platform = platformToBackend(patch.platform);
  if (patch.note !== undefined) body.note = patch.note;
  const data = await request<{ id: number; post_url: string; platform: string; note: string; created_at: string; updated_at: string }>(
    'creators/me/proposals/' + proposalId + '/deliverables/' + deliverableId + '/',
    { method: 'PATCH', body },
  );
  return mapDeliverable(data);
};

export const deleteDeliverable = async (proposalId: number | string, deliverableId: number | string) => {
  await request('creators/me/proposals/' + proposalId + '/deliverables/' + deliverableId + '/', { method: 'DELETE' });
};

export const completeProposal = async (proposalId: number | string): Promise<{ id: number; status: ProposalStatus; completedAt: string | null }> => {
  const data = await request<{ id: number; status: ProposalStatus; completed_at: string | null }>('brand/proposals/' + proposalId + '/complete/', { method: 'POST' });
  return { id: data.id, status: data.status, completedAt: data.completed_at };
};

export const listCampaignDeliverables = async (campaignId: number | string): Promise<CampaignDeliverableRow[]> => {
  const data = await request<Array<{
    proposal_id: number;
    creator: { id: number; name: string };
    completed_at: string | null;
    deliverables: Array<{ id: number; post_url: string; platform: string; note: string; created_at: string; updated_at: string }>;
  }>>('brand/campaigns/' + campaignId + '/deliverables/');
  return data.map((row) => ({
    proposalId: row.proposal_id,
    creator: row.creator,
    completedAt: row.completed_at,
    deliverables: row.deliverables.map(mapDeliverable),
  }));
};

// ----- Reviews (FR-21) ------------------------------------------------------

export type Review = {
  id: number;
  rating: number;
  text: string;
  brand: { id: number; name: string };
  campaign: { id: number; title: string };
  createdAt: string;
};

export const createReview = async (
  proposalId: number | string,
  input: { rating: number; text?: string },
): Promise<Review> => {
  const data = await request<{ id: number; rating: number; text: string; brand: { id: number; name: string }; campaign: { id: number; title: string }; created_at: string }>(
    'brand/proposals/' + proposalId + '/review/',
    { method: 'POST', body: { rating: input.rating, text: input.text ?? '' } },
  );
  return {
    id: data.id,
    rating: data.rating,
    text: data.text,
    brand: data.brand,
    campaign: data.campaign,
    createdAt: data.created_at,
  };
};

export const listCreatorReviews = async (userId: number | string): Promise<Review[]> => {
  const data = await request<Array<{ id: number; rating: number; text: string; brand: { id: number; name: string }; campaign: { id: number; title: string }; created_at: string }>>(
    'creators/' + userId + '/reviews/',
  );
  return data.map((r) => ({
    id: r.id,
    rating: r.rating,
    text: r.text,
    brand: r.brand,
    campaign: r.campaign,
    createdAt: r.created_at,
  }));
};

// ----- Admin panel (FR-22) -------------------------------------------------

export type AdminUser = {
  id: number;
  fullName: string;
  email: string;
  username: string;
  role: Role;
  status: 'active' | 'suspended';
  emailVerified: boolean;
  dateJoined: string;
};

export type AdminAction = {
  id: number;
  admin: { id: number; username: string };
  action: string;
  targetType: string;
  targetId: number;
  targetLabel: string;
  reason: string;
  createdAt: string;
};

export type AdminOverview = {
  users: { total: number; suspended: number; byRole: Record<string, number> };
  signups: Array<{ date: string; count: number }>;
  campaignsByStatus: Record<string, number>;
  totalProposals: number;
};

export const adminLogin = async (input: { identifier: string; password: string }): Promise<{ access: string; user: User }> => {
  const data = await request<{ access: string; user: ApiUser }>('admin/auth/login/', {
    method: 'POST',
    body: { identifier: input.identifier, password: input.password },
    anonymous: true,
  });
  return { access: data.access, user: mapUser(data.user) };
};

export const listAdminUsers = async (params: { q?: string; role?: Role; status?: 'active' | 'suspended' } = {}): Promise<AdminUser[]> => {
  const query: Record<string, string> = {};
  if (params.q) query.q = params.q;
  if (params.role) query.role = params.role;
  if (params.status) query.status = params.status;
  const data = await request<Array<{
    id: number; full_name: string; email: string; username: string; role: Role;
    status: 'active' | 'suspended'; email_verified: boolean; date_joined: string;
  }>>('admin/users/', { query });
  return data.map((u) => ({
    id: u.id,
    fullName: u.full_name,
    email: u.email,
    username: u.username,
    role: u.role,
    status: u.status,
    emailVerified: u.email_verified,
    dateJoined: u.date_joined,
  }));
};

export const suspendAdminUser = async (userId: number | string, reason: string): Promise<AdminUser> => {
  const data = await request<{
    id: number; full_name: string; email: string; username: string; role: Role;
    status: 'active' | 'suspended'; email_verified: boolean; date_joined: string;
  }>('admin/users/' + userId + '/suspend/', { method: 'POST', body: { reason } });
  return {
    id: data.id, fullName: data.full_name, email: data.email, username: data.username,
    role: data.role, status: data.status, emailVerified: data.email_verified, dateJoined: data.date_joined,
  };
};

export const reactivateAdminUser = async (userId: number | string, reason: string): Promise<AdminUser> => {
  const data = await request<{
    id: number; full_name: string; email: string; username: string; role: Role;
    status: 'active' | 'suspended'; email_verified: boolean; date_joined: string;
  }>('admin/users/' + userId + '/reactivate/', { method: 'POST', body: { reason } });
  return {
    id: data.id, fullName: data.full_name, email: data.email, username: data.username,
    role: data.role, status: data.status, emailVerified: data.email_verified, dateJoined: data.date_joined,
  };
};

export const deleteAdminUser = async (userId: number | string, reason: string) => {
  await request('admin/users/' + userId + '/', { method: 'DELETE', body: { reason } });
};

export const closeAdminCampaign = async (campaignId: number | string, reason: string) => {
  return request<{ id: number; title: string; status: CampaignStatus; closed_at: string | null }>(
    'admin/campaigns/' + campaignId + '/close/',
    { method: 'POST', body: { reason } },
  );
};

export const deleteAdminReview = async (reviewId: number | string, reason: string) => {
  await request('admin/reviews/' + reviewId + '/', { method: 'DELETE', body: { reason } });
};

export const listAdminActions = async (): Promise<AdminAction[]> => {
  const data = await request<Array<{
    id: number;
    admin: { id: number; username: string };
    action: string;
    target_type: string;
    target_id: number;
    target_label: string;
    reason: string;
    created_at: string;
  }>>('admin/actions/');
  return data.map((a) => ({
    id: a.id,
    admin: a.admin,
    action: a.action,
    targetType: a.target_type,
    targetId: a.target_id,
    targetLabel: a.target_label,
    reason: a.reason,
    createdAt: a.created_at,
  }));
};

export const fetchAdminOverview = async (): Promise<AdminOverview> => {
  const data = await request<{
    users: { total: number; suspended: number; by_role: Record<string, number> };
    signups: Array<{ date: string; count: number }>;
    campaigns_by_status: Record<string, number>;
    total_proposals: number;
  }>('admin/overview/');
  return {
    users: { total: data.users.total, suspended: data.users.suspended, byRole: data.users.by_role },
    signups: data.signups,
    campaignsByStatus: data.campaigns_by_status,
    totalProposals: data.total_proposals,
  };
};
