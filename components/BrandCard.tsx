import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { ArrowRight } from 'lucide-react';
import { type Route } from '../types';

interface BrandCardProps {
    brand: any;
    navigate: (route: Route, context?: any, options?: { name?: string }) => void;
}

const BrandCard = ({ brand, navigate }: BrandCardProps) => {
    return (
        <motion.div whileHover={{ y: -5 }} className="h-full">
            <Card className="overflow-hidden group h-full flex flex-col cursor-pointer bg-[--color-card] shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-transparent hover:border-[--color-primary]/50" onClick={() => navigate('fog-service-brand', brand.id, { name: brand.name })}>
                <CardContent className="p-8 flex-grow flex flex-col text-center items-center">
                    <div className="w-24 h-24 rounded-full bg-[--color-bg-tertiary] mb-5 flex items-center justify-center text-4xl font-bold text-[--color-text-secondary]">
                       {brand.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <h3 className="font-bold text-xl mt-1 flex-grow text-[--color-text-primary]">{brand.name}</h3>
                    <p className="text-[--color-text-secondary] text-sm my-4">{brand.short_tagline}</p>
                    <Button variant="outline" className="mt-auto group-hover:bg-[--color-primary] group-hover:text-white group-hover:border-[--color-primary] transition-colors">
                        View Services <ArrowRight size={16} className="ml-2"/>
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default BrandCard;