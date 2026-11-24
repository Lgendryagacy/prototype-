import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { latestTasks } from '../constants';
import { Button } from './ui/Button';
import { type Route } from '../types';
import { TaskCard } from './TaskCard';

const LatestTasks = ({ navigate }: { navigate: (route: Route, context?: any) => void }) => {
  return (
    <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[--color-text-primary]">Latest Online Tasks</h2>
            <Button variant="link">
              View all tasks <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
        </div>
        
        <div className="space-y-4">
          {latestTasks.map((task, index) => (
             <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <TaskCard task={task} navigate={navigate} />
            </motion.div>
          ))}
        </div>
    </section>
  );
};

export default LatestTasks;