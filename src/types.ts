export type Role = 'creator' | 'brand';

export type User = {
  id: string;
  role: Role;
  fullName: string;
  email: string;
  username: string;
  mobile?: string;
  avatarUrl?: string;
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
  about: string;
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
