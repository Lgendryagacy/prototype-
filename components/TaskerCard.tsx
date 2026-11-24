import React from 'react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Star, ShieldCheck, CheckCircle } from 'lucide-react';
import { type Route } from '../types';

interface TaskerCardProps {
    tasker: any;
    navigate: (route: Route) => void;
}

const TaskerCard = ({ tasker, navigate }: TaskerCardProps) => (
    <Card className="hover:border-[--color-primary]/50 transition-colors h-full flex flex-col">
        <CardContent className="p-6 pt-6 flex-grow">
            <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full bg-[--color-bg-tertiary] flex items-center justify-center text-4xl font-bold text-[--color-text-secondary]">
                        {tasker.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    {tasker.verified && <ShieldCheck className="absolute bottom-1 right-1 w-6 h-6 text-blue-500 fill-white dark:fill-slate-800" />}
                </div>
                <h3 className="font-bold text-lg">{tasker.name}</h3>
                <p className="text-[--color-text-secondary] text-sm">{tasker.role}</p>
                <Badge variant="premium" className="mt-2">{tasker.level}</Badge>
                <div className="flex items-center gap-4 text-sm text-[--color-text-secondary] my-3">
                    <span className="flex items-center gap-1"><Star size={14} className="text-yellow-500"/> {tasker.rating}</span>
                    <span className="flex items-center gap-1"><CheckCircle size={14}/> {tasker.tasksCompleted} Tasks</span>
                </div>
                 <div className="flex flex-wrap gap-2 justify-center">
                    {tasker.skills.slice(0, 3).map((skill: string) => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                </div>
            </div>
        </CardContent>
        <div className="p-4 border-t border-[--color-border] flex flex-col items-center">
            <p className="text-xs text-[--color-text-secondary]">Starts from</p>
            <p className="font-bold text-xl text-[--color-primary]">${tasker.hourlyRate}/hr</p>
             <Button className="w-full mt-3" onClick={() => navigate('profile')}>View & Book</Button>
        </div>
    </Card>
);

export default TaskerCard;