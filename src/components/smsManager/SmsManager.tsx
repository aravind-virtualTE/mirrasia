import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Mail, 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  Send, 
  Calendar, 
  Building, 
  Users,
  Phone,
  CheckCircle
} from 'lucide-react';

// Dummy data
const dummyCredits = {
  sms: 2450,
  email: 8950
};

const dummyContacts = [
  { id: '1', name: 'John Doe', phone: '+1234567890', email: 'john@company.com' },
  { id: '2', name: 'Jane Smith', phone: '+1987654321', email: 'jane@company.com' },
  { id: '3', name: 'Mike Johnson', phone: '+1122334455', email: 'mike@company.com' },
  { id: '4', name: 'Sarah Wilson', phone: '+1555666777', email: 'sarah@company.com' },
  { id: '5', name: 'David Brown', phone: '+1999888777', email: 'david@company.com' }
];

const defaultAutomaticSettings = [
  {
    id: '1',
    name: 'Company Incorporation',
    trigger: 'incorporation',
    message: 'Congratulations! Your company incorporation is complete. Welcome to our business family!',
    enabled: true,
    icon: Building
  },
  {
    id: '2',
    name: 'License Renewal',
    trigger: 'renewal',
    message: 'Reminder: Your business license renewal is due in 30 days. Please contact us for assistance.',
    enabled: true,
    icon: Calendar
  },
  {
    id: '3',
    name: 'Birthday Wishes',
    trigger: 'birthday',
    message: 'Happy Birthday! 🎉 Wishing you a wonderful day filled with joy and success.',
    enabled: false,
    icon: Users
  },
  {
    id: '4',
    name: 'Payment Confirmation',
    trigger: 'payment',
    message: 'Payment received successfully. Thank you for your business! Receipt: #{receipt_number}',
    enabled: true,
    icon: CreditCard
  }
];

export default function SMSTracker() {
  const [automaticSettings, setAutomaticSettings] = useState(defaultAutomaticSettings);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newSetting, setNewSetting] = useState({
    name: '',
    trigger: '',
    message: '',
    enabled: true
  });
  const { toast } = useToast();

  const handleToggleSetting = (id: string) => {
    setAutomaticSettings(prev => 
      prev.map(setting => 
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
    toast({
      title: "Setting Updated",
      description: "Automatic SMS setting has been updated successfully.",
    });
  };

  const handleAddSetting = () => {
    if (!newSetting.name || !newSetting.trigger || !newSetting.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const setting = {
      ...newSetting,
      id: Date.now().toString(),
      icon: MessageSquare
    };

    setAutomaticSettings(prev => [...prev, setting]);
    setNewSetting({ name: '', trigger: '', message: '', enabled: true });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Setting Added",
      description: "New automatic SMS setting has been created successfully.",
    });
  };

  const handleEditSetting = (setting: any) => {
    setEditingSetting(setting);
    setIsEditDialogOpen(true);
  };

  const handleUpdateSetting = () => {
    if (!editingSetting.name || !editingSetting.trigger || !editingSetting.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setAutomaticSettings(prev => 
      prev.map(setting => 
        setting.id === editingSetting.id ? editingSetting : setting
      )
    );
    setEditingSetting(null);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Setting Updated",
      description: "Automatic SMS setting has been updated successfully.",
    });
  };

  const handleDeleteSetting = (id: string) => {
    setAutomaticSettings(prev => prev.filter(setting => setting.id !== id));
    toast({
      title: "Setting Deleted",
      description: "Automatic SMS setting has been removed successfully.",
    });
  };

  const handleSendManualSMS = () => {
    if (!customMessage.trim() || selectedContacts.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please enter a message and select at least one contact.",
        variant: "destructive"
      });
      return;
    }

    // Simulate API call
    toast({
      title: "SMS Sent Successfully",
      description: `Message sent to ${selectedContacts.length} contact(s). ${selectedContacts.length} SMS credits used.`,
    });
    
    setCustomMessage('');
    setSelectedContacts([]);
  };

  const handleContactSelection = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Credits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-2 border-success/20 bg-gradient-to-br from-card to-success/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-success" />
                SMS Credits
              </CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{dummyCredits.sms.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Credits remaining</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-info/20 bg-gradient-to-br from-card to-info/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-info" />
                Email Credits
              </CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-info">{dummyCredits.email.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Credits remaining</p>
            </CardContent>
          </Card>
        </div>

        {/* Main SMS Management Interface */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              SMS Management Dashboard
            </CardTitle>
            <CardDescription>
              Manage automatic SMS configurations and send manual messages through Brevo API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="automatic" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="automatic" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Automatic Settings
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Manual Messaging
                </TabsTrigger>
              </TabsList>

              {/* Automatic Settings Tab */}
              <TabsContent value="automatic" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Automatic SMS Triggers</h3>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Configuration
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Automatic SMS</DialogTitle>
                        <DialogDescription>
                          Configure a new automatic SMS trigger for your business processes.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Configuration Name</Label>
                          <Input
                            id="name"
                            value={newSetting.name}
                            onChange={(e) => setNewSetting(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Welcome Message"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="trigger">Trigger Event</Label>
                          <Input
                            id="trigger"
                            value={newSetting.trigger}
                            onChange={(e) => setNewSetting(prev => ({ ...prev, trigger: e.target.value }))}
                            placeholder="e.g., user_signup"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="message">SMS Message</Label>
                          <Textarea
                            id="message"
                            value={newSetting.message}
                            onChange={(e) => setNewSetting(prev => ({ ...prev, message: e.target.value }))}
                            placeholder="Enter your SMS message here..."
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddSetting}>Add Configuration</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Edit Dialog */}
                  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Automatic SMS</DialogTitle>
                        <DialogDescription>
                          Update the automatic SMS trigger configuration.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="edit-name">Configuration Name</Label>
                          <Input
                            id="edit-name"
                            value={editingSetting?.name || ''}
                            onChange={(e) => setEditingSetting((prev: any) => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Welcome Message"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="edit-trigger">Trigger Event</Label>
                          <Input
                            id="edit-trigger"
                            value={editingSetting?.trigger || ''}
                            onChange={(e) => setEditingSetting((prev: any) => ({ ...prev, trigger: e.target.value }))}
                            placeholder="e.g., user_signup"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="edit-message">SMS Message</Label>
                          <Textarea
                            id="edit-message"
                            value={editingSetting?.message || ''}
                            onChange={(e) => setEditingSetting((prev: any) => ({ ...prev, message: e.target.value }))}
                            placeholder="Enter your SMS message here..."
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleUpdateSetting}>Update Configuration</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid gap-4">
                  {automaticSettings.map((setting) => {
                    const IconComponent = setting.icon;
                    return (
                      <Card key={setting.id} className={`transition-all duration-200 ${setting.enabled ? 'border-success/50 bg-success/5' : 'border-muted bg-muted/20'}`}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className={`p-2 rounded-lg ${setting.enabled ? 'bg-success/20' : 'bg-muted'}`}>
                                <IconComponent className={`h-4 w-4 ${setting.enabled ? 'text-success' : 'text-muted-foreground'}`} />
                              </div>
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{setting.name}</h4>
                                  <Badge variant={setting.enabled ? "default" : "secondary"} className="text-xs">
                                    {setting.enabled ? 'Active' : 'Inactive'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Trigger: <code className="bg-muted px-1 py-0.5 rounded text-xs">{setting.trigger}</code>
                                </p>
                                <p className="text-sm bg-muted/50 p-2 rounded border-l-2 border-primary/30">
                                  {setting.message}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={setting.enabled}
                                onCheckedChange={() => handleToggleSetting(setting.id)}
                              />
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditSetting(setting)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteSetting(setting.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Manual Messaging Tab */}
              <TabsContent value="manual" className="space-y-4">
                <div className="grid gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Send Custom SMS</h3>
                    
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="recipients">Select Recipients</Label>
                        <Select 
                          value={selectedContacts.length > 0 ? "selected" : ""} 
                          onValueChange={() => {}}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={
                              selectedContacts.length > 0 
                                ? `${selectedContacts.length} contact(s) selected`
                                : "Choose recipients..."
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {dummyContacts.map((contact) => (
                              <SelectItem 
                                key={contact.id} 
                                value={contact.id}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleContactSelection(contact.id);
                                }}
                                className="cursor-pointer"
                              >
                                <div className="flex items-center gap-3 w-full">
                                  <div className={`p-1 rounded-full ${selectedContacts.includes(contact.id) ? 'bg-primary' : 'bg-muted'}`}>
                                    <Users className={`h-3 w-3 ${selectedContacts.includes(contact.id) ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{contact.name}</p>
                                    <p className="text-xs text-muted-foreground">{contact.phone}</p>
                                  </div>
                                  {selectedContacts.includes(contact.id) && (
                                    <CheckCircle className="h-4 w-4 text-primary" />
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {selectedContacts.length > 0 && (
                          <div className="bg-primary/10 p-3 rounded-lg">
                            <p className="text-sm font-medium text-primary">
                              {selectedContacts.length} contact(s) selected
                            </p>
                            <p className="text-xs text-muted-foreground">
                              This will use {selectedContacts.length} SMS credit(s)
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="custom-message">Message Content</Label>
                        <Textarea
                          id="custom-message"
                          value={customMessage}
                          onChange={(e) => setCustomMessage(e.target.value)}
                          placeholder="Type your custom SMS message here..."
                          rows={4}
                          className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                          {customMessage.length}/160 characters
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSendManualSMS}
                      disabled={!customMessage.trim() || selectedContacts.length === 0}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Send SMS ({selectedContacts.length} recipients)
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setCustomMessage('');
                        setSelectedContacts([]);
                      }}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}