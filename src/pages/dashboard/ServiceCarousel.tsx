import React, { useRef } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {  Briefcase, Gamepad2, Globe, Package, Building2 } from 'lucide-react';
import ServiceCard from './ServiceCard';

const services = [
  {
    icon: Briefcase,
    title: 'Virtual Asset License',
    description: 'Obtain the necessary licensing for virtual asset operations.',
  },
  {
    icon: Gamepad2,
    title: 'iGaming License',
    description: 'Secure a license to operate online gaming platforms.',
  },
  {
    icon: Globe,
    title: 'Import/Export License',
    description: 'Facilitate international trade with an import/export license.',
  },
  {
    icon: Package,
    title: 'Meta Package',
    description: 'Comprehensive service package tailored for your business needs.',
  },
  {
    icon: Building2,
    title: 'Cayman Fund',
    description: 'Set up and manage funds in the Cayman Islands efficiently.',
  },
];

const ServiceCarousel: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  return (
    <div className="mb-12 animate-fade-in">
      <ScrollArea className="w-full pb-4">
        <div 
          ref={scrollContainerRef}
          className="flex space-x-4 pb-4" 
        >
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
              className="animate-slide-in"
            //   style={{ animationDelay: `${index * 0.1}s` }}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default ServiceCarousel;
