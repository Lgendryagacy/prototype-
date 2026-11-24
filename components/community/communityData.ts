import { CommunityPost, CommunityNotification, CommunityConnection } from './types';

export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  // 1. PINNED & EXCLUSIVE FOGSLY NATIONAL GRANT
  {
    id: 'post-fogsly-grant',
    communityId: 'fogsly-universal',
    author: {
      id: 'fogsly-official',
      name: 'Fogsly Core Team',
      role: 'Official Platform Architecture & Ecosystem',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      verified: true,
      bio: 'The core engineering, talent vetting, and developer grant council behind Fogsly Pakistan.',
      company: 'Fogsly Global Ecosystem',
      location: 'Islamabad / Silicon Valley',
    },
    type: 'announcement',
    title: 'Fogsly Ecosystem Initiative: $15,000 National Tech Dev Grant & 2026 Global Remote Cohort',
    content: `We are thrilled to launch the Fogsly 2026 Ecosystem Acceleration Program — directly backing Pakistan's top engineers, SaaS creators, and open-source architects with non-dilutive capital and verified international pipeline placement.

EXCLUSIVE COHORT BENEFITS:
• $15,000 in direct non-equity milestone grants disbursed via escrow
• Direct 1-on-1 architecture reviews with Silicon Valley staff engineers & Y-Combinator alumni
• Fast-track interview access to 25+ vetted US/UK partner companies hiring at $4,000–$8,000/month
• $1,000 AWS & Google Cloud credits + free Fogsly Verified Pro Architect credentials
• Priority access to private client bounties with 0% platform commission

WHO SHOULD APPLY?
Full-stack engineers (Next.js/React/Node/Go/Rust), AI agents & LLM infrastructure builders, and senior freelancers ready to scale into high-ticket global consulting agencies.

Applications are reviewed on a rolling basis. All members of the Fogsly Community receive priority evaluation. Ask any questions below!`,
    tags: ['FogslyExclusive', 'DeveloperGrant', 'RemoteWork', 'TechPakistan', 'CareerGrowth'],
    createdAt: '30 mins ago',
    status: 'approved',
    isPinned: true,
    isFogslyExclusive: true,
    fogslyBadgeText: 'FOGSLY ECOSYSTEM INITIATIVE • $15,000 GRANT COHORT',
    viewsCount: 5420,
    likesCount: 384,
    dislikesCount: 4,
    likedByMe: true,
    dislikedByMe: false,
    savedByMe: true,
    commentsCount: 3,
    comments: [
      {
        id: 'comm-grant-1',
        postId: 'post-fogsly-grant',
        author: {
          id: 'user-daniyal',
          name: 'Daniyal Sheikh',
          role: 'Top-Rated Plus Agency Founder',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          verified: true,
        },
        content: 'This is monumental for Pakistan tech ecosystem! How will milestone evaluation work for developers building open-source developer tooling vs client-facing SaaS products?',
        createdAt: '20 mins ago',
        likesCount: 42,
        dislikesCount: 1,
        likedByMe: true,
        dislikedByMe: false,
        replies: [
          {
            id: 'rep-grant-1-1',
            commentId: 'comm-grant-1',
            author: {
              id: 'fogsly-official',
              name: 'Fogsly Core Team',
              role: 'Official Platform Architecture & Ecosystem',
              avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
              verified: true,
            },
            content: 'Great question Daniyal! Open-source tools are evaluated on GitHub velocity, test coverage, and ecosystem adoption, whereas SaaS products are judged on architecture resilience, load testing, and active user retention. Both tracks are equally funded!',
            createdAt: '12 mins ago',
            likesCount: 29,
            dislikesCount: 0,
            likedByMe: false,
            dislikedByMe: false,
            replyingToAuthorName: 'Daniyal Sheikh',
          },
          {
            id: 'rep-grant-1-2',
            commentId: 'comm-grant-1',
            author: {
              id: 'user-hamza-tariq',
              name: 'Hamza Tariq',
              role: 'Staff Engineer & International Consultant',
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
              verified: true,
            },
            content: 'Can confirm that the direct engineering reviews mentioned here are worth their weight in gold. Submitting two junior devs from my consulting group today.',
            createdAt: '8 mins ago',
            likesCount: 18,
            dislikesCount: 0,
            likedByMe: true,
            dislikedByMe: false,
            replyingToAuthorName: 'Daniyal Sheikh',
          }
        ]
      },
      {
        id: 'comm-grant-2',
        postId: 'post-fogsly-grant',
        author: {
          id: 'user-maria-ux',
          name: 'Maria Sohail',
          role: 'Principal Product Designer',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
          verified: true,
        },
        content: 'Are design system architects and technical product designers eligible to apply as solo founders or co-founders?',
        createdAt: '15 mins ago',
        likesCount: 19,
        dislikesCount: 0,
        likedByMe: false,
        dislikedByMe: false,
        replies: [
          {
            id: 'rep-grant-2-1',
            commentId: 'comm-grant-2',
            author: {
              id: 'fogsly-official',
              name: 'Fogsly Core Team',
              role: 'Official Platform Architecture & Ecosystem',
              avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
              verified: true,
            },
            content: '100% yes Maria! High-fidelity design systems paired with code implementations are highly prized in this cohort. We encourage you to submit.',
            createdAt: '6 mins ago',
            likesCount: 14,
            dislikesCount: 0,
            likedByMe: true,
            dislikedByMe: false,
            replyingToAuthorName: 'Maria Sohail',
          }
        ]
      }
    ]
  },

  // 2. EXCLUSIVE FOGSLY VETTED CAREER DROP
  {
    id: 'post-fogsly-jobs',
    communityId: 'fogsly-universal',
    author: {
      id: 'fogsly-talent',
      name: 'Fogsly Talent Engine',
      role: 'Verified Direct Talent & Escrow Desk',
      avatar: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=80',
      verified: true,
      bio: 'Direct, zero-commission verified placement for engineers and tech leads with US/UK international companies.',
      company: 'Fogsly Vetted Network',
      location: 'Global Remote',
    },
    type: 'opportunity',
    title: 'Fogsly Vetted Pipeline: 15 Direct-Hire Remote Senior Roles ($3,500 – $7,500/mo) — Zero Agency Fees, Escrow Protected',
    content: `The Fogsly Talent Engine has finalized exclusive contracts with 6 vetted venture-backed US & European startups actively hiring Pakistani technical talent this month.

FEATURED POSITIONS:
1. Staff Full-Stack Next.js 15 & AI Engineer ($5,500–$7,500/month) — SF AI Fintech
2. Senior Go & Distributed Systems Engineer ($4,500–$6,500/month) — London Cloud Security
3. Lead React Native & Web Performance Specialist ($4,000–$5,500/month) — Berlin HealthTech
4. AI Agent Workflow Architect (Python/LangGraph/Next.js) ($5,000–$7,000/month) — New York
5. Senior PostgreSQL & Database Reliability Engineer ($4,200–$6,000/month) — Austin SaaS

FOGSLY VETTED ADVANTAGES:
• 100% Direct Client Contracts (No agency cuts, zero percentage deducted)
• Guaranteed on-time monthly USD inward wire / Elevate / SadaPay transfers
• Verified Fogsly badge holders bypass automated ATS screens directly to CTO interview
• 1-Click application via your Fogsly Community profile`,
    tags: ['FogslyExclusive', 'RemoteJobs', 'USClients', 'Nextjs', 'HighSalary', 'VettedCareer'],
    createdAt: '2 hours ago',
    status: 'approved',
    isFogslyExclusive: true,
    fogslyBadgeText: 'FOGSLY VETTED PIPELINE • DIRECT INTERNATIONAL ROLES',
    viewsCount: 4180,
    likesCount: 295,
    dislikesCount: 2,
    likedByMe: true,
    dislikedByMe: false,
    savedByMe: true,
    opportunityData: {
      title: '15 Exclusive Remote Roles ($3,500–$7,500/mo)',
      company: 'Fogsly Global Partner Network',
      location: '100% Remote (Pakistan / Global)',
      type: 'Full-time',
      country: 'USA, UK & Europe',
      description: 'Exclusive direct-hire developer opportunities curated and escrow-vetted by Fogsly core talent engine.',
      stipendOrSalary: '$3,500 – $7,500 / month (USD Net Direct)',
      targetJobId: 'fogsly-exclusive-batch-2026',
      tags: ['Next.js', 'Go', 'AI Agents', 'PostgreSQL', 'USD Direct'],
    },
    commentsCount: 2,
    comments: [
      {
        id: 'comm-job-1',
        postId: 'post-fogsly-jobs',
        author: {
          id: 'user-asim-khan',
          name: 'Asim Khan',
          role: 'Senior React Developer',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
          verified: false,
        },
        content: 'Is an interview prep or portfolio review session provided for candidates before the direct CTO round?',
        createdAt: '1 hour ago',
        likesCount: 16,
        dislikesCount: 0,
        likedByMe: true,
        dislikedByMe: false,
        replies: [
          {
            id: 'rep-job-1-1',
            commentId: 'comm-job-1',
            author: {
              id: 'fogsly-talent',
              name: 'Fogsly Talent Engine',
              role: 'Verified Direct Talent & Escrow Desk',
              avatar: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=80',
              verified: true,
            },
            content: 'Yes! Every shortlisted candidate receives a 30-minute system design mock and portfolio polish session with a Fogsly mentor prior to the client interview.',
            createdAt: '40 mins ago',
            likesCount: 21,
            dislikesCount: 0,
            likedByMe: true,
            dislikedByMe: false,
            replyingToAuthorName: 'Asim Khan',
          }
        ]
      }
    ]
  },

  // 3. EXCLUSIVE FOGSLY RESEARCH COMPENSATION POLL
  {
    id: 'post-fogsly-poll',
    communityId: 'fogsly-universal',
    author: {
      id: 'fogsly-research',
      name: 'Fogsly Research & Intelligence',
      role: 'Official Market Research & Compensation Index',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      verified: true,
      bio: 'Publishing authoritative compensation benchmarks, market trends, and talent migration data for South Asian tech.',
      company: 'Fogsly Research Lab',
      location: 'Pakistan',
    },
    type: 'poll',
    title: 'Fogsly Compensation Benchmark: 2026 Transparent Software Engineer Salaries in Pakistan (Remote vs Hybrid vs Local)',
    content: `As part of the annual Fogsly Tech Benchmark Report, we are collecting anonymous, transparent compensation data across Pakistan's developer community.

Whether you work for a local software house, a VC-backed startup, or hold direct international client retainers — cast your honest vote to help junior and senior engineers benchmark their market worth accurately in 2026.`,
    tags: ['FogslyExclusive', 'Poll', 'SalaryBenchmark', 'RemoteUSD', 'Transparency'],
    createdAt: '3 hours ago',
    status: 'approved',
    isFogslyExclusive: true,
    fogslyBadgeText: 'FOGSLY RESEARCH • 2026 COMPENSATION BENCHMARK',
    viewsCount: 6890,
    likesCount: 412,
    dislikesCount: 5,
    likedByMe: true,
    dislikedByMe: false,
    savedByMe: true,
    pollData: {
      totalVotes: 864,
      userVotedOptionId: 'opt-sal-usd',
      options: [
        { id: 'opt-sal-usd', text: '$3,500+/mo (Direct International Retainer / US Client)', votes: 348 },
        { id: 'opt-sal-tier1', text: 'PKR 400k – 800k/mo (Senior / Lead in Top Local Tier-1)', votes: 262 },
        { id: 'opt-sal-mid', text: 'PKR 180k – 380k/mo (Mid-Level Full-Stack Developer)', votes: 174 },
        { id: 'opt-sal-entry', text: 'Under PKR 160k/mo (Junior / Associate / Trainee)', votes: 80 },
      ]
    },
    commentsCount: 2,
    comments: [
      {
        id: 'comm-poll-sal-1',
        postId: 'post-fogsly-poll',
        author: {
          id: 'user-hamza-tariq',
          name: 'Hamza Tariq',
          role: 'Staff Engineer & International Consultant',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
          verified: true,
        },
        content: 'Seeing the $3,500+ tier at over 40% of responses shows how rapidly Pakistani engineers have adopted international direct consulting. Two years ago this would have been under 10%.',
        createdAt: '2 hours ago',
        likesCount: 37,
        dislikesCount: 0,
        likedByMe: true,
        dislikedByMe: false,
        replies: [
          {
            id: 'rep-poll-sal-1-1',
            commentId: 'comm-poll-sal-1',
            author: {
              id: 'fogsly-research',
              name: 'Fogsly Research & Intelligence',
              role: 'Official Market Research & Compensation Index',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
              verified: true,
            },
            content: 'Spot on Hamza. The complete 30-page Fogsly Salary Whitepaper with role breakdowns, tax structures, and tech stack demand will be published free for all verified community members next week.',
            createdAt: '1 hour ago',
            likesCount: 25,
            dislikesCount: 0,
            likedByMe: false,
            dislikedByMe: false,
            replyingToAuthorName: 'Hamza Tariq',
          }
        ]
      }
    ]
  },

  // 4. EXCLUSIVE FOGSLY COMMUNITY REWARDS 3.0
  {
    id: 'post-fogsly-rewards',
    communityId: 'fogsly-universal',
    author: {
      id: 'fogsly-official',
      name: 'Fogsly Leadership Desk',
      role: 'Platform Engineering & Community Governance',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      verified: true,
      bio: 'Rewarding technical excellence, verified code reviews, and architectural problem solving.',
      company: 'Fogsly Ecosystem',
      location: 'Pakistan',
    },
    type: 'announcement',
    title: 'Fogsly Contributor Program: Earn Reputation Badges & Priority Escrow Placement for Technical Answers',
    content: `To incentivize deep architectural discussions over superficial questions, we have activated Community Rewards 3.0 across all active discussions:

HOW REWARDS WORK:
• Verified Answer Bounty: Earn 50 FOG Points when your solution is upvoted or marked helpful by the thread creator.
• Architectural Writeup Grant: Earn 200 FOG Points for in-depth case studies with benchmark latency stats or code snippets.
• Author Tipping: Tip fellow builders 25 FOG Points directly from any post using the "Tip FOG" button.

FOG Points can be redeemed for verified job application boosts, free portfolio reviews, and hackathon VIP passes. Start answering questions and building your professional reputation today!`,
    tags: ['FogslyExclusive', 'FOGCoins', 'Rewards', 'Reputation', 'CommunityUpdate'],
    createdAt: '4 hours ago',
    status: 'approved',
    isFogslyExclusive: true,
    fogslyBadgeText: 'FOGSLY CONTRIBUTOR PROGRAM • REPUTATION & REWARDS',
    viewsCount: 3260,
    likesCount: 210,
    dislikesCount: 1,
    likedByMe: false,
    dislikedByMe: false,
    savedByMe: false,
    commentsCount: 1,
    comments: [
      {
        id: 'comm-rew-1',
        postId: 'post-fogsly-rewards',
        author: {
          id: 'user-zainab-dev',
          name: 'Zainab Ahmed',
          role: 'Junior Frontend Developer',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        },
        content: 'Love this mechanism! It gives everyone real motivation to provide thoughtful, well-researched answers instead of one-liners.',
        createdAt: '3 hours ago',
        likesCount: 15,
        dislikesCount: 0,
        likedByMe: true,
        dislikedByMe: false,
        replies: []
      }
    ]
  },

  // 5. HIGH-SIGNAL FREELANCING DISCUSSION
  {
    id: 'post-freelance-1',
    communityId: 'fogsly-universal',
    author: {
      id: 'user-hamza-tariq',
      name: 'Hamza Tariq',
      role: 'Staff Engineer & International Consultant ($120k+ ARR)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      verified: true,
      bio: 'Helping Pakistani engineers transition from low-ticket Upwork bidding to $4k–$8k/month direct US/EU client retainers.',
      company: 'Independent Consultant',
      location: 'Lahore, Pakistan',
    },
    type: 'discussion',
    title: 'How I transitioned from $15/hr Upwork gigs to $5,000/month direct international retainers',
    content: `A lot of junior and mid-level devs in Pakistan get stuck in the Upwork proposal rat-race competing on price against thousands of bidders.

Here are the 4 changes that transformed my client acquisition:

1. Specializing in an expensive business bottleneck: Instead of saying "I build React websites", I framed myself as "I build high-conversion Next.js e-commerce storefronts that load in under 1 second and integrate with Stripe".
2. Building public proof-of-work: I published 2 deep-dive case studies on LinkedIn breaking down real client architecture, latency fixes, and database indexing.
3. Offering monthly async maintenance retainers: After delivering a project, always offer a $1k–$2k/mo retainer for bug fixes, performance monitoring, and weekly feature increments.
4. Setting up a seamless payment pipeline: Using modern inward banking rails with zero payment friction for US clients.

Stop competing on hourly rates. Price by the business value of the outcome. Happy to answer any questions in the thread!`,
    tags: ['Freelancing', 'RemoteWork', 'CareerGrowth', 'Nextjs', 'Consulting'],
    createdAt: '5 hours ago',
    status: 'approved',
    viewsCount: 2940,
    likesCount: 248,
    dislikesCount: 3,
    likedByMe: false,
    dislikedByMe: false,
    savedByMe: true,
    commentsCount: 2,
    comments: [
      {
        id: 'comm-fl-1',
        postId: 'post-freelance-1',
        author: {
          id: 'user-zainab-dev',
          name: 'Zainab Ahmed',
          role: 'Junior Frontend Developer',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        },
        content: 'How did you land your very first retainer client when you had no public testimonials yet? Did you offer a trial period?',
        createdAt: '4 hours ago',
        likesCount: 14,
        dislikesCount: 0,
        likedByMe: false,
        dislikedByMe: false,
        replies: [
          {
            id: 'rep-fl-1-1',
            commentId: 'comm-fl-1',
            author: {
              id: 'user-hamza-tariq',
              name: 'Hamza Tariq',
              role: 'Staff Engineer & International Consultant',
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
              verified: true,
            },
            content: 'Great question Zainab. For my first client, I did a 2-week paid pilot with clear milestones. Once they saw the speed and communication, converting to a monthly retainer was natural.',
            createdAt: '3 hours ago',
            likesCount: 19,
            dislikesCount: 0,
            likedByMe: true,
            dislikedByMe: false,
            replyingToAuthorName: 'Zainab Ahmed',
          }
        ]
      }
    ]
  },

  // 6. TECHNICAL ARCHITECTURAL QUESTION
  {
    id: 'post-q-arch',
    communityId: 'fogsly-universal',
    author: {
      id: 'user-ayesha-lead',
      name: 'Ayesha Siddiqui',
      role: 'Principal Software Architect',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      verified: true,
      bio: 'Building enterprise cloud architectures. Tech speaker at DevFest Karachi.',
      company: 'ScalePoint Tech',
      location: 'Karachi, Pakistan',
    },
    type: 'question',
    title: 'Server Actions vs Route Handlers: How are production teams structuring Next.js 15 enterprise APIs?',
    content: `We are refactoring an enterprise healthcare portal with over 50,000 daily active users to Next.js 15.

Some of our senior engineers prefer standard Route Handlers (/api/*) with standard REST semantics, swagger documentation, and rate limiting middleware. Others are arguing to migrate all mutations directly to Server Actions for zero-boilerplate RPC calls.

For those running Next.js 15 at scale in production:
1. Do you use Server Actions for all database mutations, or keep REST endpoints for third-party integrations?
2. How do you handle schema validation (Zod) and telemetry in Server Actions?`,
    tags: ['Nextjs15', 'SystemDesign', 'Architecture', 'TypeScript', 'BestPractices'],
    createdAt: '6 hours ago',
    status: 'approved',
    viewsCount: 2150,
    likesCount: 132,
    dislikesCount: 2,
    likedByMe: false,
    dislikedByMe: false,
    savedByMe: false,
    commentsCount: 2,
    comments: [
      {
        id: 'comm-arch-1',
        postId: 'post-q-arch',
        author: {
          id: 'fogsly-official',
          name: 'Fogsly Core Team',
          role: 'Official Platform Architecture & Ecosystem',
          avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
          verified: true,
        },
        content: 'At Fogsly, our internal rule of thumb: Use Server Actions for all direct user interactions within the application (form submits, optimistic updates, auth state changes). Reserve standard Route Handlers for webhooks (Stripe, GitHub), mobile app endpoints, and public developer APIs. This keeps internal code type-safe while providing standard HTTP interfaces for external consumers.',
        createdAt: '5 hours ago',
        likesCount: 38,
        dislikesCount: 0,
        likedByMe: true,
        dislikedByMe: false,
        replies: []
      }
    ]
  },

  // 7. NETWORKING COLLABORATION REQUEST
  {
    id: 'post-net-collab',
    communityId: 'fogsly-universal',
    author: {
      id: 'user-bilal-khan',
      name: 'Bilal Khan',
      role: 'Founder & Tech Lead',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      verified: true,
      bio: 'Ex-Careem Senior Engineer building an automated logistics dispatch platform.',
      company: 'LogiFlow Labs',
      location: 'Islamabad, Pakistan',
    },
    type: 'networking',
    title: 'Looking for a Senior Rust / Go Backend Co-founder for an AI-Native Logistics Engine',
    content: `We have secured seed commitments from angel investors in Dubai and Pakistan for an AI route optimization and freight dispatch platform.

We are looking for a technical co-founder to lead low-latency microservices, routing graph algorithms, and real-time fleet telemetry. Equity: 15%–25% + competitive founder stipend upon closing.

If you have experience in distributed systems, high-concurrency message queues (Kafka/RabbitMQ), and cloud deployment — let's connect!`,
    tags: ['CoFounder', 'Rust', 'Golang', 'Startups', 'Logistics', 'Equity'],
    createdAt: '7 hours ago',
    status: 'approved',
    viewsCount: 1680,
    likesCount: 88,
    dislikesCount: 1,
    likedByMe: false,
    dislikedByMe: false,
    savedByMe: false,
    networkingData: {
      role: 'Technical Co-founder (Rust/Go)',
      skills: ['Rust', 'Golang', 'Kafka', 'System Design', 'PostgreSQL'],
      lookingFor: 'Senior Backend Architect with 5+ years experience in distributed systems',
      offering: '15%–25% Equity + Founder stipend + Leadership role',
      location: 'Islamabad (Hybrid) or Remote (PK)',
    },
    commentsCount: 1,
    comments: [
      {
        id: 'comm-net-1',
        postId: 'post-net-collab',
        author: {
          id: 'user-daniyal',
          name: 'Daniyal Sheikh',
          role: 'Top-Rated Plus Agency Founder',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          verified: true,
        },
        content: 'Sent you a direct connection request Bilal. I have an ex-colleague who built dispatch engines for delivery fleets in Singapore and is currently based in Islamabad.',
        createdAt: '6 hours ago',
        likesCount: 9,
        dislikesCount: 0,
        likedByMe: false,
        dislikedByMe: false,
        replies: []
      }
    ]
  },

  // 8. EXCLUSIVE FOGSLY TECH SUMMIT EVENT
  {
    id: 'post-event-summit',
    communityId: 'fogsly-universal',
    author: {
      id: 'fogsly-events',
      name: 'Fogsly Events Desk',
      role: 'Hackathons, AMAs & National Summits',
      avatar: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=200&auto=format&fit=crop&q=80',
      verified: true,
      bio: 'Organizing Pakistan’s largest verified engineering conferences and developer hackathons.',
      company: 'Fogsly Community',
      location: 'National',
    },
    type: 'event',
    title: '👑 [FOGSLY EXCLUSIVE EVENT] AI Agents & Cloud Architecture Summit 2026 ($5,000 Hackathon Prize Pool)',
    content: `Join 500+ builders, CTOs, and international keynote speakers for the premier technical conference in Pakistan:

🎙️ SESSIONS & KEYNOTES:
• Autonomous AI Agent Workflows with LangGraph & Multi-model Routing
• Zero-Downtime Migration of Multi-Tenant PostgreSQL Databases
• Scaling Remote Agency Revenue from $10k to $100k Monthly ARR
• Live 48-Hour Hackathon with $5,000 in cash prizes & investor judging

Free admission for verified Fogsly community members. RSVP now to reserve your entry pass and hackathon team slot!`,
    tags: ['FogslyExclusive', 'TechEvent', 'Hackathon', 'AIAgents', 'Islamabad'],
    createdAt: '8 hours ago',
    status: 'approved',
    isFogslyExclusive: true,
    fogslyBadgeText: '🏆 FOGSLY EXCLUSIVE • NATIONAL SUMMIT & HACKATHON',
    viewsCount: 3890,
    likesCount: 224,
    dislikesCount: 1,
    likedByMe: true,
    dislikedByMe: false,
    savedByMe: true,
    eventData: {
      title: 'AI Agents & Cloud Architecture Summit 2026',
      location: 'Islamabad Tech Arena & Live Global Stream',
      date: 'Saturday, November 14, 2026',
      time: '09:00 AM – 06:00 PM PKT',
      organizer: 'Fogsly Engineering Ecosystem',
      targetEventId: 'event-summit-2026',
      description: 'Pakistan premier conference on scalable software engineering, AI agents, and global career opportunities.',
    },
    commentsCount: 1,
    comments: [
      {
        id: 'comm-event-1',
        postId: 'post-event-summit',
        author: {
          id: 'user-maria-ux',
          name: 'Maria Sohail',
          role: 'Principal Product Designer',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
          verified: true,
        },
        content: 'Will there be dedicated virtual breakout rooms for attendees joining remotely from Karachi and Lahore?',
        createdAt: '7 hours ago',
        likesCount: 12,
        dislikesCount: 0,
        likedByMe: false,
        dislikedByMe: false,
        replies: [
          {
            id: 'rep-event-1-1',
            commentId: 'comm-event-1',
            author: {
              id: 'fogsly-events',
              name: 'Fogsly Events Desk',
              role: 'Hackathons, AMAs & National Summits',
              avatar: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=200&auto=format&fit=crop&q=80',
              verified: true,
            },
            content: 'Yes! High-bandwidth Discord and Zoom interactive stages will run in parallel with live Q&A for remote participants.',
            createdAt: '6 hours ago',
            likesCount: 16,
            dislikesCount: 0,
            likedByMe: true,
            dislikedByMe: false,
            replyingToAuthorName: 'Maria Sohail',
          }
        ]
      }
    ]
  }
];

export const INITIAL_PENDING_POSTS: CommunityPost[] = [
  {
    id: 'post-pending-1',
    communityId: 'fogsly-universal',
    author: {
      id: 'user-newbie-1',
      name: 'Raza Ali',
      role: 'Junior Web Developer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      verified: false,
      location: 'Rawalpindi, Pakistan',
    },
    type: 'question',
    title: 'How should I start learning Docker and CI/CD for deploying Next.js apps?',
    content: 'I have 6 months of React experience and want to understand containerization and automated deployments using GitHub Actions. What are the best resources and common traps?',
    tags: ['DevOps', 'Docker', 'Nextjs', 'CICD'],
    createdAt: '15 mins ago',
    status: 'pending',
    likesCount: 0,
    dislikesCount: 0,
    viewsCount: 12,
    commentsCount: 0,
    comments: [],
  }
];

export const INITIAL_SUGGESTED_CONNECTIONS: CommunityConnection[] = [
  {
    id: 'conn-1',
    userId: 'user-hamza-tariq',
    name: 'Hamza Tariq',
    role: 'Staff Engineer & International Consultant',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    skills: ['Next.js', 'React', 'GraphQL', 'Stripe', 'Remote Consulting'],
    bio: 'Helping senior engineers win international client contracts with high-trust engineering.',
    location: 'Lahore, Pakistan',
    status: 'connected',
  },
  {
    id: 'conn-2',
    userId: 'user-ayesha-lead',
    name: 'Ayesha Siddiqui',
    role: 'Principal Software Architect',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    skills: ['System Design', 'Microservices', 'PostgreSQL', 'Distributed Systems'],
    bio: 'Architecting high-concurrency cloud systems and mentoring tech leads in Pakistan.',
    location: 'Karachi, Pakistan',
    status: 'suggested',
  },
  {
    id: 'conn-3',
    userId: 'user-daniyal',
    name: 'Daniyal Sheikh',
    role: 'Top-Rated Plus Agency Founder',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    skills: ['Agency Scaling', 'B2B Sales', 'UI/UX', 'Product Strategy'],
    bio: 'Scaled custom software development studio from 2 to 45 engineers.',
    location: 'Islamabad, Pakistan',
    status: 'suggested',
  },
  {
    id: 'conn-4',
    userId: 'user-maria-ux',
    name: 'Maria Sohail',
    role: 'Principal Product Designer',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    skills: ['Figma', 'Design Systems', 'Design Tokens', 'Tailwind CSS'],
    bio: 'Crafting pixel-perfect human experiences for SaaS and fintech products.',
    location: 'Lahore, Pakistan',
    status: 'connected',
  },
];

export const INITIAL_NOTIFICATIONS: CommunityNotification[] = [
  {
    id: 'notif-1',
    title: 'Fogsly Vetted Roles Live',
    message: '15 new vetted $3,500–$7,500/mo remote contracts have been released.',
    timestamp: '15 mins ago',
    read: false,
    type: 'opportunity',
    targetPostId: 'post-fogsly-jobs',
  },
  {
    id: 'notif-2',
    title: 'Your comment received 42 upvotes',
    message: 'Daniyal Sheikh and 41 others upvoted your response in the Fogsly Grant thread.',
    timestamp: '35 mins ago',
    read: false,
    type: 'approval',
    targetPostId: 'post-fogsly-grant',
  },
  {
    id: 'notif-3',
    title: 'Networking Request Accepted',
    message: 'Hamza Tariq accepted your professional connection request.',
    timestamp: '2 hours ago',
    read: true,
    type: 'connection',
  },
];

// v5 storage keys to load updated professional posts
const LOCAL_STORAGE_KEY_POSTS = 'fogsly_community_posts_v5';
const LOCAL_STORAGE_KEY_PENDING = 'fogsly_community_pending_posts_v5';
const LOCAL_STORAGE_KEY_CONNECTIONS = 'fogsly_community_connections_v5';
const LOCAL_STORAGE_KEY_NOTIFICATIONS = 'fogsly_community_notifications_v5';

export function getStoredPosts(): CommunityPost[] {
  if (typeof window === 'undefined') return INITIAL_COMMUNITY_POSTS;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_POSTS);
    if (!saved) {
      localStorage.setItem(LOCAL_STORAGE_KEY_POSTS, JSON.stringify(INITIAL_COMMUNITY_POSTS));
      return INITIAL_COMMUNITY_POSTS;
    }
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY_POSTS, JSON.stringify(INITIAL_COMMUNITY_POSTS));
      return INITIAL_COMMUNITY_POSTS;
    }
    // Sanitize and ensure viewsCount, dislikesCount, isFogslyExclusive and comments replies are properly initialized
    const sanitized: CommunityPost[] = parsed.map((p: any, idx: number) => {
      const initialMatch = INITIAL_COMMUNITY_POSTS.find(init => init.id === p.id);
      return {
        ...p,
        isFogslyExclusive: typeof p.isFogslyExclusive === 'boolean'
          ? p.isFogslyExclusive
          : (initialMatch?.isFogslyExclusive || p.author?.id?.includes('fogsly') || false),
        fogslyBadgeText: p.fogslyBadgeText || initialMatch?.fogslyBadgeText,
        viewsCount: typeof p.viewsCount === 'number' 
          ? p.viewsCount 
          : (initialMatch?.viewsCount || Math.max(350, (p.likesCount || 10) * 14 + (idx + 1) * 85)),
        dislikesCount: typeof p.dislikesCount === 'number' 
          ? p.dislikesCount 
          : (initialMatch?.dislikesCount || 0),
        dislikedByMe: typeof p.dislikedByMe === 'boolean' ? p.dislikedByMe : false,
        comments: (p.comments || []).map((c: any) => ({
          ...c,
          likesCount: typeof c.likesCount === 'number' ? c.likesCount : 0,
          dislikesCount: typeof c.dislikesCount === 'number' ? c.dislikesCount : 0,
          likedByMe: typeof c.likedByMe === 'boolean' ? c.likedByMe : false,
          dislikedByMe: typeof c.dislikedByMe === 'boolean' ? c.dislikedByMe : false,
          replies: (c.replies || []).map((r: any) => ({
            ...r,
            likesCount: typeof r.likesCount === 'number' ? r.likesCount : 0,
            dislikesCount: typeof r.dislikesCount === 'number' ? r.dislikesCount : 0,
            likedByMe: typeof r.likedByMe === 'boolean' ? r.likedByMe : false,
            dislikedByMe: typeof r.dislikedByMe === 'boolean' ? r.dislikedByMe : false,
          }))
        }))
      };
    });
    return sanitized;
  } catch (err) {
    console.error('Error loading community posts:', err);
    return INITIAL_COMMUNITY_POSTS;
  }
}

export function saveStoredPosts(posts: CommunityPost[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_POSTS, JSON.stringify(posts));
  } catch (err) {
    console.error('Error saving community posts:', err);
  }
}

export function getStoredPendingPosts(): CommunityPost[] {
  if (typeof window === 'undefined') return INITIAL_PENDING_POSTS;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PENDING);
    if (!saved) {
      localStorage.setItem(LOCAL_STORAGE_KEY_PENDING, JSON.stringify(INITIAL_PENDING_POSTS));
      return INITIAL_PENDING_POSTS;
    }
    return JSON.parse(saved);
  } catch (err) {
    console.error('Error loading pending community posts:', err);
    return INITIAL_PENDING_POSTS;
  }
}

export function saveStoredPendingPosts(posts: CommunityPost[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_PENDING, JSON.stringify(posts));
  } catch (err) {
    console.error('Error saving pending community posts:', err);
  }
}

export function getStoredConnections(): CommunityConnection[] {
  if (typeof window === 'undefined') return INITIAL_SUGGESTED_CONNECTIONS;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CONNECTIONS);
    if (!saved) {
      localStorage.setItem(LOCAL_STORAGE_KEY_CONNECTIONS, JSON.stringify(INITIAL_SUGGESTED_CONNECTIONS));
      return INITIAL_SUGGESTED_CONNECTIONS;
    }
    return JSON.parse(saved);
  } catch (err) {
    console.error('Error loading connections:', err);
    return INITIAL_SUGGESTED_CONNECTIONS;
  }
}

export function saveStoredConnections(conns: CommunityConnection[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_CONNECTIONS, JSON.stringify(conns));
  } catch (err) {
    console.error('Error saving connections:', err);
  }
}

export function getStoredNotifications(): CommunityNotification[] {
  if (typeof window === 'undefined') return INITIAL_NOTIFICATIONS;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_NOTIFICATIONS);
    if (!saved) {
      localStorage.setItem(LOCAL_STORAGE_KEY_NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(saved);
  } catch (err) {
    console.error('Error loading notifications:', err);
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveStoredNotifications(notifs: CommunityNotification[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifs));
  } catch (err) {
    console.error('Error saving notifications:', err);
  }
}
