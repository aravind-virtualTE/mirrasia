import { Card, } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

// Left Sidebar Component
export const LeftSidebar = () => {
    const steps = [
      { title: "Basic Information" },
      { title: "Company Details" },
      { title: "Documents" }
    ]; // Example steps
  
    return (
      <Card className="w-64 rounded-none border-r border-t-0 border-l-0 border-b-0">
        <ScrollArea className="h-full p-4">
          <div className="space-y-2">
            {steps.map((step, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start"
              >
                {step.title}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </Card>
    );
  };