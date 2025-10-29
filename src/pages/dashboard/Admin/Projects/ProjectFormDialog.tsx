import React from 'react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, 
  // SelectGroup, SelectLabel 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Project } from './ProjectAtom';
import SearchSelectNew from '@/components/SearchSelect2';

interface ProjectFormDialogProps {
  isEditing: boolean;
  currentProject: Project;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (value: string) => void;
  // handleCompanyChange: (companyId: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleCancel: () => void;
  filteredCompanies: { id: string; name: string }[];
  handleCompanySelect: (item: { id: string; name: string } | null) => void;
  selectedValue: { id: string; name: string } | null;
}

const ProjectFormDialog: React.FC<ProjectFormDialogProps> = ({
  isEditing,
  currentProject,
  handleInputChange,
  handleSelectChange,
  // handleCompanyChange,
  handleSubmit,
  handleCancel,
  filteredCompanies,
  handleCompanySelect,
  selectedValue
}) => {

  const filteredCompanies1 = filteredCompanies.map((company) => ({ id: company.id, name: company.name }))
 
  return (
    <DialogContent className="max-h-[90vh] w-[95%] sm:w-[70%] max-w-[1800px] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-lg">{isEditing ? 'Edit Project' : 'Add New Project'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {/* First Column */}
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={currentProject.email}
                onChange={handleInputChange}
                required
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="projectName" className="text-xs">Project/Company Name</Label>
              <Input
                id="projectName"
                name="projectName"
                value={currentProject.projectName}
                onChange={handleInputChange}
                required
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone" className="text-xs">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={currentProject.phone}
                onChange={handleInputChange}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="snsPlatform" className="text-xs">SNS Platform</Label>
              <Select
                value={currentProject.snsPlatform}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger id="snsPlatform" className="h-8 text-xs">
                  <SelectValue placeholder="Select SNS Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp" className="text-xs">WhatsApp</SelectItem>
                  <SelectItem value="kakaotalk" className="text-xs">Kakao Talk</SelectItem>
                  <SelectItem value="telegram" className="text-xs">Telegram</SelectItem>
                  <SelectItem value="wechat" className="text-xs">WeChat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="snsPlatform" className="text-xs">Select Company</Label>
              <SearchSelectNew
                items={filteredCompanies1}
                placeholder="Select a Company"
                onSelect={handleCompanySelect}
                selectedItem={selectedValue}
                disabled={false}
              />
              {/* <Select
                onValueChange={handleCompanyChange}
                value={currentProject.company?.id || ''}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder={currentProject.company?.name || "Select a Company"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel className="text-xs">{"Company"}</SelectLabel>
                    {filteredCompanies.map((company) => (
                      <SelectItem key={company.id} value={company.id} className="text-xs">
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select> */}

            </div>
          </div>

          {/* Second Column */}
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="contactName" className="text-xs">Contact Person's Name</Label>
              <Input
                id="contactName"
                name="contactName"
                value={currentProject.contactName}
                onChange={handleInputChange}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="jurisdiction" className="text-xs">Jurisdiction/Country</Label>
              <Input
                id="jurisdiction"
                name="jurisdiction"
                value={currentProject.jurisdiction}
                onChange={handleInputChange}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="capacity" className="text-xs">Capacity/Position</Label>
              <Input
                id="capacity"
                name="capacity"
                value={currentProject.capacity}
                onChange={handleInputChange}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="snsAccountId" className="text-xs">SNS Account ID</Label>
              <Input
                id="snsAccountId"
                name="snsAccountId"
                value={currentProject.snsAccountId}
                onChange={handleInputChange}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Full width fields */}
        <div className="space-y-1">
          <Label htmlFor="description" className="text-xs">Project Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={2}
            value={currentProject.description}
            onChange={handleInputChange}
            className="text-xs min-h-[60px]"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="otherInformation" className="text-xs">Other Information</Label>
          <Textarea
            id="otherInformation"
            name="otherInformation"
            rows={1}
            value={currentProject.otherInformation}
            onChange={handleInputChange}
            className="text-xs min-h-[40px]"
          />
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="h-8 px-3 text-xs mr-2"
          >
            Cancel
          </Button>
          <Button type="submit" className="h-8 px-3 text-xs">
            {isEditing ? 'Update' : 'Save'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default ProjectFormDialog;