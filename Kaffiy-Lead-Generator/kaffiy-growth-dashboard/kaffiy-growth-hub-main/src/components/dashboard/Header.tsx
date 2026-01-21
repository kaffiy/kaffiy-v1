import { Coffee, Moon, Sun, Bell, Users, Send, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { ConversionGauge } from './ConversionGauge';
import { Switch } from '@/components/ui/switch';

interface HeaderStats {
  totalLeads: number;
  messagesSent: number;
  accepted: number;
  conversionRate: number;
}

interface HeaderProps {
  stats: HeaderStats;
  onRefresh: () => void;
  isBotRunning: boolean;
  onToggleBot: (nextValue: boolean) => void;
}

export function Header({ stats, onRefresh, isBotRunning, onToggleBot }: HeaderProps) {
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
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyber-lime">
              <Coffee className="h-5 w-5 text-cyber-lime-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">Kaffiy</h1>
              <p className="text-[10px] font-medium text-cyber-lime uppercase tracking-wider">
                AI Sales Hub
              </p>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Leads</p>
                <p className="text-lg font-bold text-foreground">{stats.totalLeads}</p>
              </div>
            </div>

            <div className="w-px h-10 bg-border" />

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Send className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Messages Sent</p>
                <p className="text-lg font-bold text-foreground">{stats.messagesSent}</p>
              </div>
            </div>

            <div className="w-px h-10 bg-border" />

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Accepted</p>
                <p className="text-lg font-bold text-foreground">{stats.accepted}</p>
              </div>
            </div>

            <div className="w-px h-10 bg-border" />

            <div className="flex items-center gap-3">
              <ConversionGauge value={stats.conversionRate} size={48} strokeWidth={5} />
              <div>
                <p className="text-xs text-muted-foreground">Conversion</p>
                <p className="text-xs text-cyber-lime font-medium">Rate</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-3 mr-2 rounded-full border border-border px-3 py-1.5">
              <span className="text-xs text-muted-foreground">Bot Kontrol Paneli</span>
              <Switch checked={isBotRunning} onCheckedChange={onToggleBot} />
              <span className={isBotRunning ? "text-xs text-emerald-400" : "text-xs text-red-400"}>
                {isBotRunning ? "Bot Canlı" : "Bot Uykuda"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-cyber-lime" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDark(!isDark)}
            >
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
