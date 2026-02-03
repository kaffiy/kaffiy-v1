import { cn } from '@/lib/utils';
import { Sparkles, Send, CheckCircle, XCircle, Clock, CalendarCheck2, CircleHelp, PhoneOff, AlertCircle, Mail } from 'lucide-react';

type Status = string;

interface StatusBadgeProps {
  status: Status;
  /** Show icon only (full text in tooltip on hover) */
  iconOnly?: boolean;
}

const statusConfig: Record<string, { class: string; icon: React.ComponentType<{ className?: string }> }> = {
  'Ready': { class: 'badge-ready', icon: CheckCircle },
  'Sent': { class: 'badge-sent', icon: Send },
  'In Process': { class: 'badge-inprocess', icon: Clock },
  'İşlemde': { class: 'badge-inprocess', icon: Clock },
  'AI Analyzing': { class: 'badge-analyzing', icon: Sparkles },
  'Requested': { class: 'badge-analyzing', icon: Sparkles },
  'Accepted': { class: 'badge-sent', icon: CheckCircle },
  'Rejected': { class: 'badge-rejected', icon: XCircle },
  'Reddedildi': { class: 'badge-rejected', icon: XCircle },
  'Demo Scheduled': { class: 'badge-demo', icon: CalendarCheck2 },
  'Action Required': { class: 'bg-red-500/10 text-red-500 border border-red-500/20', icon: AlertCircle },
  'Kritik Onay': { class: 'bg-red-500/10 text-red-500 border border-red-500/20', icon: AlertCircle },
  'Email Requested': { class: 'bg-purple-500/10 text-purple-600 border border-purple-500/30', icon: Mail },
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
