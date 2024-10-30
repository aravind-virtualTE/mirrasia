import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
// import { Button } from "@/components/ui/button";
import { useState } from 'react';

type RelationshipType = {
  id: string;
  label: string;
};

const relationships: RelationshipType[] = [
  {
    id: "director",
    label: "Director of the Hong Kong company"
  },
  {
    id: "delegated",
    label: "Delegated by the director of the Hong Kong company"
  },
  {
    id: "shareholder",
    label: "Shareholder of the Hong Kong company holding majority of the shares"
  },
  {
    id: "professional",
    label: "A professional(e.g. lawyer, accountant) who provides incorporation advice to the Hong Kong company"
  },
  {
    id: "other",
    label: "Other..."
  }
];

const ApplicantInfoForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    relationships: [] as string[],
    contactInfo: ''
  });

  const handleRelationshipChange = (relationshipId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      relationships: checked 
        ? [...prev.relationships, relationshipId]
        : prev.relationships.filter(id => id !== relationshipId)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Applicant Information</CardTitle>
        <p className="text-sm text-gray-500">
          This form must be filled out by the representative of the Hong Kong company. 
          The information will be kept as KYC and Client Due Diligence documents.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base">
              Name of applicant <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Please provide the full official name of the person completing this form"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base">
              Relationship between the above applicant and the Hong Kong company to be established <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-gray-500">You can select multiple items as applied.</p>
            <div className="space-y-2">
              {relationships.map((relationship) => (
                <div key={relationship.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={relationship.id}
                    checked={formData.relationships.includes(relationship.id)}
                    onCheckedChange={(checked) => 
                      handleRelationshipChange(relationship.id, checked as boolean)
                    }
                  />
                  <Label htmlFor={relationship.id} className="text-sm font-normal">
                    {relationship.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact" className="text-base">
              Contact information of the above applicant <span className="text-red-500">*</span>
            </Label>
            <Input
              id="contact"
              placeholder="Phone number, email, SNS account ID, etc."
              value={formData.contactInfo}
              onChange={(e) => setFormData(prev => ({ ...prev, contactInfo: e.target.value }))}
              required
              className="w-full"
            />
          </div>

          {/* <Button type="submit" className="w-full">
            Submit
          </Button> */}
        </form>
      </CardContent>
    </Card>
  );
};




export default ApplicantInfoForm;