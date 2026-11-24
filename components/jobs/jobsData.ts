export interface JobItem {
  id: string;
  title: string;
  companyName: string;
  companyLogo: string;
  companyWebsite: string;
  companySize: string;
  headquarters: string;
  category: 'AI & ML' | 'Engineering & IT' | 'UI/UX & Design' | 'Growth & Marketing' | 'Web3 & Blockchain' | 'Operations & Finance';
  jobType: 'Remote' | 'Full-Time' | 'Contract' | 'Hybrid' | 'Internship';
  experienceLevel: 'Entry-Level' | 'Mid-Level' | 'Senior / Lead' | 'Staff / Executive';
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  salaryPeriod: string;
  fogCoinBonus?: number;
  location: string;
  postedDate: string;
  postedTimeAgo: string;
  applicantsCount: number;
  isFeatured?: boolean;
  isUrgent?: boolean;
  verified: boolean;
  shortDescription: string;
  fullDescription: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  tags: string[];
}

export const INITIAL_JOBS: JobItem[] = [
  {
    id: 'job-1',
    title: 'Senior Full-Stack AI Engineer',
    companyName: 'Nexus AI Labs',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    companyWebsite: 'https://nexusai.io',
    companySize: '45-100 employees',
    headquarters: 'San Francisco, CA & Remote',
    category: 'AI & ML',
    jobType: 'Remote',
    experienceLevel: 'Senior / Lead',
    salaryMin: 145000,
    salaryMax: 185000,
    salaryCurrency: '$',
    salaryPeriod: 'year',
    fogCoinBonus: 4500,
    location: 'Worldwide (Async-first)',
    postedDate: '2025-02-18',
    postedTimeAgo: '2 hours ago',
    applicantsCount: 24,
    isFeatured: true,
    isUrgent: true,
    verified: true,
    shortDescription: 'Build next-generation autonomous AI agents and intelligent tool-calling workflows utilizing Next.js, FastAPI, and multimodal LLMs.',
    fullDescription: 'Nexus AI Labs is looking for a Senior Full-Stack AI Engineer to lead the architecture and implementation of our collaborative agent platform. You will design resilient backend pipelines with Python/FastAPI, implement real-time streaming interfaces with React and Next.js, and integrate foundational Gemini and Claude models with fine-tuned domain agents.',
    responsibilities: [
      'Architect and scale production web applications using Next.js 15, TypeScript, and Python.',
      'Deploy low-latency streaming endpoints for real-time generative agent loops and tool-calling protocols.',
      'Optimize vector search retrieval and context windows using pgvector and distributed caches.',
      'Collaborate directly with researchers, product designers, and founding leadership to ship high-velocity releases.'
    ],
    requirements: [
      '5+ years of full-stack production software engineering experience.',
      'Deep proficiency in modern TypeScript, React, Next.js (App Router), and Python 3.11+.',
      'Demonstrated experience shipping generative AI features, agentic workflows, or LLM-driven tooling.',
      'Familiarity with cloud-native infrastructure, Docker, Redis, and PostgreSQL.'
    ],
    benefits: [
      'Competitive base salary + equity options package.',
      'Annual 4,500 FOG Coin performance and milestone bonuses.',
      'Full healthcare, vision, and dental insurance (or international monthly health stipend).',
      '$3,500 annual home-office equipment and continuous learning grant.',
      'Flexible async schedule with unlimited paid time off (minimum 25 days encouraged).'
    ],
    tags: ['React', 'Next.js', 'Python', 'LLMs', 'FastAPI', 'Remote']
  },
  {
    id: 'job-2',
    title: 'Lead Product & Systems Designer',
    companyName: 'FinScale Global',
    companyLogo: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=120&auto=format&fit=crop&q=80',
    companyWebsite: 'https://finscale.co',
    companySize: '120-250 employees',
    headquarters: 'New York, NY',
    category: 'UI/UX & Design',
    jobType: 'Hybrid',
    experienceLevel: 'Senior / Lead',
    salaryMin: 130000,
    salaryMax: 165000,
    salaryCurrency: '$',
    salaryPeriod: 'year',
    fogCoinBonus: 3000,
    location: 'New York, NY / Hybrid (2 days in office)',
    postedDate: '2025-02-17',
    postedTimeAgo: '5 hours ago',
    applicantsCount: 38,
    isFeatured: true,
    isUrgent: false,
    verified: true,
    shortDescription: 'Lead the visual craft and design system architecture for cross-border payments, escrow wallets, and creator monetization.',
    fullDescription: 'FinScale Global powers cross-border settlement for digital marketplaces and remote contractors. We are seeking an exceptional Lead Product Designer to champion our design token infrastructure, harmonize web and mobile interfaces, and build high-trust payment flows with mathematical precision.',
    responsibilities: [
      'Spearhead the design system repository across Figma, Storybook, and React component libraries.',
      'Design high-converting onboarding, KYC identity verification, and multi-currency checkout flows.',
      'Conduct rigorous usability testing and qualitative interviews with global freelance contractors.',
      'Mentor intermediate product designers and partner closely with frontend engineers to guarantee 1:1 fidelity.'
    ],
    requirements: [
      '6+ years of UX/UI product design experience, ideally within FinTech, marketplaces, or developer tools.',
      'Mastery of Figma components, autolayout variables, design tokens, and micro-animations.',
      'Strong portfolio showcasing data-dense dashboards, accessible typography, and elegant mobile responsiveness.',
      'Basic fluency in CSS/Tailwind principles to bridge design and engineering effortlessly.'
    ],
    benefits: [
      'Top-tier salary with bi-annual performance reviews and equity grants.',
      'Comprehensive wellness benefits, 401(k) matching up to 5%, and commuter perks.',
      'Company-provided MacBook Pro M3 Max and 4K studio display.',
      'Regular team offsites in Miami, Lisbon, and Tokyo.'
    ],
    tags: ['Figma', 'Design Systems', 'FinTech', 'UI/UX', 'Mobile']
  },
  {
    id: 'job-3',
    title: 'Core Protocol & Smart Contract Architect',
    companyName: 'Aetheria Network',
    companyLogo: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=120&auto=format&fit=crop&q=80',
    companyWebsite: 'https://aetheria.network',
    companySize: '25-50 employees',
    headquarters: 'Zurich, Switzerland & Remote',
    category: 'Web3 & Blockchain',
    jobType: 'Remote',
    experienceLevel: 'Staff / Executive',
    salaryMin: 160000,
    salaryMax: 210000,
    salaryCurrency: '$',
    salaryPeriod: 'year',
    fogCoinBonus: 8000,
    location: 'Europe / Remote (Anywhere within UTC-3 to UTC+4)',
    postedDate: '2025-02-16',
    postedTimeAgo: '1 day ago',
    applicantsCount: 19,
    isFeatured: true,
    isUrgent: false,
    verified: true,
    shortDescription: 'Design, audit, and deploy high-throughput smart contracts and state channels for zero-fee escrow settlements.',
    fullDescription: 'Aetheria Network is building peer-to-peer liquidity and programmatic escrow rails for global freelance platforms. As our Lead Smart Contract Architect, you will establish rigorous security proofs, design gas-optimized contract architectures in Solidity and Rust, and oversee third-party security audits.',
    responsibilities: [
      'Write, verify, and maintain production smart contracts for escrow state channels and multi-sig vaults.',
      'Implement extensive test suites with Foundry, Hardhat, and formal verification frameworks.',
      'Collaborate with tier-1 auditing firms to eliminate re-entrancy, arithmetic, and logic vulnerabilities.',
      'Provide technical guidance to ecosystem partners integrating Fogsly escrow SDKs.'
    ],
    requirements: [
      '4+ years of dedicated smart contract development (Solidity / Rust) with >$50M total value locked in production.',
      'Deep understanding of EVM execution model, memory layout, gas optimization, and cryptography.',
      'Track record of passing multiple institutional smart contract audits with zero critical flaws.',
      'Familiarity with Layer-2 rollups (Arbitrum, Base, Optimism) and cross-chain message passing.'
    ],
    benefits: [
      'High-tier base compensation paid in USD or USDC/ETH.',
      'Generous network token allotment and Fog Coin grants.',
      'Coworking stipend for any city globally.',
      'Annual retreat budget and sponsored speaking at Devconnect and ETHGlobal.'
    ],
    tags: ['Solidity', 'Rust', 'Web3', 'EVM', 'Foundry', 'Escrow']
  },
  {
    id: 'job-4',
    title: 'Head of Growth & Performance Marketing',
    companyName: 'HyperFlow SaaS',
    companyLogo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=120&auto=format&fit=crop&q=80',
    companyWebsite: 'https://hyperflow.tech',
    companySize: '60-120 employees',
    headquarters: 'Austin, TX & Remote',
    category: 'Growth & Marketing',
    jobType: 'Remote',
    experienceLevel: 'Senior / Lead',
    salaryMin: 120000,
    salaryMax: 155000,
    salaryCurrency: '$',
    salaryPeriod: 'year',
    fogCoinBonus: 3500,
    location: 'North America / Remote',
    postedDate: '2025-02-15',
    postedTimeAgo: '2 days ago',
    applicantsCount: 42,
    isFeatured: false,
    isUrgent: true,
    verified: true,
    shortDescription: 'Scale customer acquisition, optimize organic search funnels, and build viral referral loops for a high-growth platform.',
    fullDescription: 'HyperFlow is an automation platform helping gig workers and digital agencies run invoicing and pipeline management on autopilot. We are searching for an analytical Head of Growth who understands unit economics, CAC/LTV payback periods, and data-driven experimentation.',
    responsibilities: [
      'Own top-of-funnel acquisition, paid performance channels (Meta, Google, LinkedIn), and programmatic SEO.',
      'Structure A/B test experiments for landing pages, conversion funnels, and email nurture tracks.',
      'Collaborate with product teams to embed product-led growth (PLG) referral triggers directly into user workflows.',
      'Manage a $1.2M annual growth budget and report weekly cohort metrics to the executive board.'
    ],
    requirements: [
      '5+ years leading growth or performance marketing in high-velocity B2B SaaS or consumer tech.',
      'Strong quantitative skill set with SQL, Mixpanel/PostHog, Google Analytics 4, and attribution modeling.',
      'Proven experience scaling monthly recurring revenue (MRR) from $100k to $1M+.',
      'Exceptional copywriting sensibility and creative campaign ideation.'
    ],
    benefits: [
      'Target performance bonus up to 25% of base salary tied to growth milestones.',
      'Full premium medical, dental, and vision coverage.',
      'Flexible time off, paid parental leave, and gym reimbursement.',
      'Budget for marketing experiments and creative agency contractors.'
    ],
    tags: ['Growth', 'Marketing', 'PLG', 'Analytics', 'B2B SaaS']
  },
  {
    id: 'job-5',
    title: 'Senior Mobile Engineer (React Native & iOS)',
    companyName: 'Kinetix Mobile',
    companyLogo: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=120&auto=format&fit=crop&q=80',
    companyWebsite: 'https://kinetixapp.com',
    companySize: '30-70 employees',
    headquarters: 'London, UK & Remote',
    category: 'Engineering & IT',
    jobType: 'Full-Time',
    experienceLevel: 'Senior / Lead',
    salaryMin: 95000,
    salaryMax: 125000,
    salaryCurrency: '£',
    salaryPeriod: 'year',
    fogCoinBonus: 2800,
    location: 'London, UK (Hybrid) or Remote UK/EU',
    postedDate: '2025-02-14',
    postedTimeAgo: '3 days ago',
    applicantsCount: 29,
    isFeatured: false,
    isUrgent: false,
    verified: true,
    shortDescription: 'Craft butter-smooth mobile interfaces, offline-first data sync, and instant push notifications for 500,000+ active mobile users.',
    fullDescription: 'Kinetix builds on-demand task dispatch and gig tracking software for iOS and Android. As our Senior Mobile Engineer, you will refine our React Native architecture, bridge native Swift/Kotlin modules when necessary, and ensure 60fps animations across diverse devices.',
    responsibilities: [
      'Maintain and expand our production React Native / Expo codebase with TypeScript.',
      'Implement offline-first caching strategies using WatermelonDB and SQLite.',
      'Optimize battery consumption and background geolocation tracking for field taskers.',
      'Oversee automated CI/CD builds with EAS and manage App Store / Google Play submissions.'
    ],
    requirements: [
      '4+ years building and deploying production mobile applications with React Native.',
      'Solid understanding of native iOS (Swift) or Android (Kotlin) development patterns.',
      'Experience handling push notifications, background tasks, and real-time WebSockets.',
      'Eye for polish, fluid micro-gestures, and strict adherence to Apple Human Interface Guidelines.'
    ],
    benefits: [
      'Competitive London tech package with pension contribution up to 7%.',
      'Cycle-to-work scheme and annual health and wellness stipend.',
      'Choice of latest iPhone and Android test devices + M3 MacBook Pro.',
      '30 days of annual holiday plus UK bank holidays.'
    ],
    tags: ['React Native', 'TypeScript', 'iOS', 'Android', 'Mobile']
  },
  {
    id: 'job-6',
    title: 'Staff Cloud Infrastructure & DevOps Engineer',
    companyName: 'OmniCloud Labs',
    companyLogo: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=120&auto=format&fit=crop&q=80',
    companyWebsite: 'https://omnicloud.dev',
    companySize: '200-500 employees',
    headquarters: 'Singapore & Remote',
    category: 'Engineering & IT',
    jobType: 'Remote',
    experienceLevel: 'Staff / Executive',
    salaryMin: 155000,
    salaryMax: 195000,
    salaryCurrency: '$',
    salaryPeriod: 'year',
    fogCoinBonus: 5000,
    location: 'Global Remote (APAC or EMEA preferred)',
    postedDate: '2025-02-13',
    postedTimeAgo: '4 days ago',
    applicantsCount: 17,
    isFeatured: true,
    isUrgent: false,
    verified: true,
    shortDescription: 'Architect multi-region Kubernetes clusters, zero-trust security postures, and Terraform automation for global scale.',
    fullDescription: 'OmniCloud Labs operates the cloud infrastructure that underpins high-volume marketplace transactions, microservices, and AI inferencing. You will lead our site reliability and infrastructure engineering team, standardizing infrastructure-as-code and keeping our uptime above 99.99%.',
    responsibilities: [
      'Manage multi-region AWS and GCP Kubernetes (EKS/GKE) deployments with Terraform and GitOps (ArgoCD).',
      'Build automated observability dashboards and alerting with Prometheus, Grafana, and Datadog.',
      'Champion incident response protocols, blameless post-mortems, and chaos engineering exercises.',
      'Harden security perimeter, IAM role policies, and automated vulnerability scanning in container registries.'
    ],
    requirements: [
      '7+ years in DevOps, Site Reliability Engineering, or Cloud Infrastructure.',
      'Expert-level mastery of Kubernetes, Terraform, Helm, and Linux systems internals.',
      'Proficiency in scripting and tooling with Go, Python, or Bash.',
      'Demonstrated experience handling multi-tenant production systems handling >10k requests/second.'
    ],
    benefits: [
      'Top-percentile international compensation package with zero location deductions.',
      'Annual education stipend for certifications (CKA, AWS SA Pro) and conferences.',
      'Flexible home office setup budget and high-speed internet reimbursement.',
      'Comprehensive family private healthcare.'
    ],
    tags: ['Kubernetes', 'Terraform', 'AWS', 'GCP', 'DevOps', 'Go']
  },
  {
    id: 'job-7',
    title: 'Developer Relations & Technical Advocate',
    companyName: 'Fogsly Ecosystem',
    companyLogo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120&auto=format&fit=crop&q=80',
    companyWebsite: 'https://fogsly.com',
    companySize: '50-100 employees',
    headquarters: 'Global Decentralized',
    category: 'Growth & Marketing',
    jobType: 'Remote',
    experienceLevel: 'Mid-Level',
    salaryMin: 105000,
    salaryMax: 135000,
    salaryCurrency: '$',
    salaryPeriod: 'year',
    fogCoinBonus: 6000,
    location: 'Worldwide Remote',
    postedDate: '2025-02-12',
    postedTimeAgo: '5 days ago',
    applicantsCount: 51,
    isFeatured: true,
    isUrgent: true,
    verified: true,
    shortDescription: 'Inspire and empower our global developer community through open-source sample apps, technical guides, and live hackathons.',
    fullDescription: 'Join the core Fogsly team as our Developer Relations Advocate! You will be the bridge between thousands of developers building on Fogsly APIs, escrow smart contracts, and micro-app integrations. You will produce engaging code tutorials, host developer office hours, and speak at international conferences.',
    responsibilities: [
      'Author high-quality technical blog posts, code starters, and interactive documentation for Fogsly SDKs.',
      'Build open-source reference implementations showcasing escrow payments, AI task matching, and WebHooks.',
      'Host monthly developer hangouts, code walkthroughs, and hackathon judging panels.',
      'Gather developer feedback, synthesize bug reports, and advocate for API improvements with core engineers.'
    ],
    requirements: [
      '3+ years of experience in software development, DevRel, or technical community management.',
      'Strong ability to communicate complex software concepts simply and engagingly in written and video formats.',
      'Hands-on coding experience in modern JavaScript/TypeScript, Node.js, and REST/GraphQL APIs.',
      'Passion for open source, remote freelance empowerment, and developer ergonomics.'
    ],
    benefits: [
      'Generous salary + quarterly community growth incentives in FOG Coins.',
      'Full travel budget for speaking at 4-6 global tech conferences annually.',
      'Home studio audio/video setup package (Shure microphone, Sony mirrorless camera, Elgato gear).',
      'Flexible async workflow with genuine creative autonomy.'
    ],
    tags: ['DevRel', 'TypeScript', 'Open Source', 'Community', 'Public Speaking']
  },
  {
    id: 'job-8',
    title: 'Principal Cybersecurity & Pen-Testing Specialist',
    companyName: 'Vanguard Defense',
    companyLogo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=120&auto=format&fit=crop&q=80',
    companyWebsite: 'https://vanguarddef.io',
    companySize: '80-150 employees',
    headquarters: 'Berlin, Germany & Remote',
    category: 'Engineering & IT',
    jobType: 'Contract',
    experienceLevel: 'Senior / Lead',
    salaryMin: 110000,
    salaryMax: 140000,
    salaryCurrency: '€',
    salaryPeriod: 'year',
    fogCoinBonus: 3200,
    location: 'Berlin / Remote (EU timezone)',
    postedDate: '2025-02-11',
    postedTimeAgo: '6 days ago',
    applicantsCount: 14,
    isFeatured: false,
    isUrgent: false,
    verified: true,
    shortDescription: 'Lead offensive penetration testing, smart contract threat modeling, and SOC2 compliance validation.',
    fullDescription: 'Vanguard Defense provides offensive cybersecurity and defensive posture auditing for decentralized finance and marketplace platforms. As Principal Security Specialist, you will coordinate ethical red-teaming simulations, analyze zero-day threat vectors, and help harden customer data against sophisticated intrusions.',
    responsibilities: [
      'Conduct end-to-end blackbox and whitebox penetration tests across web apps, APIs, and cloud networks.',
      'Perform source code security reviews for Node.js, Python, and Go microservices.',
      'Validate cryptographic protocols, zero-knowledge proofs, and secure enclave implementations.',
      'Publish detailed vulnerability assessment reports with actionable mitigation code snippets.'
    ],
    requirements: [
      '5+ years in offensive security, penetration testing, or red teaming.',
      'Industry certifications such as OSCP, OSCE, or CISSP.',
      'Demonstrated expertise in OWASP Top 10, cloud security misconfigurations, and API security.',
      'Clean track record of responsible disclosure and bug bounty recognition.'
    ],
    benefits: [
      'Flexible 12-month renewable contract with retainer options.',
      'Dedicated research budget to purchase security lab hardware and tools.',
      'Freedom to publish independent security research papers with company backing.',
      'Remote-first schedule with option for Berlin office access.'
    ],
    tags: ['Cybersecurity', 'Penetration Testing', 'OSCP', 'Python', 'Security']
  },
  {
    id: 'job-9',
    title: 'Senior Technical Writer & API Documentarian',
    companyName: 'DataPulse APIs',
    companyLogo: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=120&auto=format&fit=crop&q=80',
    companyWebsite: 'https://datapulse.dev',
    companySize: '35-80 employees',
    headquarters: 'Toronto, Canada & Remote',
    category: 'Engineering & IT',
    jobType: 'Remote',
    experienceLevel: 'Mid-Level',
    salaryMin: 90000,
    salaryMax: 115000,
    salaryCurrency: '$',
    salaryPeriod: 'year',
    fogCoinBonus: 2000,
    location: 'North America / Remote',
    postedDate: '2025-02-10',
    postedTimeAgo: '1 week ago',
    applicantsCount: 33,
    isFeatured: false,
    isUrgent: false,
    verified: true,
    shortDescription: 'Craft intuitive, developer-obsessed documentation, interactive OpenAPI sandboxes, and quickstart guides.',
    fullDescription: 'DataPulse provides high-frequency financial and market intelligence APIs to fintech startups. We are searching for an exceptional Senior Technical Writer who cares deeply about typography, crisp phrasing, and helping developers make their first successful API call in under 3 minutes.',
    responsibilities: [
      'Structure and maintain our developer documentation site using MDX, Nextra/Mintlify, and OpenAPI 3.1 specs.',
      'Create runnable code examples across curl, Python, TypeScript, and Go for all API endpoints.',
      'Collaborate with backend engineers to document schema changes before new API versions ship.',
      'Analyze developer drop-off points in documentation and iterate on information architecture.'
    ],
    requirements: [
      '3+ years writing technical documentation for developer tools, APIs, or cloud platforms.',
      'Ability to read and write basic code in JavaScript/TypeScript and Python.',
      'Familiarity with Git-based documentation workflows, Markdown/MDX, and OpenAPI/Swagger.',
      'Exceptional English written communication with meticulous attention to grammar and formatting.'
    ],
    benefits: [
      'Competitive salary + annual profit-sharing bonus.',
      'Health, dental, and vision insurance with HSA contribution.',
      '$2,000 annual book and course allowance.',
      'Generous paid parental leave and mental health wellness days.'
    ],
    tags: ['Technical Writing', 'OpenAPI', 'Documentation', 'Markdown', 'APIs']
  },
  {
    id: 'job-10',
    title: 'Product Operations & Marketplace Manager',
    companyName: 'Apex Gig Logistics',
    companyLogo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    companyWebsite: 'https://apexgig.com',
    companySize: '90-180 employees',
    headquarters: 'Dubai, UAE & Remote',
    category: 'Operations & Finance',
    jobType: 'Full-Time',
    experienceLevel: 'Mid-Level',
    salaryMin: 85000,
    salaryMax: 110000,
    salaryCurrency: '$',
    salaryPeriod: 'year',
    fogCoinBonus: 2500,
    location: 'Dubai, UAE (Relocation supported) or Remote',
    postedDate: '2025-02-09',
    postedTimeAgo: '1 week ago',
    applicantsCount: 47,
    isFeatured: false,
    isUrgent: false,
    verified: true,
    shortDescription: 'Optimize marketplace supply-demand liquidity, streamline escrow dispute workflows, and onboard institutional clients.',
    fullDescription: 'Apex Gig Logistics manages the matchmaking and quality assurance layer for thousands of freelance transactions daily. As Product Operations Manager, you will streamline our dispute resolution engine, monitor platform fraud detection, and partner with product managers to launch operational automation tools.',
    responsibilities: [
      'Monitor marketplace balance metrics (fill rates, average response times, dispute rates) and diagnose operational bottlenecks.',
      'Design standard operating procedures for dispute mediation and fraud investigation.',
      'Collaborate with product and data engineering to automate repetitive operational tasks.',
      'Lead a team of 6 distributed marketplace trust specialists across multiple time zones.'
    ],
    requirements: [
      '3+ years in product operations, marketplace operations, or customer experience leadership.',
      'High comfort level working with data dashboards (Looker, Tableau, Metabase) and SQL.',
      'Empathetic problem-solving demeanor under stressful mediation situations.',
      'Strong cross-functional collaboration experience across engineering, legal, and support.'
    ],
    benefits: [
      'Tax-advantaged compensation package in UAE or competitive international remote equivalent.',
      'Relocation assistance package including visa sponsorship and initial housing stipend if based in Dubai.',
      'Annual flight ticket allowance to home country.',
      'Comprehensive global health insurance coverage.'
    ],
    tags: ['Operations', 'Marketplace', 'Dispute Resolution', 'SQL', 'Management']
  }
];
