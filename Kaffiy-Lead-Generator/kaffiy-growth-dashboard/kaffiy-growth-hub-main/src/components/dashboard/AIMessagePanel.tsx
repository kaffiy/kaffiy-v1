import { X, Sparkles, MapPin, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from './StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { LeadRecord } from '@/types/leads';

interface AIMessagePanelProps {
  lead: LeadRecord;
  onClose: () => void;
}

export function AIMessagePanel({ lead, onClose }: AIMessagePanelProps) {
  const { toast } = useToast();
  const buildWhatsAppMessage = (currentLead: LeadRecord) => {
    if (currentLead['Ready Message']) {
      return currentLead['Ready Message'];
    }
    if (currentLead['AI Message']) {
      return currentLead['AI Message'];
    }
    const companyName = currentLead['Company Name'] || 'Kafe';
    const review = (currentLead['Last Review'] || '').replace(/["']/g, '');
    if (review) {
      return `Merhaba ${companyName}! Yorumunuzda bahsettiğiniz ${review} detayı çok hoşuma gitti. Kaffiy dijital sadakat sistemiyle misafirlerinize kolayca ödül sunmanıza yardımcı olabiliriz.`;
    }
    return `Merhaba ${companyName}! Kaffiy dijital sadakat sistemiyle misafirlerinize kolayca ödül sunmanıza yardımcı olabiliriz.`;
  };
  const initialMessage = buildWhatsAppMessage(lead);
  const [message, setMessage] = useState(initialMessage);

  // Update message when lead changes
  useEffect(() => {
    setMessage(buildWhatsAppMessage(lead));
  }, [lead]);

  const handleSendWhatsApp = () => {
    // Format phone number for WhatsApp (remove spaces and special chars)
    const formattedPhone = (lead.Phone || '').replace(/[\s\-\(\)]/g, '');
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `whatsapp://send?phone=${formattedPhone}&text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Opening WhatsApp",
      description: `Sending message to ${lead['Company Name'] || 'lead'}`,
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Side Panel */}
      <div className="side-panel animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyber-lime">
                <Sparkles className="h-5 w-5 text-cyber-lime-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">AI Message Composer</h2>
                <p className="text-xs text-muted-foreground">Personalized outreach</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {/* Lead Info */}
          <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-semibold text-foreground">{lead['Company Name'] || '-'}</h3>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {lead.City || '-'}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {lead.Phone || '-'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={lead['Phone Status'] || 'Pending'} />
              <StatusBadge status={lead['WhatsApp Status'] || 'Pending'} />
            </div>
          </div>

          {/* Last Review */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Last Customer Review
            </h4>
            <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
              <p className="text-sm text-foreground italic leading-relaxed">
                {lead['Last Review'] || 'Henüz bir yorum bulunmuyor.'}
              </p>
            </div>
          </div>

          {/* AI Generated Message */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-cyber-lime" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Generated AI Message
              </h4>
            </div>
            <div className="space-y-3">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[180px] bg-background border-cyber-lime/30 focus:border-cyber-lime resize-none"
                placeholder="AI-generated message will appear here..."
              />
              <p className="text-xs text-muted-foreground">
                ✨ This message mentions details from the customer's review for personalization
              </p>
            </div>
          </div>
        </div>

        {/* Footer - WhatsApp Button */}
        <div className="p-6 border-t border-border flex-shrink-0">
          <Button 
            onClick={handleSendWhatsApp}
            className="w-full h-12 bg-cyber-lime hover:bg-cyber-lime/90 text-cyber-lime-foreground font-semibold text-base btn-glow gap-2"
          >
            <svg 
              className="h-5 w-5" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Send via WhatsApp
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-3">
            Opens WhatsApp with the message pre-filled
          </p>
        </div>
      </div>
    </>
  );
}
