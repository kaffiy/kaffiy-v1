import { Coffee, Moon, Sun, Bell, RefreshCw, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { ConversionGauge } from './ConversionGauge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

interface HeaderStats {
  totalLeads: number;
  messagesSent: number;
  accepted: number;
  conversionRate: number;
}

interface HeaderProps {
  stats: HeaderStats;
  onRefresh: () => void;
  onReset: () => void;
  isBotRunning: boolean;
  onToggleBot: (nextValue: boolean) => void;
  isAutonomous: boolean;
  onToggleAutonomous: (nextValue: boolean) => void;
}

export function Header({ stats, onRefresh, onReset, isBotRunning, onToggleBot, isAutonomous, onToggleAutonomous }: HeaderProps) {
  const { t, lang, setLang } = useLanguage();
  const [isDark, setIsDark] = useState(true); // Default to dark mode

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  // Initialize with dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyber-lime">
              <Coffee className="h-4 w-4 text-cyber-lime-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-foreground truncate">Kaffiy</h1>
              <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">AI Sales</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs">
            <span className="text-muted-foreground">Leads</span>
            <span className="font-medium tabular-nums">{stats.totalLeads}</span>
            <span className="text-muted-foreground">{t('header.sent')}</span>
            <span className="font-medium tabular-nums">{stats.messagesSent}</span>
            <span className="text-muted-foreground">{t('header.accepted')}</span>
            <span className="font-medium tabular-nums">{stats.accepted}</span>
            <ConversionGauge value={stats.conversionRate} size={32} strokeWidth={4} />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="hidden md:flex items-center gap-2 mr-1">
              <div className="flex items-center gap-1.5 rounded-md border border-border/80 px-2 py-1">
                <Switch checked={isBotRunning} onCheckedChange={onToggleBot} className="scale-90" />
                <span className={cn("text-[11px]", isBotRunning ? "text-emerald-500" : "text-muted-foreground")}>
                  {isBotRunning ? "Bot" : t('header.off')}
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-md border border-border/80 px-2 py-1">
                <Switch checked={isAutonomous} onCheckedChange={onToggleAutonomous} disabled={!isBotRunning} className="scale-90" />
                <span className={cn("text-[11px]", isAutonomous ? "text-cyber-lime" : "text-muted-foreground")}>
                  {t('header.autonomous')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-0.5 rounded-md border border-border/80 overflow-hidden">
              <button
                type="button"
                onClick={() => setLang('tr')}
                className={cn(
                  'px-2 py-1 text-[11px] font-medium transition-colors',
                  lang === 'tr' ? 'bg-cyber-lime text-cyber-lime-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
                title="Türkçe"
              >
                TR
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={cn(
                  'px-2 py-1 text-[11px] font-medium transition-colors',
                  lang === 'en' ? 'bg-cyber-lime text-cyber-lime-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
                title="English"
              >
                EN
              </button>
            </div>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onReset?.(); }}
              title={t('header.reset')}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
              aria-label={t('header.reset')}
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRefresh} title={t('header.refresh')}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 relative" title={lang === 'tr' ? 'Bildirimler' : 'Notifications'}>
              <Bell className="h-4 w-4" />
              <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-cyber-lime" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsDark(!isDark)}>
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
