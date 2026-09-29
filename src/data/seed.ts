import type {
  AppNotification,
  Campaign,
  ConnectedAccount,
  CreatorProfile,
  BrandProfile,
  Proposal,
} from '../types';

export const NICHES = [
  'Fashion',
  'Beauty',
  'Fitness',
  'Tech',
  'Gaming',
  'Food',
  'Travel',
  'Lifestyle',
  'Finance',
  'Education',
] as const;

export const PLATFORMS = ['YouTube', 'Instagram', 'TikTok', 'Facebook'] as const;

export const seedBrand: BrandProfile = {
  id: 'brand_1',
  companyName: 'Northwind Beverages',
  industry: 'Food & Beverage',
  website: 'https://northwind.example.com',
  logoUrl: '',
  about:
    'Northwind crafts small-batch cold brew and adaptogenic drinks for modern consumers. We partner with creators who genuinely love great taste.',
};

export const seedConnectedYouTube: ConnectedAccount = {
  id: 'acc_yt_1',
  platform: 'YouTube',
  handle: 'Avery Makes',
  verified: true,
  lastSyncedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  status: 'connected',
};

export const seedCreator: CreatorProfile = {
  id: 'creator_1',
  fullName: 'Avery Johnson',
  bio: 'Lifestyle creator focused on mindful routines, slow mornings, and cozy NYC apartments. I share what actually fits in a real schedule.',
  niche: 'Lifestyle',
  primaryPlatform: 'YouTube',
  location: 'Brooklyn, NY',
  ratePerPost: 450,
  ratePerStory: 180,
  ratePerVideo: 1200,
  followers: 38400,
  engagementRate: 4.8,
  verified: true,
  connectedAccount: seedConnectedYouTube,
  portfolio: [
    { id: 'p1', url: 'https://youtube.com/watch?v=sample1', title: 'Morning routine reel' },
    { id: 'p2', url: 'https://youtube.com/watch?v=sample2', title: 'Apartment tour' },
  ],
};

export const discoverableCreators: CreatorProfile[] = [
  seedCreator,
  {
    id: 'c_2',
    fullName: 'Maya Patel',
    bio: 'Beauty creator focused on clean skincare routines for sensitive skin.',
    niche: 'Beauty',
    primaryPlatform: 'Instagram',
    location: 'Los Angeles, CA',
    ratePerPost: 320,
    ratePerStory: 120,
    ratePerVideo: 850,
    followers: 52100,
    engagementRate: 6.2,
    verified: false,
    portfolio: [],
  },
  {
    id: 'c_3',
    fullName: 'Diego Romero',
    bio: 'Home cook sharing 20-minute weeknight dinners. Bilingual EN/ES.',
    niche: 'Food',
    primaryPlatform: 'TikTok',
    location: 'Austin, TX',
    ratePerPost: 280,
    ratePerStory: 110,
    ratePerVideo: 700,
    followers: 89400,
    engagementRate: 5.4,
    verified: true,
    portfolio: [],
  },
  {
    id: 'c_4',
    fullName: 'Priya Shah',
    bio: 'Personal finance for early-career designers. Spreadsheets that will not make you cry.',
    niche: 'Finance',
    primaryPlatform: 'YouTube',
    location: 'Seattle, WA',
    ratePerPost: 600,
    ratePerStory: 220,
    ratePerVideo: 1800,
    followers: 64200,
    engagementRate: 3.9,
    verified: true,
    portfolio: [],
  },
  {
    id: 'c_5',
    fullName: 'Jonas Kim',
    bio: 'Setup tours and dev tools. Long-form reviews of gear for indie hackers.',
    niche: 'Tech',
    primaryPlatform: 'YouTube',
    location: 'San Francisco, CA',
    ratePerPost: 520,
    ratePerStory: 200,
    ratePerVideo: 1500,
    followers: 41700,
    engagementRate: 4.1,
    verified: false,
    portfolio: [],
  },
  {
    id: 'c_6',
    fullName: 'Lena Okafor',
    bio: 'Strength training and mobility for desk workers. Form-first, no gimmicks.',
    niche: 'Fitness',
    primaryPlatform: 'Instagram',
    location: 'Chicago, IL',
    ratePerPost: 380,
    ratePerStory: 150,
    ratePerVideo: 950,
    followers: 28900,
    engagementRate: 7.1,
    verified: false,
    portfolio: [],
  },
  {
    id: 'c_7',
    fullName: 'Theo Laurent',
    bio: 'Backpacker documenting slow travel across Southeast Asia. Cinematic edits.',
    niche: 'Travel',
    primaryPlatform: 'YouTube',
    location: 'Bali, Indonesia',
    ratePerPost: 700,
    ratePerStory: 260,
    ratePerVideo: 2100,
    followers: 118300,
    engagementRate: 4.6,
    verified: true,
    portfolio: [],
  },
  {
    id: 'c_8',
    fullName: 'Hana Sato',
    bio: 'Cozy cooking, grocery hauls, and tiny kitchen hacks from a Tokyo apartment.',
    niche: 'Food',
    primaryPlatform: 'TikTok',
    location: 'Tokyo, Japan',
    ratePerPost: 340,
    ratePerStory: 130,
    ratePerVideo: 880,
    followers: 73200,
    engagementRate: 6.8,
    verified: true,
    portfolio: [],
  },
  {
    id: 'c_9',
    fullName: 'Marcus Bell',
    bio: 'Indie game reviews and devlog commentary. Plays everything weird.',
    niche: 'Gaming',
    primaryPlatform: 'YouTube',
    location: 'Manchester, UK',
    ratePerPost: 290,
    ratePerStory: 100,
    ratePerVideo: 780,
    followers: 51200,
    engagementRate: 3.4,
    verified: false,
    portfolio: [],
  },
  {
    id: 'c_10',
    fullName: 'Sienna Wright',
    bio: 'Capsule wardrobe styling for creative professionals. Less, but better.',
    niche: 'Fashion',
    primaryPlatform: 'Instagram',
    location: 'London, UK',
    ratePerPost: 420,
    ratePerStory: 160,
    ratePerVideo: 1100,
    followers: 39500,
    engagementRate: 5.0,
    verified: true,
    portfolio: [],
  },
];

const daysFromNow = (d: number) =>
  new Date(Date.now() + d * 24 * 60 * 60 * 1000).toISOString();

export const seedCampaigns: Campaign[] = [
  {
    id: 'camp_1',
    brandId: 'brand_1',
    brandName: 'Northwind Beverages',
    title: 'Launch our new adaptogenic cold brew',
    description:
      'We are launching a new line of adaptogenic cold brews and need creators who can tell a real, calm-morning story. We are not looking for a hard sell - we want honest reviews and lifestyle integration.',
    category: 'Food',
    requiredPlatform: 'YouTube',
    budgetPerCreator: 1200,
    applicationDeadline: daysFromNow(14),
    deliverables: '1 long-form video (8-12 min) + 1 short (60s) for Shorts',
    creatorsNeeded: 3,
    minFollowers: 20000,
    status: 'published',
    createdAt: daysFromNow(-7),
  },
  {
    id: 'camp_2',
    brandId: 'brand_1',
    brandName: 'Northwind Beverages',
    title: 'Summer hydration social series',
    description: 'Five creators, one summer. Looking for bright, energetic storytelling around hydration rituals.',
    category: 'Lifestyle',
    requiredPlatform: 'Instagram',
    budgetPerCreator: 450,
    applicationDeadline: daysFromNow(21),
    deliverables: '2 in-feed posts + 4 stories',
    creatorsNeeded: 5,
    status: 'published',
    createdAt: daysFromNow(-3),
  },
  {
    id: 'camp_3',
    brandId: 'brand_1',
    brandName: 'Northwind Beverages',
    title: 'Cozy morning recipe collabs',
    description: 'Quick recipes featuring our oat milk line. Warm, welcoming tone.',
    category: 'Food',
    requiredPlatform: 'TikTok',
    budgetPerCreator: 600,
    applicationDeadline: daysFromNow(9),
    deliverables: '3 TikToks',
    creatorsNeeded: 2,
    minFollowers: 30000,
    status: 'published',
    createdAt: daysFromNow(-2),
  },
  {
    id: 'camp_4',
    brandId: 'brand_1',
    brandName: 'Northwind Beverages',
    title: 'Holiday limited-edition unboxings',
    description: 'Sneak peek at our holiday packaging. Festive, premium, giftable.',
    category: 'Lifestyle',
    requiredPlatform: 'YouTube',
    budgetPerCreator: 900,
    applicationDeadline: daysFromNow(45),
    deliverables: '1 unboxing + 1 integration',
    creatorsNeeded: 4,
    status: 'draft',
    createdAt: daysFromNow(-1),
  },
  {
    id: 'camp_5',
    brandId: 'brand_1',
    brandName: 'Northwind Beverages',
    title: 'Q1 spring reset campaign',
    description: 'Closed campaign. Used for testing status transitions.',
    category: 'Lifestyle',
    requiredPlatform: 'YouTube',
    budgetPerCreator: 800,
    applicationDeadline: daysFromNow(-5),
    deliverables: '1 long-form video',
    creatorsNeeded: 2,
    status: 'closed',
    createdAt: daysFromNow(-30),
  },
];

export const seedProposals: Proposal[] = [
  {
    id: 'prop_1',
    campaignId: 'camp_1',
    creatorId: 'c_2',
    creatorName: 'Maya Patel',
    creatorNiche: 'Beauty',
    creatorPlatform: 'Instagram',
    creatorFollowers: 52100,
    creatorEngagement: 6.2,
    coverMessage:
      'Hi! I would love to weave the cold brew into my morning skincare routine videos - my audience already trusts me on calming rituals. I can shoot next week.',
    proposedRate: 1100,
    portfolio: [
      { id: 'pp1', url: 'https://instagram.com/p/sample', title: 'Morning routine' },
    ],
    relevantExperience: 'Worked with 3 beverage brands (Glossier, Drunk Elephant, Olipop).',
    status: 'shortlisted',
    submittedAt: daysFromNow(-3),
  },
  {
    id: 'prop_2',
    campaignId: 'camp_1',
    creatorId: 'c_4',
    creatorName: 'Priya Shah',
    creatorNiche: 'Finance',
    creatorPlatform: 'YouTube',
    creatorFollowers: 64200,
    creatorEngagement: 3.9,
    coverMessage:
      'My audience is full of professionals who actually drink cold brew while reviewing their monthly budgets. This is a natural fit.',
    proposedRate: 1500,
    portfolio: [],
    relevantExperience: 'Sponsored integrations with 4 CPG brands in 2024.',
    status: 'pending',
    submittedAt: daysFromNow(-1),
  },
  {
    id: 'prop_3',
    campaignId: 'camp_1',
    creatorId: 'c_5',
    creatorName: 'Jonas Kim',
    creatorNiche: 'Tech',
    creatorPlatform: 'YouTube',
    creatorFollowers: 41700,
    creatorEngagement: 4.1,
    coverMessage:
      'I run a desk-setup channel and a slow-morning routine is part of every setup video I post. Easy integration.',
    proposedRate: 1200,
    portfolio: [],
    relevantExperience: 'Mostly tech sponsors but open to CPG.',
    status: 'pending',
    submittedAt: daysFromNow(-2),
  },
  {
    id: 'prop_4',
    campaignId: 'camp_1',
    creatorId: 'c_8',
    creatorName: 'Hana Sato',
    creatorNiche: 'Food',
    creatorPlatform: 'TikTok',
    creatorFollowers: 73200,
    creatorEngagement: 6.8,
    coverMessage:
      'Tokyo-based food creator. I can do a morning recipe integration with the cold brew in a calm, cinematic style.',
    proposedRate: 900,
    portfolio: [],
    relevantExperience: 'Local Tokyo beverage collabs.',
    status: 'rejected',
    submittedAt: daysFromNow(-4),
  },
];

export const seedNotifications: AppNotification[] = [
  {
    id: 'n_1',
    type: 'proposal_shortlisted',
    title: 'You were shortlisted',
    description: 'Northwind Beverages shortlisted your proposal for "Launch our new adaptogenic cold brew".',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
    link: '/creator/applications',
  },
  {
    id: 'n_2',
    type: 'proposal_received',
    title: 'New proposal received',
    description: 'Maya Patel applied to "Launch our new adaptogenic cold brew".',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: false,
    link: '/brand/campaigns/camp_1/proposals',
  },
  {
    id: 'n_3',
    type: 'account_reconnect',
    title: 'Reconnect YouTube',
    description: 'Your YouTube connection expires soon. Reconnect to keep your stats verified.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
    link: '/creator/accounts',
  },
];

export const fmtNumber = (n: number): string => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1) + 'K';
  return n.toString();
};

export const fmtRelativeTime = (iso: string): string => {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.round(ms / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return m + 'm ago';
  const h = Math.round(m / 60);
  if (h < 24) return h + 'h ago';
  const d = Math.round(h / 24);
  if (d < 7) return d + 'd ago';
  return new Date(iso).toLocaleDateString();
};

export const fmtDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export const currency = (n: number): string =>
  '$' + n.toLocaleString(undefined, { maximumFractionDigits: 0 });
