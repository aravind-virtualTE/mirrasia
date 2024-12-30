import React from 'react';
import { Card, CardContent } from '@/components/ui/card'; // Assuming you have these components
import { useNavigate } from 'react-router-dom';
import { Rocket } from 'lucide-react'; // Assuming you're using lucide icons

const AppLetter: React.FC = () => {
  const navigate = useNavigate();

  // Handle card click to navigate to the registration form
  const handleCardClick = () => {
    navigate('/form'); // Replace '/form' with the actual route for registration
  };

  return (
    <>
    <div className="flex-1 p-8">
        <h1 className="text-2xl font-semibold mb-8">Welcome, User. Here's what you can do to get started.</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

        <Card>
          <CardContent
            className="p-6 flex flex-col items-center text-center cursor-pointer"
            onClick={handleCardClick}
          >
            <Rocket className="w-12 h-12 mb-4" />
            <p className="font-medium">
              You are appointed as a director/shareholder for a{' '}
              <span className="font-bold">[Company Limited]</span> by{' '}
              <span className="font-bold">[User]</span>. Please{' '}
              
                click here
              
              to navigate to fill your registration details.
            </p>
          </CardContent>
        </Card>
      </div>
      </div>ss
      </>
    
  );
};

export default AppLetter;
