/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
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
  ArrowLeft
} from 'lucide-react';
import {
  getInvoiceBillableData,
  saveInvoiceBillableData,
  delInvoiceBillableData,
  BillableItem
} from '../InvoiceManager/invoiceM';
import { updateReqForEnquiry } from '@/pages/dashboard/Admin/ReqForQuote/rfq';
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
  <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow group">
    <div className="flex justify-between items-start mb-2">
      <h3 className="font-bold text-slate-800 line-clamp-1">{item.title}</h3>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(item)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
        <button onClick={() => onDelete(item._id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
      </div>
    </div>
    <p className="text-sm text-slate-500 line-clamp-2 mb-3 h-10">{item.description}</p>
    <div className="flex justify-between items-center pt-3 border-t">
      <span className="text-xs font-semibold uppercase text-slate-400">Price</span>
      <span className="text-lg font-bold text-blue-700">${item.price}</span>
    </div>
  </div>
);

const InvoiceLayout = ({ data, items, selectedIds }: { data: any, items: BillableItem[], selectedIds: string[] }) => {
  const selectedItems = items.filter(i => selectedIds.includes(i._id || ''));
  const subtotal = selectedItems.reduce((acc, curr) => acc + (curr.price || 0), 0);
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="bg-white shadow-2xl rounded-none w-full max-w-4xl mx-auto p-12 border border-slate-200 text-slate-800 print:p-0 print:shadow-none" id="invoice-capture">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-800 pb-8 mb-8 text-black">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 italic">MIRR ASIA</h1>
          <div className="text-xs leading-relaxed text-slate-600 uppercase tracking-wider">
            MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED<br />
            WORKSHOP UNIT B50 & B58, 2/F, 36-40 Tai Lin Pai Road<br />
            KWAI CHUNG, N.T. Hong Kong<br />
            Email: mirrasia@gmail.com | Phone: +8225436187
          </div>
        </div>
        <div className="text-right">
          <div className="bg-slate-900 text-white px-4 py-1 text-xs font-bold mb-4 inline-block">DRAFT QUOTE</div>
          <div className="text-sm">
            <p><span className="font-bold">Quote #:</span> 2026{Math.floor(Math.random() * 10000)}</p>
            <p><span className="font-bold">Date:</span> {date}</p>
            <p><span className="font-bold">Expires:</span> 30 Days from issue</p>
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div className="mb-10 text-black">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Recipient</h3>
        <p className="font-bold text-lg">{data.personName || 'Valued Client'}</p>
        <p className="text-slate-600">{data.email}</p>
        <p className="text-slate-600 italic mt-1 font-medium">"{data.productDescription || 'Service Inquiry'}"</p>
      </div>

      {/* Table */}
      <table className="w-full mb-10 text-black">
        <thead>
          <tr className="border-b-2 border-slate-800 text-left text-xs font-bold uppercase tracking-widest">
            <th className="py-3 px-2 w-16 text-center">Qty</th>
            <th className="py-3 px-4">Product or Service</th>
            <th className="py-3 px-4 text-right">Unit Price</th>
            <th className="py-3 px-4 text-right">Line Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {selectedItems.map((item, idx) => (
            <tr key={idx} className="group">
              <td className="py-5 px-2 text-center align-top font-medium">1</td>
              <td className="py-5 px-4">
                <div className="font-bold text-slate-900 mb-1">{item.title}</div>
                <div className="text-xs text-slate-500 whitespace-pre-wrap leading-relaxed">{item.description}</div>
              </td>
              <td className="py-5 px-4 text-right align-top font-medium">${(item.price || 0).toFixed(2)}</td>
              <td className="py-5 px-4 text-right align-top font-bold text-slate-900">${(item.price || 0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-800">
            <td colSpan={3} className="py-6 px-4 text-right font-bold text-lg">Total Price:</td>
            <td className="py-6 px-4 text-right font-black text-2xl text-slate-900">${subtotal.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      {/* Footer Notes */}
      <div className="grid grid-cols-2 gap-10 border-t border-slate-100 pt-8 text-[10px] leading-relaxed text-slate-500">
        <div>
          <h4 className="font-bold text-slate-800 uppercase mb-2">Notes</h4>
          <p>별도비용: 회계/세무 (예상견적 차트 참조)</p>
          <p className="mt-2">This is a digital quote generated via Mirrasia App.</p>
        </div>
        <div>
          <h4 className="font-bold text-slate-800 uppercase mb-2">Legal Terms</h4>
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
  const [view, setView] = useState('manager'); // 'manager' | 'customer' | 'invoice'
  const [items, setItems] = useState<BillableItem[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navigation Header */}
      <nav className="bg-white border-b sticky top-0 z-10 px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 text-white p-1.5 rounded font-black text-xl italic">MA</div>
          <span className="font-bold tracking-tight text-lg">MIRRASIA <span className="text-slate-400 font-medium">QUOTES</span></span>
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setView('manager')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'manager' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Settings size={16} className="inline mr-2" />
            Manage Catalog
          </button>
          <button
            onClick={() => setView('customer')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'customer' || view === 'invoice' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <FileText size={16} className="inline mr-2" />
            Create Quote
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">

        {/* VIEW 1: ITEM MANAGEMENT */}
        {view === 'manager' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Service Catalog</h1>
                <p className="text-slate-500">Define the products and services that will appear on client forms.</p>
              </div>
              <button
                onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
              >
                <Plus size={20} />
                Add New Service
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50">
                {[1, 2, 3].map(i => <div key={i} className="h-48 bg-white border rounded-lg animate-pulse"></div>)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item: BillableItem) => (
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
              <h1 className="text-3xl font-bold text-slate-900">Request for Quotation</h1>
              <p className="text-slate-500 mt-2">Please provide your details and select the services you require.</p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b bg-slate-50/50">
                  <h2 className="font-bold flex items-center gap-2 text-slate-700">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-bold">1</span>
                    Contact Information
                  </h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600">Your Name</label>
                    <input
                      required
                      type="text"
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                      placeholder="John Doe"
                      value={formData.personName}
                      onChange={e => setFormData({ ...formData, personName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600">Email Address</label>
                    <input
                      required
                      type="email"
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-600">Business Context / Product Description</label>
                    <textarea
                      required
                      rows={3}
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                      placeholder="Describe your business or specific needs..."
                      value={formData.productDescription}
                      onChange={e => setFormData({ ...formData, productDescription: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b bg-slate-50/50">
                  <h2 className="font-bold flex items-center gap-2 text-slate-700">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-bold">2</span>
                    Select Services
                  </h2>
                </div>
                <div className="p-4 grid grid-cols-1 gap-3">
                  {items.map((item: BillableItem) => (
                    <div
                      key={item._id}
                      onClick={() => toggleService(item._id || '')}
                      className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${formData.selectedServiceIds.includes(item._id || '')
                        ? 'border-slate-900 bg-slate-50 shadow-sm'
                        : 'border-slate-100 hover:border-slate-300'
                        }`}
                    >
                      <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.selectedServiceIds.includes(item._id || '')
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'border-slate-200 text-transparent'
                        }`}>
                        <CheckCircle2 size={16} />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-bold text-slate-800">{item.title}</h4>
                          <span className="font-bold text-slate-900">${item.price}</span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="bg-slate-900 text-white px-10 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 group"
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
            <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <button
                onClick={() => setView('customer')}
                className="text-slate-500 hover:text-slate-900 font-bold flex items-center gap-2"
              >
                <ArrowLeft size={18} />
                Back to Selection
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-white border text-slate-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-50"
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
                        description: formData.productDescription,
                        items: selectedItems.map(i => ({ title: i.title, price: i.price })),
                        total: selectedItems.reduce((acc, curr) => acc + (curr.price || 0), 0),
                        status: 'pending'
                      };
                      await updateReqForEnquiry(payload);
                      toast({ title: "Sent", description: "Quotation sent to " + formData.email });
                      setView('manager');
                    } catch (err) {
                      toast({ title: "Error", description: "Failed to send quotation", variant: "destructive" });
                    }
                  }}
                  className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-800 shadow-lg shadow-slate-200"
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

            <div className="mt-12 text-center text-slate-400 text-sm">
              <p>Generated by MIRRASIA Proprietary Quotation Engine</p>
            </div>
          </div>
        )}

      </main>

      {/* Item Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {editingItem ? 'Edit Service' : 'Add New Service'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveItem} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Service Name</label>
                  <input
                    name="name"
                    required
                    defaultValue={editingItem?.title}
                    className="w-full border-2 rounded-xl px-4 py-2.5 focus:border-slate-900 outline-none transition-all font-medium"
                    placeholder="e.g. Hong Kong Incorporation"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Price (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                    <input
                      name="price"
                      required
                      type="number"
                      defaultValue={editingItem?.price}
                      className="w-full border-2 rounded-xl pl-8 pr-4 py-2.5 focus:border-slate-900 outline-none transition-all font-medium"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Description</label>
                  <textarea
                    name="description"
                    required
                    rows={6}
                    defaultValue={editingItem?.description}
                    className="w-full border-2 rounded-xl px-4 py-2.5 focus:border-slate-900 outline-none transition-all font-medium"
                    placeholder="Provide full details. Use new lines for bullet points..."
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-grow bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                >
                  <Save size={18} />
                  {editingItem ? 'Update Service' : 'Save New Service'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 border-2 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
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
          nav, button, footer { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          main { padding: 0 !important; max-width: 100% !important; margin: 0 !important; }
          #invoice-capture { border: none !important; box-shadow: none !important; max-width: 100% !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}