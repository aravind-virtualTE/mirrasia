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
      // Compact view styles for large screens
      "lg:p-4 lg:items-start", // Removed lg:flex-row from here
      className
    )}
    onClick={onClick}
    style={style}
  >
    <div className={cn(
      "flex flex-row items-center gap-3 mb-4 w-full",
      "lg:mb-2 lg:w-auto"
    )}>
      <div className={cn(
        "icon-container p-4 rounded-full bg-primary/10",
        "lg:p-2"
      )}>
        <Icon className={cn("w-8 h-8 text-primary", "lg:w-5 lg:h-5")} strokeWidth={1.5} />
      </div>
      <h1 className={cn("font-semibold text-xl", "lg:text-base")}>{title}</h1>
    </div>
    <p className={cn("text-sm text-muted-foreground text-center", "lg:text-xs lg:text-left")}>{description}</p>
  </div>
  );
};

export default MainFunctionalityCard;