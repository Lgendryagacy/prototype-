import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import QuickActionCards from '../components/landing/QuickActionCards';
import WhyFogslySection from '../components/landing/WhyFogslySection';
import FeaturedJobs from '../components/landing/FeaturedJobs';
import FeaturedEvents from '../components/landing/FeaturedEvents';
import AIPostingFeature from '../components/landing/AIPostingFeature';
import ForEmployersAndOrganizers from '../components/landing/ForEmployersAndOrganizers';
import Testimonials from '../components/landing/Testimonials';
import BlogSection from '../components/landing/BlogSection';
import ContactForm from '../components/landing/ContactForm';

interface HomePageProps {
  navigate: (route: string) => void;
  isLoggedIn?: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ navigate, isLoggedIn }) => {
  return (
    <main className="w-full min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] transition-colors duration-300 overflow-x-hidden">
      {/* 1. HeroSection */}
      <HeroSection navigate={navigate} />

      {/* Quick Action Grid (Jobs, Events, Post Job, Post Event) */}
      <QuickActionCards navigate={navigate} />

      {/* Why Fogsly? One Platform. More Than Jobs. */}
      <WhyFogslySection navigate={navigate} />

      {/* 2. FeaturedJobs (Real Jobs. Verified Employers.) */}
      <FeaturedJobs navigate={navigate} />

      {/* 3. FeaturedEvents */}
      <FeaturedEvents navigate={navigate} />

      {/* 4. AIPostingFeature */}
      <AIPostingFeature navigate={navigate} />

      {/* 5. ForEmployersAndOrganizers */}
      <ForEmployersAndOrganizers navigate={navigate} />

      {/* 6. Testimonials */}
      <Testimonials />

      {/* 8. BlogSection */}
      <BlogSection navigate={navigate} />

      {/* 9. ContactForm */}
      <ContactForm navigate={navigate} />
    </main>
  );
};

export default HomePage;
