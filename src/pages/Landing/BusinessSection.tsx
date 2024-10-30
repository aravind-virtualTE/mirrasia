import { Button } from '@/components/ui/button';

const BusinessSectionWithIllustration = () => {
  return (
    <div className="py-10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* First Section */}
          <div className=" p-8 rounded-lg shadow-md">
            <h3 className="text-md font-semibold text-600">Starting a new business?</h3>
            <h2 className="text-3xl font-bold mb-4">
              Register a company and open a business account Fast & Simple!
            </h2>
            <p className="text-600 mb-6">
              Get the stress-free services and expert support you need to register and manage a company quickly and digitally!
            </p>
            <div className="flex gap-4">
              <Button >
                Register now
              </Button>
              <Button >
                Contact us
              </Button>
            </div>
          </div>

          {/* Illustration Section */}
          <div className="flex justify-center">
            <img 
              src="/path/to/your/image.png" 
              alt="Business Illustration" 
              className="max-w-full h-auto"
            />
          </div>

          {/* Second Section */}
          <div className=" p-8 rounded-lg shadow-md">
            <h3 className="text-md font-semibold text-600">Already have a company?</h3>
            <h2 className="text-3xl font-bold mb-4">
              Focus on your business, while we manage your books and compliance
            </h2>
            <p className="text-600 mb-6">
              From bookkeeping to payroll, and corporate secretary, bring peace of mind to your back office with our experts!
            </p>
            <div className="flex">
              <Button >
                Transfer to Mirr Asia
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSectionWithIllustration;
