import { useCallback, useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/dashboard/Header';
import { AILearningCenter } from '@/components/dashboard/AILearningCenter';
import { LeadTable } from '@/components/dashboard/LeadTable';
import { AIMessagePanel } from '@/components/dashboard/AIMessagePanel';
import { CityChart } from '@/components/dashboard/CityChart';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { ScraperSection } from '@/components/dashboard/ScraperSection';
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
import { LeadRecord } from '@/types/leads';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';

const getLeadKey = (lead: LeadRecord) => lead.ID || `${lead['Company Name'] ?? ''}-${lead.Phone ?? ''}`;

const Index = () => {
  const { t, lang } = useLanguage();
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [firstSeenMap, setFirstSeenMap] = useState<Record<string, string>>(() => {
    try {
      if (typeof localStorage !== 'undefined' && !localStorage.getItem('leads_first_seen_v3_reset')) {
        localStorage.removeItem('leads_first_seen');
        localStorage.removeItem('leads_first_seen_v2_reset');
        localStorage.setItem('leads_first_seen_v3_reset', '1');
      }
      return JSON.parse(localStorage.getItem('leads_first_seen') || '{}');
    } catch {
      return {};
    }
  });
  const [dataState, setDataState] = useState<'loading' | 'ready' | 'empty'>('loading');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [settings, setSettings] = useState<{ is_bot_running: boolean; autonomous_mode: boolean; test_mode: boolean; test_phone: string; rate_limit_sec: number; inbound_enabled: boolean; outbound_enabled: boolean; security_lock: boolean; daily_limit: number; message_delay_minutes: number; manual_approval: boolean }>({
    is_bot_running: false,
    autonomous_mode: false,
    test_mode: false,
    test_phone: '',
    rate_limit_sec: 60,
    inbound_enabled: true,
    outbound_enabled: true,
    security_lock: true,
    daily_limit: 5,
    message_delay_minutes: 30,
    manual_approval: true,
  });
  const [successTimelineCleared, setSuccessTimelineCleared] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showAILearningCenter, setShowAILearningCenter] = useState(false);
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
      const u = new URL('../data/settings.json', import.meta.url);
      u.searchParams.set('t', Date.now().toString());
      const response = await fetch(u.toString());
      if (!response.ok) {
        throw new Error('Settings not available');
      }
      const data = await response.json();
      const rateLimit = typeof data?.rate_limit_sec === 'number' ? Math.min(600, Math.max(15, data.rate_limit_sec)) : 60;
      setSettings({
        is_bot_running: Boolean(data?.is_bot_running),
        autonomous_mode: Boolean(data?.autonomous_mode),
        test_mode: Boolean(data?.test_mode),
        test_phone: String(data?.test_phone ?? ''),
        rate_limit_sec: rateLimit,
        inbound_enabled: data?.inbound_enabled ?? true,
        outbound_enabled: data?.outbound_enabled ?? true,
        security_lock: data?.security_lock ?? true,
        daily_limit: typeof data?.daily_limit === 'number' ? data.daily_limit : 5,
        message_delay_minutes: typeof data?.message_delay_minutes === 'number' ? data.message_delay_minutes : 30,
        manual_approval: Boolean(data?.manual_approval ?? true),
      });
    } catch {
      setSettings({
        is_bot_running: false,
        autonomous_mode: false,
        test_mode: false,
        test_phone: '',
        rate_limit_sec: 60,
        inbound_enabled: true,
        outbound_enabled: true,
        security_lock: true,
        daily_limit: 5,
        message_delay_minutes: 30,
        manual_approval: true,
      });
    }
  }, []);

  useEffect(() => {
    loadLeads();
    loadSettings();
  }, [loadLeads]);

  useEffect(() => {
    if (leads.length === 0) return;
    setFirstSeenMap((prev) => {
      const next = { ...prev };
      let changed = false;
      const isInitialSeed = Object.keys(prev).length === 0 && leads.length > 0;
      const firstSeenDate = isInitialSeed
        ? new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
        : new Date().toISOString();
      leads.forEach((l) => {
        const k = getLeadKey(l);
        if (!next[k]) {
          next[k] = firstSeenDate;
          changed = true;
        }
      });
      if (changed) {
        try {
          localStorage.setItem('leads_first_seen', JSON.stringify(next));
        } catch {
          // ignore
        }
      }
      return changed ? next : prev;
    });
  }, [leads]);

  const persistSettings = async (updates: Partial<{ is_bot_running: boolean; autonomous_mode: boolean; test_mode: boolean; test_phone: string; rate_limit_sec: number; inbound_enabled: boolean; outbound_enabled: boolean; security_lock: boolean; daily_limit: number; message_delay_minutes: number; manual_approval: boolean }>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      (async () => {
        try {
          const res = await fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(next, null, 2),
          });
          if (!res.ok) throw new Error('Save failed');
        } catch {
          localStorage.setItem('settings', JSON.stringify(next));
        }
      })();
      return next;
    });
  };

  const handleToggleBot = (nextValue: boolean) => {
    persistSettings({ is_bot_running: nextValue });
  };


  const handleToggleTestMode = (nextValue: boolean) => {
    persistSettings({ test_mode: nextValue });
  };

  const handleReset = useCallback(() => {
    setSelectedLead(null);
    setResetTrigger((r) => r + 1);
    setLeads((prev) => {
      const next = prev.map((lead) => {
        if (lead['Phone Status'] === 'Sent') {
          return { ...lead, 'Phone Status': 'Not Sent', 'WhatsApp Status': 'Not Sent' };
        }
        return lead;
      });
      persistLeads(next);
      return next;
    });
    toast({
      title: t('index.resetDoneTitle'),
      description: t('index.resetDoneDesc'),
    });
  }, [toast, t]);

  const handleDeleteLead = useCallback((lead: LeadRecord) => {
    const isSame = (a: LeadRecord, b: LeadRecord) =>
      (a.ID && b.ID && a.ID === b.ID) ||
      (a['Company Name'] === b['Company Name'] && a.Phone === b.Phone);
    (async () => {
      try {
        await fetch('/api/deleted_leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lead),
        });
      } catch {
        // ignore; still remove from list
      }
      try {
        await fetch('/api/delete_lead_from_sheets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lead),
        });
      } catch {
        // ignore; silinen listede işaretli, gerekirse manuel Sheets'ten silinir
      }
    })();
    setLeads((prev) => {
      const next = prev.filter((item) => !isSame(item, lead));
      persistLeads(next);
      return next;
    });
    setSelectedLead((prev) => (prev && isSame(prev, lead) ? null : prev));
  }, []);

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
      setSaveError(t('index.saveError'));
    }
  };

  const handleUpdateLead = (lead: LeadRecord, updates: Partial<LeadRecord>) => {
    const hasStatusChange =
      'Phone Status' in updates || 'WhatsApp Status' in updates;
    const updatesWithTime = hasStatusChange
      ? { ...updates, last_activity_at: new Date().toISOString() }
      : updates;
    setLeads((prev) => {
      const next = prev.map((item) => {
        const isMatch =
          (item.ID && item.ID === lead.ID) ||
          (!item.ID && item['Company Name'] === lead['Company Name'] && item.Phone === lead.Phone);
        return isMatch ? { ...item, ...updatesWithTime } : item;
      });
      persistLeads(next);
      return next;
    });
    if (updates['Phone Status'] === 'Send Requested') {
      toast({
        title: 'Send queued',
        description: 'If the bot is running, WhatsApp will open automatically.',
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

  const recentSentActivities = useMemo(() => {
    if (successTimelineCleared) return [];
    const withActivity = leads.filter((lead) => {
      const ps = lead['Phone Status'] || '';
      const ws = lead['WhatsApp Status'] || '';
      return ps === 'Sent' || ws === 'Pending' || ws === 'Accepted' || ws === 'Rejected' || ws === 'Demo Scheduled';
    });
    const sorted = [...withActivity].sort((a, b) => {
      const ta = a.last_activity_at ? new Date(a.last_activity_at).getTime() : 0;
      const tb = b.last_activity_at ? new Date(b.last_activity_at).getTime() : 0;
      return tb - ta;
    });
    const recent = sorted.slice(0, 15);
    return recent.map((lead, index) => {
      const ps = lead['Phone Status'] || '';
      const ws = lead['WhatsApp Status'] || '';
      let type: 'message_sent' | 'status_update' = 'message_sent';
      let description = t('index.whatsappSendDone');
      if (ps === 'Sent') {
        description = lead['Last_Action'] === 'Automated_Sent' ? t('index.autonomousSendDone') : t('index.whatsappSendDone');
      } else if (ws === 'Pending') {
        description = t('activity.messageSentPending');
      } else if (ws === 'Accepted') {
        type = 'status_update';
        description = t('activity.statusAccepted');
      } else if (ws === 'Rejected') {
        type = 'status_update';
        description = t('activity.statusRejected');
      } else if (ws === 'Demo Scheduled') {
        type = 'status_update';
        description = t('activity.demoScheduled');
      }
      return {
        id: lead.ID || `${lead['Company Name']}-${lead.Phone}-${index}-${lead.last_activity_at || ''}`,
        type,
        description,
        cafeName: lead['Company Name'] || 'Business',
        timestamp: lead.last_activity_at ? new Date(lead.last_activity_at) : new Date(),
      };
    });
  }, [leads, successTimelineCleared, t]);

  const selectedLeadFresh = useMemo(() => {
    if (!selectedLead) return null;
    const match = leads.find(
      (l) =>
        (l.ID && selectedLead.ID && l.ID === selectedLead.ID) ||
        (!l.ID && l['Company Name'] === selectedLead['Company Name'] && l.Phone === selectedLead.Phone)
    );
    return match ?? selectedLead;
  }, [leads, selectedLead]);

  return (
    <div className={`min-h-screen bg-background ${settings.is_bot_running ? 'bot-live-pulse' : ''}`}>
      <Header
        stats={stats}
        onRefresh={loadLeads}
        onReset={() => setShowResetConfirm(true)}
        onOpenAILearning={() => setShowAILearningCenter(true)}
      />
      <AILearningCenter
        open={showAILearningCenter}
        onOpenChange={setShowAILearningCenter}
        settings={{
          isBotRunning: settings.is_bot_running,
          onToggleBot: handleToggleBot,
          isTestMode: settings.test_mode,
          onToggleTestMode: handleToggleTestMode,
          testPhone: settings.test_phone,
          onTestPhoneChange: (v) => persistSettings({ test_phone: v }),
          botSpeedSec: settings.rate_limit_sec,
          onBotSpeedChange: (v) => persistSettings({ rate_limit_sec: v }),
          inboundEnabled: settings.inbound_enabled,
          onToggleInbound: (v) => persistSettings({ inbound_enabled: v }),
          outboundEnabled: settings.outbound_enabled,
          onToggleOutbound: (v) => persistSettings({ outbound_enabled: v }),
          securityLock: settings.security_lock,
          onToggleSecurityLock: (v) => persistSettings({ security_lock: v }),
          dailyLimit: settings.daily_limit,
          onDailyLimitChange: (v) => persistSettings({ daily_limit: v }),
          messageDelayMin: settings.message_delay_minutes,
          onMessageDelayChange: (v) => persistSettings({ message_delay_minutes: v }),
          manualApproval: settings.manual_approval,
          onToggleManualApproval: (v) => persistSettings({ manual_approval: v }),
        }}
      />

      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-5">
        {dataState !== 'ready' && (
          <div className="mb-4 rounded-md border border-border/80 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            {t('index.loadingData')}
          </div>
        )}
        {saveError && (
          <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {saveError}
          </div>
        )}

        <ScraperSection onLeadsAdded={loadLeads} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Lead Table - Takes 2 columns on xl */}
          <div className="xl:col-span-2">
            <LeadTable
              leads={leads}
              onSelectLead={setSelectedLead}
              selectedLead={selectedLead}
              onUpdateLead={handleUpdateLead}
              onDeleteLead={handleDeleteLead}
              resetTrigger={resetTrigger}
              firstSeenMap={firstSeenMap}
            />
          </div>

          {/* Right Sidebar - Charts & Activity */}
          <div className="space-y-6">
            <CityChart data={cityData} />
            <ActivityFeed activities={recentSentActivities} onReset={() => setSuccessTimelineCleared(true)} />
          </div>
        </div>
      </main>

      {/* AI Message Side Panel - use fresh lead from list so Two-step Step etc. update immediately */}
      {selectedLeadFresh && (
        <AIMessagePanel
          lead={selectedLeadFresh}
          onClose={() => setSelectedLead(null)}
          onUpdateLead={handleUpdateLead}
        />
      )}

      {/* Reset All confirmation */}
      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('index.resetConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('index.resetConfirmDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{lang === 'tr' ? 'İptal' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleReset();
                setShowResetConfirm(false);
              }}
            >
              {t('header.reset')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
