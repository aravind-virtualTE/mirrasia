/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Filter, Search, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getRedQuoteData } from '@/pages/dashboard/Admin/ReqForQuote/rfq';
import { toast } from '@/hooks/use-toast';

interface HistoryViewProps {
    onViewQuote: (quote: any) => void;
    isAdmin: boolean;
    currentUserId?: string;
    currentUserEmail?: string;
}

export default function HistoryView({ onViewQuote, isAdmin, currentUserId, currentUserEmail }: HistoryViewProps) {
    const { t } = useTranslation();
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', userName: '', sort: '-createdAt' });

    const fetchRows = async () => {
        setLoading(true);
        try {
            const queryParams: any = { ...filters };
            if (!isAdmin) {
                // Non-admin users should see quotes addressed to their email, not only quotes created by their userId.
                if (currentUserEmail) {
                    queryParams.recipientEmail = currentUserEmail;
                } else if (currentUserId) {
                    queryParams.userId = currentUserId;
                }
            }
            const res = await getRedQuoteData({ params: queryParams });
            setRows(res?.data || []);
        } catch (error) {
            console.error(error);
            toast({ title: t('quoteService.common.error'), description: t('quoteService.history.toast.failedToLoadHistory'), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRows();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.search, filters.userName, filters.sort, isAdmin, currentUserId]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        className="w-full border border-input rounded-lg pl-9 pr-3 py-2 bg-background"
                        placeholder={t('quoteService.history.searchPlaceholder')}
                        value={filters.search}
                        onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                    />
                </div>
                {isAdmin && (
                    <div className="relative flex-1">
                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            className="w-full border border-input rounded-lg pl-9 pr-3 py-2 bg-background"
                            placeholder={t('quoteService.history.filterByCreatorPlaceholder')}
                            value={filters.userName}
                            onChange={(e) => setFilters((p) => ({ ...p, userName: e.target.value }))}
                        />
                    </div>
                )}
                <div className="relative w-full sm:w-[220px]">
                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <select
                        className="w-full border border-input rounded-lg pl-9 pr-3 py-2 bg-background"
                        value={filters.sort}
                        onChange={(e) => setFilters((p) => ({ ...p, sort: e.target.value }))}
                    >
                        <option value="-createdAt">{t('quoteService.history.sort.newestFirst')}</option>
                        <option value="createdAt">{t('quoteService.history.sort.oldestFirst')}</option>
                        <option value="-total">{t('quoteService.history.sort.highestValue')}</option>
                    </select>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[860px]">
                        <thead>
                            <tr className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground text-left">
                                <th className="px-4 py-3">{t('quoteService.history.columns.quoteNumber')}</th>
                                <th className="px-4 py-3">{t('quoteService.history.columns.date')}</th>
                                <th className="px-4 py-3">{t('quoteService.history.columns.client')}</th>
                                <th className="px-4 py-3">{t('quoteService.history.columns.creator')}</th>
                                <th className="px-4 py-3 text-right">{t('quoteService.history.columns.total')}</th>
                                <th className="px-4 py-3 text-center">{t('quoteService.history.columns.status')}</th>
                                <th className="px-4 py-3 text-right">{t('quoteService.history.columns.action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">{t('quoteService.history.loading')}</td></tr>
                            ) : rows.length === 0 ? (
                                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">{t('quoteService.history.noQuotesFound')}</td></tr>
                            ) : rows.map((row) => (
                                <tr key={row._id} className="border-t border-border/70">
                                    <td className="px-4 py-3 font-mono text-sm">{row.quoteNumber || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(row.createdAt).toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-bold text-sm">{row.clientName || row.personName}</p>
                                        <p className="text-xs text-muted-foreground">{row.clientEmail || row.email}</p>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">{row.userName || row.userId || t('quoteService.history.anonymous')}</td>
                                    <td className="px-4 py-3 text-right font-bold">${(row.total || 0).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${row.status === 'approved' || row.status === 'paid' ? 'bg-green-500/10 text-green-600 border border-green-500/20' :
                                            row.status === 'rejected' ? 'bg-red-500/10 text-red-600 border border-red-500/20' :
                                                row.status === 'sent' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' :
                                                    'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'
                                            }`}>
                                            {t(`quoteService.history.statusValues.${row.status || 'pending'}`, { defaultValue: row.status || 'pending' })}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button className="text-primary text-sm font-medium" onClick={() => onViewQuote(row)}>{t('quoteService.history.viewPrint')}</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
