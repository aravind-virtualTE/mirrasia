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
import { toast } from "@/hooks/use-toast";
import { Plus, Search, Pencil, Trash2, Info } from "lucide-react";
import { BillableItem, delInvoiceBillableData, getInvoiceBillableData, saveInvoiceBillableData } from "./invoiceM";

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

    // 🔹 New state for delete confirmation
    const [documentToDelete, setDocumentToDelete] = useState<BillableItem | null>(null);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const data = await getInvoiceBillableData();
                setItems(data.result || []);
            } catch (error) {
                console.error("Failed to fetch billable items:", error);
                toast({
                    title: "Error",
                    description: "Failed to load billable items.",
                    variant: "destructive",
                });
            }
        };
        fetchItems();
    }, [setItems]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return items;
        return items.filter((i) => i.title.toLowerCase().includes(q));
    }, [items, search]);

    useEffect(() => {
        if (editingItem) {
            setTitle(editingItem.title);
            setDescription(editingItem.description ?? "");
            setPrice(editingItem.price.toString());
        }
    }, [editingItem]);

    const onAdd = () => {
        setEditingItem(null);
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

    // 🔹 Delete with confirmation modal
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

        if (!title.trim() || !price.trim()) {
            toast({
                title: "Validation Error",
                description: "Please fill in Title and Price.",
                variant: "destructive",
            });
            return;
        }

        const p = parseFloat(price);
        if (Number.isNaN(p) || p < 0) {
            toast({
                title: "Invalid Price",
                description: "Enter a valid non-negative number.",
                variant: "destructive",
            });
            return;
        }

        if (editingItem) {
            const updated: BillableItem = {
                ...editingItem,
                title: title.trim(),
                description: description.trim(),
                price: p,
            };
            const otpt = await saveInvoiceBillableData(updated, updated._id);
            if (otpt.success) {
                setItems((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
                toast({ title: "Item Updated", description: "Billable item updated successfully." });
            }
        } else {
            const newItem: BillableItem = {
                title: title.trim(),
                description: description.trim(),
                price: p,
            };
            const otpt = await saveInvoiceBillableData(newItem);
            if (otpt.success) {
                newItem._id = otpt.result._id;
                setItems((prev) => [...prev, newItem]);
                toast({ title: "Item Added", description: "Billable item added successfully." });
            }
        }

        handleClose(false);
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto py-8 px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-semibold text-foreground">Billable Items</h1>
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
                            Add Item
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
                                <TableHead className="font-medium text-right w-32">
                                    <div className="flex items-center justify-end gap-1">
                                        Price
                                        <Info className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                </TableHead>
                                <TableHead className="w-20"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((item, idx) => (
                                <TableRow key={item._id} className="hover:bg-muted/20">
                                    <TableCell className="text-center">{idx + 1}</TableCell>
                                    <TableCell className="font-medium">{item.title}</TableCell>
                                    <TableCell className="text-muted-foreground max-w-md">{item.description}</TableCell>
                                    <TableCell className="text-right font-mono">{formatPrice(item.price)}</TableCell>
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
                                                onClick={() => setDocumentToDelete(item)} // 🔹 open confirm modal
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
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
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
                            <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={onSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter item title"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter item description"
                                    rows={3}
                                />
                            </div>
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
                                    required
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">{editingItem ? "Update Item" : "Add Item"}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* 🔹 Delete Confirmation Modal */}
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
