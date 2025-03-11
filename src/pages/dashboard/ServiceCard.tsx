import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  icon: Icon,
  title,
  description,
  className,
}) => {
  return (
    <div className={cn("service-card min-w-[250px] h-[140px] flex flex-col", className)}>
    <div className="flex items-center mb-3">
      <div className="flex items-center"> {/* Added flex to wrap icon and title */}
        <div className="service-icon mr-2"> {/* Added mr-2 for spacing */}
          <Icon className="w-5 h-5" />
        </div>
        <div className="card-badge">{title}</div>
      </div>
    </div>
    <p className="text-sm">{description}</p>
  </div>
  );
};

export default ServiceCard;
