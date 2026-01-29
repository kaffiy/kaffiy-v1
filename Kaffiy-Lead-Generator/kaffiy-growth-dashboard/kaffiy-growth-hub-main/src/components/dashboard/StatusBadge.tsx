import { cn } from '@/lib/utils';
import { Sparkles, Send, CheckCircle, XCircle, Clock, CalendarCheck2, CircleHelp, PhoneOff } from 'lucide-react';

type Status = string;

interface StatusBadgeProps {
  status: Status;
  /** Show icon only (full text in tooltip on hover) */
  iconOnly?: boolean;
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
  'Number Not Found': { class: 'badge-analyzing', icon: PhoneOff },
  'Numara Bulunamadı': { class: 'badge-analyzing', icon: PhoneOff },
  'Interested': { class: 'badge-sent', icon: CheckCircle },
  'Error': { class: 'badge-analyzing', icon: XCircle },
};

export function StatusBadge({ status, iconOnly }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { class: 'badge-ready', icon: CircleHelp };
  const Icon = config.icon;

  const content = (
    <span
      className={cn(
        'inline-flex items-center rounded-full',
        iconOnly ? 'p-1' : 'gap-1.5 px-2.5 py-1 text-xs font-medium',
        config.class
      )}
      title={iconOnly ? status : undefined}
    >
      <Icon className={iconOnly ? 'h-3.5 w-3.5' : 'h-3 w-3'} />
      {!iconOnly && status}
    </span>
  );

  return content;
}
