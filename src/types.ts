export type Role = 'creator' | 'brand' | 'admin';

export type User = {
  id: string;
  role: Role;
  fullName: string;
  email: string;
  username: string;
  mobile?: string;
  avatarUrl?: string;
  emailVerified?: boolean;
  emailNotificationsEnabled?: boolean;
};

export type Niche =
  | 'Fashion'
  | 'Beauty'
  | 'Fitness'
  | 'Tech'
  | 'Gaming'
  | 'Food'
  | 'Travel'
  | 'Lifestyle'
  | 'Finance'
  | 'Education';

export type Platform = 'YouTube' | 'Instagram' | 'TikTok' | 'Facebook';

export type CreatorProfile = {
  id: string;
  fullName: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio: string;
  niche: Niche;
  primaryPlatform: Platform;
  location: string;
  ratePerPost: number;
  ratePerStory: number;
  ratePerVideo: number;
  followers: number;
  engagementRate: number; // %
  verified: boolean;
  connectedAccount?: ConnectedAccount;
  portfolio: PortfolioLink[];
  ratingAvg?: number | null;
  ratingCount?: number;
};

export type ConnectedAccount = {
  id: string;
  platform: Platform;
  handle: string;
  verified: boolean;
  lastSyncedAt: string; // ISO
  status: 'connected' | 'expired' | 'revoked';
};

export type PortfolioLink = {
  id: string;
  url: string;
  title?: string;
};

export type BrandProfile = {
  id: string;
  companyName: string;
  industry: string;
  website: string;
  logoUrl?: string;
  coverUrl?: string;
  about: string;
  size?: '1–10' | '11–50' | '51–200' | '201–1000' | '1000+';
  headquarters?: string;
  foundedYear?: number;
};

export type CampaignStatus = 'draft' | 'published' | 'closed';

export type Campaign = {
  id: string;
  brandId: string;
  brandName: string;
  title: string;
  description: string;
  category: Niche;
  requiredPlatform: Platform;
  budgetPerCreator: number;
  applicationDeadline: string; // ISO date
  deliverables: string;
  creatorsNeeded: number;
  minFollowers?: number;
  status: CampaignStatus;
  createdAt: string;
};

export type ProposalStatus =
  | 'pending'
  | 'shortlisted'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

export type Proposal = {
  id: string;
  campaignId: string;
  creatorId: string;
  creatorName: string;
  creatorNiche: Niche;
  creatorPlatform: Platform;
  creatorFollowers: number;
  creatorEngagement: number;
  coverMessage: string;
  proposedRate: number;
  portfolio: PortfolioLink[];
  relevantExperience: string;
  status: ProposalStatus;
  submittedAt: string;
  withdrawReason?: string;
  completedAt?: string;
};

export type NotificationType =
  | 'proposal_shortlisted'
  | 'proposal_accepted'
  | 'proposal_rejected'
  | 'account_reconnect'
  | 'proposal_received'
  | 'proposal_withdrawn'
  | 'slot_opened'
  | 'campaign_closed';

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  link?: string;
};

/**
 * A proposal as it appears in the creator's "My applications" list.
 * The backend joins the campaign + brand summary inline, so we carry those
 * alongside the standard proposal fields.
 */
export type MyProposal = Proposal & {
  campaignTitle: string;
  brandName: string;
  brandId: string;
  campaignStatus: CampaignStatus;
};
