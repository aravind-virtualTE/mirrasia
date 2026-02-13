/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  FileText,
  Settings,
  ChevronRight,
  Download,
  Mail,
  CheckCircle2,
  ArrowLeft,
  Search,
  Package,
  History,
  User,
  Filter
} from 'lucide-react';
import {
  getInvoiceBillableData,
  saveInvoiceBillableData,
  delInvoiceBillableData,
  BillableItem
} from '../InvoiceManager/invoiceM';
import { updateReqForEnquiry, getRedQuoteData } from '@/pages/dashboard/Admin/ReqForQuote/rfq';
import { toast } from '@/hooks/use-toast';

// --- API Service Layer Removed in favor of imports ---

// --- Mock Data from your prompt for initial state ---
const INITIAL_ITEMS = [
  {
    "_id": "d78bc7d5-95f9-4006-8a9c-a820ff07e89d",
    "title": "Seychelles IBC Incorporation",
    "description": "1. Corporate name reservation and availability check service\n2. Preparation of Articles of Association (M&A)...",
    "price": 2850
  },
  {
    "_id": "caef6528-f456-4871-ba4c-e797045d5ed6",
    "title": "Accounting and Tax Management Package Service",
    "description": "* For cases with 20 or fewer transactions...\n* Service fee: US$ 400/month X 12 months (Pre-billed)",
    "price": 4800
  },
  {
    "_id": "ddd27297-8966-470a-9336-52d69b92ca40",
    "title": "EMI (Electronic Money Institution) Account Opening Support",
    "description": "EMI account opening support service (Mercury, Wise, or Airwallex)",
    "price": 400
  }
];

// --- Sub-Components ---

const ItemCard = ({ item, onEdit, onDelete }: { item: BillableItem, onEdit: any, onDelete: any }) => (
  <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow group">
    <div className="flex justify-between items-start mb-2 gap-2">
      <h3 className="font-bold text-foreground line-clamp-1">{item.title}</h3>
      <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(item)} className="p-1 text-primary hover:bg-primary/10 rounded"><Edit2 size={16} /></button>
        <button onClick={() => onDelete(item._id)} className="p-1 text-destructive hover:bg-destructive/10 rounded"><Trash2 size={16} /></button>
      </div>
    </div>
    <p className="text-sm text-muted-foreground line-clamp-2 mb-3 h-10">{item.description}</p>
    <div className="flex justify-between items-center pt-3 border-t border-border">
      <span className="text-xs font-semibold uppercase text-muted-foreground">Price</span>
      <span className="text-lg font-bold text-primary">${item.price}</span>
    </div>
  </div>
);

const InvoiceLayout = ({ data, items, selectedIds }: { data: any, items: BillableItem[], selectedIds: string[] }) => {
  const selectedItems = items.filter(i => selectedIds.includes(i._id || ''));
  const subtotal = selectedItems.reduce((acc, curr) => acc + (curr.price || 0), 0);
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="bg-card shadow-2xl rounded-2xl w-full max-w-4xl mx-auto p-4 sm:p-8 lg:p-12 border border-border text-foreground print:p-0 print:shadow-none" id="invoice-capture">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-2 border-border pb-8 mb-8">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2 italic">MIRR ASIA</h1>
          <div className="text-xs leading-relaxed text-muted-foreground uppercase tracking-wider">
            MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED<br />
            WORKSHOP UNIT B50 & B58, 2/F, 36-40 Tai Lin Pai Road<br />
            KWAI CHUNG, N.T. Hong Kong<br />
            Email: mirrasia@gmail.com | Phone: +8225436187
          </div>
        </div>
        <div className="text-right">
          <div className="bg-primary text-primary-foreground px-4 py-1 text-xs font-bold mb-4 inline-block">DRAFT QUOTE</div>
          <div className="text-sm">
            <p><span className="font-bold">Quote #:</span> 2026{Math.floor(Math.random() * 10000)}</p>
            <p><span className="font-bold">Date:</span> {date}</p>
            <p><span className="font-bold">Expires:</span> 30 Days from issue</p>
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div className="mb-10">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Recipient</h3>
        <p className="font-bold text-lg">{data.personName || 'Valued Client'}</p>
        <p className="text-muted-foreground">{data.email}</p>
        <p className="text-muted-foreground italic mt-1 font-medium">"{data.productDescription || 'Service Inquiry'}"</p>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full mb-10 min-w-[640px]">
          <thead>
            <tr className="border-b-2 border-border text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <th className="py-3 px-2 w-16 text-center">Qty</th>
              <th className="py-3 px-4">Product or Service</th>
              <th className="py-3 px-4 text-right">Unit Price</th>
              <th className="py-3 px-4 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {selectedItems.map((item, idx) => (
              <tr key={idx} className="group">
                <td className="py-5 px-2 text-center align-top font-medium">1</td>
                <td className="py-5 px-4">
                  <div className="font-bold text-foreground mb-1">{item.title}</div>
                  <div className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">{item.description}</div>
                </td>
                <td className="py-5 px-4 text-right align-top font-medium">${(item.price || 0).toFixed(2)}</td>
                <td className="py-5 px-4 text-right align-top font-bold text-foreground">${(item.price || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border">
              <td colSpan={3} className="py-6 px-4 text-right font-bold text-lg">Total Price:</td>
              <td className="py-6 px-4 text-right font-black text-2xl text-foreground">${subtotal.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 border-t border-border pt-8 text-[10px] leading-relaxed text-muted-foreground">
        <div>
          <h4 className="font-bold text-foreground uppercase mb-2">Notes</h4>
          <p>별도비용: 회계/세무 (예상견적 차트 참조)</p>
          <p className="mt-2">This is a digital quote generated via Mirrasia App.</p>
        </div>
        <div>
          <h4 className="font-bold text-foreground uppercase mb-2">Legal Terms</h4>
          <p>결제방법 : 해외송금 혹은 카드결제(카드결제시 수수료3.5% 추가)</p>
          <p className="mt-1 font-bold">주의사항:</p>
          <ol className="list-decimal pl-4">
            <li>업무 진행 전 KYC/Due Diligence 를 진행하며, 당사에서 수임이 확정되어야 서비스가 가능합니다.</li>
            <li>라이선스를 요할 수 있습니다 (SFC 규제 대상).</li>
            <li>가상자산 업종 등은 계좌개설이 어려울 수 있습니다.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

// --- Main Application ---

export default function QuoteEnquiry() {
  // --- Role Detection ---
  const user = useMemo(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  }, []);


  const userRole = user?.role || 'user';
  const isAdmin = ['admin', 'master'].includes(userRole);

  const [view, setView] = useState(isAdmin ? 'manager' : 'customer'); // 'manager' | 'customer' | 'invoice' | 'history'
  const [items, setItems] = useState<BillableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Item Editor State
  const [editingItem, setEditingItem] = useState<BillableItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    personName: '',
    productDescription: '',
    selectedServiceIds: [] as string[]
  });

  // Filtered items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(i =>
      i.title?.toLowerCase().includes(q) ||
      i.description?.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await getInvoiceBillableData("billableItems");
      setItems(res.result || []);
    } catch (err) {
      console.error("Failed to load items", err);
      setItems(INITIAL_ITEMS as any);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async (e: any) => {
    e.preventDefault();
    const form = e.target;

    const itemData: any = {
      title: form.name.value,
      price: parseFloat(form.price.value),
      description: form.description.value,
      type: "billableItems" as const
    };

    try {
      await saveInvoiceBillableData(itemData, editingItem?._id || '');
      toast({ title: "Success", description: editingItem ? "Item updated" : "Item created" });
      loadItems();
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      toast({ title: "Error", description: "Failed to save item", variant: "destructive" });
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await delInvoiceBillableData(id);
        toast({ title: "Success", description: "Item deleted" });
        loadItems();
      } catch (err) {
        toast({ title: "Error", description: "Failed to delete item", variant: "destructive" });
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.selectedServiceIds.length === 0) {
      alert("Please select at least one service.");
      return;
    }
    setView('invoice');
  };

  const toggleService = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedServiceIds: prev.selectedServiceIds.includes(id)
        ? prev.selectedServiceIds.filter(sid => sid !== id)
        : [...prev.selectedServiceIds, id]
    }));
  };

  return (
    <div className="h-screen flex flex-col bg-background font-sans text-foreground">
      {/* Navigation Header */}
      <nav className="bg-card border-b border-border sticky top-0 z-10 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-1.5 rounded font-black text-xl italic">MA</div>
          <span className="font-bold tracking-tight text-lg">MIRRASIA <span className="text-muted-foreground font-medium">QUOTES</span></span>
        </div>
        <div className="flex flex-col sm:flex-row gap-1 bg-muted p-1 rounded-lg w-full sm:w-auto">
          {isAdmin && (
            <>
              <button
                onClick={() => setView('manager')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex-1 sm:flex-none ${view === 'manager' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Settings size={16} className="inline mr-2" />
                Manage Catalog
              </button>
              <button
                onClick={() => setView('history')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex-1 sm:flex-none ${view === 'history' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <History size={16} className="inline mr-2" />
                Quote History
              </button>
            </>
          )}
          <button
            onClick={() => setView('customer')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex-1 sm:flex-none ${view === 'customer' || view === 'invoice' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <FileText size={16} className="inline mr-2" />
            Create Quote
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">

          {/* VIEW 1: ITEM MANAGEMENT */}
          {view === 'manager' && isAdmin && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Service Catalog</h1>
                  <p className="text-muted-foreground">Define the products and services that will appear on client forms.</p>
                </div>
                <button
                  onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                  className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-lg"
                >
                  <Plus size={20} />
                  Add New Service
                </button>
              </div>

              {/* Search & Stats Bar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full border border-input bg-background text-foreground rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                  <Package size={16} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">{items.length} services</span>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50">
                  {[1, 2, 3].map(i => <div key={i} className="h-48 bg-card border border-border rounded-lg animate-pulse"></div>)}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Package size={48} className="text-muted-foreground/30 mb-4" />
                  <p className="text-lg font-semibold text-muted-foreground">No services found</p>
                  <p className="text-sm text-muted-foreground/70">{searchQuery ? 'Try a different search term' : 'Add your first service to get started'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item: BillableItem) => (
                    <ItemCard
                      key={item._id}
                      item={item}
                      onEdit={(item: any) => { setEditingItem(item); setIsModalOpen(true); }}
                      onDelete={handleDeleteItem}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: CUSTOMER REQUEST FORM */}
          {view === 'customer' && (
            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-foreground">Request for Quotation</h1>
                <p className="text-muted-foreground mt-2">Please provide your details and select the services you require.</p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-border bg-muted/30">
                    <h2 className="font-bold flex items-center gap-2 text-foreground">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold">1</span>
                      Contact Information
                    </h2>
                  </div>
                  <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-muted-foreground">Your Name</label>
                      <input
                        required
                        type="text"
                        className="w-full border border-input bg-background text-foreground rounded-lg px-4 py-2 focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                        placeholder="John Doe"
                        value={formData.personName}
                        onChange={e => setFormData({ ...formData, personName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-muted-foreground">Email Address</label>
                      <input
                        required
                        type="email"
                        className="w-full border border-input bg-background text-foreground rounded-lg px-4 py-2 focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-semibold text-muted-foreground">Business Context / Product Description</label>
                      <textarea
                        required
                        rows={3}
                        className="w-full border border-input bg-background text-foreground rounded-lg px-4 py-2 focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                        placeholder="Describe your business or specific needs..."
                        value={formData.productDescription}
                        onChange={e => setFormData({ ...formData, productDescription: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-border bg-muted/30 flex items-center justify-between">
                    <h2 className="font-bold flex items-center gap-2 text-foreground">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold">2</span>
                      Select Services
                    </h2>
                    {formData.selectedServiceIds.length > 0 && (
                      <span className="text-xs font-semibold px-2.5 py-1 bg-primary/10 text-primary rounded-full">
                        {formData.selectedServiceIds.length} selected
                      </span>
                    )}
                  </div>
                  <div className="p-4 grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto">
                    {items.map((item: BillableItem) => (
                      <div
                        key={item._id}
                        onClick={() => toggleService(item._id || '')}
                        className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${formData.selectedServiceIds.includes(item._id || '')
                          ? 'border-primary/50 bg-primary/5 shadow-sm'
                          : 'border-border hover:border-muted-foreground/40'
                          }`}
                      >
                        <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.selectedServiceIds.includes(item._id || '')
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-muted-foreground/30 text-transparent'
                          }`}>
                          <CheckCircle2 size={16} />
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="font-bold text-foreground">{item.title}</h4>
                            <span className="font-bold text-foreground">${item.price}</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="bg-primary text-primary-foreground px-10 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg group w-full sm:w-auto justify-center"
                  >
                    Generate Professional Quote
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* VIEW 3: INVOICE PREVIEW */}
          {view === 'invoice' && (
            <div className="animate-in zoom-in-95 duration-300">
              <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <button
                  onClick={() => setView('customer')}
                  className="text-muted-foreground hover:text-foreground font-bold flex items-center gap-2"
                >
                  <ArrowLeft size={18} />
                  Back to Selection
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="bg-card border border-border text-foreground px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-muted"
                  >
                    <Download size={18} />
                    Download PDF
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const selectedItems = items.filter(i => formData.selectedServiceIds.includes(i._id || ''));
                        const payload = {
                          clientName: formData.personName,
                          clientEmail: formData.email,
                          // Required fields for MongoDB model:
                          email: formData.email,
                          personName: formData.personName,
                          description: formData.productDescription,
                          items: selectedItems.map(i => ({ title: i.title, price: i.price, description: i.description })),
                          total: selectedItems.reduce((acc, curr) => acc + (curr.price || 0), 0),
                          status: 'pending',
                          userId: user?._id || user?.id || ''
                        };
                        await updateReqForEnquiry(payload);
                        toast({ title: "Sent", description: "Quotation sent to " + formData.email });
                        setView(isAdmin ? 'history' : 'customer');
                      } catch (err) {
                        toast({ title: "Error", description: "Failed to send quotation", variant: "destructive" });
                      }
                    }}
                    className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 shadow-lg"
                  >
                    <Mail size={18} />
                    Send to Client
                  </button>
                </div>
              </div>

              <InvoiceLayout
                data={formData}
                items={items}
                selectedIds={formData.selectedServiceIds}
              />

              <div className="mt-12 text-center text-muted-foreground text-sm">
                <p>Generated by MIRRASIA Proprietary Quotation Engine</p>
              </div>
            </div>
          )}

          {/* VIEW 4: ADMIN HISTORY */}
          {view === 'history' && isAdmin && (
            <HistoryView
              onViewQuote={(quote: any) => {
                // Map history item back to form data format for preview
                setFormData({
                  email: quote.clientEmail || quote.email || '',
                  personName: quote.clientName || quote.personName || '',
                  productDescription: quote.description || quote.productDescription || '',
                  selectedServiceIds: [] // We won't select IDs, we'll pass full items to preview
                });
                // We need a way to pass arbitrary items to InvoiceLayout. 
                // Currently InvoiceLayout takes IDs. 
                // For now, let's just log or improve InvoiceLayout later.
                // Actually, we can just switch to invoice view and populate a special state.
                // But for simplicity in this turn, let's just show a toast or basic list.
                // Wait, I should implement this properly.
                // Let's defer "View Quote" full visual preview for a specialized component or just reprint.

                // Hack: Repopulate form with "custom" items if needed, or just show raw data.
                // A better approach is to make InvoiceLayout accept items directly, which it does!
                // InvoiceLayout takes `items` and `selectedIds`. 
                // I can pass the quote items as `items` and SELECT ALL of them.

                const quoteItems: BillableItem[] = (quote.items || []).map((i: any, idx: number) => ({
                  _id: `history-${idx}`,
                  title: i.title,
                  price: i.price,
                  description: i.description
                }));

                const tempItems = [...quoteItems];
                setItems(tempItems); // Override catalog temporarily
                setFormData(prev => ({
                  ...prev,
                  selectedServiceIds: tempItems.map(i => i._id || '')
                }));
                setView('invoice');
              }}
            />
          )}

        </div>
      </main>

      {/* Item Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/40">
              <h2 className="text-xl font-black text-foreground tracking-tight">
                {editingItem ? 'Edit Service' : 'Add New Service'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveItem} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Service Name</label>
                  <input
                    name="name"
                    required
                    defaultValue={editingItem?.title}
                    className="w-full border-2 border-input bg-background text-foreground rounded-xl px-4 py-2.5 focus:border-ring outline-none transition-all font-medium"
                    placeholder="e.g. Hong Kong Incorporation"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Price (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">$</span>
                    <input
                      name="price"
                      required
                      type="number"
                      defaultValue={editingItem?.price}
                      className="w-full border-2 border-input bg-background text-foreground rounded-xl pl-8 pr-4 py-2.5 focus:border-ring outline-none transition-all font-medium"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Description</label>
                  <textarea
                    name="description"
                    required
                    rows={6}
                    defaultValue={editingItem?.description}
                    className="w-full border-2 border-input bg-background text-foreground rounded-xl px-4 py-2.5 focus:border-ring outline-none transition-all font-medium"
                    placeholder="Provide full details. Use new lines for bullet points..."
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-grow bg-primary text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all"
                >
                  <Save size={18} />
                  {editingItem ? 'Update Service' : 'Save New Service'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 border border-border rounded-xl font-bold text-muted-foreground hover:bg-muted transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global CSS for Print */}
      <style>{`
        @media print {
          body { background: white !important; padding: 0 !important; }
          body * { visibility: hidden !important; }
          #invoice-capture, #invoice-capture * { visibility: visible !important; }
          #invoice-capture {
            border: none !important;
            box-shadow: none !important;
            max-width: 100% !important;
            padding: 0 !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}

// --- History View Component ---
function HistoryView({ onViewQuote }: { onViewQuote: (quote: any) => void }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    userId: '',
    sort: '-createdAt'
  });

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await getRedQuoteData({
        params: {
          search: filters.search,
          userId: filters.userId,
          sort: filters.sort
        }
      });
      if (res?.data) {
        setHistory(res.data);
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to load history", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filters]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quote History</h1>
          <p className="text-muted-foreground">Review and manage generated quotations.</p>
        </div>
        <button
          onClick={() => fetchHistory()}
          className="bg-muted text-foreground px-4 py-2 rounded-lg font-medium hover:bg-muted/80 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search client, email, or quote #..."
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full border border-input bg-background text-foreground rounded-lg pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="relative">
          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter by User ID..."
            value={filters.userId}
            onChange={e => setFilters(prev => ({ ...prev, userId: e.target.value }))}
            className="w-full border border-input bg-background text-foreground rounded-lg pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <select
            value={filters.sort}
            onChange={e => setFilters(prev => ({ ...prev, sort: e.target.value }))}
            className="w-full border border-input bg-background text-foreground rounded-lg pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-ring appearance-none"
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="-total">Highest Value</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-4">Quote #</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Creator (User ID)</th>
                <th className="px-6 py-4 text-right">Total</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground animate-pulse">
                    Loading history...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    No quotes found.
                  </td>
                </tr>
              ) : (
                history.map((quote) => (
                  <tr key={quote._id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm font-medium">{quote.quoteNumber || '—'}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(quote.createdAt).toLocaleDateString()}
                      <div className="text-xs opacity-70">{new Date(quote.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm text-foreground">{quote.clientName || quote.personName}</div>
                      <div className="text-xs text-muted-foreground">{quote.clientEmail || quote.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {quote.userId || <span className="text-xs italic opacity-50">Anonymous</span>}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-foreground">
                      ${(quote.total || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${quote.status === 'sent' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'}`}>
                        {quote.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onViewQuote(quote)}
                        className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                      >
                        View / Print
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
