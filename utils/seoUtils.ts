import { useEffect } from 'react';
import { type Route } from '../types';

export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile' | 'event';
  author?: string;
  publishedTime?: string;
}

const DEFAULT_SEO: SEOConfig = {
  title: "FOGSLY | Pakistan's Premier Careers & Events Network",
  description: "Find jobs, internships, freelance gigs, and explore top tech events, conferences, and workshops in Pakistan on FOGSLY.",
  keywords: "jobs in pakistan, internships, remote work, tech events, expos, webinars, freelance pakistan, fogsly",
  image: "/FOGCOIN_SITE_ICON.png",
  url: typeof window !== 'undefined' ? window.location.origin : 'https://fogsly.com',
  type: 'website',
};

/**
 * Helper function to safely update or create a meta tag by name or property
 */
const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
  if (typeof document === 'undefined') return;

  let element = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

/**
 * Helper function to safely update or create a link tag (e.g. canonical)
 */
const setLinkTag = (rel: string, href: string) => {
  if (typeof document === 'undefined') return;

  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
};

/**
 * Dynamically updates the document title and meta tags based on the active route or page data.
 */
export const updateDocumentSEO = (config: SEOConfig = {}) => {
  if (typeof document === 'undefined') return;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://fogsly.com';
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  const currentUrl = config.url || `${currentOrigin}${currentPath}`;

  // Format document title: Ensure brand suffix is clean
  let fullTitle = config.title || DEFAULT_SEO.title!;
  if (!fullTitle.includes('FOGSLY')) {
    fullTitle = `${fullTitle} | FOGSLY`;
  }
  document.title = fullTitle;

  const description = config.description || DEFAULT_SEO.description!;
  const keywords = config.keywords || DEFAULT_SEO.keywords!;
  const image = config.image ? (config.image.startsWith('http') ? config.image : `${currentOrigin}${config.image}`) : `${currentOrigin}/FOGCOIN_SITE_ICON.png`;
  const ogType = config.type || 'website';

  // 1. Standard HTML Meta Tags
  setMetaTag('name', 'description', description);
  setMetaTag('name', 'keywords', keywords);
  setLinkTag('canonical', currentUrl);

  // 2. Open Graph (Facebook / LinkedIn / Discord)
  setMetaTag('property', 'og:site_name', 'FOGSLY (Private) Limited');
  setMetaTag('property', 'og:title', fullTitle);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:url', currentUrl);
  setMetaTag('property', 'og:type', ogType);
  setMetaTag('property', 'og:image', image);

  // 3. Twitter Card
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', fullTitle);
  setMetaTag('name', 'twitter:description', description);
  setMetaTag('name', 'twitter:image', image);

  // 4. Optional Article / Publish Meta
  if (config.author) {
    setMetaTag('name', 'author', config.author);
  }
  if (config.publishedTime) {
    setMetaTag('property', 'article:published_time', config.publishedTime);
  }
};

/**
 * Returns SEO configuration for default application routes
 */
export const getRouteSEO = (route: Route | string, context?: any): SEOConfig => {
  switch (route) {
    case 'home':
      return {
        title: "FOGSLY | Pakistan's Premier Careers & Events Network",
        description: "Find jobs, internships, freelance gigs, and explore top tech events, conferences, and workshops in Pakistan on FOGSLY.",
        type: 'website'
      };

    case 'fog-jobs':
    case 'find-work':
      return {
        title: "Browse Verified Jobs & Internships | FOGSLY",
        description: "Explore hundreds of full-time, part-time, remote, and internship job opportunities from trusted companies across Pakistan.",
        keywords: "job search, hiring, careers pakistan, lahore jobs, karachi jobs, islamabad jobs, remote tech jobs"
      };

    case 'events':
      return {
        title: "Discover Tech Events, Conferences & Expos | FOGSLY",
        description: "Find upcoming tech conferences, webinars, workshops, and networking expos across Pakistan. Book tickets and connect with organizers.",
        keywords: "tech events pakistan, webinars, developer workshops, business expos, conference tickets"
      };

    case 'event-detail':
      return {
        title: context?.title ? `${context.title} | Event Details` : "Event Details & Tickets | FOGSLY",
        description: context?.description || "Get full event details, agenda, speakers, location, and register for tickets on FOGSLY.",
        type: 'event'
      };

    case 'blog':
      return {
        title: "Career & Tech Insights | FOGSLY Blog",
        description: "Read expert guides, career growth tips, freelancing advice, and tech industry news on the official FOGSLY blog.",
        keywords: "career advice, freelancing tips, tech articles, resume guide, fogsly blog"
      };

    case 'blog-post':
      return {
        title: context?.title ? `${context.title} | Insights` : "Article | FOGSLY Blog",
        description: context?.excerpt || context?.description || "Read this article on FOGSLY.",
        type: 'article'
      };

    case 'post-job':
    case 'post-physical-job':
      return {
        title: "Post a Job | Hire Top Talent on FOGSLY",
        description: "Reach thousands of qualified professionals, graduates, and interns in Pakistan. Post your job opening today.",
        keywords: "post job, employer hiring, recruiter portal pakistan"
      };

    case 'create-event':
      return {
        title: "Host & Promote Your Event | FOGSLY Events",
        description: "Create and publish conferences, webinars, or workshops to thousands of attendees on FOGSLY.",
        keywords: "create event, event management, sell tickets pakistan"
      };

    case 'fog-coins':
    case 'earnings-dashboard':
      return {
        title: "FOG Coins & Rewards | FOGSLY",
        description: "Earn, manage, and redeem FOG coins through daily tasks, events, and community achievements.",
        keywords: "fog coins, rewards, crypto wallet, digital points"
      };

    case 'pricing':
      return {
        title: "Transparent Plans & Pricing | FOGSLY",
        description: "Explore flexible subscription plans for job seekers, recruiters, event organizers, and freelancers.",
      };

    case 'about':
      return {
        title: "About Us | Our Mission & Team | FOGSLY",
        description: "Learn how FOGSLY is revolutionizing careers, professional events, and digital skill empowerment in Pakistan.",
      };

    case 'careers':
      return {
        title: "Careers at FOGSLY | Join Our Mission",
        description: "Join the passionate team building the future of hiring, events, and community in Pakistan.",
      };

    case 'help-center':
      return {
        title: "Help Center & FAQs | FOGSLY Support",
        description: "Find instant answers to common questions about jobs, event ticketing, wallet transactions, and accounts.",
      };

    case 'privacy-policy':
      return {
        title: "Privacy Policy | FOGSLY",
        description: "Understand how FOGSLY protects your personal data, privacy, and account security.",
      };

    case 'terms':
      return {
        title: "Terms of Service | FOGSLY",
        description: "Terms and conditions governing the use of the FOGSLY platform and services.",
      };

    default:
      return {
        title: `FOGSLY | ${typeof route === 'string' ? route.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Careers & Events'}`
      };
  }
};

/**
 * Custom React Hook to dynamically apply SEO settings on mount and update
 */
export const usePageSEO = (config: SEOConfig, deps: any[] = []) => {
  useEffect(() => {
    updateDocumentSEO(config);
  }, deps);
};
