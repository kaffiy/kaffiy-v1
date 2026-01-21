import { useCallback, useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/dashboard/Header';
import { LeadTable } from '@/components/dashboard/LeadTable';
import { AIMessagePanel } from '@/components/dashboard/AIMessagePanel';
import { CityChart } from '@/components/dashboard/CityChart';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { LeadRecord } from '@/types/leads';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [dataState, setDataState] = useState<'loading' | 'ready' | 'empty'>('loading');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isBotRunning, setIsBotRunning] = useState(false);
  const { toast } = useToast();

  const loadLeads = useCallback(async () => {
    setDataState('loading');
    try {
      const dataUrl = new URL('../data/leads_data.json', import.meta.url);
      dataUrl.searchParams.set('t', Date.now().toString());
      const response = await fetch(dataUrl.toString());
      if (!response.ok) {
        throw new Error('Data not available');
      }
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setLeads(data);
        setDataState('ready');
      } else {
        setLeads([]);
        setDataState('empty');
      }
    } catch {
      const cached = localStorage.getItem('leads_data');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLeads(parsed);
            setDataState('ready');
            return;
          }
        } catch {
          // ignore cache parse errors
        }
      }
      setLeads([]);
      setDataState('empty');
    }
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const response = await fetch(new URL('../data/settings.json', import.meta.url));
      if (!response.ok) {
        throw new Error('Settings not available');
      }
      const data = await response.json();
      setIsBotRunning(Boolean(data?.is_bot_running));
    } catch {
      setIsBotRunning(false);
    }
  }, []);

  useEffect(() => {
    loadLeads();
    loadSettings();
  }, [loadLeads]);

  const persistSettings = async (nextValue: boolean) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_bot_running: nextValue }, null, 2),
      });
      if (!response.ok) {
        throw new Error('Save failed');
      }
    } catch {
      localStorage.setItem('settings', JSON.stringify({ is_bot_running: nextValue }));
    }
  };

  const handleToggleBot = async (nextValue: boolean) => {
    setIsBotRunning(nextValue);
    await persistSettings(nextValue);
  };

  const persistLeads = async (nextLeads: LeadRecord[]) => {
    try {
      const response = await fetch('/api/leads_data', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nextLeads, null, 2),
      });
      if (!response.ok) {
        throw new Error('Save failed');
      }
      setSaveError(null);
    } catch {
      localStorage.setItem('leads_data', JSON.stringify(nextLeads));
      setSaveError('Dosyaya yazılamadı. Bot değişikliği göremeyebilir.');
    }
  };

  const handleUpdateLead = (lead: LeadRecord, updates: Partial<LeadRecord>) => {
    setLeads((prev) => {
      const next = prev.map((item) => {
        const isMatch =
          (item.ID && item.ID === lead.ID) ||
          (!item.ID && item['Company Name'] === lead['Company Name'] && item.Phone === lead.Phone);
        return isMatch ? { ...item, ...updates } : item;
      });
      persistLeads(next);
      return next;
    });
    if (updates['Phone Status'] === 'Send Requested') {
      toast({
        title: 'Gönderim kuyruğa alındı',
        description: 'Bot çalışıyorsa WhatsApp otomatik açılacaktır.',
      });
    }
  };

  const stats = useMemo(() => {
    const totalLeads = leads.length;
    const messagesSent = leads.filter((lead) => lead['Phone Status'] === 'Sent').length;
    const accepted = leads.filter((lead) => lead['WhatsApp Status'] === 'Accepted').length;
    const conversionRate = messagesSent > 0 ? Math.round((accepted / messagesSent) * 100) : 0;
    return { totalLeads, messagesSent, accepted, conversionRate };
  }, [leads]);

  const cityData = useMemo(() => {
    const counts = new Map<string, number>();
    leads.forEach((lead) => {
      const city = lead.City || 'Unknown';
      counts.set(city, (counts.get(city) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([city, count]) => ({ city, leads: count }));
  }, [leads]);

  return (
    <div className="min-h-screen bg-background">
      <Header
        stats={stats}
        onRefresh={loadLeads}
        isBotRunning={isBotRunning}
        onToggleBot={handleToggleBot}
      />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Lead Management</h2>
          <p className="text-muted-foreground mt-1">
            AI-powered cafe outreach and personalized messaging
          </p>
        </div>
        {dataState !== 'ready' && (
          <div className="mb-6 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            Veri bekleniyor...
          </div>
        )}
        {saveError && (
          <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {saveError}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Lead Table - Takes 2 columns on xl */}
          <div className="xl:col-span-2">
            <LeadTable 
              leads={leads} 
              onSelectLead={setSelectedLead}
              selectedLead={selectedLead}
              onUpdateLead={handleUpdateLead}
            />
          </div>

          {/* Right Sidebar - Charts & Activity */}
          <div className="space-y-6">
            <CityChart data={cityData} />
            <ActivityFeed activities={[]} />
          </div>
        </div>
      </main>

      {/* AI Message Side Panel */}
      {selectedLead && (
        <AIMessagePanel 
          lead={selectedLead} 
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
};

export default Index;
