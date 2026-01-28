import { useEffect, useMemo, useState } from "react";
import { atom, useAtom } from "jotai";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Plus, Search, Pencil, Trash2, Info } from "lucide-react";
import {
  BillableItem,
  delInvoiceBillableData,
  getInvoiceBillableData,
  ItemType,
  saveInvoiceBillableData,
} from "./invoiceM";


const itemsAtom = atom<BillableItem[]>([]);
const formatPrice = (n: number) => `$${n.toFixed(2)}`;

const InvoiceManager = () => {
  const [items, setItems] = useAtom(itemsAtom);
  const [search, setSearch] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<BillableItem | null>(null);

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("");

  // NEW: active tab/type
  const [activeType, setActiveType] = useState<ItemType>("billableItems");

  // Delete confirmation
  const [documentToDelete, setDocumentToDelete] = useState<BillableItem | null>(null);

  // fetch by type
  const loadItems = async (type: ItemType) => {
    try {
      const data = await getInvoiceBillableData(type);
      setItems(data.result || []);
    } catch (error) {
      console.error("Failed to fetch items:", error);
      toast({
        title: "Error",
        description: "Failed to load items.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadItems(activeType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeType]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.title.toLowerCase().includes(q));
  }, [items, search]);

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title);
      setDescription(editingItem.description ?? "");
      setPrice(
        typeof editingItem.price === "number" ? editingItem.price.toString() : ""
      );
    }
  }, [editingItem]);

  const onAdd = () => {
    setEditingItem(null);
    setTitle("");
    setDescription("");
    setPrice("");
    setDialogOpen(true);
  };

  const onEdit = (item: BillableItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleClose = (next: boolean) => {
    setDialogOpen(next);
    if (!next) {
      setEditingItem(null);
      setTitle("");
      setDescription("");
      setPrice("");
    }
  };

  const deleteDocument = async () => {
    if (!documentToDelete?._id) return;
    const result = await delInvoiceBillableData(documentToDelete._id);
    if (result.success) {
      setItems((prev) => prev.filter((i) => i._id !== documentToDelete._id));
      toast({ title: "Item Deleted", description: "The item was removed." });
    } else {
      toast({ title: "Item not Deleted", description: "Please try again later." });
    }
    setDocumentToDelete(null);
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    // Validate title
    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in Title.",
        variant: "destructive",
      });
      return;
    }

    // If billableItems, validate price
    let numericPrice = 0;
    if (activeType === "billableItems") {
      if (!price.trim()) {
        toast({
          title: "Validation Error",
          description: "Please fill in Price for Billable Item.",
          variant: "destructive",
        });
        return;
      }
      numericPrice = parseFloat(price);
      if (Number.isNaN(numericPrice) || numericPrice < 0) {
        toast({
          title: "Invalid Price",
          description: "Enter a valid non-negative number.",
          variant: "destructive",
        });
        return;
      }
    }

    const payload: BillableItem = {
      ...(editingItem?._id ? { _id: editingItem._id } : {}),
      title: title.trim(),
      description: (description || "").trim(),
      type: activeType,
      // Only include price for billableItems
      ...(activeType === "billableItems" ? { price: numericPrice } : {}),
    };

    const otpt = await saveInvoiceBillableData(payload, editingItem?._id);

    if (otpt.success) {
      if (editingItem) {
        setItems((prev) =>
          prev.map((i) => (i._id === editingItem._id ? otpt.result : i))
        );
        toast({ title: "Item Updated", description: "Updated successfully." });
      } else {
        setItems((prev) => [...prev, otpt.result]);
        toast({ title: "Item Added", description: "Added successfully." });
      }
      handleClose(false);
    } else {
      toast({
        title: "Save Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const showPrice = activeType === "billableItems";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Tabs */}
        <div className="mb-6">
          <Tabs value={activeType} onValueChange={(v) => setActiveType(v as ItemType)}>
            <TabsList>
              <TabsTrigger value="billableItems">Billable Items</TabsTrigger>
              <TabsTrigger value="industryType">Industry Type</TabsTrigger>
              <TabsTrigger value="countryForCorporation">Country for Corporation</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-foreground capitalize">
              {activeType === "billableItems"
                ? "Billable Items"
                : activeType === "industryType"
                ? "Industry Types"
                : "Countries for Corporation"}
            </h1>
            <span className="text-sm text-muted-foreground">{items.length}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by title…"
                className="pl-10 w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button className="gap-2" onClick={onAdd}>
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-14 text-center">S.No</TableHead>
                <TableHead className="font-medium">Title</TableHead>
                <TableHead className="font-medium">Description</TableHead>
                {showPrice && (
                  <TableHead className="font-medium text-right w-32">
                    <div className="flex items-center justify-end gap-1">
                      Price
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </TableHead>
                )}
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item, idx) => (
                <TableRow key={item._id} className="hover:bg-muted/20">
                  <TableCell className="text-center">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="text-muted-foreground max-w-md">
                    {item.description}
                  </TableCell>
                  {showPrice && (
                    <TableCell className="text-right font-mono">
                      {formatPrice(item.price || 0)}
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(item)}
                        className="h-8 w-8 p-0 hover:bg-muted"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDocumentToDelete(item)}
                        className="h-8 w-8 p-0 text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={showPrice ? 5 : 4}
                    className="text-center text-muted-foreground py-8"
                  >
                    No items found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={handleClose}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit" : "Add New"}{" "}
                {activeType === "billableItems"
                  ? "Billable Item"
                  : activeType === "industryType"
                  ? "Industry Type"
                  : "Country for Corporation"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                  rows={3}
                />
              </div>

              {showPrice && (
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    required={showPrice}
                  />
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingItem ? "Update" : "Add"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        {documentToDelete && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-2">Delete Item</h3>
              <p className="mb-4 text-gray-600">
                Are you sure you want to delete "{documentToDelete.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDocumentToDelete(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={deleteDocument}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceManager;
