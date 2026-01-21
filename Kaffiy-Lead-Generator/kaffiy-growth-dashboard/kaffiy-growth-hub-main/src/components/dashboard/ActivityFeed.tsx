import { MessageSquare, RefreshCw, UserPlus, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'message_sent' | 'status_update' | 'lead_added' | 'demo_scheduled';
  description: string;
  cafeName: string;
  timestamp: Date;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
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

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="chart-container animate-slide-up delay-400" style={{ animationFillMode: 'forwards', opacity: 0 }}>
      <h3 className="text-lg font-semibold text-foreground mb-1">Success Timeline</h3>
      <p className="text-sm text-muted-foreground mb-6">Recent actions</p>
      
      <div className="space-y-0 custom-scrollbar max-h-[280px] overflow-y-auto pr-2">
        {activities.length === 0 && (
          <div className="text-sm text-muted-foreground py-6 text-center">
            Veri bekleniyor...
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
