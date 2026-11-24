import React from 'react';
import { type Route } from '../types';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../components/ui/Card';
import { taskCategories } from '../constants';
import TaskerHero from '../components/TaskerHero';
import MapPlaceholder from '../components/MapPlaceholder';
import LatestTasks from '../components/LatestTasks';
import CTA from '../components/CTA';

const TaskerHubPage = ({ navigate }: { navigate: (route: Route, context?: any) => void }) => {
    return (
        <div className="bg-[--color-bg-primary]">
            <TaskerHero navigate={navigate} />
            <div className="container mx-auto px-4 py-8 space-y-10">
                
                {/* Categories Section */}
                <section>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold mb-4 text-[--color-text-primary]">Popular Tasks</h2>
                        <p className="text-[--color-text-secondary] max-w-2xl mx-auto">
                            Get help with anything from home repairs to virtual assistance.
                        </p>
                    </motion.div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {taskCategories.map((category, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                            >
                                <Card className="hover:shadow-lg transition-all hover:-translate-y-1 h-full cursor-pointer">
                                    <CardContent className="p-6 flex flex-col items-center text-center justify-center h-full">
                                    <span className="text-4xl mb-3">{category.icon}</span>
                                    <h3 className="font-medium text-[--color-text-primary] leading-tight">{category.name}</h3>
                                    <p className="text-sm text-[--color-text-secondary] mt-1">{category.tasks} tasks</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <MapPlaceholder />

                <LatestTasks navigate={navigate} />
            </div>
            <CTA 
                title="Get It Done with Fogsly Tasks"
                description="Post any task, from cleaning to coding, and get instant offers from skilled Taskers near you or online."
                primaryButtonText="Post a Task"
                secondaryButtonText="Become a Tasker"
                onPrimaryClick={() => navigate('post-task')}
                onSecondaryClick={() => navigate('start-freelancing')}
            />
        </div>
    );
};

export default TaskerHubPage;