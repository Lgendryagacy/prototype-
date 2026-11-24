import React from 'react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { ShoppingCart } from 'lucide-react';
import { type Route } from '../types';

interface SubServiceCardProps {
    subService: any;
    navigate: (route: Route, context?: any, options?: { name?: string }) => void;
}

const SubServiceCard: React.FC<SubServiceCardProps> = ({ subService, navigate }) => {
    const priceDisplay = subService.currency === 'PKR'
        ? `PKR ${subService.price.toLocaleString()}`
        : `${subService.price} FOG`;

    return (
        <Card
            className="overflow-hidden group h-full flex flex-col cursor-pointer"
            onClick={() => navigate('fog-service-detail', subService.id, { name: subService.title })}
        >
            <div className="aspect-video bg-[--color-bg-tertiary] overflow-hidden">
                <img src="https://images.unsplash.com/photo-1542744095-291d1f67b221?w=800&q=80" alt={subService.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <CardContent className="p-4 flex-grow flex flex-col">
                <h3 className="font-semibold mt-1 flex-grow group-hover:text-[--color-primary] transition-colors">{subService.title}</h3>
                <p className="text-sm text-[--color-text-secondary] my-3">{subService.description}</p>
                <div className="flex justify-between items-center pt-3 border-t border-[--color-border] mt-auto">
                    <div>
                        <p className="text-xs text-[--color-text-secondary]">Price</p>
                        <p className="font-bold text-lg text-[--color-primary]">{priceDisplay}</p>
                    </div>
                    <Button onClick={(e) => { e.stopPropagation(); alert('Added to cart!'); }}>
                        <ShoppingCart size={16} className="mr-2" /> Buy Now
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default SubServiceCard;