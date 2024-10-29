import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
// import { Separator } from "@/components/ui/separator";

import { 
  // Building2,
  ChevronLeft,
  ChevronRight,
  Rocket,
  Users, 
  FileSignature, 
  HelpCircle,
  Building,

} from "lucide-react";
import Layout from '@/components/Layout';
import { useNavigate } from 'react-router-dom';
const Dashboard = () => {
  const partnerCards = [
    { 
      logo: "FlySpaces",
      description: "Office space"
    },
    {
      logo: "AWS",
      description: "Web hosting"
    },
    {
      logo: "GREATER",
      description: "The Greater Room"
    }
  ];
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate('/company-register');
  };

  return (
    <Layout >
      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-semibold mb-8">Welcome, User. Here's what you can do to get started.</h1>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center cursor-pointer" onClick={handleCardClick}>
              <Rocket className="w-12 h-12 mb-4" />
              <p className="font-medium">Register a new company & get a free business account</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center cursor-pointer">
              <Users className="w-12 h-12 mb-4" />
              <p className="font-medium">Transfer existing company secretary or accounting services to Mirr Asia</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center cursor-pointer">
              <FileSignature className="w-12 h-12 mb-4" />
              <p className="font-medium">Sign documents securely, anywhere in the world. For free!</p>
            </CardContent>
          </Card>
        </div>

        {/* Partners Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Get exclusive offers with our partners</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="w-full">
            <div className="flex space-x-6">
              {partnerCards.map((partner, index) => (
                <Card key={index} className="min-w-[300px] cursor-pointer">
                  <CardContent className="p-6">
                    <div className="h-12 mb-4">
                      <img 
                        src={`/api/placeholder/120/40`} 
                        alt={partner.logo} 
                        className="h-full object-contain"
                      />
                    </div>
                    <p className="text-gray-600">{partner.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Bottom Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Building className="w-8 h-8" />
                <div>
                  <h3 className="text-lg font-semibold">Accounting support</h3>
                  <p className="text-gray-600">View available accounting services anytime you need it.</p>
                  <Button variant="link" className="p-0 mt-2">
                    GET A QUOTE →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <HelpCircle className="w-8 h-8" />
                <div>
                  <h3 className="text-lg font-semibold">Have a question?</h3>
                  <p className="text-gray-600">
                    Call us at +65 6929 8272, or email us at{" "}
                    <Button variant="link" className="p-0">
                      customer@mirrasia.sg
                    </Button>
                  </p>
                  <Button variant="link" className="p-0 mt-2">
                    CONTACT SUPPORT →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;