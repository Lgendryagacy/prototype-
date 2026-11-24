import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, Linkedin, Instagram, Facebook, Twitter, Youtube } from 'lucide-react';

interface ContactFormProps {
  navigate: (route: string) => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ navigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const socialLinks = [
    { icon: <Linkedin className="w-4 h-4" />, name: 'LinkedIn' },
    { icon: <Instagram className="w-4 h-4" />, name: 'Instagram' },
    { icon: <Facebook className="w-4 h-4" />, name: 'Facebook' },
    { icon: <Twitter className="w-4 h-4" />, name: 'Twitter' },
    { icon: <Youtube className="w-4 h-4" />, name: 'YouTube' },
  ];

  return (
    <footer id="footer-section" className="bg-[#050b18] text-slate-400 py-16 lg:py-20 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Footer Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 mb-12">
          
          {/* Brand Col */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4 cursor-pointer" onClick={() => navigate('home')}>
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1.5 shadow-md">
                <img src="/images/quick-actions/visual-fog-coin.png" alt="3D FOGSLY" className="w-full h-full object-contain filter drop-shadow-xs" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">FOGSLY</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6 font-normal">
              Pakistan's Career & Opportunity Platform
            </p>
            <div className="flex items-center gap-2">
              {socialLinks.map((s, idx) => (
                <span
                  key={idx}
                  title={s.name}
                  className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all cursor-pointer shadow-xs"
                >
                  {s.icon}
                </span>
              ))}
            </div>
          </div>

          {/* Col 1: Platform */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm font-normal text-slate-400">
              <li><button onClick={() => navigate('fog-jobs')} className="hover:text-white transition-colors cursor-pointer">Jobs</button></li>
              <li><button onClick={() => navigate('events')} className="hover:text-white transition-colors cursor-pointer">Events</button></li>
              <li><button onClick={() => navigate('post-job')} className="hover:text-white transition-colors cursor-pointer">For Employers</button></li>
              <li><button onClick={() => navigate('ai-assistant')} className="hover:text-white transition-colors cursor-pointer">AI Posting</button></li>
            </ul>
          </div>

          {/* Col 2: Company */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm font-normal text-slate-400">
              <li><button onClick={() => navigate('about')} className="hover:text-white transition-colors cursor-pointer">About Us</button></li>
              <li><button onClick={() => navigate('blog')} className="hover:text-white transition-colors cursor-pointer">Blog</button></li>
              <li><button onClick={() => navigate('careers')} className="hover:text-white transition-colors cursor-pointer">Careers</button></li>
              <li><button onClick={() => navigate('help-center')} className="hover:text-white transition-colors cursor-pointer">Contact</button></li>
            </ul>
          </div>

          {/* Col 3: Support */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4">Support</h4>
            <ul className="space-y-2.5 text-sm font-normal text-slate-400">
              <li><button onClick={() => navigate('help-center')} className="hover:text-white transition-colors cursor-pointer">Help Center</button></li>
              <li><button onClick={() => navigate('privacy')} className="hover:text-white transition-colors cursor-pointer">Privacy Policy</button></li>
              <li><button onClick={() => navigate('terms')} className="hover:text-white transition-colors cursor-pointer">Terms of Service</button></li>
              <li><button onClick={() => navigate('help-center')} className="hover:text-white transition-colors cursor-pointer">Report Issue</button></li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h4 className="text-white font-semibold text-base mb-2">Newsletter</h4>
            <p className="text-xs text-slate-400 mb-4 font-normal">Get weekly opportunities</p>
            
            {subscribed ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Thank you for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-white placeholder-slate-500 text-xs font-normal focus:outline-none px-2"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <span>Join</span>
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
          <span>© 2026 Fogsly. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300 cursor-pointer">English</span>
            <span>/</span>
            <span className="hover:text-slate-300 cursor-pointer">Urdu</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default ContactForm;
