import React, { useRef } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {  Briefcase, Gamepad2, Globe, Package, Building2 } from 'lucide-react';
import ServiceCard from './ServiceCard';
import { useTranslation } from "react-i18next";



const ServiceCarousel: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const services = [
    {
      icon: Briefcase,
      title: t('dashServices.vaTtitle'),
      description: t('dashServices.vaDesc'),
    },
    {
      icon: Gamepad2,
      title: t('dashServices.game'),
      description: t('dashServices.secureLis'),
    },
    {
      icon: Globe,
      title: t('dashServices.importExprt'),
      description: t('dashServices.international'),
    },
    {
      icon: Package,
      title: t('dashServices.metaPack'),
      description: t('dashServices.metaDesc'),
    },
    {
      icon: Building2,
      title: t('dashServices.cayman'),
      description: t('dashServices.caymanDesc'),
    },
  ];
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
