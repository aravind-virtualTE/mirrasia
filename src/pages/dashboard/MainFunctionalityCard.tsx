import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MainFunctionalityCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const MainFunctionalityCard: React.FC<MainFunctionalityCardProps> = ({
  icon: Icon,
  title,
  description,
  className,
  style,
  onClick,
}) => {
  return (
    <div 
            className={cn(
                "main-functionality-card flex flex-col items-center p-6 transition-all duration-300",
                "rounded-xl border border-border/50 bg-card hover:shadow-lg hover:border-primary/20",
                "hover:translate-y-[-5px] cursor-pointer",
                className
            )}
            onClick={onClick} // Ensure click is handled correctly
            style={style}
        >
            <div className="flex flex-row items-center gap-3 mb-4 w-full">
                <div className="icon-container p-4 rounded-full bg-primary/10">
                    <Icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-xl">{title}</h3>
            </div>
            <p className="text-sm text-muted-foreground text-center">{description}</p>
        </div>
  );
};

export default MainFunctionalityCard;