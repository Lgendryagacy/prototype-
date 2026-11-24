import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Star, Eye, Edit, Trash2, Calendar, ShoppingBag } from 'lucide-react';
import { BrandService } from '../firebase/types/service';

interface ServiceCardProps {
  service: BrandService;
  onView?: (serviceId: string) => void;
  onEdit?: (serviceId: string) => void;
  onDelete?: (serviceId: string) => void;
  onToggleSoldOut?: (serviceId: string, currentSoldOut: boolean) => void;
  index?: number;
}

const ServiceCard = ({ service, onView, onEdit, onDelete, onToggleSoldOut, index = 0 }: ServiceCardProps) => {
  const priceDisplay = service.pricing.type === 'hourly'
    ? `PKR ${service.pricing.hourlyRate?.rate || 0}/hr`
    : service.pricing.packages && service.pricing.packages.length > 0
      ? `PKR ${Math.min(...service.pricing.packages.map(p => p.price)).toLocaleString()}`
      : 'PKR 0';

  const maxPrice = service.pricing.type === 'fixed' && service.pricing.packages && service.pricing.packages.length > 1
    ? Math.max(...service.pricing.packages.map(p => p.price))
    : null;

  const priceRange = maxPrice && maxPrice !== Math.min(...service.pricing.packages!.map(p => p.price))
    ? `PKR ${Math.min(...service.pricing.packages!.map(p => p.price)).toLocaleString()} - ${maxPrice.toLocaleString()}`
    : priceDisplay;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 border-[--color-border] bg-[--color-card] overflow-hidden">
        <div className={`relative ${onView ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'}`} onClick={() => onView?.(service.id)}>
          {service.mainImage ? (
            <img 
              src={service.mainImage} 
              alt={service.title}
              className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-[--color-primary]/20 to-[--color-primary]/10 flex items-center justify-center hover:opacity-90 transition-opacity">
              <span className="text-4xl font-bold text-[--color-primary] opacity-50">
                {service.title.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </span>
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge 
              variant={service.status === 'active' ? 'default' : 'secondary'}
              className={service.status === 'active' ? 'bg-green-500' : ''}
            >
              {service.status}
            </Badge>
            
            {/* Sold Out Badge */}
            {service.soldOut && (
              <Badge 
                variant="secondary"
                className="bg-red-500 text-white"
              >
                SOLD OUT
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          {/* {(onEdit || onDelete) && (
            <div className="absolute top-3 right-3 flex gap-1">
              {onEdit && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(service.id);
                  }}
                  className="bg-white/90 hover:bg-white p-2"
                >
                  <Edit size={14} />
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(service.id);
                  }}
                  className="bg-white/90 hover:bg-white p-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
          )} */}
        </div>

        <CardContent className="p-2 md:p-6 pt-6">
          {/* Service Title */}
          <h3 
            className={`font-bold text-lg text-[--color-text-primary] mb-2 line-clamp-2 transition-colors ${
              onView ? 'cursor-pointer hover:text-[--color-primary]' : 'cursor-not-allowed'
            }`}
            onClick={() => onView?.(service.id)}
          >
            {service.title}
          </h3>

          {/* Categories */}
          <div className="flex flex-wrap gap-1 mb-3">
            {service.categories.slice(0, 2).map((category) => (
              <Badge 
                key={category} 
                variant="outline" 
                className="text-xs px-2 py-1"
              >
                {category}
              </Badge>
            ))}
            {service.categories.length > 2 && (
              <Badge variant="outline" className="text-xs px-2 py-1">
                +{service.categories.length - 2}
              </Badge>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-[--color-text-secondary] mb-4 line-clamp-2">
            {service.description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-4 text-sm text-[--color-text-secondary]">
            <div className="flex items-center gap-1">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{service.stats.rating || 5.0}</span>
              <span>({service.stats.reviews || 0})</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye size={14} />
              <span>{service.stats.views || 0} views</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-bold text-lg text-[--color-primary]">
                {priceRange}
              </div>
              <div className="text-xs text-[--color-text-secondary]">
                {service.pricing.type === 'hourly' 
                  ? `Min. ${service.pricing.hourlyRate?.minimumHours || 1}h`
                  : `${service.pricing.packages?.length || 0} package${service.pricing.packages?.length !== 1 ? 's' : ''}`
                }
              </div>
            </div>
          </div>

          {/* Created Date */}
          <div className="flex items-center gap-1 text-xs text-[--color-text-secondary] mb-4">
            <Calendar size={12} />
            <span>Created {service.createdAt.toLocaleDateString()}</span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {onView && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onView(service.id)}
                className="flex items-center gap-1"
              >
                <Eye size={14} />
                View
              </Button>
            )}
            {onEdit && (
              <Button 
                size="sm" 
                onClick={() => onEdit(service.id)}
                className="flex items-center gap-1"
              >
                <Edit size={14} />
                Edit
              </Button>
            )}
            {!onView && !onEdit && (
              <div className="col-span-2 text-center text-sm text-[--color-text-secondary] py-2">
                Service actions unavailable
              </div>
            )}
          </div>

          {/* Sold Out Toggle Button */}
          {onToggleSoldOut && (
            <div className="mt-2">
              <Button
                variant={service.soldOut ? "default" : "outline"}
                size="sm"
                onClick={() => onToggleSoldOut(service.id, service.soldOut)}
                className={`w-full flex items-center justify-center gap-2 ${
                  service.soldOut 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10'
                }`}
              >
                <ShoppingBag size={14} />
                {service.soldOut ? 'Mark as Available' : 'Mark as Sold Out'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ServiceCard;