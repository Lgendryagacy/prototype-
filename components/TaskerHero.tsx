import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Button } from './ui/Button';
import { type Route } from '../types';

const TaskerHero = ({ navigate }: { navigate: (route: Route) => void }) => {
  return (
    <section className="relative overflow-hidden pt-20 pb-10 bg-[--color-bg-secondary] border-b border-[--color-border]">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4 text-[--color-text-primary]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            Your To-Do List, Done.
          </motion.h1>

          <motion.p
            className="text-lg text-[--color-text-secondary] max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Find trusted and skilled help for everyday tasks. From home repairs to online assistance, get your tasks completed quickly and securely.
          </motion.p>
          
          <motion.div
            className="max-w-2xl mx-auto bg-[--color-card] p-2 rounded-lg shadow-md border border-[--color-border] flex flex-col sm:flex-row items-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
             <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[--color-text-secondary]" />
                <input type="text" placeholder="What do you need help with?" className="w-full h-12 bg-transparent pl-10 pr-4 text-[--color-text-primary] focus:outline-none"/>
            </div>
             <Button size="lg" className="w-full sm:w-auto h-12 flex-shrink-0" onClick={() => navigate('hire-tasker')}>Search</Button>
          </motion.div>
           <motion.div
            className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Button size="lg" onClick={() => navigate('hire-tasker')}>Hire a Tasker</Button>
            <Button size="lg" variant="outline" onClick={() => navigate('post-task')}>Post a Task</Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TaskerHero;