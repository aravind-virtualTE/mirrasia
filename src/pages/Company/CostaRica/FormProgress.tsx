import { formConfig } from './costaFormConfig';
import { cn } from '@/lib/utils';

interface FormProgressProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export const FormProgress = ({ currentStep, onStepClick }: FormProgressProps) => {
  const progress = ((currentStep + 1) / formConfig.length) * 100;

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Step {currentStep + 1} of {formConfig.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step navigation */}
      <nav className="space-y-1">
        {formConfig.map((step, index) => (
          <button
            key={step.id}
            onClick={() => onStepClick(index)}
            className={cn(
              "w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 group",
              index === currentStep 
                ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-4 border-primary" 
                : index < currentStep 
                  ? "text-sidebar-foreground hover:bg-secondary/80" 
                  : "text-muted-foreground hover:bg-secondary/50"
            )}
          >
            <span className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium transition-all",
              index === currentStep 
                ? "bg-primary text-primary-foreground" 
                : index < currentStep 
                  ? "bg-success text-success-foreground" 
                  : "bg-secondary text-muted-foreground"
            )}>
              {index < currentStep ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                index + 1
              )}
            </span>
            <span className="text-sm font-medium truncate">{step.shortTitle}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
