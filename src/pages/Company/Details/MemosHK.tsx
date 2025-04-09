import { useEffect, useState } from "react";
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
import { createMemo, getMemos, 
    // shareMemo
 } from "@/lib/api/FetchData";
import { Input } from "@/components/ui/input";



export default function MemoApp({ id }: {
    id: string; // or the appropriate type for 'id'
  }) {
const [memos, setMemos] = useState<{ _id: string; text: string; author: string; timestamp: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState("");
  const [newText, setNewText] = useState("");

  const people = [
    { id: 1, name: "Test User1" },
    { id: 2, name: "Test User2" },
    { id: 3, name: "Test User3" },
  ];

  useEffect(() => {
    fetchMemos();
  }, []);

  const fetchMemos = async () => {
    try {
        // console.log("id",id)
      const data = await getMemos(id);
      setMemos(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleCreateMemo = async () => {
    if (!newText.trim()) return;
    try {
      const timestamp = new Date().toLocaleString("en-GB");
      await createMemo({ text: newText, author: "Admin", timestamp, 'companyId': id });
      setNewText("");
      fetchMemos();
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async (memoId: string) => {
    try {
    //   await shareMemo(memoId, selectedPerson);
    //   setSelectedPerson("");
    //   setOpen(false);
    //   fetchMemos();
    console.log("memoId",memoId)
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Memo</h1>
      {memos.map((memo) => (
        <div key={memo._id} className="mb-4 border rounded p-3 bg-gray-100">
          <div>{memo.text}</div>
          <div className="text-sm text-gray-600">
            {memo.author}, {memo.timestamp}
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="mt-2 flex gap-1 items-center">
                <MessageSquareShare size={14} />
                Share
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share with a person</DialogTitle>
              </DialogHeader>
              <Command className="rounded-lg border shadow-md">
                <CommandInput placeholder="Select User" />
                <CommandList>
                  <CommandEmpty>No person found.</CommandEmpty>
                  <CommandGroup>
                    {people.map((person) => (
                      <CommandItem
                        key={person.id}
                        onSelect={() => setSelectedPerson(person.name)}
                      >
                        {person.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
              <div className="flex justify-end mt-4">
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => handleShare(memo._id)}
                  disabled={!selectedPerson}
                >
                  Submit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ))}

      <div className="mt-6 flex">
        <Input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Type a memo"
        //   className="flex-1 border rounded-lg p-2 mr-2"
        />
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={handleCreateMemo}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}