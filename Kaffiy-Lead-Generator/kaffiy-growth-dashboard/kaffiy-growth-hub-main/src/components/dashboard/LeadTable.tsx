import { useEffect, useMemo, useState, useDeferredValue, useRef } from 'react';
import { Search, Filter, ChevronDown, Pencil, Send, RotateCcw, MessageCircle, PhoneCall, Sparkles } from 'lucide-react';
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
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';
import { LeadRecord } from '@/types/leads';

interface LeadTableProps {
  leads: LeadRecord[];
  onSelectLead: (lead: LeadRecord) => void;
  selectedLead: LeadRecord | null;
  onUpdateLead: (lead: LeadRecord, updates: Partial<LeadRecord>) => void;
}

type StatusFilter = 'All' | string;

const WHATSAPP_STATUSES = ['Not Sent', 'Accepted', 'Rejected', 'Demo Scheduled', 'Pending'] as const;

const buildWhatsAppMessage = (lead: LeadRecord) => {
  if (lead['Ready Message']) {
    return lead['Ready Message'];
  }
  if (lead['AI Message']) {
    return lead['AI Message'];
  }
  const companyName = lead['Company Name'] || 'Kafe';
  const review = (lead['Last Review'] || '').replace(/["']/g, '');
  if (review) {
    return `Merhaba ${companyName}! Yorumunuzda bahsettiğiniz ${review} detayı çok hoşuma gitti. Kaffiy dijital sadakat sistemiyle misafirlerinize kolayca ödül sunmanıza yardımcı olabiliriz.`;
  }
  return `Merhaba ${companyName}! Kaffiy dijital sadakat sistemiyle misafirlerinize kolayca ödül sunmanıza yardımcı olabiliriz.`;
};

export function LeadTable({ leads, onSelectLead, selectedLead, onUpdateLead }: LeadTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<LeadRecord | null>(null);
  const [draftMessage, setDraftMessage] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState<'A' | 'B' | 'C'>('A');
  const [isGenerating, setIsGenerating] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [sendCountdowns, setSendCountdowns] = useState<Record<string, number>>({});
  const previousStatusesRef = useRef<Record<string, string>>({});
  const [leadTypeFilter, setLeadTypeFilter] = useState<'All' | 'WhatsApp' | 'Call Only'>('All');

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const companyName = (lead['Company Name'] || '').toLowerCase();
      const city = (lead.City || '').toLowerCase();
      const leadId = (lead.ID || '').toLowerCase();
      const matchesSearch = 
        companyName.includes(deferredSearchQuery.toLowerCase()) ||
        city.includes(deferredSearchQuery.toLowerCase()) ||
        leadId.includes(deferredSearchQuery.toLowerCase());
      
      const phoneStatus = lead['Phone Status'] || '';
      const matchesStatus = statusFilter === 'All' || phoneStatus === statusFilter;
      const leadType = lead['Lead Type'] || '';
      const matchesType = leadTypeFilter === 'All' || leadType === leadTypeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [leads, deferredSearchQuery, statusFilter, leadTypeFilter]);

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
          next[key] = 8;
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
    return filteredLeads.slice(0, visibleCount);
  }, [filteredLeads, visibleCount]);

  const handleWhatsAppStatusChange = (lead: LeadRecord, value: string) => {
    onUpdateLead(lead, { 'WhatsApp Status': value });
  };

  const handleWhatsAppClick = (event: React.MouseEvent<HTMLButtonElement>, lead: LeadRecord, messageOverride?: string) => {
    event.stopPropagation();
    const message = messageOverride || buildWhatsAppMessage(lead);
    onUpdateLead(lead, { 'Phone Status': 'Requested', 'Ready Message': message });
    const key = lead.ID || `${lead['Company Name']}-${lead.Phone}`;
    setSendCountdowns((prev) => ({ ...prev, [key]: 8 }));
  };

  const handleResetStatuses = (event: React.MouseEvent<HTMLButtonElement>, lead: LeadRecord) => {
    event.stopPropagation();
    onUpdateLead(lead, { 'Phone Status': '', 'WhatsApp Status': '' });
  };

  const handleOpenWhatsApp = (event: React.MouseEvent<HTMLButtonElement>, lead: LeadRecord) => {
    event.stopPropagation();
    const phone = (lead.Phone || '').replace(/[\s\-\(\)]/g, '');
    if (!phone) {
      return;
    }
    window.open(`whatsapp://send?phone=${phone}`, '_blank');
  };

  const handleEditMessage = (event: React.MouseEvent<HTMLButtonElement>, lead: LeadRecord) => {
    event.stopPropagation();
    const initialMessage = lead['Ready Message'] || buildWhatsAppMessage(lead);
    setEditingLead(lead);
    setDraftMessage(initialMessage);
    setSelectedStrategy((lead['Active Strategy'] as 'A' | 'B' | 'C') || 'A');
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
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Mesaj oluşturulamadı');
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
          : 'Mesaj yeniden yazılamadı. OPENAI_API_KEY ayarlı mı kontrol edin.';
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

  const handleStrategyChange = (event: React.MouseEvent<HTMLButtonElement>, lead: LeadRecord, strategy: 'A' | 'B' | 'C') => {
    event.stopPropagation();
    onUpdateLead(lead, { 'request_strategy_change': strategy });
  };

  return (
    <div className="chart-container animate-slide-up delay-200" style={{ animationFillMode: 'forwards', opacity: 0 }}>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by cafe name, city, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {statusFilter}
                <ChevronDown className="h-4 w-4" />
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
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={leadTypeFilter === 'All' ? 'default' : 'outline'}
            onClick={() => setLeadTypeFilter('All')}
            className="h-8"
          >
            Tümü
          </Button>
          <Button
            variant={leadTypeFilter === 'WhatsApp' ? 'default' : 'outline'}
            onClick={() => setLeadTypeFilter('WhatsApp')}
            className="h-8"
          >
            WhatsApp Leads
          </Button>
          <Button
            variant={leadTypeFilter === 'Call Only' ? 'default' : 'outline'}
            onClick={() => setLeadTypeFilter('Call Only')}
            className="h-8"
          >
            Manuel Arama Listesi
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="lead-table">
          <thead>
            <tr>
              <th>Company Name</th>
              <th>City</th>
              <th>Phone Status</th>
              <th>WhatsApp Status</th>
              <th className="text-center">Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {pagedLeads.map((lead) => (
              <tr 
                key={lead.ID || `${lead['Company Name']}-${lead.Phone}`}
                onClick={() => onSelectLead(lead)}
                className={cn(
                  selectedLead?.ID === lead.ID && "selected",
                  lead['Phone Status'] === 'Sent' && "bg-cyber-lime/10 hover:bg-cyber-lime/15"
                )}
              >
                <td className="font-medium text-foreground">{lead['Company Name'] || '-'}</td>
                <td>{lead.City || '-'}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={lead['Phone Status'] || 'Pending'} />
                    {lead['Phone Status'] === 'Requested' && (
                      <div
                        className="relative h-7 w-7"
                        title="Gönderim için bekleniyor"
                        style={{
                          background: `conic-gradient(hsl(var(--cyber-lime)) ${(sendCountdowns[lead.ID || `${lead['Company Name']}-${lead.Phone}`] ?? 0) / 8 * 360}deg, hsl(var(--border)) 0deg)`,
                          borderRadius: '9999px',
                        }}
                      >
                        <div className="absolute inset-0 m-[3px] rounded-full bg-background" />
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground">
                          {sendCountdowns[lead.ID || `${lead['Company Name']}-${lead.Phone}`] ?? 0}
                        </span>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <Select
                    value={lead['WhatsApp Status'] || 'Not Sent'}
                    onValueChange={(value) => handleWhatsAppStatusChange(lead, value)}
                  >
                    <SelectTrigger className="h-9 w-[170px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WHATSAPP_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="text-center">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(event) => handleEditMessage(event, lead)}
                      className="text-muted-foreground hover:text-foreground"
                      title="Mesajı Düzenle"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {lead['Lead Type'] === 'Call Only' ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(event) => handleOpenWhatsApp(event, lead)}
                        className="text-emerald-500 hover:text-emerald-400"
                        title="Telefonu Ara"
                      >
                        <PhoneCall className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(event) => handleOpenWhatsApp(event, lead)}
                        className="text-emerald-500 hover:text-emerald-400"
                        title="WhatsApp'ı Aç"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(event) => handleResetStatuses(event, lead)}
                      className="text-muted-foreground hover:text-foreground"
                      title="Statüleri Sıfırla"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    {lead['Lead Type'] !== 'Call Only' && (
                      <>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-xs font-semibold"
                              title="Strateji Değiştir"
                            >
                              <Sparkles className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(event) => handleStrategyChange(event as any, lead, 'A')}
                              className={lead['Active Strategy'] === 'A' ? 'bg-muted' : ''}
                            >
                              <span className="font-semibold mr-2">A:</span>
                              <span className="text-xs text-muted-foreground">Girişimci (Varsayılan)</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(event) => handleStrategyChange(event as any, lead, 'B')}
                              className={lead['Active Strategy'] === 'B' ? 'bg-muted' : ''}
                            >
                              <span className="font-semibold mr-2">B:</span>
                              <span className="text-xs text-muted-foreground">Komşu (Yerel/Samimi)</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(event) => handleStrategyChange(event as any, lead, 'C')}
                              className={lead['Active Strategy'] === 'C' ? 'bg-muted' : ''}
                            >
                              <span className="font-semibold mr-2">C:</span>
                              <span className="text-xs text-muted-foreground">Fırsat (Net Fayda)</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          onClick={(event) => handleWhatsAppClick(event, lead)}
                          className="h-8 bg-emerald-500 hover:bg-emerald-600 text-white px-3 gap-1"
                          title="WhatsApp'a Gönder"
                        >
                          <Send className="h-4 w-4" />
                          Gönder
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLeads.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No leads found matching your criteria
          </div>
        )}

        {(filteredLeads.length > pagedLeads.length || visibleCount > 10) && (
          <div className="py-6 flex justify-center gap-3">
            {visibleCount > 10 && (
              <Button
                variant="outline"
                onClick={() => setVisibleCount((count) => Math.max(10, count - 10))}
              >
                Daha az yükle
              </Button>
            )}
            {filteredLeads.length > pagedLeads.length && (
              <Button
                variant="outline"
                onClick={() => setVisibleCount((count) => count + 10)}
              >
                Daha fazla yükle ({pagedLeads.length}/{filteredLeads.length})
              </Button>
            )}
          </div>
        )}
      </div>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Mesajı Düzenle {editingLead?.['Company Name'] ? `- ${editingLead['Company Name']}` : ''}
            </DialogTitle>
            <DialogDescription>
              Strateji seçip mesaj oluştur, beğenmezsen tekrar oluştur, sonra gönder.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Strateji Seç</Label>
              <RadioGroup
                value={selectedStrategy}
                onValueChange={(value) => setSelectedStrategy(value as 'A' | 'B' | 'C')}
                className="flex flex-col gap-3"
              >
                <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted/50">
                  <RadioGroupItem value="A" id="strategy-a" />
                  <Label htmlFor="strategy-a" className="flex-1 cursor-pointer">
                    <div className="font-semibold">A: Fikir Alma / Beta Testi (Varsayılan)</div>
                    <div className="text-xs text-muted-foreground">En az reddedilen yöntem. Bir şey satmıyorsun, sadece onlardan 'akıl hocası' olmalarını istiyorsun.</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted/50">
                  <RadioGroupItem value="B" id="strategy-b" />
                  <Label htmlFor="strategy-b" className="flex-1 cursor-pointer">
                    <div className="font-semibold">B: Komşu Yaklaşımı (Yerel/Samimi)</div>
                    <div className="text-xs text-muted-foreground">Bölgesel güven. 'Dışarıdan biri' değil, 'Bizden biri' imajı verirsin.</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted/50">
                  <RadioGroupItem value="C" id="strategy-c" />
                  <Label htmlFor="strategy-c" className="flex-1 cursor-pointer">
                    <div className="font-semibold">C: Doğrudan Fayda (Net Fayda)</div>
                    <div className="text-xs text-muted-foreground">Hiç dolandırmadan, direkt acıya dokunmak. Açık sözlü yaklaşım.</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <Textarea
              value={draftMessage}
              onChange={(event) => handleDraftChange(event.target.value)}
              className="min-h-[180px]"
              placeholder="Mesajınızı buradan düzenleyin veya 'Mesaj Oluştur' butonuna basın..."
            />
            {regenerateError && (
              <div className="text-xs text-destructive">
                {regenerateError}
              </div>
            )}
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="default"
                onClick={handleGenerateMessage}
                disabled={isGenerating || !editingLead}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {isGenerating ? 'Oluşturuluyor...' : 'Mesaj Oluştur'}
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditorOpen(false)}
                >
                  Kapat
                </Button>
                {editingLead && (
                  <Button
                    onClick={(event) => {
                      handleWhatsAppClick(event as React.MouseEvent<HTMLButtonElement>, editingLead, draftMessage);
                      setIsEditorOpen(false);
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
                    disabled={!draftMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                    Gönder
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
