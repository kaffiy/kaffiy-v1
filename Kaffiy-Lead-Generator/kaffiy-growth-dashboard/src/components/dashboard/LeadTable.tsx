import { useEffect, useMemo, useState, useDeferredValue, useRef } from 'react';
import { Search, Filter, ChevronDown, Pencil, Send, RotateCcw, MessageCircle, PhoneCall, Sparkles, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { LeadRecord } from '@/types/leads';
import { useLanguage } from '@/context/LanguageContext';

interface LeadTableProps {
  leads: LeadRecord[];
  onSelectLead: (lead: LeadRecord) => void;
  selectedLead: LeadRecord | null;
  onUpdateLead: (lead: LeadRecord, updates: Partial<LeadRecord>) => void;
  onDeleteLead?: (lead: LeadRecord) => void;
  resetTrigger?: number;
  firstSeenMap?: Record<string, string>;
}

type StatusFilter = 'All' | string;

const WHATSAPP_STATUSES = ['Not Sent', 'Accepted', 'Rejected', 'Interested', 'Demo Scheduled', 'Pending', 'Email Requested', 'Number Not Found'] as const;
const PHONE_STATUS_EMPTY = '__';
const PHONE_STATUSES = [PHONE_STATUS_EMPTY, 'Not Sent', 'Requested', 'Sent', 'In Process', 'Ready'] as const;

const TWO_STEP_GREETING = 'Merhabalar kolay gelsin';
const STRATEGY_A_MAIN_MESSAGE = `Merhabalar, ben Oguz :) Tech İstanbul bünyesinde, butik kafelerin büyük zincirlerin veri gücüyle rekabet etmesini sağlayan bir Akıllı Ara Katman geliştirdik. Şu an sistemin tüketici alışkanlığı tahminleme algoritmasını test edecek 10 öncü işletme seçiyoruz. Müşteri yorumlarınızı çok olumlu bulduk. Bu pilot programda yer alıp sistemimizi yorumlamanızı çok isteriz. Kısaca bahsetmemi ister misiniz?`;
const NEW_BADGE_MS = 14 * 24 * 60 * 60 * 1000; // 2 weeks

const getLeadKey = (lead: LeadRecord) => lead.ID || `${lead['Company Name'] ?? ''}-${lead.Phone ?? ''}`;

function getStrategyTemplate(lead: LeadRecord, strategy: 'A' | 'B' | 'C' | 'D'): string {
  if (strategy === 'A') return STRATEGY_A_MAIN_MESSAGE;
  const companyName = lead['Company Name'] || 'Kafe';
  const review = (lead['Last Review'] || '').replace(/["']/g, '');
  if (review) {
    return `Merhaba ${companyName}! Yorumunuzda bahsettiğiniz ${review} detayı çok hoşuma gitti. Kaffiy müşteri geri kazanma ve dijital sadakat sistemiyle misafirlerinize kolayca ödül sunmanıza yardımcı olabiliriz.`;
  }
  return `Merhaba ${companyName}! Kaffiy müşteri geri kazanma ve dijital sadakat sistemiyle misafirlerinize kolayca ödül sunmanıza yardımcı olabiliriz.`;
}

const buildWhatsAppMessage = (lead: LeadRecord) => {
  if (lead['Ready Message']) {
    return lead['Ready Message'];
  }
  if (lead['AI Message']) {
    return lead['AI Message'];
  }
  if ((lead['Active Strategy'] || 'A') === 'A') {
    return STRATEGY_A_MAIN_MESSAGE;
  }
  const companyName = lead['Company Name'] || 'Kafe';
  const review = (lead['Last Review'] || '').replace(/["']/g, '');
  if (review) {
    return `Merhaba ${companyName}! Yorumunuzda bahsettiğiniz ${review} detayı çok hoşuma gitti. Kaffiy müşteri geri kazanma ve dijital sadakat sistemiyle misafirlerinize kolayca ödül sunmanıza yardımcı olabiliriz.`;
  }
  return `Merhaba ${companyName}! Kaffiy müşteri geri kazanma ve dijital sadakat sistemiyle misafirlerinize kolayca ödül sunmanıza yardımcı olabiliriz.`;
};

export function LeadTable({ leads, onSelectLead, selectedLead, onUpdateLead, onDeleteLead, resetTrigger = 0, firstSeenMap = {} }: LeadTableProps) {
  const { t, lang } = useLanguage();
  const [leadToDelete, setLeadToDelete] = useState<LeadRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');

  const [serviceTagFilter, setServiceTagFilter] = useState<'All' | 'Web sitesi düzeltilecek'>('All');

  useEffect(() => {
    if (resetTrigger > 0) {
      setSearchQuery('');
      setStatusFilter('All');
      setLeadTypeFilter('All');
      setServiceTagFilter('All');
      setVisibleCount(10);
    }
  }, [resetTrigger]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<LeadRecord | null>(null);
  const [draftMessage, setDraftMessage] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [isGenerating, setIsGenerating] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [sendCountdowns, setSendCountdowns] = useState<Record<string, number>>({});
  const previousStatusesRef = useRef<Record<string, string>>({});
  const [leadTypeFilter, setLeadTypeFilter] = useState<'All' | 'WhatsApp' | 'Call Only' | 'Email' | 'Instagram' | 'Web' | 'Other'>('All');

  const OTHER_CHANNELS = ['Email', 'Instagram', 'Web', 'Other'];

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const serviceTag = (lead['Service Tag'] || '').trim();
      const isWebsiteFixLead = serviceTag === 'Web sitesi düzeltilecek';
      const showingWebsiteFixOnly = serviceTagFilter === 'Web sitesi düzeltilecek';

      const q = deferredSearchQuery.trim().toLowerCase();
      const companyName = (lead['Company Name'] || '').toLowerCase();
      const city = (lead.City || '').toLowerCase();
      const leadId = (lead.ID || '').toLowerCase();
      const phoneNorm = (lead.Phone || '').replace(/\D/g, '');
      const qNorm = q.replace(/\D/g, '');
      const matchesSearch =
        !q ||
        companyName.includes(q) ||
        city.includes(q) ||
        leadId.includes(q) ||
        (qNorm.length >= 3 && phoneNorm.includes(qNorm));

      const phoneStatus = lead['Phone Status'] || '';
      const matchesStatus =
        statusFilter === 'All' ||
        phoneStatus === statusFilter ||
        (showingWebsiteFixOnly && isWebsiteFixLead);

      const leadType = lead['Lead Type'] || '';
      const matchesType =
        leadTypeFilter === 'All' ||
        leadType === leadTypeFilter ||
        (leadTypeFilter === 'Other' && OTHER_CHANNELS.includes(leadType)) ||
        (showingWebsiteFixOnly && isWebsiteFixLead);

      const matchesServiceTag =
        serviceTagFilter === 'All' || isWebsiteFixLead;

      return matchesSearch && matchesStatus && matchesType && matchesServiceTag;
    });
  }, [leads, deferredSearchQuery, statusFilter, leadTypeFilter, serviceTagFilter]);

  const sortedLeads = useMemo(() => {
    const isTestKafe = (lead: LeadRecord) => (lead['Company Name'] || '').trim().includes('Test Kafe');
    return [...filteredLeads].sort((a, b) => {
      const aTest = isTestKafe(a);
      const bTest = isTestKafe(b);
      if (aTest && !bTest) return -1;
      if (!aTest && bTest) return 1;
      const tA = a.last_activity_at ? new Date(a.last_activity_at).getTime() : 0;
      const tB = b.last_activity_at ? new Date(b.last_activity_at).getTime() : 0;
      return tA - tB;
    });
  }, [filteredLeads]);

  const statuses = useMemo<StatusFilter[]>(() => {
    const uniqueStatuses = new Set<string>();
    leads.forEach((lead) => {
      const status = lead['Phone Status'];
      if (status) {
        uniqueStatuses.add(status);
      }
    });
    return ['All', ...Array.from(uniqueStatuses)];
  }, [leads]);

  useEffect(() => {
    setVisibleCount(10);
  }, [deferredSearchQuery, statusFilter, leadTypeFilter]);

  useEffect(() => {
    setSendCountdowns((prev) => {
      const next = { ...prev };
      const nextStatuses: Record<string, string> = {};
      leads.forEach((lead) => {
        const key = lead.ID || `${lead['Company Name']}-${lead.Phone}`;
        const status = lead['Phone Status'] || '';
        nextStatuses[key] = status;
        const previousStatus = previousStatusesRef.current[key];
        if (status === 'Requested' && previousStatus !== 'Requested') {
          next[key] = 5;
        }
        if (status !== 'Requested') {
          delete next[key];
        }
      });
      previousStatusesRef.current = nextStatuses;
      return next;
    });
  }, [leads]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSendCountdowns((prev) => {
        const updated: Record<string, number> = {};
        Object.entries(prev).forEach(([key, value]) => {
          if (value > 0) {
            updated[key] = value - 1;
          }
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pagedLeads = useMemo(() => {
    return sortedLeads.slice(0, visibleCount);
  }, [sortedLeads, visibleCount]);

  const handleWhatsAppStatusChange = (lead: LeadRecord, value: string) => {
    const updates: Partial<LeadRecord> = { 'WhatsApp Status': value };
    if (value === 'Number Not Found' || value === 'Numara Bulunamadı') {
      updates['Phone Status'] = 'Not Sent';
    }
    onUpdateLead(lead, updates);
  };

  const handlePhoneStatusChange = (lead: LeadRecord, value: string) => {
    onUpdateLead(lead, { 'Phone Status': value === PHONE_STATUS_EMPTY ? '' : value });
  };

  const phoneStatusValue = (raw: string | undefined) => (raw && raw.trim() ? raw : PHONE_STATUS_EMPTY);
  const phoneStatusLabel = (value: string) => {
    if (!value || value === PHONE_STATUS_EMPTY) return t('table.phoneEmpty');
    if (value === 'Not Sent') return t('table.phoneNotSent');
    if (value === 'Requested') return t('table.phoneRequested');
    if (value === 'Sent') return t('table.phoneSent');
    if (value === 'In Process') return t('table.phoneInProcess');
    if (value === 'Ready') return t('table.phoneReady');
    return value;
  };

  const handleWhatsAppClick = (event: React.MouseEvent<HTMLButtonElement>, lead: LeadRecord, messageOverride?: string) => {
    event.stopPropagation();
    const messageFlow = (lead['Message Flow'] || 'Single') as 'Single' | 'Two-step';
    const twoStepStep = (lead['Two-step Step'] || '') as '' | 'greeting_sent' | 'main_sent';
    const isSendingGreeting = messageFlow === 'Two-step' && twoStepStep !== 'greeting_sent';
    const mainMessage = messageOverride || lead['Ready Message'] || buildWhatsAppMessage(lead);
    const textToSend = isSendingGreeting
      ? TWO_STEP_GREETING
      : (messageFlow === 'Two-step' && (lead['Active Strategy'] || 'A') === 'A'
        ? STRATEGY_A_MAIN_MESSAGE
        : mainMessage);
    const stepUpdate = messageFlow === 'Two-step'
      ? (isSendingGreeting ? 'greeting_sent' : 'main_sent')
      : undefined;
    const phone = (lead.Phone || '').replace(/[\s\-\(\)]/g, '');
    if (phone) {
      const encoded = encodeURIComponent(textToSend);
      window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
    }
    onUpdateLead(lead, {
      'Phone Status': 'Requested',
      'Ready Message': textToSend,
      'WhatsApp Status': 'Pending',
      ...(stepUpdate && { 'Two-step Step': stepUpdate }),
    });
    fetch('/api/request_press_enter', { method: 'POST' }).catch(() => { });
    const key = lead.ID || `${lead['Company Name']}-${lead.Phone}`;
    setSendCountdowns((prev) => ({ ...prev, [key]: 5 }));
  };

  const handleResetStatuses = (event: React.MouseEvent<HTMLButtonElement>, lead: LeadRecord) => {
    event.stopPropagation();
    onUpdateLead(lead, { 'Phone Status': '', 'WhatsApp Status': '', 'Two-step Step': '' });
  };

  const lastOpenWhatsAppRef = useRef<{ key: string; at: number }>({ key: '', at: 0 });
  const OPEN_WHATSAPP_DEBOUNCE_MS = 5000;

  const handleOpenWhatsApp = (event: React.MouseEvent<HTMLButtonElement>, lead: LeadRecord) => {
    event.stopPropagation();
    const phone = (lead.Phone || '').replace(/[\s\-\(\)]/g, '');
    if (!phone) return;
    const key = lead.ID || `${lead['Company Name']}-${lead.Phone}`;
    const now = Date.now();
    if (lastOpenWhatsAppRef.current.key === key && now - lastOpenWhatsAppRef.current.at < OPEN_WHATSAPP_DEBOUNCE_MS) {
      return;
    }
    lastOpenWhatsAppRef.current = { key, at: now };
    onUpdateLead(lead, { 'WhatsApp Status': 'Pending' });
    window.open(`whatsapp://send?phone=${phone}`, '_blank');
  };

  const handleEditMessage = (event: React.MouseEvent<HTMLButtonElement>, lead: LeadRecord) => {
    event.stopPropagation();
    const initialMessage = lead['Ready Message'] || buildWhatsAppMessage(lead);
    setEditingLead(lead);
    setDraftMessage(initialMessage);
    setSelectedStrategy((lead['Active Strategy'] as 'A' | 'B' | 'C' | 'D') || 'A');
    setIsEditorOpen(true);
  };

  const handleGenerateMessage = async () => {
    if (!editingLead || isGenerating) {
      return;
    }
    setIsGenerating(true);
    setRegenerateError('');
    try {
      const response = await fetch('/api/regenerate_message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cafeName: editingLead['Company Name'],
          city: editingLead.City,
          review: editingLead['Last Review'],
          strategy: selectedStrategy,
          leadId: editingLead.ID,
          phone: editingLead.Phone,
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || t('table.messageError'));
      }
      const data = await response.json();
      const generated = data.message || '';
      if (generated) {
        setDraftMessage(generated);
        onUpdateLead(editingLead, {
          'Ready Message': generated,
          'Active Strategy': selectedStrategy,
        });
      }
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Mesaj oluşturulamadı. OPENAI_API_KEY ayarlı mı kontrol edin.';
      setRegenerateError(message);
      const fallback = buildWhatsAppMessage({
        ...editingLead,
        'Ready Message': '',
      });
      setDraftMessage(fallback);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDraftChange = (value: string) => {
    setDraftMessage(value);
    if (editingLead) {
      onUpdateLead(editingLead, { 'Ready Message': value });
    }
  };

  const handleRegenerateMessage = async () => {
    if (!editingLead || isRegenerating) {
      return;
    }
    setIsRegenerating(true);
    setRegenerateError('');
    try {
      const response = await fetch('/api/regenerate_message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cafeName: editingLead['Company Name'],
          city: editingLead.City,
          review: editingLead['Last Review'],
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Regeneration failed');
      }
      const data = await response.json();
      const regenerated = data.message || '';
      if (regenerated) {
        setDraftMessage(regenerated);
        onUpdateLead(editingLead, { 'Ready Message': regenerated });
      }
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : t('table.messageRegenError');
      setRegenerateError(message);
      const fallback = buildWhatsAppMessage({
        ...editingLead,
        'Ready Message': '',
      });
      setDraftMessage(fallback);
      onUpdateLead(editingLead, { 'Ready Message': fallback });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleStrategyChange = (event: React.MouseEvent<HTMLButtonElement>, lead: LeadRecord, strategy: 'A' | 'B' | 'C' | 'D') => {
    event.stopPropagation();
    onUpdateLead(lead, { 'request_strategy_change': strategy, selected_strategy: strategy, 'Active Strategy': strategy });
  };

  return (
    <div className="chart-container animate-slide-up delay-200" style={{ animationFillMode: 'forwards', opacity: 0 }}>
      <div className="flex flex-nowrap items-center gap-2 mb-4 shrink-0">
        <div className="relative w-40 shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder={t('table.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-sm bg-background border-border"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 shrink-0 gap-1.5 text-xs">
              <Filter className="h-3.5 w-3.5" />
              {statusFilter}
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {statuses.map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center gap-1 border-l border-border pl-2 shrink-0">
          <button
            type="button"
            onClick={() => setLeadTypeFilter('All')}
            className={cn(
              'px-2 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap',
              leadTypeFilter === 'All' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setLeadTypeFilter('WhatsApp')}
            className={cn(
              'px-2 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap',
              leadTypeFilter === 'WhatsApp' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            WhatsApp
          </button>
          <button
            type="button"
            onClick={() => setLeadTypeFilter('Call Only')}
            className={cn(
              'px-2 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap',
              leadTypeFilter === 'Call Only' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t('table.call')}
          </button>
          <button
            type="button"
            onClick={() => setLeadTypeFilter('Other')}
            className={cn(
              'px-2 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap',
              leadTypeFilter === 'Other' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
            title="Email / Instagram / Web"
          >
            Other
          </button>
          <button
            type="button"
            onClick={() => setServiceTagFilter(serviceTagFilter === 'Web sitesi düzeltilecek' ? 'All' : 'Web sitesi düzeltilecek')}
            className={cn(
              'px-2 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap',
              serviceTagFilter === 'Web sitesi düzeltilecek' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
            title="Sadece web sitesi düzeltilecek olanlar"
          >
            {lang === 'tr' ? 'Web sitesi düzeltilecek' : 'Website fix'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar -mx-1">
        <table className="lead-table w-full text-sm">
          <thead>
            <tr className="border-b border-border/80">
              <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Business</th>
              <th className="text-left py-2.5 px-2 font-medium text-muted-foreground">Status</th>
              <th className="text-left py-2.5 px-2 font-medium text-muted-foreground">WA (Answer)</th>
              <th className="text-right py-2.5 px-3 font-medium text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {pagedLeads.map((lead) => {
              // Auto-set WhatsApp Status to 'Pending' if Phone Status is 'Sent'
              const phoneStatus = lead['Phone Status'] || '';
              let waStatus = lead['WhatsApp Status'] || 'Not Sent';

              if (phoneStatus === 'Sent' && (waStatus === 'Not Sent' || !waStatus)) {
                waStatus = 'Pending';
                // Update the lead silently
                if (lead['WhatsApp Status'] !== 'Pending') {
                  setTimeout(() => onUpdateLead(lead, { 'WhatsApp Status': 'Pending' }), 0);
                }
              }

              const isNumberNotFound =
                waStatus === 'Number Not Found' || waStatus === 'Numara Bulunamadı';
              const rowStyle = isNumberNotFound
                ? "opacity-70 bg-red-500/8 dark:bg-red-950/15 text-red-800/70 dark:text-red-300/60"
                : waStatus === 'Pending'
                  ? "bg-orange-400/12 dark:bg-orange-950/20 text-orange-900/85 dark:text-orange-200/75"
                  : waStatus === 'Accepted'
                    ? "bg-emerald-500/8 dark:bg-emerald-950/15 text-emerald-800/80 dark:text-emerald-300/70"
                    : waStatus === 'Rejected'
                      ? "bg-red-500/12 dark:bg-red-950/25 text-red-800/80 dark:text-red-200/70"
                      : waStatus === 'Interested'
                        ? "bg-indigo-500/10 dark:bg-indigo-950/25 text-indigo-900/85 dark:text-indigo-200/80 border-l-2 border-indigo-500"
                        : "";
              const nameStyle = isNumberNotFound
                ? "text-red-700/70 dark:text-red-400/60"
                : waStatus === 'Pending'
                  ? "text-orange-800/90 dark:text-orange-200/80 font-medium"
                  : waStatus === 'Interested'
                    ? "text-indigo-800/90 dark:text-indigo-200/90 font-bold"
                    : waStatus === 'Accepted'
                      ? "text-emerald-700/80 dark:text-emerald-300/70"
                      : waStatus === 'Rejected'
                        ? "text-red-800/85 dark:text-red-200/80 font-medium"
                        : "text-foreground";

              // Email Requested row highlight
              const isEmailRequested = waStatus === 'Email Requested';

              return (
                <tr
                  key={lead.ID || `${lead['Company Name']}-${lead.Phone}`}
                  onClick={() => onSelectLead(lead)}
                  className={cn(
                    "group border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer",
                    selectedLead?.ID === lead.ID && "bg-muted/50",
                    lead['Phone Status'] === 'Sent' && !rowStyle && !isEmailRequested && "bg-emerald-500/5 dark:bg-emerald-950/10",
                    isEmailRequested && "bg-purple-500/10 dark:bg-purple-950/20 border-purple-500/20",
                    rowStyle
                  )}
                >
                  <td className="py-2 px-3">
                    <span className={cn("font-medium", nameStyle)}>
                      {lead['Company Name'] || '–'}
                    </span>
                    {(() => {
                      const key = getLeadKey(lead);
                      const added = firstSeenMap[key];
                      const isNew = added && (Date.now() - new Date(added).getTime() < NEW_BADGE_MS);
                      const isWebFix = (lead['Service Tag'] || '') === 'Web sitesi düzeltilecek';
                      return (
                        <>
                          {isNew && (
                            <span className="ml-1.5 inline-flex items-center rounded bg-primary/12 text-primary px-1.5 py-0.5 text-[10px] font-medium" title={t('table.new')}>
                              {t('table.new')}
                            </span>
                          )}
                          {isWebFix && (
                            <span className="ml-1.5 inline-flex items-center rounded bg-purple-500/15 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 text-[10px] font-medium" title="Web Sitesi Düzeltilecek">
                              Web Fix
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </td>
                  <td className="py-2 px-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <Select
                        value={phoneStatusValue(lead['Phone Status'])}
                        onValueChange={(value) => handlePhoneStatusChange(lead, value)}
                      >
                        <SelectTrigger className="h-6 min-w-0 w-[82px] text-[11px] py-0 px-2 border-border/80 [&>span]:truncate">
                          <SelectValue>{phoneStatusLabel(phoneStatusValue(lead['Phone Status']))}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {PHONE_STATUSES.map((status) => (
                            <SelectItem key={status} value={status} className="text-xs">
                              {phoneStatusLabel(status)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {lead['Phone Status'] === 'Requested' && (
                        <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                          {sendCountdowns[lead.ID || `${lead['Company Name']}-${lead.Phone}`] ?? 0}s
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-2" onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={lead['WhatsApp Status'] || 'Not Sent'}
                      onValueChange={(value) => handleWhatsAppStatusChange(lead, value)}
                    >
                      <SelectTrigger className="h-6 min-w-0 w-[88px] text-[11px] py-0 px-2 border-border/80 [&>span]:truncate">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WHATSAPP_STATUSES.map((status) => (
                          <SelectItem key={status} value={status} className="text-xs">
                            {t(`waStatus.${status}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-2 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            title={t('table.more')}
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(event) => handleEditMessage(event as any, lead)}>
                            <Pencil className="h-3.5 w-3.5 mr-2" /> {t('table.edit')}
                          </DropdownMenuItem>
                          {lead['Lead Type'] !== 'Call Only' && (
                            <DropdownMenuItem onClick={(event) => handleOpenWhatsApp(event as any, lead)}>
                              <MessageCircle className="h-3.5 w-3.5 mr-2" /> WhatsApp Aç
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={(event) => handleResetStatuses(event as any, lead)}>
                            <RotateCcw className="h-3.5 w-3.5 mr-2" /> {t('table.reset')}
                          </DropdownMenuItem>
                          {onDeleteLead && (
                            <DropdownMenuItem
                              onClick={(e) => { e.stopPropagation(); setLeadToDelete(lead); }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> {t('table.delete')}
                            </DropdownMenuItem>
                          )}
                          {lead['Lead Type'] !== 'Call Only' && (
                            <>
                              <DropdownMenuItem onClick={(event) => handleStrategyChange(event as any, lead, 'A')} className={lead['Active Strategy'] === 'A' ? 'bg-muted' : ''}>
                                {t('table.strategyA')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(event) => handleStrategyChange(event as any, lead, 'B')} className={lead['Active Strategy'] === 'B' ? 'bg-muted' : ''}>
                                {t('table.strategyB')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(event) => handleStrategyChange(event as any, lead, 'C')} className={lead['Active Strategy'] === 'C' ? 'bg-muted' : ''}>
                                {t('table.strategyC')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(event) => handleStrategyChange(event as any, lead, 'D')} className={lead['Active Strategy'] === 'D' ? 'bg-muted' : ''}>
                                {t('table.strategyD')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(event) => handleStrategyChange(event as any, lead, 'E')} className={lead['Active Strategy'] === 'E' ? 'bg-muted' : ''}>
                                {t('table.strategyE')}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {lead['Lead Type'] === 'Call Only' ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(event) => handleOpenWhatsApp(event, lead)}
                          className="h-7 px-2 text-emerald-600 hover:text-emerald-500 hover:bg-emerald-500/10"
                          title={t('table.call')}
                        >
                          <PhoneCall className="h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          onClick={(event) => handleWhatsAppClick(event, lead)}
                          className="h-7 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 gap-1 text-xs"
                          title={t('table.send')}
                        >
                          <Send className="h-3.5 w-3.5" />
                          {t('table.send')}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredLeads.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No matching leads
          </div>
        )}

        {(filteredLeads.length > pagedLeads.length || visibleCount > 10) && (
          <div className="py-4 flex justify-center gap-2">
            {visibleCount > 10 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setVisibleCount((count) => Math.max(10, count - 10))}>
                {t('table.showLess')}
              </Button>
            )}
            {filteredLeads.length > pagedLeads.length && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setVisibleCount((count) => count + 10)}>
                +10 ({pagedLeads.length}/{filteredLeads.length})
              </Button>
            )}
          </div>
        )}
      </div>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('table.editMessage')} {editingLead?.['Company Name'] ? `- ${editingLead['Company Name']}` : ''}
            </DialogTitle>
            <DialogDescription>
              {t('table.editMessageDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Business Name</Label>
                <Input
                  value={editingLead?.['Company Name'] || ''}
                  onChange={(e) => {
                    if (editingLead) {
                      const updated = { ...editingLead, 'Company Name': e.target.value };
                      setEditingLead(updated);
                      onUpdateLead(editingLead, { 'Company Name': e.target.value });
                    }
                  }}
                  className="h-9 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Phone</Label>
                  <Input
                    value={editingLead?.Phone || ''}
                    onChange={(e) => {
                      if (editingLead) {
                        const updated = { ...editingLead, Phone: e.target.value };
                        setEditingLead(updated);
                        onUpdateLead(editingLead, { Phone: e.target.value });
                      }
                    }}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">City</Label>
                  <Input
                    value={editingLead?.City || ''}
                    onChange={(e) => {
                      if (editingLead) {
                        const updated = { ...editingLead, City: e.target.value };
                        setEditingLead(updated);
                        onUpdateLead(editingLead, { City: e.target.value });
                      }
                    }}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t pt-4">
              <Label className="text-sm font-medium">{t('table.messageFlow')}</Label>
              <Select
                value={(editingLead?.['Message Flow'] as string) || 'Single'}
                onValueChange={(v) => {
                  if (!editingLead) return;
                  const flow = v as 'Single' | 'Two-step';
                  const updates: Partial<LeadRecord> = { 'Message Flow': flow };

                  if (flow === 'Single') {
                    const template = getStrategyTemplate(editingLead, selectedStrategy);
                    setDraftMessage(template);
                    updates['Ready Message'] = template;
                  }

                  const updatedLead = { ...editingLead, ...updates };
                  setEditingLead(updatedLead);
                  onUpdateLead(editingLead, updates);
                }}
              >
                <SelectTrigger className="w-full text-sm h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Single">{t('table.singleMessage')}</SelectItem>
                  <SelectItem value="Two-step">{t('table.twoStepGreetingFirst')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">{t('table.selectStrategy')}</Label>
              <RadioGroup
                value={selectedStrategy}
                onValueChange={(value) => {
                  const s = value as 'A' | 'B' | 'C' | 'D';
                  setSelectedStrategy(s);
                  if (editingLead) {
                    const template = getStrategyTemplate(editingLead, s);
                    setDraftMessage(template);
                    const updates = { 'Active Strategy': s, 'Ready Message': template };
                    setEditingLead({ ...editingLead, ...updates });
                    onUpdateLead(editingLead, updates);
                  }
                }}
                className="grid grid-cols-1 gap-2"
              >
                <div className="flex items-center space-x-2 p-2.5 border rounded-md hover:bg-muted/50">
                  <RadioGroupItem value="A" id="strategy-a" />
                  <Label htmlFor="strategy-a" className="flex-1 cursor-pointer">
                    <div className="font-semibold text-xs">{t('table.strategyALabel')}</div>
                    <div className="text-[10px] text-muted-foreground line-clamp-1">{t('table.strategyADesc')}</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-2.5 border rounded-md hover:bg-muted/50">
                  <RadioGroupItem value="C" id="strategy-c" />
                  <Label htmlFor="strategy-c" className="flex-1 cursor-pointer">
                    <div className="font-semibold text-xs">{t('table.strategyCLabel')}</div>
                    <div className="text-[10px] text-muted-foreground line-clamp-1">{t('table.strategyCDesc')}</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-2.5 border rounded-md hover:bg-muted/50">
                  <RadioGroupItem value="D" id="strategy-d" />
                  <Label htmlFor="strategy-d" className="flex-1 cursor-pointer">
                    <div className="font-semibold text-xs">{t('table.strategyDLabel')}</div>
                    <div className="text-[10px] text-muted-foreground line-clamp-1">{t('table.strategyDDesc')}</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Message Preview</Label>
              <Textarea
                value={draftMessage}
                onChange={(event) => handleDraftChange(event.target.value)}
                className="min-h-[140px] text-sm"
                placeholder={t('table.messagePlaceholder')}
              />
            </div>

            {regenerateError && (
              <div className="text-xs text-destructive">
                {regenerateError}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t">
            <Button
              variant="default"
              size="sm"
              onClick={handleGenerateMessage}
              disabled={isGenerating || !editingLead}
              className="gap-2 h-9"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {isGenerating ? 'Creating...' : 'Create Message'}
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={() => setIsEditorOpen(false)}
              >
                {t('table.close')}
              </Button>
              {editingLead && (
                <Button
                  type="button"
                  size="sm"
                  onClick={(event) => {
                    handleWhatsAppClick(event as React.MouseEvent<HTMLButtonElement>, editingLead, draftMessage);
                    setIsEditorOpen(false);
                  }}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2 h-9"
                  disabled={!draftMessage.trim()}
                >
                  <Send className="h-3.5 w-3.5" />
                  {t('table.send')}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!leadToDelete} onOpenChange={(open) => !open && setLeadToDelete(null)}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('table.delete')}</AlertDialogTitle>
            <AlertDialogDescription>{t('table.deleteConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{lang === 'tr' ? 'İptal' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (leadToDelete) {
                  onDeleteLead?.(leadToDelete);
                  setLeadToDelete(null);
                }
              }}
            >
              {t('table.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
}
