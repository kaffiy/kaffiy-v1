import { useEffect, useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Gauge, Shield, ShieldAlert, Bot, MessageSquare, Send, Radio, ShieldCheck, Zap, Brain, Sparkles as SparklesIcon, Terminal, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface BotStats {
  funnel?: { total_leads?: number; contacted?: number; interested?: number; converted?: number };
  ai_learning?: Array<{ title?: string; insight?: string }>;
  ai_log?: Array<{ time?: string; action?: string; detail?: string }>;
  last_conversations?: Array<{ company?: string; last_user_message?: string; last_ai_response?: string; at?: string }>;
  learned_behaviors?: Array<{ input: string; output: string }>;
  updated_at?: string;
  bot_status?: string;
  pending_approvals?: Array<{ id: string; company: string; message: string; type: string; phone: string; last_incoming?: string }>;
}

function ApprovalItem({ item, onApprove }: { item: any, onApprove: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(item.message);
  const [editReason, setEditReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await fetch('/api/leads/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: item.phone,
          status: 'Approved',
          field: item.type === 'Yanıt' ? 'WhatsApp Status' : 'Phone Status',
          original_message: item.message,
          approved_message: editedMessage,
          is_edited: editedMessage !== item.message,
          reason: editReason
        })
      });
      onApprove();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!confirm('Bu mesaja cevap verilmeyecek ve listeden kaldırılacak. Emin misiniz?')) return;
    setLoading(true);
    try {
      await fetch('/api/leads/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: item.phone,
          status: 'No Reply',
          field: item.type === 'Yanıt' ? 'WhatsApp Status' : 'Phone Status',
          original_message: item.message,
          approved_message: '',
          is_edited: false,
          reason: 'User skipped reply'
        })
      });
      onApprove();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-700 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-zinc-100">{item.company}</span>
        <span className={`text-[9px] px-1.5 py-0.5 rounded border ${item.type === 'Yanıt' ? 'border-blue-500/30 text-blue-400 bg-blue-400/5' : 'border-emerald-500/30 text-emerald-400 bg-emerald-400/5'}`}>
          {item.type}
        </span>
      </div>

      {item.last_incoming && (
        <div className="bg-zinc-800/50 p-2 rounded-lg rounded-tl-none border border-zinc-700/50 ml-0 mr-8">
          <p className="text-[10px] text-zinc-500 mb-1 font-bold flex items-center gap-1">
            <span>👤 Müşteri:</span>
          </p>
          <p className="text-xs text-zinc-300 font-sans leading-snug">
            {item.last_incoming}
          </p>
        </div>
      )}

      <div className="relative">
        {item.last_incoming && (
          <p className="text-[10px] text-emerald-500/70 mb-1 font-bold flex items-center gap-1 pl-1">
            <span>🤖 Bot Önerisi:</span>
          </p>
        )}

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              className="w-full h-24 bg-zinc-950 border border-zinc-700 rounded p-2 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50 resize-none font-serif"
              placeholder="Mesajı düzenleyin..."
            />
            <input
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              placeholder="💡 Neden değiştirdiniz? (Örn: Çok resmiydi, samimi yaptım)"
              className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-[10px] text-zinc-400 focus:outline-none focus:border-amber-500/50 placeholder:text-zinc-600 font-sans"
            />
          </div>
        ) : (
          <p className="text-xs text-zinc-400 font-serif leading-relaxed italic bg-zinc-950/50 p-2 rounded whitespace-pre-wrap cursor-pointer hover:bg-zinc-950/80 transition-colors border border-dashed border-zinc-800 hover:border-zinc-600" onClick={() => setIsEditing(true)}>
            "{item.message}"
            <span className="block text-[9px] text-zinc-600 not-italic mt-1 text-right">✏️ Düzenlemek için tıkla</span>
          </p>
        )}
      </div>

      <div className="flex gap-2 justify-end pt-1">
        {isEditing && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-[10px] text-zinc-400 hover:text-white"
            onClick={() => { setIsEditing(false); setEditedMessage(item.message); setEditReason(""); }}
            disabled={loading}
          >
            İptal
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-[10px] border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-400 mr-2"
          onClick={handleSkip}
          disabled={loading}
        >
          <X className="w-3 h-3 mr-1" /> Cevap Verme
        </Button>
        <Button
          size="sm"
          variant="outline"
          className={`h-7 text-[10px] ${isEditing && editedMessage !== item.message ? 'border-purple-500/50 text-purple-400 hover:bg-purple-500/10' : 'border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10'}`}
          onClick={handleApprove}
          disabled={loading}
        >
          {loading ? '...' : (isEditing && editedMessage !== item.message ? '✨ Öğren & Onayla' : '✓ Onayla')}
        </Button>
      </div>
    </div>
  );
}

export interface AILearningCenterSettings {
  isBotRunning: boolean;
  onToggleBot: (v: boolean) => void;
  isTestMode: boolean;
  onToggleTestMode: (v: boolean) => void;
  testPhone: string;
  onTestPhoneChange: (v: string) => void;
  botSpeedSec: number;
  onBotSpeedChange: (v: number) => void;
  inboundEnabled: boolean;
  onToggleInbound: (v: boolean) => void;
  outboundEnabled: boolean;
  onToggleOutbound: (v: boolean) => void;
  securityLock: boolean;
  onToggleSecurityLock: (v: boolean) => void;
  dailyLimit: number;
  onDailyLimitChange: (v: number) => void;
  messageDelayMin: number;
  onMessageDelayChange: (v: number) => void;
  manualApproval: boolean;
  onToggleManualApproval: (v: boolean) => void;
}

interface AILearningCenterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings?: AILearningCenterSettings;
}

// Tek bir EKG kalp atışı şekli (P-QRS-T benzeri)
const HEARTBEAT_PATH = 'M0,40 L30,40 L35,28 L42,12 L48,52 L55,38 L65,40 L100,40';
const PATH_WIDTH = 100;

function EKGStrip({ bpm = 60, isActive = true }: { bpm?: number; isActive?: boolean }) {
  const duration = useMemo(() => (60 / Math.max(30, Math.min(120, bpm))) * 2, [bpm]);
  const pathRepeat = 5;
  const totalWidth = PATH_WIDTH * pathRepeat;
  const pathD = useMemo(
    () =>
      Array.from({ length: pathRepeat }, (_, i) =>
        HEARTBEAT_PATH.replace(/\b(\d+),(\d+)/g, (_, x, y) => `${i * PATH_WIDTH + parseInt(x, 10)},${y}`)
      ).join(' '),
    [pathRepeat]
  );

  return (
    <div className="relative rounded-lg border border-emerald-500/30 bg-black/90 overflow-hidden" style={{ minHeight: 100 }}>
      {/* EKG kağıt ızgara */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="ekg-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgb(0, 255, 136)" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ekg-grid)" />
        </svg>
      </div>
      {/* Dalga - tek heartbeat penceresi, kaydırma ile kesintisiz döngü */}
      <div className="absolute inset-0 flex items-center overflow-hidden">
        <svg
          viewBox={`0 0 ${PATH_WIDTH + 20} 80`}
          preserveAspectRatio="none"
          className="w-full h-20 text-emerald-400"
          style={{ filter: 'drop-shadow(0 0 6px rgba(0, 255, 136, 0.6))' }}
        >
          <g
            style={{
              animation: isActive ? `ekg-scroll ${duration}s linear infinite` : 'none',
            }}
          >
            <path
              d={pathD}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-emerald-400"
            />
          </g>
        </svg>
      </div>
      {/* Üst etiket */}
      <div className="absolute top-1 left-2 flex items-center gap-3 text-[10px] font-mono text-emerald-400/90">
        <span>AI RİTİM</span>
        <span className="text-emerald-400/70">II</span>
        <span>{isActive ? `${bpm} bpm` : '---'}</span>
        {isActive && (
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            CANLI
          </span>
        )}
      </div>
      <style>{`
        @keyframes ekg-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-${PATH_WIDTH}px); }
        }
      `}</style>
    </div>
  );
}

function formatBotSpeed(sec: number): string {
  if (sec < 60) return `${sec} sn`;
  if (sec === 60) return '1 dk';
  return `${Math.round(sec / 60)} dk`;
}

export function AILearningCenter({ open, onOpenChange, settings }: AILearningCenterProps) {
  const { lang } = useLanguage();
  const [stats, setStats] = useState<BotStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [qrBaseUrl, setQrBaseUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('waha_base_url') || 'http://localhost:3000/api';
    } catch {
      return 'http://localhost:3000/api';
    }
  });
  const [qrApiKey, setQrApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem('waha_api_key') || '72c66d88d5ff48e9b9236e5503ef9dbd';
    } catch {
      return '72c66d88d5ff48e9b9236e5503ef9dbd';
    }
  });
  const [dockerStatus, setDockerStatus] = useState<'checking' | 'running' | 'stopped' | 'error'>('checking');
  const [dockerLoading, setDockerLoading] = useState(false);
  const [wahaApiStatus, setWahaApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    return () => {
      if (qrImageUrl) URL.revokeObjectURL(qrImageUrl);
    };
  }, [qrImageUrl]);

  const checkDockerStatus = async () => {
    try {
      const res = await fetch(qrBaseUrl.replace('/api', '') + '/api/sessions', {
        headers: { 'x-api-key': qrApiKey }
      });
      if (res.ok) {
        setDockerStatus('running');
        setWahaApiStatus('online');
      } else {
        setDockerStatus('running'); // Container might be up but API not ready
        setWahaApiStatus('offline');
      }
    } catch {
      setDockerStatus('stopped');
      setWahaApiStatus('offline');
    }
  };

  const handleDockerStart = async () => {
    setDockerLoading(true);
    try {
      // Trigger bot start which auto-starts Docker
      await fetch('/api/ai-bot/start', { method: 'POST' });
      await new Promise(resolve => setTimeout(resolve, 3000));
      await checkDockerStatus();
    } catch {
      setDockerStatus('error');
    } finally {
      setDockerLoading(false);
    }
  };

  const fetchStats = () => {
    fetch('/api/bot-stats')
      .then((res) => res.json())
      .then((data) => setStats(data || {}))
      .catch(() => setStats({}));
  };

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchStats();
    checkDockerStatus();
    setLoading(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => {
      fetchStats();
      checkDockerStatus();
    }, 5000);
    return () => clearInterval(t);
  }, [open]);

  const handleCreateQr = async () => {
    setQrLoading(true);
    setQrError(null);
    if (qrImageUrl) {
      URL.revokeObjectURL(qrImageUrl);
      setQrImageUrl(null);
    }
    try {
      try {
        localStorage.setItem('waha_base_url', qrBaseUrl);
        localStorage.setItem('waha_api_key', qrApiKey);
      } catch {
        // ignore storage errors
      }
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (qrApiKey) headers['x-api-key'] = qrApiKey;
      await fetch(`${qrBaseUrl}/sessions/default`, { method: 'DELETE', headers });
      const startRes = await fetch(`${qrBaseUrl}/sessions/start`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: 'default' }),
      });
      if (!startRes.ok && startRes.status !== 422) {
        throw new Error(`Session başlatılamadı (${startRes.status})`);
      }
      await new Promise((resolve) => setTimeout(resolve, 10000));
      const qrRes = await fetch(`${qrBaseUrl}/default/auth/qr`, { headers });
      if (!qrRes.ok) {
        throw new Error(`QR alınamadı (${qrRes.status})`);
      }
      const blob = await qrRes.blob();
      const url = URL.createObjectURL(blob);
      setQrImageUrl(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'QR alınamadı';
      setQrError(message);
    } finally {
      setQrLoading(false);
    }
  };

  const funnel = stats?.funnel || {};
  const aiLearning = stats?.ai_learning || [];
  const pendingApprovals = stats?.pending_approvals || [];
  const aiLog = stats?.ai_log || [];
  const lastConvs = stats?.last_conversations || [];
  const updatedAt = stats?.updated_at;
  const isActive = stats?.bot_status === 'running' || !!updatedAt;

  // Son 5 dakikadaki olay sayısına göre "BPM" (ritim yoğunluğu)
  const activityBpm = useMemo(() => {
    if (!aiLog.length) return 45;
    const now = Date.now();
    const fiveMinAgo = now - 5 * 60 * 1000;
    const recent = aiLog.filter((e) => e.time && new Date(e.time).getTime() > fiveMinAgo).length;
    return Math.min(120, 45 + recent * 8);
  }, [aiLog]);

  const totalLeads = funnel.total_leads ?? 0;
  const contacted = funnel.contacted ?? 0;
  const funnelPct = totalLeads > 0 ? Math.round((contacted / totalLeads) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[90vh] max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-zinc-950 border-zinc-800">
        <DialogHeader className="px-6 pt-6 pb-2 border-b border-zinc-800 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span className="text-emerald-400 font-mono">AI LEARNING CENTER</span>
            <span className="text-zinc-500 text-xs font-normal">— Yapay zeka ritim monitörü</span>
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            Bot istatistikleri ve canlı olay akışı. Veriler her 5 saniyede güncellenir.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="p-8 text-center text-zinc-500">Yükleniyor…</div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-6">
            <div className="space-y-5 pt-4">
              {/* Bot kontrolleri */}
              {settings && (
                <Card className="bg-zinc-900/80 border-zinc-700">
                  <CardHeader className="py-3 px-4 text-xs font-mono text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                    {lang === 'tr' ? 'Bot kontrolleri' : 'Bot controls'}
                  </CardHeader>
                  <CardContent className="p-4 space-y-6">
                    {/* Main Controls row */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Left: Main Bot Switch & Test Mode */}
                      <div className="flex-1 space-y-3">
                        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Main Controls</div>

                        <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-3">
                          <div className="flex items-center gap-3">
                            <Bot className={`h-5 w-5 ${settings.isBotRunning ? 'text-emerald-400' : 'text-zinc-500'}`} />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-zinc-200">{lang === 'tr' ? 'Bot Ana Şalter' : 'Main Bot Switch'}</span>
                              <span className="text-[10px] text-zinc-500">{settings.isBotRunning ? (lang === 'tr' ? 'Aktif' : 'Active') : (lang === 'tr' ? 'Kapalı' : 'Offline')}</span>
                            </div>
                          </div>
                          <Switch checked={settings.isBotRunning} onCheckedChange={settings.onToggleBot} />
                        </div>
                      </div>

                      {/* Right: Autopilot Column */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Autopilot</div>
                          {settings.securityLock ? (
                            <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20">
                              <Shield className="h-3 w-3" />
                              <span>SAFE</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-[10px] text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded border border-red-400/20">
                              <ShieldAlert className="h-3 w-3" />
                              <span>UNSAFE</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          {/* Reach Customers */}
                          <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 px-3 py-2 bg-zinc-900/40">
                            <div className="flex items-center gap-2">
                              <Send className="h-4 w-4 text-zinc-500" />
                              <span className="text-sm text-zinc-300">{lang === 'tr' ? 'Müşterilere Ulaş' : 'Reach Customers'}</span>
                            </div>
                            <Switch checked={settings.outboundEnabled} onCheckedChange={settings.onToggleOutbound} />
                          </div>

                          {/* Reply Messages */}
                          <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 px-3 py-2 bg-zinc-900/40">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-zinc-500" />
                              <span className="text-sm text-zinc-300">{lang === 'tr' ? 'Mesajları Cevapla' : 'Reply Messages'}</span>
                            </div>
                            <Switch checked={settings.inboundEnabled} onCheckedChange={settings.onToggleInbound} />
                          </div>

                          {/* Manual Approval Mode */}
                          <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-700/50 bg-amber-500/10 px-3 py-2">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <ShieldCheck className={`h-4 w-4 ${settings.manualApproval ? 'text-amber-400' : 'text-zinc-500'}`} />
                                <span className="text-sm text-zinc-200">{lang === 'tr' ? 'Onay Modu (Güvenlik)' : 'Safety Mode (Approval)'}</span>
                              </div>
                              <span className="text-[10px] text-zinc-500 ml-6">
                                {lang === 'tr' ? 'Mesajları göndermeden önce bana sor.' : 'Ask me before sending.'}
                              </span>
                            </div>
                            <Switch checked={settings.manualApproval} onCheckedChange={settings.onToggleManualApproval} />
                          </div>

                          {/* Security Lock */}
                          <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-700/50 bg-zinc-800/30 px-3 py-2">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <Shield className={`h-4 w-4 ${settings.securityLock ? 'text-emerald-400' : 'text-red-400'}`} />
                                <span className="text-sm text-zinc-200">{lang === 'tr' ? 'Güvenlik Kilidi' : 'Security Lock'}</span>
                              </div>
                              <span className="text-[10px] text-zinc-500 ml-6">
                                {lang === 'tr' ? 'Sadece kurucu & test no işlem yapar.' : 'Only Founder/Test phone allowed.'}
                              </span>
                            </div>
                            <Switch checked={settings.securityLock} onCheckedChange={settings.onToggleSecurityLock} />
                          </div>

                          {/* Docker WAHA Control - Moved up for visibility */}
                          <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 px-3 py-2.5 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Radio className="h-4 w-4 text-cyan-400" />
                                <span className="text-sm text-zinc-200">{lang === 'tr' ? 'WAHA Docker' : 'WAHA Docker'}</span>
                              </div>
                              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${dockerStatus === 'running' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' :
                                dockerStatus === 'stopped' ? 'bg-red-400/10 text-red-400 border border-red-400/20' :
                                  dockerStatus === 'error' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' :
                                    'bg-zinc-600/10 text-zinc-500 border border-zinc-600/20'
                                }`}>
                                <div className={`h-1.5 w-1.5 rounded-full ${dockerStatus === 'running' ? 'bg-emerald-400 animate-pulse' :
                                  dockerStatus === 'stopped' ? 'bg-red-400' :
                                    dockerStatus === 'error' ? 'bg-amber-400' :
                                      'bg-zinc-600 animate-pulse'
                                  }`} />
                                {dockerStatus === 'running' ? 'AKTIF' : dockerStatus === 'stopped' ? 'KAPALI' : dockerStatus === 'error' ? 'HATA' : 'KONTROL...'}
                              </div>
                            </div>
                            {dockerStatus === 'stopped' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full h-7 text-xs border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400"
                                onClick={handleDockerStart}
                                disabled={dockerLoading}
                              >
                                {dockerLoading ? '⏳ Başlatılıyor...' : '▶️ Docker Başlat'}
                              </Button>
                            )}

                            {/* WAHA API Status */}
                            <div className="flex items-center justify-between pt-2 border-t border-cyan-500/20">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-zinc-400">WAHA API:</span>
                              </div>
                              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${wahaApiStatus === 'online' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' :
                                wahaApiStatus === 'offline' ? 'bg-red-400/10 text-red-400 border border-red-400/20' :
                                  'bg-zinc-600/10 text-zinc-500 border border-zinc-600/20'
                                }`}>
                                <div className={`h-1.5 w-1.5 rounded-full ${wahaApiStatus === 'online' ? 'bg-emerald-400 animate-pulse' :
                                  wahaApiStatus === 'offline' ? 'bg-red-400' :
                                    'bg-zinc-600 animate-pulse'
                                  }`} />
                                {wahaApiStatus === 'online' ? 'ONLINE' : wahaApiStatus === 'offline' ? 'OFFLINE' : 'KONTROL...'}
                              </div>
                            </div>

                            <div className="text-[9px] text-zinc-500 italic">
                              {lang === 'tr' ? 'WhatsApp bağlantısı için gerekli' : 'Required for WhatsApp connection'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Anti-Ban Protection Card */}
                    <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-400">
                          <ShieldCheck className="h-5 w-5" />
                          <span className="text-sm font-bold uppercase tracking-wider">
                            {lang === 'tr' ? 'Anti-Ban Koruması Aktif' : 'Anti-Ban Protection Active'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1 rounded bg-emerald-400/10 border border-emerald-400/20">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[9px] font-mono text-emerald-400 tracking-tighter uppercase font-black">Secure Connection</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                        {[
                          { tr: 'Doğal Düşünme Süresi (Jitter)', en: 'Natural Jitter (Thinking time)' },
                          { tr: 'İnsansı Yazıyor... Simülasyonu', en: 'Realistic Typing... Simulation' },
                          { tr: 'Görülme/Okundu Takibi', en: 'Seen/Read Simulation' },
                          { tr: 'AI Dinamik Mesaj Değiştirme', en: 'AI Dynamic Paraphrasing' },
                          { tr: 'Mesai Saatleri Koruması', en: 'Business Hours Protection' },
                          { tr: 'Kritik Hata Duraklatma', en: 'Safety Pause on Errors' },
                          { tr: 'Günlük Akıllı Limit Takibi', en: 'Daily Intelligent Cap' },
                          { tr: 'Gecikmeli İnsansı Yanıt', en: 'Delayed Human-like Reply' },
                        ].map((measure, idx) => (
                          <div key={idx} className="flex items-center gap-2 group">
                            <div className="h-5 w-5 rounded-full bg-emerald-400/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-400/20 transition-colors">
                              <Zap className="h-3 w-3 text-emerald-400" />
                            </div>
                            <span className="text-[11px] text-zinc-400 font-medium">
                              {lang === 'tr' ? measure.tr : measure.en}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-emerald-500/10 text-[10px] text-zinc-500 italic text-center">
                        {lang === 'tr'
                          ? 'Sistemimiz Meta spam filtrelerine takılmamak için her mesajı benzersizleştirir ve insansı tempo kullanır.'
                          : 'Our system unique-ifies every message and uses human tempo to avoid Meta spam filters.'}
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 mt-2">
                      <div className="flex items-center gap-3 rounded-lg border border-zinc-800 px-3 py-2">
                        <Gauge className="h-4 w-4 text-zinc-500 shrink-0" />
                        <span className="text-sm text-zinc-300 shrink-0">{lang === 'tr' ? 'Bot hızı (mesaj aralığı)' : 'Bot speed (message interval)'}</span>
                        <Slider
                          min={30}
                          max={300}
                          step={30}
                          value={[Math.min(300, Math.max(30, settings.botSpeedSec))]}
                          onValueChange={([v]) => settings.onBotSpeedChange(v)}
                          className="flex-1 max-w-[200px]"
                        />
                        <span className="text-xs font-mono text-zinc-400 tabular-nums w-12 shrink-0">
                          {formatBotSpeed(Math.min(300, Math.max(30, settings.botSpeedSec)))}
                        </span>
                      </div>

                      {/* Daily Limit Slider */}
                      <div className="flex items-center gap-3 rounded-lg border border-zinc-800 px-3 py-2">
                        <div className="flex items-center gap-2 w-[220px]">
                          <Send className="h-4 w-4 text-blue-400 shrink-0" />
                          <span className="text-sm text-zinc-300">{lang === 'tr' ? 'Günlük Limit' : 'Daily Limit'}</span>
                        </div>
                        <Slider
                          min={1}
                          max={50}
                          step={1}
                          value={[settings.dailyLimit]}
                          onValueChange={([v]) => settings.onDailyLimitChange(v)}
                          className="flex-1"
                        />
                        <span className="text-xs font-mono text-zinc-400 tabular-nums w-12 shrink-0 text-right">
                          {settings.dailyLimit}
                        </span>
                      </div>

                      {/* Message Delay Slider */}
                      <div className="flex items-center gap-3 rounded-lg border border-zinc-800 px-3 py-2">
                        <div className="flex items-center gap-2 w-[220px]">
                          <MessageSquare className="h-4 w-4 text-amber-400 shrink-0" />
                          <span className="text-sm text-zinc-300">{lang === 'tr' ? 'Mesaj Gecikmesi (dk)' : 'Msg Delay (min)'}</span>
                        </div>
                        <Slider
                          min={1}
                          max={120}
                          step={1}
                          value={[settings.messageDelayMin]}
                          onValueChange={([v]) => settings.onMessageDelayChange(v)}
                          className="flex-1"
                        />
                        <span className="text-xs font-mono text-zinc-400 tabular-nums w-12 shrink-0 text-right">
                          {settings.messageDelayMin} dk
                        </span>
                      </div>
                    </div>

                    <div className="rounded-lg border border-zinc-800 px-3 py-3 bg-zinc-900/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-zinc-300">{lang === 'tr' ? 'WAHA Bağlantısı' : 'WAHA Connection'}</div>
                          <div className="text-[11px] text-zinc-500">
                            API: {qrBaseUrl}
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="h-7 text-xs border-zinc-700 bg-zinc-800" onClick={() => setQrOpen(true)}>
                          {lang === 'tr' ? 'QR Kodu' : 'QR Code'}
                        </Button>
                      </div>

                      {/* Docker Status & Control */}
                      <div className="flex items-center justify-between gap-3 pt-2 border-t border-zinc-800">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${dockerStatus === 'running' ? 'bg-emerald-400 animate-pulse' :
                            dockerStatus === 'stopped' ? 'bg-red-400' :
                              dockerStatus === 'error' ? 'bg-amber-400' :
                                'bg-zinc-600 animate-pulse'
                            }`} />
                          <span className="text-xs text-zinc-400">
                            Docker: {dockerStatus === 'running' ? '🟢 Aktif' : dockerStatus === 'stopped' ? '🔴 Kapalı' : dockerStatus === 'error' ? '⚠️ Hata' : '⏳ Kontrol ediliyor...'}
                          </span>
                        </div>
                        {dockerStatus === 'stopped' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400"
                            onClick={handleDockerStart}
                            disabled={dockerLoading}
                          >
                            {dockerLoading ? '⏳ Başlatılıyor...' : '▶️ Docker Başlat'}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* LIVE TERMINAL FEED */}
                    <Card className="bg-zinc-950 border-emerald-500/30">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Terminal className="h-4 w-4 text-emerald-400" />
                            <span className="text-sm font-mono text-emerald-400">LIVE TERMINAL FEED</span>
                          </div>
                          <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                        </div>
                        <p className="text-[10px] text-zinc-500">Son bot aktiviteleri • Canlı akış</p>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="h-[200px] overflow-y-auto bg-black/50 rounded-lg p-3 font-mono text-xs border border-zinc-800">
                          {aiLog.length === 0 ? (
                            <div className="text-zinc-600 italic">Bot henüz aktif değil veya log yok...</div>
                          ) : (
                            <div className="space-y-1">
                              {[...aiLog].reverse().slice(0, 20).map((log, i) => (
                                <div key={i} className="flex gap-2 text-[10px] leading-relaxed">
                                  <span className="text-zinc-600 shrink-0">
                                    {log.time ? new Date(log.time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
                                  </span>
                                  <span className={`shrink-0 ${log.action?.includes('📩') ? 'text-blue-400' :
                                    log.action?.includes('💬') ? 'text-emerald-400' :
                                      log.action?.includes('⚠️') ? 'text-amber-400' :
                                        'text-zinc-400'
                                    }`}>
                                    {log.action}
                                  </span>
                                  <span className="text-zinc-300 truncate">{log.detail}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-[9px] text-zinc-600 text-center">
                          Gösterilen: Son {Math.min(aiLog.length, 20)} log • Her 5 saniyede güncellenir
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              )}

              {/* ONAY BEKLEYENLER BÖLÜMÜ */}
              {pendingApprovals.length > 0 && (
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-4 animate-in fade-in slide-in-from-top-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-500">
                      <ShieldAlert className="h-5 w-5" />
                      <span className="text-sm font-bold uppercase tracking-wider">
                        {lang === 'tr' ? 'ONAY BEKLEYEN MESAJLAR' : 'PENDING APPROVALS'}
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-bold">
                      {pendingApprovals.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {pendingApprovals.map((item, idx) => (
                      <ApprovalItem key={item.id || idx} item={item} onApprove={fetchStats} />
                    ))}
                  </div>
                </div>
              )}

              {/* EKG Monitör */}
              <div>
                <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">Canlı ritim (EKG)</h3>
                <EKGStrip bpm={activityBpm} isActive={isActive} />
              </div>

              {/* Huni + Özet */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="bg-zinc-900/80 border-zinc-800">
                  <CardHeader className="py-2 px-3 text-[10px] font-mono text-zinc-500 uppercase">Toplam Lead</CardHeader>
                  <CardContent className="py-1 px-3 text-xl font-semibold tabular-nums text-zinc-100">{funnel.total_leads ?? 0}</CardContent>
                </Card>
                <Card className="bg-zinc-900/80 border-zinc-800">
                  <CardHeader className="py-2 px-3 text-[10px] font-mono text-zinc-500 uppercase">İletişime Geçilen</CardHeader>
                  <CardContent className="py-1 px-3 text-xl font-semibold tabular-nums text-cyan-400">{funnel.contacted ?? 0}</CardContent>
                </Card>
                <Card className="bg-zinc-900/80 border-zinc-800">
                  <CardHeader className="py-2 px-3 text-[10px] font-mono text-zinc-500 uppercase">İlgilenen</CardHeader>
                  <CardContent className="py-1 px-3 text-xl font-semibold tabular-nums text-amber-400">{funnel.interested ?? 0}</CardContent>
                </Card>
                <Card className="bg-zinc-900/80 border-zinc-800">
                  <CardHeader className="py-2 px-3 text-[10px] font-mono text-zinc-500 uppercase">Satış Kapanan</CardHeader>
                  <CardContent className="py-1 px-3 text-xl font-semibold tabular-nums text-emerald-400">{funnel.converted ?? 0}</CardContent>
                </Card>
              </div>
              <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${funnelPct}%` }}
                />
              </div>
              <p className="text-[10px] text-zinc-500 font-mono">Huni ilerlemesi: %{funnelPct}</p>

              {/* Canlı olay akışı */}
              <div>
                <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">Canlı olay akışı (son 10)</h3>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 divide-y divide-zinc-800 max-h-40 overflow-y-auto">
                  {aiLog.length === 0 ? (
                    <div className="py-4 px-3 text-xs text-zinc-500 text-center">Henüz olay yok. Autonomous açıkken burada akacak.</div>
                  ) : (
                    [...aiLog].reverse().slice(0, 10).map((e, i) => (
                      <div key={i} className="flex items-start gap-2 py-2 px-3 text-xs">
                        <span className="font-mono text-zinc-500 shrink-0">{e.time?.slice(11, 19) ?? '--:--:--'}</span>
                        <span className="text-cyan-400/90 font-medium shrink-0">{e.action ?? ''}</span>
                        <span className="text-zinc-400 truncate">{e.detail ?? ''}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Son analizler */}
              <div>
                <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">Son analizler (leads verisi)</h3>
                <div className="space-y-2">
                  {aiLearning.length === 0 ? (
                    <p className="text-xs text-zinc-500">Henüz analiz yok. Bot veri topladıkça burada görünecek.</p>
                  ) : (
                    [...aiLearning].reverse().map((item, i) => (
                      <Card key={i} className="bg-zinc-900/80 border-zinc-800 border-l-2 border-l-emerald-500/50">
                        <CardHeader className="py-1.5 px-3">
                          <span className="text-[10px] font-mono text-emerald-400 uppercase">{item.title || 'Analiz'}</span>
                        </CardHeader>
                        <CardContent className="py-0 px-3 pb-2 text-sm text-zinc-300">{item.insight || '—'}</CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {/* Yeni: Learned Behaviors */}
              <div>
                <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Brain className="h-3 w-3 text-purple-400" />
                  {lang === 'tr' ? 'Öğrenilen Davranışlar (Memory)' : 'Learned Behaviors (Memory)'}
                </h3>
                <div className="space-y-2">
                  {(stats?.learned_behaviors || []).length === 0 ? (
                    <p className="text-[10px] text-zinc-600 italic">Henüz özel bir davranış öğretilmedi.</p>
                  ) : (
                    stats?.learned_behaviors?.map((ex, i) => (
                      <div key={i} className="p-2.5 rounded-lg border border-purple-500/10 bg-purple-500/5 text-[11px] space-y-1">
                        <div className="text-zinc-500 flex items-center gap-1">
                          <span className="font-bold text-purple-400">IN:</span> {ex.input}
                        </div>
                        <div className="text-zinc-300 flex items-center gap-1">
                          <span className="font-bold text-emerald-400">OUT:</span> {ex.output}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Yeni: Self-Criticism Status */}
              <div className="p-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <SparklesIcon className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {lang === 'tr' ? 'AI Öz-Denetim Modu' : 'AI Self-Criticism Mode'}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono">Loop: Active</div>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed italic">
                  {lang === 'tr'
                    ? "Bot her mesajı göndermeden önce 'Kurucu Oğuz' filtresinden geçirir. Samimiyetsiz veya robotik ifadeleri anında temizler."
                    : "Bot filters every message through 'Founder Oguz' persona. Instantly cleans up insincere or robotic tones."}
                </p>
              </div>

              {/* Son konuşmalar özet */}
              {lastConvs.length > 0 && (
                <div>
                  <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">Son konuşmalar</h3>
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 divide-y divide-zinc-800 max-h-36 overflow-y-auto">
                    {lastConvs.slice(-5).reverse().map((c, i) => (
                      <div key={i} className="py-2 px-3 text-xs">
                        <div className="font-medium text-zinc-300">{c.company || '—'}</div>
                        <div className="text-zinc-500 mt-0.5">
                          <span className="text-cyan-400/80">Müşteri:</span> {(c.last_user_message || '').slice(0, 60)}
                          {(c.last_user_message?.length ?? 0) > 60 ? '…' : ''}
                        </div>
                        <div className="text-zinc-500 mt-0.5">
                          <span className="text-emerald-400/80">AI:</span> {(c.last_ai_response || '').slice(0, 60)}
                          {(c.last_ai_response?.length ?? 0) > 60 ? '…' : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {updatedAt && (
                <p className="text-[10px] text-zinc-600 font-mono">Son güncelleme: {updatedAt}</p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-lg bg-zinc-950 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-sm text-emerald-400 font-mono">WAHA QR</DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              {lang === 'tr'
                ? 'QR üretimi için WAHA oturumu başlatılır ve QR görüntülenir.'
                : 'Starts WAHA session and shows the QR code.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              <Input
                value={qrBaseUrl}
                onChange={(e) => setQrBaseUrl(e.target.value)}
                placeholder="http://localhost:3000/api"
                className="h-8 text-xs bg-zinc-900 border-zinc-700"
              />
              <Input
                value={qrApiKey}
                onChange={(e) => setQrApiKey(e.target.value)}
                placeholder="x-api-key"
                className="h-8 text-xs bg-zinc-900 border-zinc-700"
              />
            </div>
            <Button onClick={handleCreateQr} disabled={qrLoading} className="w-full">
              {qrLoading ? (lang === 'tr' ? 'QR hazırlanıyor…' : 'Preparing QR…') : lang === 'tr' ? 'QR Oluştur' : 'Create QR'}
            </Button>
            {qrError && (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {qrError}
              </div>
            )}
            <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-3 flex items-center justify-center min-h-[240px]">
              {qrImageUrl ? (
                <img src={qrImageUrl} alt="WAHA QR" className="max-h-[220px] object-contain" />
              ) : (
                <span className="text-xs text-zinc-500">
                  {lang === 'tr' ? 'Henüz QR yok. Oluştur deyin.' : 'No QR yet. Click create.'}
                </span>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
