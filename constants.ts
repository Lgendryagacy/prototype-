import React from 'react';
import IconAiBot from './components/icons/IconAiBot';
import IconSecureLock from './components/icons/IconSecureLock';
import IconMarketplace from './components/icons/IconMarketplace';
import IconFogCoin from './components/icons/IconFogCoin';
import IconGlobe from './components/icons/IconGlobe';
import IconSupport from './components/icons/IconSupport';
import { AtomIcon } from './components/icons/AnimatedIcons/IconAtom';
import { BadgeCheck } from './components/icons/AnimatedIcons/IconBadge';
import { ShoppingBagIcon } from './components/icons/AnimatedIcons/IconShoppingBag';
import { BadgeDollarSign } from './components/icons/AnimatedIcons/IconDollar';
import { CircleHelp } from './components/icons/AnimatedIcons/IconHeadphones';
import IconVerifiedBadge from './components/icons/IconVerifiedBadge';
import IconDispute from './components/icons/IconDispute';

export const categories = [
  { name: 'Development & IT', icon: '💻', jobs: '1,245' },
  { name: 'Design & Creative', icon: '🎨', jobs: '892' },
  { name: 'Sales & Marketing', icon: '📈', jobs: '756' },
  { name: 'Writing & Translation', icon: '✍️', jobs: '543' },
  { name: 'Admin Support', icon: '📋', jobs: '432' },
  { name: 'Finance & Legal', icon: '💰', jobs: '321' },
];



export const pricingPageData = {
  hero: {
    headline: "Simple Pricing",
    subheadline: "No hidden fees.",
    highlights: ["Free tier", "Transparent"]
  },
  plans: [
    { id: "free", name: "Free", price: "0", currency: "$", billing: "Free", description: "Basic access.", features: ["Access to Hubs"], cta: "Start Free", primary: false, badge: "Starter" },
    { id: "starter", name: "Growth", price: "29", currency: "$", billing: "/mo", description: "For rising professionals.", features: ["Priority Support", "Featured Listing"], cta: "Upgrade", primary: true, badge: "Popular" }
  ],
  faqs: [{ q: "Hidden fees?", a: "None." }]
};



export const helpCenterPageData = {
  hero: {
    title: "How Can We Help You?",
    subtitle: "Search our knowledge base or browse categories below to solve issues independently."
  },
  trending: ["Withdrawal process", "Account verification", "How Fog Coins work"],
  categories: [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: "Rocket",
      description: "Basics of creating and setting up your Fogsly account.",
      articles: [
        { id: "what-is-fogsly", title: "What is Fogsly and how it works", content: "Fogsly is a next-generation digital ecosystem that combines freelancing, tasks, and AI tools into one secure platform. Our hybrid model allows you to hire expert talent for long-term projects or taskers for physical, local jobs. The core foundation of Fogsly is trust, secured through our government-registered status and automated Escrow systems." },
        { id: "create-account", title: "How to create an account", content: "Creating an account on Fogsly is simple. Visit our homepage and click the 'Sign Up' button. You can register using your email address, or link your existing Google or LinkedIn profiles for a faster setup. Ensure your information matches your government ID for smooth verification later." },
        { id: "verification-process", title: "Account verification process", content: "To maintain a safe marketplace, Fogsly requires verification. You will need to upload a clear photo of your National ID, Passport, or Driver's License. Our team typically reviews these within 24-48 hours. Verified users receive a blue badge and have higher withdrawal limits." },
        { id: "how-to-earn", title: "Choosing how to earn on Fogsly", content: "Fogsly offers multiple earning paths: 1) Freelance Hub: Offer professional digital services. 2) Tasker Hub: Complete local physical tasks. 3) Watch Ads: Earn small rewards for feedback. 4) Fog Services: Productize your recurring services." },
        { id: "beginner-guide", title: "Beginner earning guide", content: "New to digital work? Start by completing small online tasks in the Tasker Hub or participating in the Watch Ads program to build your first Fog Coins. As you gain ratings, move into professional freelancing by bidding on projects that match your primary skills." }
      ]
    },
    {
      id: "account-verification",
      title: "Account & Verification",
      icon: "ShieldCheck",
      description: "Identity verification and profile security.",
      articles: [
        { id: "why-verify", title: "Why verification is required", content: "Verification is mandatory to prevent fraud, ensure secure payments, and build a community of real, trustworthy professionals. It protects both clients and freelancers from fake accounts and malicious activity." },
        { id: "how-to-verify", title: "How to verify your account", content: "Navigate to Settings > Identity Verification. Follow the prompts to take a selfie and upload your ID documents. Make sure the lighting is good and all text on your ID is legible." },
        { id: "update-info", title: "Updating personal information", content: "You can update your display name and bio at any time in Profile Settings. However, legal information like your date of birth or legal name requires a support ticket if changed after verification." },
        { id: "locked-account", title: "Recovering a locked account", content: "If your account is locked due to suspicious activity, please check your email for instructions. You will likely need to re-verify your identity or reset your password through our secure recovery portal." }
      ]
    },
    {
      id: "earnings-payments",
      title: "Earnings, Wallet & Payments",
      icon: "Wallet",
      description: "Managing your wallet, withdrawals, and timelines.",
      articles: [
        { id: "how-fog-coins-work", title: "How Fog Coins work", content: "Fog Coins (FOG) are our native utility tokens. They allow for zero-fee internal transfers and can be used to pay for services across the platform. You can swap them for USD or PKR inside your dashboard." },
        { id: "earning-methods", title: "Earning methods explained", content: "Earnings from Freelance Hub are credited upon milestone approval. Tasker Hub earnings are released after client confirmation. Fog Coins earned from Ads are credited instantly to your wallet." },
        { id: "withdrawal-step-by-step", title: "Withdrawal process step-by-step", content: "1) Go to Dashboard > Wallet. 2) Click 'Withdraw'. 3) Select your payment method (Bank, PayPal, Easypaisa). 4) Enter amount. 5) Confirm with 2FA." },
        { id: "payment-timelines", title: "Payment timelines", content: "Escrow funds are held until work approval. Once in your balance, standard withdrawals take 24-72 business hours to process, depending on the chosen provider." }
      ]
    },
    {
      id: "freelance-hub",
      title: "Freelance Hub",
      icon: "Briefcase",
      description: "Bidding on projects and working with clients.",
      articles: [
        { id: "create-profile", title: "How to create a freelancer profile", content: "A great profile includes a professional headshot, a descriptive headline, a portfolio of past work, and a list of verified skills. Profiles with portfolios are 80% more likely to get hired." },
        { id: "bidding-projects", title: "Posting and bidding on projects", content: "When bidding, tailor your proposal to the client's needs. Explain exactly HOW you will solve their problem. Avoid generic copy-paste bids." },
        { id: "workflow", title: "Client-freelancer workflow", content: "Communication happens in our secure chat. Always use milestones to break down large projects. Work should only begin once the milestone is funded in Escrow." }
      ]
    },
    {
      id: "tasker-hub",
      title: "Tasker Hub & Fog Jobs",
      icon: "Wrench",
      description: "Local tasks and short-term job opportunities.",
      articles: [
        { id: "how-tasker-hub-works", title: "How Tasker Hub works", content: "Tasker Hub connects you with local clients for physical tasks like cleaning, mounting, or delivery. You set your availability and location radius." },
        { id: "completing-tasks", title: "Completing tasks correctly", content: "Always arrive on time and take 'before and after' photos for your own record. Once finished, the client must click 'Confirm Completion' to release your payment." }
      ]
    },
    {
      id: "ai-tools",
      title: "AI Tools & Platform Features",
      icon: "Sparkles",
      description: "Using integrated AI for productivity and creation.",
      articles: [
        { id: "available-ai", title: "What AI tools are available on Fogsly", content: "We offer AI-powered Proposal Generators, Image Enhancers for portfolios, and Code Helpers for developers. These are integrated directly into your workspace." },
        { id: "ai-usage", title: "Using AI responsibly", content: "AI should be a starting point. Always review and personalize AI-generated content to ensure it reflects your true expertise and maintains quality." }
      ]
    },
    {
      id: "watch-ads",
      title: "Watch Ads & Q&A",
      icon: "Play",
      description: "Earning through knowledge and activity.",
      articles: [
        { id: "how-ads-work", title: "How Watch Ads works", content: "Advertisers pay to get feedback on their products. You watch a short video and answer specific questions to earn Fog Coins." },
        { id: "ad-limits", title: "Daily limits and rules", content: "To ensure quality feedback, we limit the number of ads each user can watch daily. Attempting to skip videos or provide gibberish answers may lead to account suspension." }
      ]
    },
    {
      id: "events-expo",
      title: "Events & Expo",
      icon: "Globe",
      description: "Networking and learning sessions.",
      articles: [
        { id: "what-are-events", title: "What are Fogsly Events and Expos", content: "These are virtual and physical gatherings where you can learn from industry leaders, pitch your services to big clients, and network with other pros." }
      ]
    },
    {
      id: "security-trust",
      title: "Security, Trust & Safety",
      icon: "ShieldCheck",
      description: "Safety tips and fraud prevention.",
      articles: [
        { id: "fraud-prevention", title: "How Fogsly protects users", content: "We use 2FA, encrypted messaging, and a strict verification process. Our dispute resolution team is always available to step in if a client or freelancer breaks terms." },
        { id: "avoid-scams", title: "Avoiding scams and fake offers", content: "Never communicate outside Fogsly before a contract is started. Never pay a 'security deposit' to a client. Fogsly will never ask for your password via email." }
      ]
    }
  ],
  faq: [
    { question: "How does the Escrow system work?", answer: "Escrow holds project funds securely until the client approves the work, ensuring both parties are protected." },
    { question: "Is Fogsly a registered company?", answer: "Yes, Fogsly (Pvt) Ltd is a government-registered private limited entity." },
    { question: "How long do withdrawals take?", answer: "Withdrawals typically process within 24-48 hours depending on your chosen method." }
  ],
  guides: [
    { title: "Mastering Proposals", description: "Learn how to write bids that clients can't ignore." },
    { title: "Safety First", description: "Our comprehensive guide to staying safe on digital platforms." }
  ],
  contact: {
    title: "Still need help?",
    description: "Our dedicated team is here to support you 24/7.",
    email: "support@fogsly.com"
  }
};

export const communityPageData = {
  hero: {
    headline: "Welcome to the Fogsly Community",
    subheadline: "Connect, learn, share, and grow with people building their future through skills and technology.",
    cta: "Join the Community"
  },
  benefits: [
    { title: "Learn from Pros", description: "Learn from experienced freelancers and professionals.", icon: "BookOpen" },
    { title: "Mentor Access", description: "Get guidance for beginners and students.", icon: "Compass" },
    { title: "Global Tips", description: "Share knowledge, tips, and opportunities.", icon: "Share2" },
    { title: "Active Challenges", description: "Participate in challenges, events, and discussions.", icon: "Trophy" },
    { title: "Feature Updates", description: "Stay updated with platform features and announcements.", icon: "Bell" }
  ],
  spaces: [
    {
      name: "Discussion Forums",
      description: "Ask questions, share ideas, and discuss freelancing, AI, and digital earning.",
      icon: "MessageSquare",
      threads: "1.2k"
    },
    {
      name: "Learning Circles",
      description: "Skill-building groups focused on freelancing, AI tools, and career growth.",
      icon: "Users",
      threads: "850"
    },
    {
      name: "Announcements & Updates",
      description: "Official updates, feature releases, and important notices.",
      icon: "Megaphone",
      threads: "120"
    },
    {
      name: "Events & Meetups",
      description: "Community events, webinars, STEAM sessions, and expos.",
      icon: "Calendar",
      threads: "45"
    }
  ],
  guidelines: [
    "Be respectful and supportive",
    "No scams, spam, or fake opportunities",
    "Share accurate and helpful information",
    "Respect privacy and diversity",
    "Follow platform rules and policies"
  ],
  impact: [
    { label: "Active Members", value: "120K+" },
    { label: "Questions Answered", value: "450K" },
    { label: "Skills Shared", value: "15K" },
    { label: "Events Hosted", value: "2K+" }
  ],
  leaderboard: [
    { rank: 1, name: "Sarah K.", points: 12500, avatar: "SK", level: "Top Contributor", badges: ["Expert", "Helpful"] },
    { rank: 2, name: "Michael T.", points: 10200, avatar: "MT", level: "Elite Member", badges: ["Vanguard"] },
    { rank: 3, name: "Jamal R.", points: 8900, avatar: "JR", level: "Rising Star", badges: ["Active"] }
  ]
};

export const privacyPolicyPageData = {
  hero: {
    headline: "Privacy Policy",
    subheadline: "Your privacy matters to us. This policy explains how Fogsly collects, uses, and protects your information.",
    lastUpdated: "October 24, 2024"
  },
  introduction: "Fogsly (Pvt) Ltd is committed to protecting your privacy. This Privacy Policy outlines how we handle your personal information when you use our platform.",
  sections: [
    {
      title: "Information We Collect",
      content: "We collect various types of information to provide and improve our services:",
      list: [
        "Personal information (name, email, phone number)",
        "Account and profile information",
        "Payment and transaction data",
        "Usage data and activity logs",
        "Device and technical information"
      ]
    },
    {
      title: "How We Use Your Information",
      content: "Your information helps us maintain a secure and efficient marketplace:",
      list: [
        "To provide and improve platform services",
        "To verify user identity and prevent fraud",
        "To process earnings, payments, and withdrawals",
        "To communicate updates and important notices",
        "To enhance security and platform performance"
      ]
    },
    {
      title: "AI & Automated Tools Usage",
      content: "Fogsly may use AI-powered tools to enhance user experience, improve productivity, and maintain platform safety. AI systems do not sell or misuse personal data."
    },
    {
      title: "Data Sharing & Disclosure",
      content: "We handle your data with the utmost care and strictly regulate sharing:",
      list: [
        "We do not sell user data to third parties",
        "Data may be shared with trusted service providers under strict agreements",
        "Legal disclosure may occur if required by law",
        "Business transfers may include data under privacy safeguards"
      ]
    },
    {
      title: "Data Security",
      content: "We implement industry-standard security measures to protect your data against unauthorized access, alteration, or disclosure."
    },
    {
      title: "User Rights",
      content: "As a Fogsly user, you have the following rights regarding your data:",
      list: [
        "Access your personal data",
        "Request correction or deletion",
        "Control communication preferences",
        "Withdraw consent where applicable"
      ]
    },
    {
      title: "Cookies & Tracking",
      content: "Fogsly uses cookies and similar technologies to enhance functionality, analyze usage, and improve user experience."
    },
    {
      title: "Children’s Privacy",
      content: "Fogsly does not knowingly collect personal information from children under the applicable legal age without parental consent."
    },
    {
      title: "Policy Updates",
      content: "This Privacy Policy may be updated periodically. Changes will be communicated through the platform."
    }
  ],
  contact: {
    email: "privacy@fogsly.com",
    phone: "+92 311 7557999",
    note: "For privacy-related questions or concerns"
  }
};

export const termsPageData = {
  hero: {
    headline: "Terms of Service",
    subheadline: "Welcome to Fogsly. Please read these terms carefully as they govern your use of our platform and services.",
    lastUpdated: "October 24, 2024"
  },
  introduction: "Fogsly (Pvt) Ltd provides a digital ecosystem connecting professionals with opportunities. By accessing or using our platform, you agree to comply with and be bound by these Terms of Service.",
  sections: [
    {
      title: "Acceptance of Terms",
      content: "By creating an account or using any part of the Fogsly platform, you enter into a legally binding agreement. If you do not agree to these terms, you must not use our services."
    },
    {
      title: "User Registration & Responsibilities",
      content: "You must provide accurate and complete information during registration. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
      list: [
        "Minimum age of 18 years or legal majority",
        "Account must be for personal or authorized business use",
        "Notification of any unauthorized account access",
        "Accuracy of skills, portfolio, and identity data"
      ]
    },
    {
      title: "Services & Project Terms",
      content: "Fogsly facilitates contracts between clients and freelancers/taskers. Each project is a separate agreement between users, subject to our standard platform workflows.",
      list: [
        "Mandatory use of Escrow for payment protection",
        "Defined milestone approvals and deliverables",
        "Platform fee structure and processing costs",
        "Communication protocols within the platform"
      ]
    },
    {
      title: "Payments, Fees & Withdrawals",
      content: "All financial transactions must occur through Fogsly's integrated payment systems to ensure security and trust for all parties.",
      list: [
        "Platform service fees (standard 10%)",
        "FOG Coin utility and conversion rules",
        "Withdrawal verification and timeline protocols",
        "Tax reporting responsibilities for users"
      ]
    },
    {
      title: "Refund & Cancellation Policy",
      content: "We maintain a fair refund policy focused on project milestones and work delivered. Cancellations are subject to review by our dispute resolution team.",
      list: [
        "Milestone-based refund eligibility",
        "Mutual cancellation protocols",
        "Treatment of service fees on refunds",
        "Timeline for processing refund requests"
      ]
    },
    {
      title: "Prohibited Activities",
      content: "To maintain a safe environment, certain activities are strictly prohibited and may result in permanent account suspension.",
      list: [
        "Scams, spam, or misleading earning offers",
        "Circumventing platform payment systems",
        "Abusive behavior or harassment",
        "Infringing on intellectual property rights"
      ]
    },
    {
      title: "Dispute Resolution & Governing Law",
      content: "Any disputes arising from the use of the platform shall be resolved through our internal dispute resolution process before seeking external legal recourse.",
      list: [
        "Internal mediation by Fogsly team",
        "Binding arbitration for unresolved cases",
        "Governing law: Laws of the Islamic Republic of Pakistan",
        "Exclusive jurisdiction of competent courts"
      ]
    }
  ],
  contact: {
    email: "support@fogsly.com",
    phone: "+92 311 7557999",
    note: "For questions regarding our terms and conditions"
  }
};

export const featuredJobs = [
  { title: 'Website Development', budget: '$1,500', skills: ['React', 'Node.js'], type: 'Fixed Price' },
  { title: 'Logo Design', budget: '$300', skills: ['Logo', 'Branding'], type: 'Fixed Price' },
  { title: 'Social Media Manager', budget: '$800/mo', skills: ['Instagram', 'Content'], type: 'Part-time' },
];

export const topTalent = [
  { name: 'Alex Johnson', role: 'UX Designer', rating: '4.9', projects: 42, skills: ['Figma', 'UI/UX', 'Prototyping'], url: 'https://images.unsplash.com/photo-1610088441520-4352457e7095?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Sam Wilson', role: 'Fullstack Dev', rating: '4.8', projects: 35, skills: ['React', 'Node.js', 'TypeScript'], url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Taylor Smith', role: 'Content Writer', rating: '5.0', projects: 28, skills: ['Copywriting', 'SEO', 'Blogging'], url: 'https://plus.unsplash.com/premium_photo-1672239496290-5061cfee7ebb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWVufGVufDB8MXwwfHx8MA%3D%3D' },
];

export const testimonials = [
  {
    quote: "FOGSLY helped me triple my freelance income in just 6 months! The platform is intuitive and the community is amazing.",
    author: "Sarah K.",
    role: "Freelancer",
    stats: "Earns $8,500/mo",
    clientImage: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    quote: "Found the perfect developer for our project in under 48 hours. The vetting process saved us so much time.",
    author: "Michael T.",
    role: "Startup Founder",
    stats: "Hired 12 freelancers",
    clientImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YnVzaW5lc3MlMjBtZW58ZW58MHx8MHx8fDA%3D"
  },
  {
    quote: "The hybrid model gives me both long-term projects and quick gigs. Plus, FOG Coins are a game-changer!",
    author: "Jamal R.",
    role: "Digital Marketer",
    stats: "500+ tasks completed",
    clientImage: "https://images.unsplash.com/photo-1537511446984-935f663eb1f4?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aGFwcHklMjBtZW58ZW58MHx8MHx8fDA%3D"
  },
];

export const benefits = [
  {
    title: "AI-Powered Matching",
    description: "Our algorithm connects you with ideal clients or freelancers in seconds",
    icon: AtomIcon,
  },
  {
    title: "Secure Payments",
    description: "Escrow protection ensures you only pay for satisfactory work",
    icon: BadgeCheck,
  },
  {
    title: "Hybrid Marketplace",
    description: "Get the best of both freelancing and on-demand services",
    icon: ShoppingBagIcon,
  },
  {
    title: "FOG Coin Rewards",
    description: "Earn crypto for activity and get discounts on platform fees",
    icon: BadgeDollarSign,
  },
  {
    title: "Global Talent Pool",
    description: "Access top professionals from around the world",
    icon: IconGlobe,
  },
  {
    title: "24/7 Support",
    description: "Dedicated team ready to help anytime",
    icon: CircleHelp,
  },
];

// Mock data for Find Work page
export const gigs = [
  { id: 1, title: "Build a responsive E-commerce front-end", client: "Shopify Plus", budget: 3500, type: "Fixed Price", duration: "1 month", skills: ["React", "TypeScript", "Next.js", "TailwindCSS"], proposals: 12, posted: "2 hours ago" },
  { id: 2, title: "Social Media Marketing Campaign Manager", client: "Nike", budget: 2500, type: "Monthly", duration: "3-6 months", skills: ["Social Media", "SEO", "Content Strategy"], proposals: 28, posted: "8 hours ago" },
  { id: 3, title: "UI/UX Design for a Mobile Banking App", client: "Fintech Innovations", budget: 5000, type: "Fixed Price", duration: "2 months", skills: ["Figma", "User Research", "Prototyping", "Mobile Design"], proposals: 5, posted: "1 day ago" },
  { id: 4, title: "Technical Content Writer for SaaS Blog", client: "SaaSify", budget: 45, type: "Hourly", duration: "Ongoing", skills: ["Technical Writing", "SEO", "Developer Marketing"], proposals: 35, posted: "2 days ago" },
  { id: 5, title: "Custom WordPress Plugin Development", client: "WP Gurus", budget: 1200, type: "Fixed Price", duration: "3 weeks", skills: ["WordPress", "PHP", "JavaScript"], proposals: 18, posted: "3 days ago" },
];

export const talents = [
  { id: 1, name: 'Alex Johnson', role: 'UX Designer', rating: 4.9, hourlyRate: 75, projects: 42, skills: ['Figma', 'UI/UX', 'Prototyping', 'Webflow'], verified: true, level: "Top Rated Plus" },
  { id: 2, name: 'Sam Wilson', role: 'Fullstack Dev', rating: 4.8, hourlyRate: 90, projects: 35, skills: ['React', 'Node.js', 'TypeScript', 'GraphQL'], verified: true, level: "Top Rated" },
  { id: 3, name: 'Taylor Smith', role: 'Content Writer', rating: 5.0, hourlyRate: 50, projects: 28, skills: ['Copywriting', 'SEO', 'Blogging', 'Content Strategy'], verified: false, level: "Rising Talent" },
  { id: 4, name: 'Maria Garcia', role: 'Mobile Developer', rating: 4.9, hourlyRate: 85, projects: 22, skills: ['Swift', 'Kotlin', 'React Native', 'Firebase'], verified: true, level: "Top Rated" },
  { id: 5, name: 'Chen Wei', role: 'Data Scientist', rating: 4.7, hourlyRate: 120, projects: 15, skills: ['Python', 'TensorFlow', 'Scikit-learn', 'SQL'], verified: true, level: "Expert" },
];

export const singleGigData = {
  ...gigs[2], // UI/UX Design for a Mobile Banking App
  description: "We are looking for a talented UI/UX designer to create a modern, user-friendly interface for our new mobile banking application. The ideal candidate will have a strong portfolio of mobile design projects and experience in the fintech industry. You will be responsible for the entire design process, from user research and wireframing to creating high-fidelity mockups and interactive prototypes.",
  responsibilities: [
    "Conduct user research to understand customer needs and pain points.",
    "Create user flows, wireframes, and prototypes for mobile platforms.",
    "Design visually stunning and intuitive user interfaces.",
    "Collaborate with product managers and developers to ensure design feasibility.",
    "Iterate on designs based on user feedback and testing.",
  ],
  qualifications: [
    "3+ years of experience in UI/UX design for mobile apps.",
    "Proficiency in Figma, Sketch, or Adobe XD.",
    "Strong portfolio showcasing your design skills.",
    "Experience with design systems and component-based design.",
    "Excellent communication and collaboration skills.",
  ],
  clientInfo: {
    name: "Fintech Innovations",
    location: "London, UK",
    rating: 4.9,
    reviews: 89,
    jobsPosted: 15,
    hireRate: "92%",
    memberSince: "2021",
  }
};

export const conversations = [
  { id: 1, name: 'Fintech Innovations', message: 'Sounds great, looking forward to your proposal!', time: '10:32 AM', unread: 0, avatar: 'FI' },
  { id: 2, name: 'Sam Wilson', message: 'I have a question about the component library...', time: 'Yesterday', unread: 2, avatar: 'SW' },
  { id: 3, name: 'Shopify Plus', message: 'The prototype looks amazing! One small tweak...', time: '3d ago', unread: 0, avatar: 'SP' },
  { id: 4, name: 'Maria Garcia', message: 'Can you send over the assets for the iOS build?', time: '1w ago', unread: 0, avatar: 'MG' },
];

export const messages = [
  { id: 1, sender: 'other', text: 'Hi Alex, thanks for your interest in the UI/UX Designer role for our mobile banking app. We were very impressed with your portfolio.', time: '10:30 AM' },
  { id: 2, sender: 'me', text: 'Thank you! I\'m very excited about the opportunity. The project aligns perfectly with my experience in fintech.', time: '10:31 AM' },
  { id: 3, sender: 'other', text: 'Sounds great, looking forward to your proposal!', time: '10:32 AM' },
];

export const myJobsData = [
  { id: 3, title: 'UI/UX Design for a Mobile Banking App', proposalsCount: 5 },
  { id: 1, title: 'Build a responsive E-commerce front-end', proposalsCount: 12 },
  { id: 4, title: 'Technical Content Writer for SaaS Blog', proposalsCount: 35 },
];

export const proposalsData = [
  {
    id: 1,
    freelancer: { name: 'Alex Johnson', role: 'UX Designer', rating: 4.9, avatar: 'AJ', level: 'Top Rated Plus' },
    bid: 4800,
    date: '2024-08-28',
    coverLetter: "Hello! As a senior UX designer with over 8 years of experience, specializing in fintech, I'm confident I can deliver an exceptional user experience for your mobile banking app. My portfolio includes several successful mobile finance applications where I led the design from research to high-fidelity prototypes. I'm particularly skilled in creating intuitive interfaces for complex financial data. I'm excited by the opportunity to bring my expertise to your project and create something truly user-centric. Let's discuss how I can help you achieve your goals."
  },
  {
    id: 2,
    freelancer: { name: 'Maria Garcia', role: 'Mobile Designer', rating: 4.9, avatar: 'MG', level: 'Top Rated' },
    bid: 5000,
    date: '2024-08-28',
    coverLetter: "Hi there, I've reviewed your job post for a mobile banking app designer and I am very interested. My work focuses on clean, modern, and highly functional mobile UI/UX, and I have a strong background in creating secure and trustworthy designs for financial institutions. I pride myself on my collaborative approach and my ability to translate business requirements into beautiful, effective designs. I've attached a few relevant case studies from my portfolio. I look forward to hearing from you."
  },
  {
    id: 3,
    freelancer: { name: 'Chen Wei', role: 'Product Designer', rating: 4.7, avatar: 'CW', level: 'Expert' },
    bid: 5200,
    date: '2024-08-27',
    coverLetter: "Greetings. Your project to design a new mobile banking app is a perfect match for my skills in product design and user experience strategy. I believe a successful fintech app is built on a foundation of trust and simplicity, which has been the guiding principle of my career. I can handle the full design lifecycle, from initial ideation and user journey mapping to final UI polish and developer handoff. Let's connect to talk about your vision."
  }
];

export const projectData = {
  id: 'PROJ-001',
  title: 'UI/UX Design for a Mobile Banking App',
  client: 'Fintech Innovations',
  freelancer: 'Alex Johnson',
  status: 'In Progress',
  budget: 5000,
  paid: 1000,
  remaining: 4000,
  startDate: '2024-09-01',
  endDate: '2024-10-31',
  milestones: [
    { id: 1, title: 'Phase 1: Research & Wireframes', dueDate: '2024-09-15', amount: 1000, status: 'Paid' },
    { id: 2, title: 'Phase 2: High-Fidelity Mockups', dueDate: '2024-10-01', amount: 2000, status: 'In Progress' },
    { id: 3, title: 'Phase 3: Interactive Prototype & Handoff', dueDate: '2024-10-25', amount: 2000, status: 'Pending' },
  ],
  files: [
    { id: 1, name: 'Project Brief.pdf', size: '1.2 MB', uploaded: '2024-09-01' },
    { id: 2, name: 'Wireframes_v1.fig', size: '15.8 MB', uploaded: '2024-09-10' },
    { id: 3, name: 'Milestone 1 - Invoice.pdf', size: '88 KB', uploaded: '2024-09-16' },
  ],
  messages: [
    { id: 1, user: 'Fintech Innovations', text: 'Thanks for the wireframes, they look great. We\'ve released the first milestone payment.', time: '2024-09-16' },
    { id: 2, user: 'Alex Johnson', text: 'Excellent! I\'m starting on the high-fidelity mockups now. Will share an update by Friday.', time: '2024-09-16' },
  ],
};

export const contractsData = [
  { ...projectData, id: 'PROJ-001', freelancer: 'You', otherParty: 'Fintech Innovations' },
  { id: 'PROJ-002', title: 'React Component Library', status: 'Completed', budget: 2500, endDate: '2024-08-30', freelancer: 'You', otherParty: 'SaaSify' },
  { id: 'PROJ-003', title: 'Social Media Campaign', status: 'Pending', budget: 1500, endDate: '2024-09-30', freelancer: 'You', otherParty: 'Nike' },
];

export const trustFeatures = [
  { name: 'Escrow Payments', icon: IconSecureLock },
  { name: 'Verified Badges', icon: IconVerifiedBadge },
  { name: 'Dispute Resolution', icon: IconDispute },
  { name: 'Fog Coin Integration', icon: IconFogCoin },
];

export const taskCategories = [
  { name: 'Handyman', icon: '🛠️', tasks: '28' },
  { name: 'Cleaning', icon: '🧹', tasks: '45' },
  { name: 'Delivery', icon: '🚚', tasks: '112' },
  { name: 'Mounting', icon: '🖼️', tasks: '19' },
  { name: 'Virtual Assistant', icon: '🧑‍💻', tasks: '67' },
  { name: 'Shopping', icon: '🛒', tasks: '33' },
];

export const latestTasks = [
  { id: 1, title: "Organize Google Drive folders", location: "Online", budget: 50, type: "Fixed" },
  { id: 2, title: "Data entry for 200 spreadsheet rows", location: "Online", budget: 75, type: "Fixed" },
  { id: 3, title: "Assemble IKEA bookshelf", location: "San Francisco, CA", budget: 30, type: "Hourly" },
  { id: 4, title: "Schedule social media posts for 1 week", location: "Online", budget: 100, type: "Fixed" },
];

export const taskers = [
  { id: 1, name: 'Maria Rodriguez', role: 'Home Cleaner', rating: 4.9, hourlyRate: 25, tasksCompleted: 128, skills: ['Deep Cleaning', 'Organizing', 'Laundry'], verified: true, level: "Top Tasker" },
  { id: 2, name: 'David Chen', role: 'Handyman', rating: 4.8, hourlyRate: 45, tasksCompleted: 95, skills: ['Mounting', 'Furniture Assembly', 'Minor Repairs'], verified: true, level: "Top Tasker" },
  { id: 3, name: 'Emily White', role: 'Virtual Assistant', rating: 5.0, hourlyRate: 30, tasksCompleted: 210, skills: ['Data Entry', 'Scheduling', 'Social Media'], verified: true, level: "Elite Tasker" },
  { id: 4, name: 'John Smith', role: 'Delivery & Errands', rating: 4.7, hourlyRate: 20, tasksCompleted: 350, skills: ['Shopping', 'Courier', 'Contactless Delivery'], verified: false, level: "Rising Star" },
];

export const userProfileData = {
  name: 'Alex Johnson',
  role: 'Senior UX Designer & Web Developer',
  location: 'San Francisco, CA',
  avatarUrl: '', // Will use a placeholder
  coverUrl: 'https://images.unsplash.com/photo-1554147090-e1221a04a025?w=800&q=80',
  bio: 'A passionate Senior UX Designer with over 8 years of experience in creating intuitive and engaging digital experiences. I specialize in user-centered design, prototyping, and collaborating with cross-functional teams to deliver impactful products that users love.',
  social: {
    linkedin: '#',
    twitter: '#',
    dribbble: '#',
    github: '#'
  },
  stats: {
    rating: '4.95',
    reviews: 124,
    projects: 42,
    completionRate: '98%',
  },
  verification: {
    status: 'Tier 2 Verified',
    items: ['ID Verified', 'Phone Verified', 'Email Verified'],
  },
  gamification: {
    rank: 'Top Rated Plus',
    level: 12,
    xp: 450,
    xpToNext: 1000,
    badges: ['Top Seller', 'Quick Responder', 'Community Expert']
  },
  skills: ['UI/UX Design', 'Prototyping', 'Figma', 'React', 'Webflow', 'User Research', 'Design Systems'],
  portfolio: [
    { id: 1, title: 'Project Alpha', category: 'Web App', imageUrl: 'https://images.unsplash.com/photo-1516116216624-53e697320f64?w=500' },
    { id: 2, title: 'Mobile Banking App', category: 'Mobile App', imageUrl: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=500' },
    { id: 3, title: 'E-commerce Redesign', category: 'E-commerce', imageUrl: 'https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?w=500' },
    { id: 4, title: 'SaaS Dashboard', category: 'SaaS', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500' },
  ],
  reviews: [
    { id: 1, client: 'TechCorp', project: 'Project Alpha', rating: 5, comment: 'Alex is an exceptional designer. His attention to detail and creative solutions were instrumental to our project\'s success.' },
    { id: 2, client: 'FinBank', project: 'Mobile Banking App', rating: 5, comment: 'Working with Alex was a pleasure. He transformed our complex requirements into a simple and elegant user interface.' },
    { id: 3, client: 'Shopify Plus', project: 'E-commerce Redesign', rating: 4, comment: 'Great communication and high-quality deliverables. We saw a significant improvement in user engagement after the redesign.' },
  ],
  activity: [
    { type: 'completed', content: 'Project "Mobile Banking App"', time: '2 days ago' },
    { type: 'review', content: 'Received a 5-star review from FinBank', time: '3 days ago' },
    { type: 'started', content: 'Started a new contract with Innovate Co.', time: '1 week ago' },
    { type: 'skill', content: 'Added "Design Systems" to skills', time: '2 weeks ago' },
  ]
};


// --- FOG SERVICES MOCK DATA (Brand -> Sub-Services Model) ---

export const fullFogServiceBrands = [
  {
    id: 1,
    name: "Fogsly Design Co.",
    logo_url: "", // Placeholder
    short_tagline: "Modern designs for your brand identity.",
    description: "Fogsly Design Co. is a creative studio specializing in branding and visual identity. We help startups and established businesses create memorable logos, stunning websites, and engaging social media content.",
    whatsapp_channel: "#",
    sub_services: [
      {
        id: 101,
        title: "Modern Minimalist Logo Design",
        description: "Get a unique, modern logo that elevates your brand. We focus on clean lines, simple shapes, and a timeless aesthetic that will make your business stand out. Our process is collaborative, ensuring the final design perfectly represents your vision.",
        price: 15000,
        currency: 'PKR',
        image_url: 'https://images.unsplash.com/photo-1600466922579-3754949a27e0?w=800&q=80',
        image_urls: [
          'https://images.unsplash.com/photo-1600466922579-3754949a27e0?w=800&q=80',
          'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&q=80',
          'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80',
          'https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?w=800&q=80',
        ],
        category: "Design",
        rating: 4.9,
        reviews: 120,
        delivery_time: "3 days",
        includes: [
          "3 Initial Logo Concepts",
          "Unlimited Revisions",
          "Vector Source File (AI, EPS)",
          "High-Resolution Files (PNG, JPG, SVG)",
          "Brand Style Guide (Mini)",
          "3D Mockup"
        ],
        faqs: [
          { q: "What do I get in the final delivery?", a: "You will receive high-resolution vector files (AI, EPS, PDF) and web-ready files (PNG, JPG, SVG). We also provide a mini brand style guide with color codes and font information." },
          { q: "How many revisions are included?", a: "We offer unlimited revisions until you are 100% satisfied with the design. Our goal is your complete satisfaction." },
          { q: "What is your design process?", a: "After you place an order, we'll send a brief questionnaire. Based on your answers, we'll create 3 initial concepts. You'll provide feedback, and we'll revise the chosen concept until it's perfect." }
        ]
      },
    ]
  },
  {
    id: 2,
    name: "CodeCrafters",
    logo_url: "",
    short_tagline: "Building robust digital solutions for your business.",
    description: "CodeCrafters is a team of experienced developers focused on delivering high-quality websites, e-commerce stores, and custom software. We turn complex requirements into clean, efficient, and scalable code.",
    whatsapp_channel: "https://whatsapp.com/channel/codecrafters",
    sub_services: [
      {
        id: 201,
        title: "Responsive Landing Page Development",
        description: "Get a stunning, fast, and mobile-friendly landing page built with modern technologies like React and Tailwind CSS. Perfect for product launches, marketing campaigns, or a professional online presence.",
        price: 25000,
        currency: 'PKR',
        image_url: 'https://images.unsplash.com/photo-1542744095-291d1f67b221?w=800&q=80',
        image_urls: [
          'https://images.unsplash.com/photo-1542744095-291d1f67b221?w=800&q=80',
          'https://images.unsplash.com/photo-1559028006-44d081543144?w=800&q=80',
          'https://images.unsplash.com/photo-1604964432806-254d07c11f32?w=800&q=80',
        ],
        category: "Development & IT",
        rating: 4.8,
        reviews: 85,
        delivery_time: "5 days",
        includes: [
          "1 Page Responsive Design",
          "Contact Form Integration",
          "Source Code",
          "Deployment to your hosting",
        ],
        faqs: [
          { q: "What technologies do you use?", a: "We primarily use the MERN stack (MongoDB, Express, React, Node.js) but are flexible and can work with other technologies based on your project requirements." },
          { q: "Is hosting included?", a: "Hosting is not included, but we will deploy the website to your existing hosting provider for free." },
        ]
      },
      {
        id: 202,
        title: "Custom WordPress Plugin",
        description: "Need a unique feature for your WordPress site? We can build a custom, secure, and well-documented plugin to meet your specific needs, from simple shortcodes to complex integrations.",
        price: 40000,
        currency: 'PKR',
        image_url: 'https://images.unsplash.com/photo-1599658880121-d41a50b7a8a2?w=800&q=80',
        image_urls: [
          'https://images.unsplash.com/photo-1599658880121-d41a50b7a8a2?w=800&q=80',
        ],
        category: "Development & IT",
        rating: 4.9,
        reviews: 42,
        delivery_time: "10 days",
        includes: [
          "Plugin Development",
          "Testing & Bug Fixes",
          "Documentation",
          "1 Year of Updates",
        ],
        faqs: [
          { q: "Will the plugin be compatible with my theme?", a: "We build plugins following WordPress best practices to ensure maximum compatibility. We will test it with your active theme." },
        ]
      }
    ]
  },
  {
    id: 3,
    name: "WordWeavers",
    logo_url: "",
    short_tagline: "Crafting compelling content that converts.",
    description: "At WordWeavers, we specialize in creating high-quality written content. From engaging blog posts that boost your SEO to professional resumes that land you interviews, our words work for you.",
    whatsapp_channel: "https://whatsapp.com/channel/wordweavers",
    sub_services: [
      {
        id: 301,
        title: "SEO Blog Post Writing",
        description: "Boost your website's traffic with a professionally written, SEO-optimized blog post. We research keywords and topics relevant to your industry to create content that ranks and engages.",
        price: 7500,
        currency: 'PKR',
        image_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80',
        image_urls: [
          'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80',
        ],
        category: "Writing & Translation",
        rating: 5.0,
        reviews: 150,
        delivery_time: "2 days",
        includes: [
          "1000-word Article",
          "Keyword Research",
          "SEO Optimization (Yoast/RankMath)",
          "2 Royalty-Free Images",
        ],
        faqs: [
          { q: "Can you write about my niche topic?", a: "Absolutely! We have a team of writers with diverse expertise. We will research your topic thoroughly to provide accurate and insightful content." },
        ]
      },
      {
        id: 302,
        title: "Professional Resume & Cover Letter",
        description: "Land your dream job with a professionally crafted resume and cover letter. We highlight your skills and achievements to make you stand out to recruiters.",
        price: 10000,
        currency: 'PKR',
        image_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80',
        image_urls: [
          'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80',
        ],
        category: "Writing & Translation",
        rating: 4.9,
        reviews: 210,
        delivery_time: "3 days",
        includes: [
          "ATS-Optimized Resume",
          "Tailored Cover Letter",
          "Editable Word & PDF files",
          "LinkedIn Profile Review",
        ],
        faqs: [
          { q: "What information do you need from me?", a: "We will send you a questionnaire to gather all the necessary details, including your work history, education, and the job you're targeting." },
        ]
      }
    ]
  },
  {
    id: 4,
    name: "MarketMinds",
    logo_url: "",
    short_tagline: "Data-driven marketing for measurable growth.",
    description: "MarketMinds helps businesses grow through strategic digital marketing. We manage social media, run effective ad campaigns, and create engaging email newsletters to build your brand and drive sales.",
    whatsapp_channel: "https://whatsapp.com/channel/marketminds",
    sub_services: [
      {
        id: 401,
        title: "Social Media Management (Monthly)",
        description: "We will manage one of your social media platforms (Instagram, Facebook, or Twitter) for a month. This includes content creation, posting, and basic engagement.",
        price: 30000,
        currency: 'PKR',
        image_url: 'https://images.unsplash.com/photo-1611162617213-6d22e6f2e2b1?w=800&q=80',
        image_urls: [
          'https://images.unsplash.com/photo-1611162617213-6d22e6f2e2b1?w=800&q=80',
        ],
        category: "Sales & Marketing",
        rating: 4.7,
        reviews: 65,
        delivery_time: "30 days",
        includes: [
          "12 Custom Posts",
          "Hashtag Research",
          "Scheduled Posting",
          "Monthly Performance Report",
        ],
        faqs: [
          { q: "Do you create video content?", a: "This package includes static image and text-based posts. Video content can be added for an extra fee." },
        ]
      },
      {
        id: 402,
        title: "Google Ads Campaign Setup",
        description: "Get a professional Google Ads search campaign set up for your business. We handle keyword research, ad copy writing, and campaign configuration to maximize your ROI. Ad spend is not included.",
        price: 20000,
        currency: 'PKR',
        image_url: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=800&q=80',
        image_urls: [
          'https://images.unsplash.com/photo-1557862921-37829c790f19?w=800&q=80',
        ],
        category: "Sales & Marketing",
        rating: 4.8,
        reviews: 90,
        delivery_time: "4 days",
        includes: [
          "Keyword Research (up to 20)",
          "3 Ad Copies",
          "Campaign & Ad Group Setup",
          "Conversion Tracking Setup Guide",
        ],
        faqs: [
          { q: "Is ad budget included?", a: "No, the price is for the setup service only. The ad budget is paid directly to Google." },
        ]
      }
    ]
  },
  {
    id: 5,
    name: "PixelPerfect",
    logo_url: "",
    short_tagline: "Engaging video and animation for your brand.",
    description: "PixelPerfect creates eye-catching visual content. We produce short video ads, animated logos, and explainer videos that capture attention and tell your story effectively.",
    whatsapp_channel: "https://whatsapp.com/channel/pixelperfect",
    sub_services: [
      {
        id: 501,
        title: "Short Video Ad (30 seconds)",
        description: "Get a high-impact, 30-second video ad for your social media channels. We use stock footage, text overlays, and background music to create a professional video that drives engagement.",
        price: 18000,
        currency: 'PKR',
        image_url: 'https://images.unsplash.com/photo-1574717024633-6cf301a31d60?w=800&q=80',
        image_urls: [
          'https://images.unsplash.com/photo-1574717024633-6cf301a31d60?w=800&q=80',
        ],
        category: "Video & Animation",
        rating: 4.9,
        reviews: 112,
        delivery_time: "5 days",
        includes: [
          "30-second Video",
          "Licensed Stock Footage",
          "Background Music",
          "Formatted for Instagram/TikTok",
        ],
        faqs: [
          { q: "Can I provide my own footage?", a: "Yes, you can provide your own footage and we will edit it into the final video." },
        ]
      },
      {
        id: 502,
        title: "Animated Logo Intro",
        description: "Add a professional touch to your videos with a custom animated logo intro. We'll create a clean and modern animation of your existing logo.",
        price: 8000,
        currency: 'PKR',
        image_url: 'https://images.unsplash.com/photo-1611162617213-6d22e6f2e2b1?w=800&q=80',
        image_urls: [
          'https://images.unsplash.com/photo-1611162617213-6d22e6f2e2b1?w=800&q=80',
        ],
        category: "Video & Animation",
        rating: 5.0,
        reviews: 180,
        delivery_time: "3 days",
        includes: [
          "5-10 second Animation",
          "Full HD 1080p Output",
          "Sound Effects",
          "Transparent Background Version",
        ],
        faqs: [
          { q: "Do you design the logo as well?", a: "This service is for animating an existing logo. If you need a logo designed, please check out our design services." },
        ]
      }
    ]
  },
  {
    id: 6,
    name: "LaunchPad SEO",
    logo_url: "",
    short_tagline: "Climb the search rankings and get found online.",
    description: "LaunchPad SEO provides technical and local SEO services to help your business increase its visibility on search engines like Google. We help you attract more organic traffic and customers.",
    whatsapp_channel: "https://whatsapp.com/channel/launchpadseo",
    sub_services: [
      {
        id: 601,
        title: "Complete SEO Audit & Report",
        description: "Understand your website's SEO health with a comprehensive audit. We analyze technical SEO, on-page factors, and backlink profile to provide a detailed report with actionable recommendations.",
        price: 15000,
        currency: 'PKR',
        image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
        image_urls: [
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
        ],
        category: "Sales & Marketing",
        rating: 4.8,
        reviews: 75,
        delivery_time: "4 days",
        includes: [
          "Technical SEO Analysis",
          "On-Page Content Review",
          "Backlink Profile Overview",
          "Actionable PDF Report",
        ],
        faqs: [
          { q: "Do you implement the changes?", a: "This service provides the audit and report only. We offer a separate service for implementing the recommended changes." },
        ]
      },
      {
        id: 602,
        title: "Local SEO Setup (Google My Business)",
        description: "Get your local business on the map. We will set up and optimize your Google My Business profile to improve your visibility in local search results and attract nearby customers.",
        price: 8000,
        currency: 'PKR',
        image_url: 'https://images.unsplash.com/photo-1549989476-69a92fa57c36?w=800&q=80',
        image_urls: [
          'https://images.unsplash.com/photo-1549989476-69a92fa57c36?w=800&q=80',
        ],
        category: "Sales & Marketing",
        rating: 4.9,
        reviews: 130,
        delivery_time: "2 days",
        includes: [
          "GMB Profile Creation",
          "Business Info Optimization",
          "Photo Uploads (up to 5)",
          "Service Area Setup",
        ],
        faqs: [
          { q: "What do you need from me to start?", a: "We'll need your business name, address, phone number, website, and operating hours to get started." },
        ]
      }
    ]
  }
];

export const singleFogServiceData = { ...fullFogServiceBrands[0].sub_services[0] };

export const fogServiceBrands = fullFogServiceBrands.map(({ sub_services, ...brand }) => brand);

// FIX: Create and export `fogServices` by flattening the `sub_services` from `fullFogServiceBrands` and including brand info.
export const fogServices = fullFogServiceBrands.flatMap(brand =>
  brand.sub_services.map(service => ({
    ...service,
    brand: {
      id: brand.id,
      name: brand.name
    }
  }))
);

export const brandMessages = [
  { id: 1, sender: 'brand', text: 'Hi there! Thanks for reaching out to Fogsly Design Co. How can we help you today?', time: '11:01 AM' },
  { id: 2, sender: 'me', text: 'Hi, I was interested in the Modern Minimalist Logo Design service. I have a few questions.', time: '11:02 AM' },
  { id: 3, sender: 'brand', text: 'Of course! We\'d be happy to answer them. What would you like to know?', time: '11:03 AM' },
];

export const myUserBrand = {
  id: 99,
  name: "Creative Wizards",
  logo_url: "",
  short_tagline: "Magical solutions for your creative needs.",
  description: "Creative Wizards is your one-stop shop for enchanting designs, captivating content, and powerful marketing spells. We turn your ideas into reality with a touch of magic and a lot of expertise.",
  whatsapp_channel: "https://whatsapp.com/channel/creativewizards",
  sub_services: [
    {
      id: 9901,
      title: "Enchanting Logo Spell",
      description: "A custom logo that captures the essence of your brand, complete with 3 concepts and vector files.",
      price: 250,
      currency: 'USD',
      type: 'fixed',
      image_url: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=500',
    },
    {
      id: 9902,
      title: "Social Media Potion",
      description: "A month of custom social media posts and strategy to boost your online presence.",
      price: null,
      currency: 'USD',
      type: 'quote',
      image_url: 'https://images.unsplash.com/photo-1611162617213-6d22e6f2e2b1?w=500',
    },
  ]
};


// export const aboutPageData = {
//   story: {
//     title: "Our Story",
//     content: "FOGSLY was born from a simple yet powerful idea: to create a single, unified platform where any type of work—be it a complex software project or a simple home repair—could be sourced and managed with trust and efficiency. We saw a fragmented market of specialized freelance sites and local service apps, and envisioned a future where talent and opportunity could connect without barriers. Our journey began with a small team of passionate innovators dedicated to building this hybrid ecosystem, grounded in blockchain for transparency and AI for intelligent matching."
//   },
//   missionVision: {
//     mission: {
//       title: "Our Mission",
//       content: "To empower professionals and clients worldwide by providing a flexible, secure, and rewarding platform that seamlessly integrates digital and physical services, fostering economic growth and opportunity for all."
//     },
//     vision: {
//       title: "Our Vision",
//       content: "To be the world's most trusted and comprehensive work marketplace, where anyone can find the right talent or service, and every professional can build a prosperous and independent career."
//     }
//   },
//   founders: [
//     { name: 'Ruh Ul Hassnain', role: 'Founder & CEO', bio: 'Pioneering the next generation of on-demand services, bridging talent and opportunity with blockchain.', socials: { linkedin: '#', twitter: '#' } },
//     { name: 'Alishba Sundas', role: 'Co-founder & COO', bio: 'Architecting the operational framework of FOGSLY for a seamless and empowering user experience.', socials: { linkedin: '#', twitter: '#' } },
//     { name: 'Ibrar Hussain', role: 'Chairman & Chief Advisor', bio: 'Guiding FOGSLY\'s strategic direction with decades of experience, ensuring a foundation of integrity.', socials: { linkedin: '#', twitter: '#' } }
//   ],
//   milestones: [
//     { year: 2022, achievement: "Concept of a hybrid freelance and tasker platform is born." },
//     { year: 2023, achievement: "Secured pre-seed funding and began core platform development." },
//     { year: 2024, achievement: "Launched Beta version with FOG Coin integration for early adopters." },
//     { year: 2025, achievement: "Expanded to 50+ countries and surpassed 100,000 verified users." }
//   ]
// };

export const aboutPageData = {
  hero: {
    headline: "Building the Future of Digital Work",
    subheadline: "FOGSLY is a government-registered, trusted digital marketplace that seamlessly connects skills, opportunities, and technology into one secure, all-in-one earning platform.",
    highlights: ["Registered & Trusted Platform", "Multiple Earning Models", "AI-Powered Digital Ecosystem"]
  },
  whoWeAre: {
    title: "Who We Are",
    description: "FOGSLY is a government-registered digital marketplace and online earning platform built to connect global talent, verified opportunities, and smart technology in one secure ecosystem. We are designed for freelancers, professionals, creators, and businesses who want to work, earn, and grow digitally with trust and transparency.\n \n By combining freelancing, online jobs, digital services, micro tasks, and blockchain-based rewards, FOGSLY delivers a future-ready solution that supports secure payments, verified systems, and scalable growth for users worldwide."
  },
  mission: {
    title: "Our Mission",
    points: ["Our mission is to create a trusted global marketplace where individuals can earn money online, build long-term careers, and access secure digital earning opportunities without barriers. We aim to simplify online work through verified systems, secure payments, and smart technology."]
  },
  vision: {
    title: "Our Vision",
    description: "We envision FOGSLY as a leading AI-powered and blockchain-enabled platform that transforms how people find work, offer services, and earn digital currency globally. Our goal is to shape the future of work-from-anywhere opportunities."
  },
  differentiation: [
    { title: "All-in-One Ecosystem", description: "Freelancing, jobs, tasks, and AI tools in one platform." },
    { title: "Verified & Secure", description: "Government-registered structure with strong trust." },
    { title: "Multiple Earning Models", description: "From freelancing to micro-tasks." },
    { title: "AI-Powered Tools", description: "AI for content creation and productivity." }
  ],
  ecosystem: [
    { name: "Freelance Hub", icon: "Briefcase" },
    { name: "Tasker Hub", icon: "Wrench" },
    { name: "Fog Jobs", icon: "FileText" },
    { name: "Fog e-Services", icon: "ShoppingBag" },
    { name: "AI Tools", icon: "Sparkles" },
    { name: "Fog Shop", icon: "Store" },
    { name: "Gamification System", icon: "Award" },
    { name: "Events & Expo", icon: "Globe" }
  ],
  trust: ["Registered business entity", "Transparent processes", "User-first policies"],
  founderMessage: {
    quote: "Fogsly was built to give people real opportunities — not false promises.",
    name: "Ruh Ul Hassnain",
    designation: "Founder & CEO, Fogsly (Pvt) Ltd"
  }
};


export const careersPageData = {
  hero: {
    title: "Build the Future with Fogsly",
    subtitle: "Join a mission-driven team shaping the future of digital work and AI.",
    headline: "Join Our Global Team",
    subheadline: "Join FOGSLY’s global team to build innovative digital products powering online earning, freelancing, and secure marketplaces worldwide.",
    highlights: ["Impactful Work", "Growth Mindset", "Global Team"]
  },
  whyJoin: {
    title: "Why Join Fogsly?",
    points: [
      { title: "Impactful Work", description: "Build products used by thousands of professionals.", icon: "Target" },
      { title: "Growth Mindset", description: "Heavy investment in team learning and tools.", icon: "Zap" },
      { title: "Radical Transparency", description: "Open communication at all levels.", icon: "ShieldCheck" },
      { title: "Global Reach", description: "Collaborate with talent from all over the world.", icon: "Globe" },
      { title: "Flexible Work", description: "Ownership-driven, results-oriented culture.", icon: "Heart" }
    ]
  },
  culture: {
    title: "Our Culture",
    description: "We value ownership, radical transparency, and results over hours.",
    values: [
      { title: "Ownership", description: "Take full responsibility for your results." },
      { title: "Radical Transparency", description: "Honest communication is our baseline." },
      { title: "Results over Hours", description: "We care about outcomes, not the clock." }
    ]
  },
  openPositions: {
    title: "Open Positions",
    categories: ["Development", "Design", "Marketing"],
    roles: [
      { id: 1, title: "Senior React Engineer", category: "Development", location: "Remote", type: "Full-time", description: "Help build the future of our marketplace." }
    ]
  },
  lifeAtFogsly: {
    title: "Life at Fogsly",
    description: "Flexible hours, global team, and a focus on wellness.",
    benefits: ["Flexible PTO", "Health Stipend", "Learning Budget"]
  },
  hiringProcess: {
    steps: [{ title: "Apply", description: "Send your CV" }]
  },
  founderMessage: {
    quote: "We're not just building a platform; we're building a new way of working.",
    name: "Ruh Ul Hassnain",
    designation: "CEO"
  }
};


export const pressPageData = {
  hero: { title: "Press", subheadline: "Latest News", headline: "Fogsly in the News" },
  releases: [{ id: 1, date: "Aug 2024", title: "Fogsly Official Launch", snippet: "Fogsly officially enters the market...", content: "Full launch details...", category: "Corporate" }],
  mediaKit: [
    { name: "Brand Guidelines", type: "PDF", size: "2.5 MB", icon: "FileText" },
    { name: "Logos", type: "ZIP", size: "12.1 MB", icon: "Image" }
  ],
  featuredIn: [],
  factSheet: [{ label: "Founded", value: "2021" }],
  contact: { name: "Media Relations", email: "press@fogsly.com" },
  categories: ["All", "Product", "Corporate", "Community"]
};

export const blogPageData = {
  hero: { title: "Blog", subheadline: "Latest Insights", headline: "The Fogsly Blog" },
  categories: ["All", "Freelancing", "AI", "Digital Work"],
  posts: [
    { id: 1, title: "The Future of AI", author: "RH", date: "Aug 2024", imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500", excerpt: "AI is changing...", content: "Full content...", tags: ["AI", "Work"], category: "AI", authorBio: "CEO of Fogsly" },
    { id: 2, title: "Mastering the Art of Freelance Negotiation", author: "Sarah Chen", date: "Jan 2025", imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500", excerpt: "Learn essential strategies for negotiating better rates and terms as a freelancer.", content: "Negotiation is a critical skill in the freelance world. In this comprehensive guide, we explore proven techniques for securing higher rates, favorable project terms, and long-term client relationships. From setting your baseline rates to handling difficult conversations, discover how to advocate for your value while maintaining professional relationships.", tags: ["Freelancing", "Skills", "Negotiation"], category: "Freelancing", authorBio: "Freelance strategist and career coach with 10+ years of experience helping professionals thrive." }
  ],

  contributors: [
    { name: "Ruh Ul Hassnain", role: "CEO", bio: "Leading Fogsly towards the future of work." },
    { name: "Sarah Chen", role: "Career Strategist", bio: "Helping freelancers build sustainable careers." }
  ],
  featuredPostId: 1
};



export const featuresPageData = {
  hero: {
    title: "Everything You Need to Learn, Work, and Earn",
    subtitle: "A comprehensive ecosystem for modern professionals."
  },
  modules: [
    { name: "Freelance Hub", description: "Secure global marketplace.", iconName: "Briefcase", route: "find-work" as Route },
    { name: "Tasker Hub", description: "Local and micro tasks.", iconName: "Wrench", route: "tasker-hub" as Route }
  ],
  whyFogsly: ["Trusted", "Secure", "Global"],
  howItWorks: ["Sign up", "Apply", "Earn"],
  audiences: ["Students", "Freelancers", "Pros"]
};


// Mock data for Fog Jobs page (On-Site Jobs)
export const onSiteJobs = [
  {
    id: 101,
    title: "Senior Frontend Developer",
    companyName: "Innovate Inc.",
    category: 'Development & IT',
    skills: ["React", "TypeScript", "GraphQL"],
    educationLevel: "Bachelor's Degree",
    experienceLevel: "Expert",
    salaryRange: "$80k - $120k/year",
    salaryMin: 80000,
    salaryMax: 120000,
    jobType: "Full-Time",
    country: "USA",
    city: "San Francisco",
    postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'Active',
  },
  {
    id: 102,
    title: "High School English Teacher",
    companyName: "Global Education Foundation",
    category: 'Education',
    skills: ["Teaching", "Curriculum Development", "English Literature"],
    educationLevel: "Master's Degree",
    experienceLevel: "Intermediate",
    salaryRange: "$50k - $65k/year",
    salaryMin: 50000,
    salaryMax: 65000,
    jobType: "Full-Time",
    country: "Canada",
    city: "Toronto",
    postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'Active',
  },
  {
    id: 103,
    title: "Office Administrator",
    companyName: "Solutions Corp",
    category: 'Admin Support',
    skills: ["Microsoft Office", "Scheduling", "Bookkeeping"],
    educationLevel: "High School Diploma",
    experienceLevel: "Entry",
    salaryRange: "$40k - $50k/year",
    salaryMin: 40000,
    salaryMax: 50000,
    jobType: "Full-Time",
    country: "Pakistan",
    city: "Lahore",
    postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'Hired',
  },
  {
    id: 104,
    title: "Construction Project Manager",
    companyName: "BuildRight Constructors",
    category: 'Construction',
    skills: ["Project Management", "Budgeting", "AutoCAD"],
    educationLevel: "Bachelor's in Civil Engineering",
    experienceLevel: "Expert",
    salaryRange: "$90k - $130k/year",
    salaryMin: 90000,
    salaryMax: 130000,
    jobType: "Full-Time",
    country: "UAE",
    city: "Dubai",
    postedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    status: 'Active',
  },
  {
    id: 105,
    title: "Marketing Manager",
    companyName: "TechNova",
    category: 'Sales & Marketing',
    skills: ["Digital Marketing", "SEO", "Content Strategy"],
    educationLevel: "Bachelor's in Marketing",
    experienceLevel: "Intermediate",
    salaryRange: "$70k - $90k/year",
    salaryMin: 70000,
    salaryMax: 90000,
    jobType: "Full-Time",
    country: "UK",
    city: "London",
    postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'Pending',
  },
];


export const eventsData = [
  {
    id: 1,
    title: "Fogsly Global Tech Expo 2024",
    category: "Expo",
    date: "Nov 15, 2024",
    time: "10:00 AM",
    city: "Japan",
    venue: "Moscone Center",
    type: "Physical",
    coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    shortDesc: "The pinnacle of tech innovation and vendor networking.",
    longDesc: "Join us for the annual Fogsly Tech Expo, where the future of work meets cutting-edge technology. Experience keynote speeches from industry leaders, hands-on workshops, and networking opportunities with thousands of professionals.",
    status: "Upcoming",
    stats: { visitors: 5000, exhibitors: 120, registrations: 4500 },
    stalls: [
      { id: 'gold', name: 'Gold Booth', price: 2500, benefits: ['Prime Location', '4 Staff Passes', 'Logo on Main Stage'] },
      { id: 'silver', name: 'Silver Booth', price: 1200, benefits: ['Standard Location', '2 Staff Passes', 'Logo on Website'] }
    ]
  },
  {
    id: 2,
    title: "AI Strategy Seminar",
    category: "Seminar",
    date: "Dec 05, 2024",
    time: "02:00 PM",
    city: "London, UK",
    venue: "The Excel Centre",
    type: "Hybrid",
    coverImage: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80",
    shortDesc: "Mastering AI integration for modern enterprises.",
    status: "Upcoming",
    stats: { visitors: 300, exhibitors: 15, registrations: 280 },
    stalls: [{ id: 'standard', name: 'Exhibition Table', price: 800, benefits: ['1 Staff Pass', 'Attendee List Access'] }]
  },
  {
    id: 3,
    title: "Blockchain Founders Meetup",
    category: "Meetup",
    date: "Jan 12, 2025",
    time: "06:30 PM",
    city: "Dubai, UAE",
    venue: "Innovation Hub",
    type: "Physical",
    coverImage: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80",
    shortDesc: "Casual networking for Web3 and Blockchain innovators.",
    status: "Upcoming",
    stats: { visitors: 150, exhibitors: 5, registrations: 120 },
    stalls: [{ id: 'corner', name: 'Networking Corner', price: 400, benefits: ['Banner Placement', 'Reserved Table'] }]
  },
  {
    id: 4,
    title: "Virtual Freelance Summit",
    category: "Online Seminar",
    date: "Nov 22, 2024",
    time: "09:00 AM",
    city: "Global",
    venue: "Fogsly Virtual Hall",
    type: "Online",
    coverImage: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800&q=80",
    shortDesc: "Connecting remote talent across all time zones.",
    status: "Upcoming",
    stats: { visitors: 10000, exhibitors: 50, registrations: 8500 },
    stalls: [{ id: 'v-booth', name: 'Virtual Booth', price: 300, benefits: ['Video Auto-play', 'Direct Chat Link'] }]
  },
  {
    id: 5,
    title: "Sustainable Tech Forum",
    category: "Seminar",
    date: "Feb 10, 2025",
    time: "11:00 AM",
    city: "Berlin, DE",
    venue: "EcoHub Center",
    type: "Physical",
    coverImage: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
    shortDesc: "Eco-friendly innovations for the next generation.",
    status: "Upcoming",
    stats: { visitors: 400, exhibitors: 20, registrations: 350 },
    stalls: [{ id: 'green', name: 'Eco Stall', price: 950, benefits: ['Recycled Furniture Provided', 'Organic Catering'] }]
  },
  {
    id: 6,
    title: "Creative Design Expo",
    category: "Expo",
    date: "Mar 05, 2025",
    time: "10:00 AM",
    city: "New York, NY",
    venue: "The Javits Center",
    type: "Physical",
    coverImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80",
    shortDesc: "The world's largest gathering of design agencies.",
    status: "Upcoming",
    stats: { visitors: 3000, exhibitors: 80, registrations: 2200 },
    stalls: [
      { id: 'premium', name: 'Designer Studio', price: 2000, benefits: ['Wall for Artwork', '3 Staff Passes'] }
    ]
  },
  {
    id: 7,
    title: "Web3 Developer Workshop",
    category: "Online Seminar",
    date: "Oct 15, 2024",
    time: "03:00 PM",
    city: "Global",
    venue: "Live Stream",
    type: "Online",
    coverImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
    shortDesc: "Hands-on Solidity and Smart Contract coding.",
    status: "Past",
    stats: { visitors: 500, exhibitors: 0, registrations: 500 },
    stalls: []
  },
  {
    id: 8,
    title: "SaaS Growth Hackathon",
    category: "Meetup",
    date: "Apr 20, 2025",
    time: "09:00 AM",
    city: "Austin, TX",
    venue: "Capital Factory",
    type: "Physical",
    coverImage: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80",
    shortDesc: "Build and scale your SaaS in 48 hours.",
    status: "Upcoming",
    stats: { visitors: 200, exhibitors: 10, registrations: 180 },
    stalls: [{ id: 'hack', name: 'Team Table', price: 600, benefits: ['24/7 Access', 'Dedicated Mentor Slot'] }]
  },
  {
    id: 9,
    title: "E-commerce Future Seminar",
    category: "Seminar",
    date: "May 12, 2025",
    time: "01:00 PM",
    city: "Singapore",
    venue: "Marina Bay Sands",
    type: "Hybrid",
    coverImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    shortDesc: "Omnichannel strategies for global retailers.",
    status: "Upcoming",
    stats: { visitors: 600, exhibitors: 30, registrations: 520 },
    stalls: [{ id: 'retail', name: 'Retail Stall', price: 1100, benefits: ['Digital Kiosk', '10 Guest Passes'] }]
  },
  {
    id: 10,
    title: "Fintech Leaders Summit",
    category: "Expo",
    date: "Sep 20, 2024",
    time: "09:00 AM",
    city: "Zurich, CH",
    venue: "Congress Center",
    type: "Physical",
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    shortDesc: "Shaping the future of digital banking.",
    status: "Past",
    stats: { visitors: 1200, exhibitors: 45, registrations: 1150 },
    stalls: []
  }
];


export const eventUpdates = [
  { id: 1, eventId: 1, text: "Keynote speech starting in 10 minutes at the main stage!", time: "10:50 AM" },
  { id: 2, eventId: 1, text: "The VR Demo area is now open for visitors.", time: "11:15 AM" }
];




export const giveawaysData = [
  {
    id: 1,
    title: "100 Fog Coin Engagement Drop",
    status: "Active",
    totalCoins: 100,
    winnersCount: 10,
    endTime: new Date(Date.now() + 86400000 * 2).toISOString(),
    participants: 1420,
    requiredNft: "Early Bird",
    distributionType: "Equal",
    type: "coins" as const,
    description: "Our weekly FOG drop for active community members. Secure your share of the ecosystem!"
  },
  {
    id: 2,
    title: "Legendary NFT Whitelist",
    status: "Active",
    totalCoins: 0,
    winnersCount: 5,
    endTime: new Date(Date.now() + 86400000 * 5).toISOString(),
    participants: 850,
    requiredNft: "Legendary",
    distributionType: "Whitelist",
    type: "nft" as const,
    description: "Exclusive access to the upcoming 'Desert Nomads' NFT collection minting next month."
  },
  {
    id: 3,
    title: "500 FOG Mega Distribution",
    status: "Active",
    totalCoins: 500,
    winnersCount: 20,
    endTime: new Date(Date.now() + 3600000 * 4).toISOString(),
    participants: 3200,
    requiredNft: "Any Fogsly NFT",
    distributionType: "Equal",
    type: "coins" as const,
    description: "Flash giveaway! High volume distribution for all NFT holders. Ends very soon."
  },
  {
    id: 4,
    title: "Premium Service Pass",
    status: "Active",
    totalCoins: 0,
    winnersCount: 3,
    endTime: new Date(Date.now() + 86400000 * 10).toISOString(),
    participants: 410,
    requiredNft: "Level_1_to_307",
    distributionType: "Voucher",
    type: "service" as const,
    description: "Get a 100% discount on any service from 'Fogsly Official' brand up to $200."
  },
  {
    id: 5,
    title: "Early Bird Bonus Pack",
    status: "Active",
    totalCoins: 50,
    winnersCount: 50,
    endTime: new Date(Date.now() + 86400000 * 1).toISOString(),
    participants: 120,
    requiredNft: "Early Bird",
    distributionType: "Equal",
    type: "coins" as const,
    description: "A special small-pool giveaway exclusively for our earliest supporters."
  }
];

export const userNftStatus = {
  hasNft: true,
  nftType: "Early Bird",
  level: "307",
  isVerified: true
};

// --- Events Types & Data ---

export type EventType = "physical" | "virtual" | "hybrid";
export type EventStatus = "draft" | "pending" | "coming_soon" | "live" | "completed" | "expired" | "cancelled";

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  type: EventType;
  status: EventStatus;
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime?: string;
  city?: string;
  country?: string;
  address?: string;
  virtualLink?: string;
  banner: string;
  organizerName: string;
  organizerId?: string;
  organizerAvatar: string;
  price: string;
  attendees: number;
  maxCapacity?: number;
  isFeatured?: boolean;
  tags: string[];
}

export const CATEGORIES = ["All", "Tech & Innovation", "Education", "Networking", "Art & Design", "Marketing", "Business"];
export const STATUS_FILTERS = [
  { label: "All Status", value: "All" },
  { label: "Live Now", value: "live" },
  { label: "Upcoming", value: "coming_soon" },
  { label: "Past Events", value: "expired" }
];

export const MOCK_EVENTS: Event[] = [
  {
    id: "1",
    title: "Fogsly Global Summit 2024",
    description: "Join industry leaders for a day of innovation, networking, and future-forward discussions about the gig economy. Keynote speakers include tech CEOs and freelance pioneers.",
    category: "Tech & Innovation",
    type: "virtual",
    status: "live",
    startDate: "Nov 15, 2024",
    startTime: "10:00 AM EST",
    virtualLink: "https://fogsly.com/live/summit",
    banner: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200",
    organizerName: "Fogsly Official",
    organizerAvatar: "https://img.icons8.com/3d-fluency/94/conference-call.png",
    price: "Free",
    attendees: 1240,
    maxCapacity: 5000,
    isFeatured: true,
    tags: ["Tech", "Networking", "Future of Work"]
  },
  {
    id: "2",
    title: "Freelance Mastery Workshop",
    description: "Learn how to scale your freelance business from $0 to $10k/month with proven strategies. Includes workbook and 1-on-1 coaching session.",
    category: "Education",
    type: "physical",
    status: "coming_soon",
    startDate: "Oct 28, 2024",
    startTime: "02:00 PM GMT",
    city: "London",
    country: "UK",
    address: "Excel Centre, Hall 4",
    banner: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=1200",
    organizerName: "Sarah Jenkins",
    organizerAvatar: "https://i.pravatar.cc/150?img=5",
    price: "50 FOG",
    attendees: 85,
    maxCapacity: 100,
    isFeatured: false,
    tags: ["Business", "Coaching", "Workshop"]
  },
  {
    id: "3",
    title: "Digital Art & NFT Expo",
    description: "A showcase of the best digital art from our community members. Buy, sell, and trade NFTs directly with creators.",
    category: "Art & Design",
    type: "hybrid",
    status: "coming_soon",
    startDate: "Dec 05, 2024",
    startTime: "09:00 AM PST",
    city: "New York",
    country: "USA",
    address: "Javits Center & Online",
    virtualLink: "https://fogsly.com/live/nft-expo",
    banner: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1200",
    organizerName: "Pixel Collective",
    organizerAvatar: "https://i.pravatar.cc/150?img=8",
    price: "25 FOG",
    attendees: 300,
    maxCapacity: 1000,
    isFeatured: true,
    tags: ["Art", "Crypto", "Exhibition"]
  },
  {
    id: "4",
    title: "Local Handyman Meetup",
    description: "Connect with local taskers, share tips on home repair, and grow your local network. Free pizza and drinks provided!",
    category: "Networking",
    type: "physical",
    status: "expired",
    startDate: "Sep 10, 2024",
    startTime: "06:00 PM",
    city: "Toronto",
    country: "Canada",
    address: "Community Hub A",
    banner: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1200",
    organizerName: "Tasker Guild",
    organizerAvatar: "https://img.icons8.com/3d-fluency/94/maintenance.png",
    price: "Free",
    attendees: 45,
    maxCapacity: 50,
    isFeatured: false,
    tags: ["Community", "Trades", "Local"]
  },
  {
    id: "5",
    title: "AI for Marketing Webinar",
    description: "Discover how to use the latest AI tools to automate your social media and content creation workflow.",
    category: "Marketing",
    type: "virtual",
    status: "pending",
    startDate: "Nov 20, 2024",
    startTime: "01:00 PM EST",
    virtualLink: "zoom.us/j/123456",
    banner: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1200",
    organizerName: "Growth Hackers",
    organizerAvatar: "https://i.pravatar.cc/150?img=12",
    price: "15 FOG",
    attendees: 12,
    maxCapacity: 500,
    isFeatured: false,
    tags: ["AI", "Marketing", "Webinar"]
  }
];


