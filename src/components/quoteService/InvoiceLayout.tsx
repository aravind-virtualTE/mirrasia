/* eslint-disable @typescript-eslint/no-explicit-any */
import { BillableItem, QuoteLanguage, QuoteLayout } from '../InvoiceManager/invoiceM';
import { useTranslation } from 'react-i18next';
import { formatDate, getItemText } from './utils';

const InvoiceLayout = ({
    quote,
    items,
    language,
    layout,
}: {
    quote: any;
    items: BillableItem[];
    language: QuoteLanguage;
    layout: QuoteLayout;
}) => {
    const { t } = useTranslation();
    const selectedItems = items.filter((item) => quote.selectedServiceIds.includes(item._id || ''));
    const subtotal = selectedItems.reduce((sum, item) => sum + Number(item.price || 0), 0);
    const labels = layout.labels;

    return (
        <div id="invoice-capture" className="bg-card rounded-2xl border border-border shadow-xl p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row justify-between gap-5 border-b border-border pb-6 mb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight italic">{layout.companyName}</h1>
                    <div className="text-xs text-muted-foreground uppercase mt-2 space-y-1">
                        {layout.companyDetails.map((line, idx) => <p key={`line-${idx}`}>{line}</p>)}
                    </div>
                </div>
                <div className="text-right">
                    <div className="inline-block bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded">{layout.badgeText}</div>
                    <p className="text-sm mt-3"><b>{labels.quoteNumber}:</b> {quote.quoteNumber || t('quoteService.invoice.pending')}</p>
                    <p className="text-sm"><b>{labels.date}:</b> {formatDate(language, quote.quoteDate)}</p>
                    <p className="text-sm"><b>{labels.expires}:</b> {labels.expiresValue}</p>
                </div>
            </div>

            <div className="mb-8">
                <p className="text-xs uppercase text-muted-foreground font-bold tracking-wider mb-2">{labels.recipient}</p>
                <p className="font-bold text-lg">{quote.personName || t('quoteService.invoice.valuedClient')}</p>
                <p className="text-muted-foreground">{quote.email}</p>
                <p className="italic text-muted-foreground mt-1">"{quote.productDescription || t('quoteService.invoice.serviceInquiry')}"</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[620px]">
                    <thead>
                        <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground text-left">
                            <th className="py-2 w-16 text-center">{labels.qty}</th>
                            <th className="py-2 px-3">{labels.productOrService}</th>
                            <th className="py-2 px-3 text-right">{labels.unitPrice}</th>
                            <th className="py-2 px-3 text-right">{labels.lineTotal}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedItems.map((item, idx) => {
                            const text = getItemText(item, language, t('quoteService.catalog.untitledService'));
                            const price = Number(item.price || 0);
                            return (
                                <tr key={`inv-${idx}`} className="border-b border-border/60">
                                    <td className="py-4 text-center">1</td>
                                    <td className="py-4 px-3">
                                        <p className="font-bold">{text.title}</p>
                                        <p className="text-xs text-muted-foreground whitespace-pre-wrap">{text.description}</p>
                                    </td>
                                    <td className="py-4 px-3 text-right">${price.toFixed(2)}</td>
                                    <td className="py-4 px-3 text-right font-bold">${price.toFixed(2)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={3} className="py-5 px-3 text-right font-bold text-lg">{labels.totalPrice}:</td>
                            <td className="py-5 px-3 text-right font-black text-2xl">${subtotal.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-border pt-6 text-xs text-muted-foreground">
                <div>
                    <h4 className="font-bold text-foreground uppercase mb-1">{layout.notesTitle}</h4>
                    {layout.notesLines.map((line, idx) => <p key={`note-${idx}`}>{line}</p>)}
                </div>
                <div>
                    <h4 className="font-bold text-foreground uppercase mb-1">{layout.legalTermsTitle}</h4>
                    <ol className="list-decimal pl-4">
                        {layout.legalTermsLines.map((line, idx) => <li key={`legal-${idx}`}>{line}</li>)}
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default InvoiceLayout;
