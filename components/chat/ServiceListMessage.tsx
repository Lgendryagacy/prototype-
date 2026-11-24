import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Clock, Eye } from 'lucide-react';
import { ServiceListItem } from '../../firebase/types/message';

interface ServiceListMessageProps {
  services: ServiceListItem[];
  brandId: string;
  totalServices?: number;
  onServiceClick: (serviceId: string, serviceName: string) => void;
  onServiceView: (serviceId: string) => void;
  onExploreBrand: (brandId: string) => void;
}

export const ServiceListMessage = ({ 
  services, 
  brandId, 
  totalServices,
  onServiceClick,
  onServiceView,
  onExploreBrand 
}: ServiceListMessageProps) => {
  const displayServices = services.slice(0, 2); // Show max 2 services
  const hasMoreServices = (totalServices && totalServices > 2) || services.length > 2;

  return (
    <div className="space-y-2 max-w-md">
      {displayServices.map((service, index) => (
        <motion.div
          key={service.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card
            className="p-3 hover:shadow-md transition-all cursor-pointer group border border-[--color-border] hover:border-[--color-primary]"
            onClick={() => onServiceClick(service.id, service.name)}
          >
            <div className="flex items-center gap-3">
              {service.image && (
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-16 h-16 rounded object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-[--color-text-primary] mb-1 truncate group-hover:text-[--color-primary] transition-colors">
                  {service.name}
                </h4>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-bold text-[--color-primary]">{service.price}</span>
                  <div className="flex items-center gap-1 text-[--color-text-secondary]">
                    <Clock size={14} />
                    <span>{service.deliveryTime}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="flex-shrink-0 p-2 hover:bg-[--color-primary] hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onServiceView(service.id);
                }}
              >
                <Eye size={18} />
              </Button>
            </div>
          </Card>
        </motion.div>
      ))}
      
      {hasMoreServices && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Button 
            variant="outline" 
            className="w-full mt-2"
            onClick={() => onExploreBrand(brandId)}
          >
            Explore More Services
            {totalServices && ` (${totalServices - 2} more)`}
          </Button>
        </motion.div>
      )}
    </div>
  );
};
