import { useState } from "react";
import { MessageSquareShare,} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

export default function MemoApp() {
  const [open, setOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState("");
  
  // Sample memo data
  const memos = [
    { id: 1, text: "lorem ipsum", author: "Test User1", timestamp: "22-03-2025 4:30 PM" },
    { id: 2, text: "lorem ipsum", author: "Test User2", timestamp: "22-03-2025 4:32 PM" },
   
  ];
  
  // Sample people for sharing
  const people = [
    { id: 1, name: "Test User1" },
    { id: 2, name: "Test User2" },
    { id: 3, name: "Test User3" },
  ];
  
  const handleSubmit = () => {
    // Handle sharing logic here
    console.log(`Shared with: ${selectedPerson}`);
    setOpen(false);
    setSelectedPerson("");
  };
  
  const handleSelectPerson = (personName: string) => {
    setSelectedPerson(personName);
  };
  
  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Memos</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <MessageSquareShare size={16} />
              Share
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Sharing with the members</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <Command className="rounded-lg border shadow-md">
                <CommandInput placeholder="select User" />
                <CommandList>
                  <CommandEmpty>No person found.</CommandEmpty>
                  <CommandGroup>
                    {people.map((person) => (
                      <CommandItem 
                        key={person.id}
                        onSelect={() => handleSelectPerson(person.name)}
                        className="cursor-pointer"
                      >
                        {person.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
              <div className="flex justify-end">
                <Button 
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={handleSubmit}
                >
                  Submit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="border rounded-lg p-4">
        {memos.map((memo) => (
          <div key={memo.id} className="mb-4">
            <div className="bg-gray-100 p-3 rounded-lg mb-1">
              {memo.text}
            </div>
            <div className="text-sm text-gray-600">
              {memo.author}, {memo.timestamp}
            </div>
          </div>
        ))}
        
        <div className="mt-6 flex">
          <input 
            type="text" 
            placeholder="Type a message" 
            className="flex-1 border rounded-lg p-2 mr-2"
          />
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}