import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { DollarSign, MapPin } from 'lucide-react';
import { type Route } from '../types';

interface TaskCardProps {
    task: any;
    navigate: (route: Route, context?: any) => void;
}

export const TaskCard = ({ task, navigate }: TaskCardProps) => (
    <motion.div whileHover={{ y: -2 }}>
        <Card className="hover:border-[--color-primary]/50 transition-colors">
            <CardContent className="p-6 pt-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                        <h3 className="font-bold text-lg hover:text-[--color-primary] cursor-pointer">{task.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-[--color-text-secondary] mt-2">
                            <span className="flex items-center gap-1.5"><MapPin size={14} /> {task.location}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                        <p className="font-bold text-xl text-[--color-primary]">${task.budget} <span className="text-sm font-normal text-[--color-text-secondary]">{task.type}</span></p>
                        <Button className="w-full sm:w-auto">Make an Offer</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    </motion.div>
);