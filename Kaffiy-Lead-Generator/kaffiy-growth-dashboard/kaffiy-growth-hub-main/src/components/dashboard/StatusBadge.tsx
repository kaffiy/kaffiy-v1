import { cn } from '@/lib/utils';
import { Sparkles, Send, CheckCircle, XCircle, Clock, CalendarCheck2, CircleHelp } from 'lucide-react';

type Status = string;

interface StatusBadgeProps {
  status: Status;
}

const statusConfig: Record<string, { class: string; icon: React.ComponentType<{ className?: string }> }> = {
  'Ready': { class: 'badge-ready', icon: CheckCircle },
  'Sent': { class: 'badge-sent', icon: Send },
  'AI Analyzing': { class: 'badge-analyzing', icon: Sparkles },
  'Requested': { class: 'badge-analyzing', icon: Sparkles },
  'Accepted': { class: 'badge-sent', icon: CheckCircle },
  'Rejected': { class: 'badge-analyzing', icon: XCircle },
  'Demo Scheduled': { class: 'badge-demo', icon: CalendarCheck2 },
  'Not Sent': { class: 'badge-pending', icon: Clock },
  'Pending': { class: 'badge-pending', icon: Clock },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { class: 'badge-ready', icon: CircleHelp };
  const Icon = config.icon;

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
      config.class
    )}>
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}
