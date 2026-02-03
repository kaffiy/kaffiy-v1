import { MessageSquare, RefreshCw, UserPlus, Calendar, RotateCcw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

interface ActivityItem {
  id: string;
  type: 'message_sent' | 'status_update' | 'lead_added' | 'demo_scheduled';
  description: string;
  cafeName: string;
  timestamp: Date;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  onReset?: () => void;
}

const activityConfig = {
  message_sent: {
    icon: MessageSquare,
    color: 'bg-cyber-lime',
  },
  status_update: {
    icon: RefreshCw,
    color: 'bg-[hsl(280,70%,60%)]',
  },
  lead_added: {
    icon: UserPlus,
    color: 'bg-accent',
  },
  demo_scheduled: {
    icon: Calendar,
    color: 'bg-[hsl(210,80%,55%)]',
  },
};

export function ActivityFeed({ activities, onReset }: ActivityFeedProps) {
  const { t } = useLanguage();
  return (
    <div className="chart-container animate-slide-up delay-400" style={{ animationFillMode: 'forwards', opacity: 0 }}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <h3 className="text-lg font-semibold text-foreground">{t('activity.successTimeline')}</h3>
        {onReset && (
          <Button variant="ghost" size="sm" className="h-7 text-xs shrink-0 gap-1" onClick={onReset}>
            <RotateCcw className="h-3 w-3" /> {t('activity.reset')}
          </Button>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-6">{t('activity.recentActions')}</p>
      
      <div className="space-y-0 custom-scrollbar max-h-[280px] overflow-y-auto pr-2">
        {activities.length === 0 && (
          <div className="text-sm text-muted-foreground py-6 text-center">
            {t('activity.waitingForData')}
          </div>
        )}
        {activities.map((activity) => {
          const config = activityConfig[activity.type];
          const Icon = config.icon;
          
          return (
            <div key={activity.id} className="activity-item">
              <div className={`activity-dot ${config.color}`}>
                <Icon className="h-3 w-3 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {activity.cafeName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
