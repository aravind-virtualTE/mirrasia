/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Download,
  Edit2,
  FileText,
  History,
  Mail,
  Package,
  Plus,
  Save,
  Search,
  Settings,
  Trash2,
  X,
} from 'lucide-react';
import {
  BillableItem,
  QuoteLanguage,
  QuoteLayout,
  delInvoiceBillableData,
  getInvoiceBillableData,
  getQuoteLayoutData,
  saveInvoiceBillableData,
  saveQuoteLayoutData,
} from '../InvoiceManager/invoiceM';
import { updateReqForEnquiry } from '@/pages/dashboard/Admin/ReqForQuote/rfq';
import { toast } from '@/hooks/use-toast';

import {
  DEFAULT_LAYOUT,
  LayoutForm,
  cloneLayout,
  normalizeLanguage,
  mergeLayout,
  getItemText,
  layoutToForm,
  formToLayout,
} from './utils';
import InvoiceLayout from './InvoiceLayout';
import HistoryView from './HistoryView';

type LocaleField = 'title' | 'description';

type LocaleInputConfig = {
  lang: QuoteLanguage;
  required?: boolean;
  nameField: string;
  descriptionField: string;
  nameLabelKey: string;
  namePlaceholderKey: string;
  descriptionLabelKey: string;
  descriptionPlaceholderKey: string;
};

const LOCALE_INPUT_CONFIGS: LocaleInputConfig[] = [
  {
    lang: 'en',
    required: true,
    nameField: 'name_en',
    descriptionField: 'description_en',
    nameLabelKey: 'quoteService.modal.serviceNameEnglishLabel',
    namePlaceholderKey: 'quoteService.modal.serviceNameEnglishPlaceholder',
    descriptionLabelKey: 'quoteService.modal.serviceDescriptionEnglishLabel',
    descriptionPlaceholderKey: 'quoteService.modal.serviceDescriptionEnglishPlaceholder',
  },
  {
    lang: 'ko',
    nameField: 'name_ko',
    descriptionField: 'description_ko',
    nameLabelKey: 'quoteService.modal.serviceNameKoreanLabel',
    namePlaceholderKey: 'quoteService.modal.serviceNameKoreanPlaceholder',
    descriptionLabelKey: 'quoteService.modal.serviceDescriptionKoreanLabel',
    descriptionPlaceholderKey: 'quoteService.modal.serviceDescriptionKoreanPlaceholder',
  },
  {
    lang: 'zhTW',
    nameField: 'name_zhTW',
    descriptionField: 'description_zhTW',
    nameLabelKey: 'quoteService.modal.serviceNameTraditionalChineseLabel',
    namePlaceholderKey: 'quoteService.modal.serviceNameTraditionalChinesePlaceholder',
    descriptionLabelKey: 'quoteService.modal.serviceDescriptionTraditionalChineseLabel',
    descriptionPlaceholderKey: 'quoteService.modal.serviceDescriptionTraditionalChinesePlaceholder',
  },
];

const getLocalizationDefaultValue = (
  item: BillableItem | null,
  language: QuoteLanguage,
  field: LocaleField,
) => {
  const localizedValue = item?.localizations?.[language]?.[field];
  if (localizedValue != null && String(localizedValue).trim()) {
    return String(localizedValue);
  }

  if (language === 'en') {
    return String(field === 'title' ? item?.title || '' : item?.description || '');
  }

  return '';
};

export default function QuoteEnquiry() {
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;
  const isAdmin = user?.role !== "user";

  const [view, setView] = useState<'manager' | 'customer' | 'invoice' | 'history' | 'layout_settings'>(isAdmin ? 'manager' : 'customer');

  const { t, i18n } = useTranslation();
  const selectedLanguage = useMemo(() => normalizeLanguage(i18n.language), [i18n.language]);

  const [items, setItems] = useState<BillableItem[]>([]);
  const [invoiceItemsOverride, setInvoiceItemsOverride] = useState<BillableItem[] | null>(null);
  const [layoutOverride, setLayoutOverride] = useState<QuoteLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [layout, setLayout] = useState<QuoteLayout>(cloneLayout(DEFAULT_LAYOUT));
  const [layoutForm, setLayoutForm] = useState<LayoutForm>(layoutToForm(DEFAULT_LAYOUT));
  const [layoutLoading, setLayoutLoading] = useState(false);
  const [layoutSaving, setLayoutSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BillableItem | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [activeTab, setActiveTab] = useState<QuoteLanguage>(selectedLanguage);

  // Sync activeTab with global language when it changes
  useEffect(() => {
    setActiveTab(selectedLanguage);
  }, [selectedLanguage]);

  const [quote, setQuote] = useState({
    email: '',
    personName: '',
    productDescription: '',
    selectedServiceIds: [] as string[],
    quoteNumber: '',
    quoteDate: '',
  });

  const activeLayout = layoutOverride || layout;
  const invoiceItems = invoiceItemsOverride || items;

  const clearPreviewOverrides = () => {
    setInvoiceItemsOverride(null);
    setLayoutOverride(null);
  };

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const text = getItemText(item, selectedLanguage, t('quoteService.catalog.untitledService'));
      return (
        text.title.toLowerCase().includes(q) ||
        text.description.toLowerCase().includes(q) ||
        String(item.title || '').toLowerCase().includes(q) ||
        String(item.description || '').toLowerCase().includes(q)
      );
    });
  }, [items, search, selectedLanguage, t]);

  const customerFilteredItems = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const text = getItemText(item, selectedLanguage, t('quoteService.catalog.untitledService'));
      return (
        text.title.toLowerCase().includes(q) ||
        text.description.toLowerCase().includes(q) ||
        String(item.title || '').toLowerCase().includes(q) ||
        String(item.description || '').toLowerCase().includes(q)
      );
    });
  }, [items, customerSearch, selectedLanguage, t]);

  const customerTotal = useMemo(() => {
    const selected = items.filter((item) => quote.selectedServiceIds.includes(item._id || ''));
    return selected.reduce((sum, item) => sum + Number(item.price || 0), 0);
  }, [items, quote.selectedServiceIds]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await getInvoiceBillableData('billableItems');
      setItems(res.result || []);
    } catch (error) {
      console.error(error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const loadLayout = async (language: QuoteLanguage) => {
    setLayoutLoading(true);
    try {
      const res = await getQuoteLayoutData(language);
      const nextLayout = mergeLayout(res?.result?.layout);
      setLayout(nextLayout);
      setLayoutForm(layoutToForm(nextLayout));
    } catch (error) {
      console.error(error);
      const fallback = cloneLayout(DEFAULT_LAYOUT);
      setLayout(fallback);
      setLayoutForm(layoutToForm(fallback));
    } finally {
      setLayoutLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    loadLayout(selectedLanguage);
  }, [selectedLanguage]);

  const saveItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const price = Number((form.elements.namedItem('price') as HTMLInputElement)?.value || 0);

    let enTitle = '';
    let enDescription = '';
    const localizations: Partial<Record<QuoteLanguage, { title: string; description: string } | null>> = {};

    LOCALE_INPUT_CONFIGS.forEach((config) => {
      const title = String((form.elements.namedItem(config.nameField) as HTMLInputElement | null)?.value || '').trim();
      const description = String((form.elements.namedItem(config.descriptionField) as HTMLTextAreaElement | null)?.value || '').trim();

      if (config.lang === 'en') {
        enTitle = title;
        enDescription = description;
        localizations.en = { title, description };
        return;
      }

      if (title || description) {
        localizations[config.lang] = { title, description };
        return;
      }

      if (editingItem?.localizations?.[config.lang]) {
        localizations[config.lang] = null;
      }
    });

    try {
      await saveInvoiceBillableData({
        title: enTitle,
        description: enDescription,
        price,
        type: 'billableItems',
        localizations,
      }, editingItem?._id || '');

      toast({
        title: t('quoteService.common.success'),
        description: editingItem ? t('quoteService.toast.itemUpdated') : t('quoteService.toast.itemCreated'),
      });
      setIsModalOpen(false);
      setEditingItem(null);
      loadItems();
    } catch (error) {
      console.log("error", error)
      toast({ title: t('quoteService.common.error'), description: t('quoteService.toast.failedToSaveItem'), variant: 'destructive' });
    }
  };

  const saveLayout = async () => {
    setLayoutSaving(true);
    try {
      const payloadLayout = formToLayout(layoutForm, layout);
      const res = await saveQuoteLayoutData({
        language: selectedLanguage,
        layout: payloadLayout,
        updatedBy: user?._id || user?.id || '',
      });
      const merged = mergeLayout(res?.result?.layout || payloadLayout);
      setLayout(merged);
      setLayoutForm(layoutToForm(merged));
      toast({ title: t('quoteService.toast.saved'), description: t('quoteService.toast.layoutUpdated') });
    } catch (error) {
      console.log("error", error)
      toast({ title: t('quoteService.common.error'), description: t('quoteService.toast.failedToSaveLayout'), variant: 'destructive' });
    } finally {
      setLayoutSaving(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!window.confirm(t('quoteService.confirm.deleteService'))) return;
    try {
      await delInvoiceBillableData(id);
      toast({ title: t('quoteService.common.success'), description: t('quoteService.toast.itemDeleted') });
      loadItems();
    } catch (error) {
      console.log("error", error)
      toast({ title: t('quoteService.common.error'), description: t('quoteService.toast.failedToDeleteItem'), variant: 'destructive' });
    }
  };

  const submitQuoteForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote.selectedServiceIds.length) {
      alert(t('quoteService.alert.selectAtLeastOneService'));
      return;
    }
    clearPreviewOverrides();
    setQuote((prev) => ({
      ...prev,
      quoteNumber: `DRAFT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      quoteDate: new Date().toISOString(),
    }));
    setView('invoice');
  };

  const toggleService = (id: string) => {
    setQuote((prev) => ({
      ...prev,
      selectedServiceIds: prev.selectedServiceIds.includes(id)
        ? prev.selectedServiceIds.filter((x) => x !== id)
        : [...prev.selectedServiceIds, id],
    }));
  };

  const sendQuote = async () => {
    try {
      const selected = invoiceItems.filter((item) => quote.selectedServiceIds.includes(item._id || ''));
      const payloadItems = selected.map((item) => {
        const text = getItemText(item, selectedLanguage, t('quoteService.catalog.untitledService'));
        return {
          title: text.title,
          description: text.description,
          price: Number(item.price || 0),
          localizations: item.localizations || {},
        };
      });

      await updateReqForEnquiry({
        clientName: quote.personName,
        clientEmail: quote.email,
        email: quote.email,
        personName: quote.personName,
        description: quote.productDescription,
        language: selectedLanguage,
        layoutSnapshot: activeLayout,
        quoteNumber: quote.quoteNumber,
        quoteDate: quote.quoteDate,
        items: payloadItems,
        total: payloadItems.reduce((sum, item) => sum + Number(item.price || 0), 0),
        status: 'pending',
        userId: user?._id || user?.id || '',
        userName: user?.fullName || user?.name || user?.username || user?.email || '',
      });

      toast({
        title: t('quoteService.toast.sent'),
        description: t('quoteService.toast.quotationSent', { email: quote.email }),
      });
      clearPreviewOverrides();
      setView(isAdmin ? 'history' : 'customer');
    } catch (error) {
      console.log("error", error)
      toast({ title: t('quoteService.common.error'), description: t('quoteService.toast.failedToSendQuotation'), variant: 'destructive' });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <nav className="bg-card border-b border-border px-4 py-3 sticky top-0 z-10">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground rounded px-2 py-1 font-black italic">MA</div>
            <p className="font-bold tracking-tight">{t('quoteService.nav.title')}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">          
            <div className="flex gap-1 bg-muted p-1 rounded-lg">
              {isAdmin && (
                <>
                  <button className={`px-3 py-1.5 rounded text-sm ${view === 'manager' ? 'bg-card shadow-sm' : ''}`} onClick={() => { clearPreviewOverrides(); setView('manager'); }}>
                    <Settings size={14} className="inline mr-1" />{t('quoteService.nav.manageCatalog')}
                  </button>
                  <button className={`px-3 py-1.5 rounded text-sm ${view === 'layout_settings' ? 'bg-card shadow-sm' : ''}`} onClick={() => { clearPreviewOverrides(); setView('layout_settings'); }}>
                    <FileText size={14} className="inline mr-1" />{t('quoteService.nav.buildInvoiceTemplate')}
                  </button>
                </>
              )}
              <button className={`px-3 py-1.5 rounded text-sm ${view === 'history' ? 'bg-card shadow-sm' : ''}`} onClick={() => { clearPreviewOverrides(); setView('history'); }}>
                <History size={14} className="inline mr-1" />{isAdmin ? t('quoteService.nav.quoteHistory') : t('quoteService.nav.myQuotes')}
              </button>
              <button className={`px-3 py-1.5 rounded text-sm ${view === 'customer' || view === 'invoice' ? 'bg-card shadow-sm' : ''}`} onClick={() => { clearPreviewOverrides(); setView('customer'); }}>
                <FileText size={14} className="inline mr-1" />{t('quoteService.nav.createQuote')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        {view === 'manager' && isAdmin && (
          <div className="space-y-8">
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h1 className="text-2xl font-bold">{t('quoteService.catalog.title')}</h1>
                  <p className="text-sm text-muted-foreground">{t('quoteService.catalog.subtitle')}</p>
                </div>
                <button className="bg-primary text-primary-foreground rounded-lg px-4 py-2 font-bold" onClick={() => { setEditingItem(null); setIsModalOpen(true); }}>
                  <Plus size={16} className="inline mr-1" />{t('quoteService.catalog.addService')}
                </button>
              </div>

              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input className="w-full border border-input rounded-lg pl-9 pr-3 py-2 bg-background" placeholder={t('quoteService.catalog.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="px-3 py-2 rounded-lg bg-muted text-sm text-muted-foreground flex items-center gap-2">
                  <Package size={14} /> {t('quoteService.catalog.servicesCount', { count: items.length })}
                </div>
              </div>

              {loading ? (
                <p className="text-muted-foreground">{t('quoteService.catalog.loadingServices')}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map((item) => {
                    const text = getItemText(item, selectedLanguage, t('quoteService.catalog.untitledService'));
                    return (
                      <div key={item._id} className="border border-border rounded-lg p-4 bg-card">
                        <div className="flex justify-between gap-2">
                          <h3 className="font-bold line-clamp-1">{text.title}</h3>
                          <div className="flex gap-2">
                            <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }}><Edit2 size={14} /></button>
                            <button onClick={() => item._id && deleteItem(item._id)}><Trash2 size={14} /></button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-2">{text.description}</p>
                        <p className="mt-3 font-bold text-primary">${item.price}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {view === 'layout_settings' && isAdmin && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div>
              <h1 className="text-2xl font-bold">{t('quoteService.layoutSettings.title')}</h1>
              <p className="text-sm text-muted-foreground mt-1">{t('quoteService.layoutSettings.subtitle')}</p>
            </div>

            {layoutLoading ? (
              <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border border-border">{t('quoteService.layoutSettings.loadingLayout')}</div>
            ) : (
              <div className="space-y-6">
                {/* Brand & Identity */}
                <section className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-border bg-muted/20">
                    <h2 className="font-bold text-lg">{t('quoteService.layoutSettings.brandIdentity.title')}</h2>
                    <p className="text-xs text-muted-foreground">{t('quoteService.layoutSettings.brandIdentity.subtitle')}</p>
                  </div>
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold mb-1.5">{t('quoteService.layoutSettings.brandIdentity.companyNameLabel')}</label>
                      <input className="w-full border border-input rounded-lg px-3 py-2 bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" value={layoutForm.companyName} onChange={(e) => setLayoutForm((p) => ({ ...p, companyName: e.target.value }))} />
                      <p className="text-[11px] text-muted-foreground mt-1">{t('quoteService.layoutSettings.brandIdentity.companyNameHint')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1.5">{t('quoteService.layoutSettings.brandIdentity.headerBadgeLabel')}</label>
                      <input className="w-full border border-input rounded-lg px-3 py-2 bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" value={layoutForm.badgeText} onChange={(e) => setLayoutForm((p) => ({ ...p, badgeText: e.target.value }))} />
                      <p className="text-[11px] text-muted-foreground mt-1">{t('quoteService.layoutSettings.brandIdentity.headerBadgeHint')}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold mb-1.5">{t('quoteService.layoutSettings.brandIdentity.companyDetailsLabel')}</label>
                      <textarea className="w-full border border-input rounded-lg px-3 py-2 bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" rows={4} value={layoutForm.companyDetails} onChange={(e) => setLayoutForm((p) => ({ ...p, companyDetails: e.target.value }))} />
                      <p className="text-[11px] text-muted-foreground mt-1">{t('quoteService.layoutSettings.brandIdentity.companyDetailsHint')}</p>
                    </div>
                  </div>
                </section>

                {/* Terms & Conditions */}
                <section className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-border bg-muted/20">
                    <h2 className="font-bold text-lg">{t('quoteService.layoutSettings.terms.title')}</h2>
                    <p className="text-xs text-muted-foreground">{t('quoteService.layoutSettings.terms.subtitle')}</p>
                  </div>
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold mb-1.5">{t('quoteService.layoutSettings.terms.notesTitleLabel')}</label>
                      <input className="w-full border border-input rounded-lg px-3 py-2 bg-background" value={layoutForm.notesTitle} onChange={(e) => setLayoutForm((p) => ({ ...p, notesTitle: e.target.value }))} />
                      <label className="block text-sm font-bold mt-4 mb-1.5">{t('quoteService.layoutSettings.terms.notesContentLabel')}</label>
                      <textarea className="w-full border border-input rounded-lg px-3 py-2 bg-background" rows={4} value={layoutForm.notesLines} onChange={(e) => setLayoutForm((p) => ({ ...p, notesLines: e.target.value }))} />
                      <p className="text-[11px] text-muted-foreground mt-1">{t('quoteService.layoutSettings.terms.notesHint')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1.5">{t('quoteService.layoutSettings.terms.legalTitleLabel')}</label>
                      <input className="w-full border border-input rounded-lg px-3 py-2 bg-background" value={layoutForm.legalTermsTitle} onChange={(e) => setLayoutForm((p) => ({ ...p, legalTermsTitle: e.target.value }))} />
                      <label className="block text-sm font-bold mt-4 mb-1.5">{t('quoteService.layoutSettings.terms.legalContentLabel')}</label>
                      <textarea className="w-full border border-input rounded-lg px-3 py-2 bg-background" rows={4} value={layoutForm.legalTermsLines} onChange={(e) => setLayoutForm((p) => ({ ...p, legalTermsLines: e.target.value }))} />
                      <p className="text-[11px] text-muted-foreground mt-1">{t('quoteService.layoutSettings.terms.legalHint')}</p>
                    </div>
                    <div className="md:col-span-2 pt-2 border-t border-border">
                      <label className="block text-sm font-bold mb-1.5">{t('quoteService.layoutSettings.terms.footerTextLabel')}</label>
                      <textarea className="w-full border border-input rounded-lg px-3 py-2 bg-background text-sm" rows={2} value={layoutForm.footerText} onChange={(e) => setLayoutForm((p) => ({ ...p, footerText: e.target.value }))} />
                      <p className="text-[11px] text-muted-foreground mt-1">{t('quoteService.layoutSettings.terms.footerHint')}</p>
                    </div>
                  </div>
                </section>

                {/* Table Labels */}
                <section className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
                    <div>
                      <h2 className="font-bold text-lg">{t('quoteService.layoutSettings.tableLabels.title')}</h2>
                      <p className="text-xs text-muted-foreground">{t('quoteService.layoutSettings.tableLabels.subtitle')}</p>
                    </div>
                    <button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-6 py-2 font-bold shadow-md transition-all active:scale-95 flex items-center gap-2" disabled={layoutSaving} onClick={saveLayout}>
                      <Save size={16} />{layoutSaving ? t('quoteService.layoutSettings.saving') : t('quoteService.layoutSettings.saveConfiguration')}
                    </button>
                  </div>
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">{t('quoteService.layoutSettings.tableLabels.quotationLabel')}</label>
                      <input className="w-full border border-input rounded-lg px-3 py-2 bg-background text-sm" value={layoutForm.quotationLabel} onChange={(e) => setLayoutForm((p) => ({ ...p, quotationLabel: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">{t('quoteService.layoutSettings.tableLabels.recipientLabel')}</label>
                      <input className="w-full border border-input rounded-lg px-3 py-2 bg-background text-sm" value={layoutForm.recipientLabel} onChange={(e) => setLayoutForm((p) => ({ ...p, recipientLabel: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">{t('quoteService.layoutSettings.tableLabels.totalPriceLabel')}</label>
                      <input className="w-full border border-input rounded-lg px-3 py-2 bg-background text-sm" value={layoutForm.totalLabel} onChange={(e) => setLayoutForm((p) => ({ ...p, totalLabel: e.target.value }))} />
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        )
        }

        {
          view === 'history' && <HistoryView
            isAdmin={isAdmin}
            currentUserId={user?._id || user?.id}
            currentUserEmail={user?.email}
            onViewQuote={(row) => {
              const lang = normalizeLanguage(row.language);
              i18n.changeLanguage(lang);
              setLayoutOverride(mergeLayout(row.layoutSnapshot));
              const mapped: BillableItem[] = (row.items || []).map((item: any, idx: number) => ({
                _id: `history-${idx}`,
                title: item.title || '',
                description: item.description || '',
                price: Number(item.price) || 0,
                type: 'billableItems',
                localizations: item.localizations || { [lang]: { title: item.title || '', description: item.description || '' } },
              }));
              setInvoiceItemsOverride(mapped);
              setQuote({
                email: row.clientEmail || row.email || '',
                personName: row.clientName || row.personName || '',
                productDescription: row.description || row.productDescription || '',
                selectedServiceIds: mapped.map((m) => m._id || ''),
                quoteNumber: row.quoteNumber || '',
                quoteDate: row.createdAt || new Date().toISOString(),
              });
              setView('invoice');
            }} />
        }

        {
          view === 'customer' && (
            <div className="max-width mx-auto">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold">{t('quoteService.customer.title')}</h1>
                <p className="text-muted-foreground mt-1">{t('quoteService.customer.subtitle')}</p>
              </div>

              <form onSubmit={submitQuoteForm} className="space-y-5">
                <div className="border border-border rounded-xl bg-card overflow-hidden">
                  <div className="p-4 border-b border-border bg-muted/30 font-bold">{t('quoteService.customer.contactSectionTitle')}</div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input className="border border-input rounded-lg px-3 py-2 bg-background" placeholder={t('quoteService.customer.namePlaceholder')} required value={quote.personName} onChange={(e) => setQuote((p) => ({ ...p, personName: e.target.value }))} />
                    <input className="border border-input rounded-lg px-3 py-2 bg-background" placeholder={t('quoteService.customer.emailPlaceholder')} type="email" required value={quote.email} onChange={(e) => setQuote((p) => ({ ...p, email: e.target.value }))} />
                    <textarea className="border border-input rounded-lg px-3 py-2 bg-background md:col-span-2" rows={3} placeholder={t('quoteService.customer.descriptionPlaceholder')} required value={quote.productDescription} onChange={(e) => setQuote((p) => ({ ...p, productDescription: e.target.value }))} />
                  </div>
                </div>

                <div className="border border-border rounded-xl bg-card overflow-hidden">
                  <div className="p-4 border-b border-border bg-muted/30 font-bold flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span>{t('quoteService.customer.servicesSectionTitle')}</span>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1 sm:w-[250px]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          className="w-full border border-input rounded-full pl-8 pr-3 py-1 bg-background text-sm font-normal"
                          placeholder={t('quoteService.customer.searchPlaceholder')}
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                        />
                      </div>
                      <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-1 rounded-full whitespace-nowrap">{t('quoteService.customer.selectedCount', { count: quote.selectedServiceIds.length })}</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-3 max-h-[420px] overflow-y-auto">
                    {customerFilteredItems.map((item) => {
                      const text = getItemText(item, selectedLanguage, t('quoteService.catalog.untitledService'));
                      const active = quote.selectedServiceIds.includes(item._id || '');
                      return (
                        <button
                          type="button"
                          key={item._id}
                          className={`w-full text-left border rounded-xl p-3 transition ${active ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/40'}`}
                          onClick={() => toggleService(item._id || '')}
                        >
                          <div className="flex gap-3">
                            <div className={`w-6 h-6 rounded-full border-2 mt-1 flex items-center justify-center ${active ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30 text-transparent'}`}><CheckCircle2 size={14} /></div>
                            <div className="flex-1">
                              <div className="flex justify-between gap-3">
                                <p className="font-bold">{text.title}</p>
                                <p className="font-bold">${item.price}</p>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{text.description}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="sticky bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-xl z-20 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('quoteService.customer.totalEstimate')}</p>
                    <p className="text-2xl font-black">${customerTotal.toFixed(2)}</p>
                  </div>
                  <button type="submit" className="bg-primary text-primary-foreground rounded-xl px-8 py-3 font-bold w-full sm:w-auto shadow-lg hover:shadow-xl transition-all">
                    {t('quoteService.customer.generateQuote')} <ChevronRight size={16} className="inline ml-1" />
                  </button>
                </div>
              </form>
            </div>
          )
        }

        {
          view === 'invoice' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <button className="text-sm text-muted-foreground font-bold" onClick={() => { clearPreviewOverrides(); setView('customer'); }}>
                  <ArrowLeft size={16} className="inline mr-1" />{t('quoteService.invoice.backToSelection')}
                </button>
                <div className="flex gap-2">
                  <button className="border border-border rounded-lg px-4 py-2 font-bold" onClick={() => window.print()}>
                    <Download size={14} className="inline mr-1" />{t('quoteService.invoice.downloadPdf')}
                  </button>
                  {!invoiceItemsOverride && (
                    <button className="bg-primary text-primary-foreground rounded-lg px-4 py-2 font-bold" onClick={sendQuote}>
                      <Mail size={14} className="inline mr-1" />{t('quoteService.invoice.sendToClient')}
                    </button>
                  )}
                </div>
              </div>

              <InvoiceLayout quote={quote} items={invoiceItems} language={selectedLanguage} layout={activeLayout} />
              <p className="text-center text-sm text-muted-foreground">{activeLayout.generatedByText}</p>
            </div>
          )
        }
      </main >

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center">
          <div className="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
              <h2 className="font-black text-lg">
                {editingItem ? t('quoteService.modal.editService') : t('quoteService.modal.addService')} {t('quoteService.modal.multilingualSuffix')}
              </h2>
              <button onClick={() => setIsModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={saveItem} className="p-0 flex flex-col max-h-[75vh]">
              <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="w-full sm:w-1/2">
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">{t('quoteService.modal.basePriceLabel')}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                    <input name="price" type="number" required defaultValue={editingItem?.price} className="w-full border border-input rounded-lg pl-8 pr-3 py-2.5 bg-background font-bold text-lg" placeholder={t('quoteService.modal.basePricePlaceholder')} />
                  </div>
                </div>
                <div className="flex bg-muted/50 p-1 rounded-lg">
                  {LOCALE_INPUT_CONFIGS.map((config) => (
                    <button
                      key={`lang-tab-${config.lang}`}
                      type="button"
                      onClick={() => setActiveTab(config.lang)}
                      className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${activeTab === config.lang ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {t(`quoteService.languages.${config.lang}`, { defaultValue: config.lang })}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 overflow-y-auto min-h-[400px]">
                {LOCALE_INPUT_CONFIGS.map((config) => (
                  <div key={`lang-form-${config.lang}`} className={`space-y-4 ${activeTab === config.lang ? 'animate-in fade-in slide-in-from-bottom-2' : 'hidden'}`}>
                    {!config.required && (
                      <div className="flex items-center gap-2 mb-2 p-3 bg-blue-500/10 text-blue-600 rounded-lg">
                        <FileText size={16} /> <span className="text-xs font-medium">{t('quoteService.modal.optionalLocalizationHint')}</span>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-bold mb-1.5 text-foreground">{t(config.nameLabelKey)}</label>
                      <input
                        name={config.nameField}
                        required={Boolean(config.required)}
                        defaultValue={getLocalizationDefaultValue(editingItem, config.lang, 'title')}
                        className="w-full border border-input rounded-lg px-3 py-2 bg-background"
                        placeholder={t(config.namePlaceholderKey)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1.5 text-foreground">{t(config.descriptionLabelKey)}</label>
                      <textarea
                        name={config.descriptionField}
                        required={Boolean(config.required)}
                        defaultValue={getLocalizationDefaultValue(editingItem, config.lang, 'description')}
                        className="w-full border border-input rounded-lg px-3 py-2 bg-background"
                        rows={10}
                        placeholder={t(config.descriptionPlaceholderKey)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/10">
                <button type="button" className="px-6 py-2 border border-border rounded-lg font-medium hover:bg-muted/50 transition-colors" onClick={() => setIsModalOpen(false)}>{t('quoteService.common.cancel')}</button>
                <button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-8 py-2 font-bold shadow-md transition-transform active:scale-95 flex items-center">
                  <Save size={16} className="mr-2" />{editingItem ? t('quoteService.modal.updateService') : t('quoteService.modal.createService')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #invoice-capture, #invoice-capture * { visibility: visible !important; }
          #invoice-capture { position: absolute !important; inset: 0 !important; width: 100% !important; }
        }
      `}</style>
    </div >
  );
}
