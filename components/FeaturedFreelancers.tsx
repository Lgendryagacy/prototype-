import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, ShieldCheck } from 'lucide-react';
import { talents } from '../constants';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { type Route } from '../types';
import { Badge } from './ui/Badge';

const FeaturedFreelancers = ({ navigate }: { navigate: (route: Route) => void }) => {
  return (
    <section>
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-[--color-text-primary]">Featured Freelancers</h2>
            <Button variant="link">
              Browse all <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {talents.slice(0, 4).map((talent, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow h-full overflow-hidden group">
                  <div className="p-6 flex flex-col items-center text-center">
                    <div className="relative mb-4">
                        <div className="w-24 h-24 rounded-full bg-[--color-bg-tertiary] flex items-center justify-center text-4xl font-bold text-[--color-text-secondary]">
                            {talent.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        {talent.verified && <ShieldCheck className="absolute bottom-1 right-1 w-6 h-6 text-blue-500 fill-white dark:fill-slate-800" />}
                    </div>
                    <h3 className="font-bold text-lg text-[--color-text-primary]">{talent.name}</h3>
                    <p className="text-[--color-text-secondary] text-sm">{talent.role}</p>
                     <div className="flex items-center mt-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="ml-1 text-sm font-semibold">{talent.rating}</span>
                        <span className="ml-2 text-sm text-[--color-text-secondary]">({talent.projects} projects)</span>
                      </div>
                      <p className="text-xs text-[--color-text-secondary] mt-3">Starts from <span className="font-bold text-[--color-text-primary]">${talent.hourlyRate}/hr</span></p>
                  </div>
                   <div className="p-4 bg-[--color-bg-secondary] border-t border-[--color-border]">
                     <Button variant="outline" className="w-full" onClick={() => navigate('profile')}>View Profile</Button>
                   </div>
              </Card>
            </motion.div>
          ))}
        </div>
    </section>
  );
};

export default FeaturedFreelancers;