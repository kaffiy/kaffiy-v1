import { X, Sparkles, MapPin, Phone, MessageCircle, Globe, Mail, ExternalLink, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from './StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { LeadRecord } from '@/types/leads';
import { useLanguage } from '@/context/LanguageContext';

const STRATEGIES = ['A', 'B', 'C', 'D'] as const;
const TWO_STEP_GREETING = 'Merhabalar kolay gelsin';
const STRATEGY_A_MAIN_MESSAGE = `Merhabalar, ben Oguz :) Tech İstanbul bünyesinde, butik kafelerin büyük zincirlerin veri gücüyle rekabet etmesini sağlayan bir Akıllı Ara Katman geliştirdik. Şu an sistemin tüketici alışkanlığı tahminleme algoritmasını test edecek 10 öncü işletme seçiyoruz. Müşteri yorumlarınızı çok olumlu bulduk. Bu pilot programda yer alıp sistemimizi yorumlamanızı çok isteriz. Kısaca bahsetmemi ister misiniz?`;

function getStrategyTemplate(lead: LeadRecord, strategy: 'A' | 'B' | 'C' | 'D'): string {
  if (strategy === 'A') return STRATEGY_A_MAIN_MESSAGE;
  const companyName = lead['Company Name'] || 'Kafe';
  const review = (lead['Last Review'] || '').replace(/["']/g, '');
  if (review) {
    return `Merhaba ${companyName}! Yorumunuzda bahsettiğiniz ${review} detayı çok hoşuma gitti. Kaffiy müşteri geri kazanma ve dijital sadakat sistemiyle misafirlerinize kolayca ödül sunmanıza yardımcı olabiliriz.`;
  }
  return `Merhaba ${companyName}! Kaffiy müşteri geri kazanma ve dijital sadakat sistemiyle misafirlerinize kolayca ödül sunmanıza yardımcı olabiliriz.`;
}

interface AIMessagePanelProps {
  lead: LeadRecord;
  onClose: () => void;
  onUpdateLead?: (lead: LeadRecord, updates: Partial<LeadRecord>) => void;
}

export function AIMessagePanel({ lead, onClose, onUpdateLead }: AIMessagePanelProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedStrategy, setSelectedStrategy] = useState<'A' | 'B' | 'C' | 'D'>(
    (lead['Active Strategy'] as 'A' | 'B' | 'C' | 'D') || 'A'
  );
  const messageFlow = (lead['Message Flow'] || 'Single') as 'Single' | 'Two-step';
  const twoStepStep = (lead['Two-step Step'] || '') as '' | 'greeting_sent' | 'main_sent';
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const buildWhatsAppMessage = (currentLead: LeadRecord) => {
    if (currentLead['Ready Message']) {
      return currentLead['Ready Message'];
    }
    if (currentLead['AI Message']) {
      return currentLead['AI Message'];
    }
    if ((currentLead['Active Strategy'] || 'A') === 'A') {
      return STRATEGY_A_MAIN_MESSAGE;
    }
    const companyName = currentLead['Company Name'] || 'Kafe';
    const review = (currentLead['Last Review'] || '').replace(/["']/g, '');
    if (review) {
      return `Merhaba ${companyName}! Yorumunuzda bahsettiğiniz ${review} detayı çok hoşuma gitti. Kaffiy müşteri geri kazanma ve dijital sadakat sistemiyle misafirlerinize kolayca ödül sunmanıza yardımcı olabiliriz.`;
    }
    return `Merhaba ${companyName}! Kaffiy müşteri geri kazanma ve dijital sadakat sistemiyle misafirlerinize kolayca ödül sunmanıza yardımcı olabiliriz.`;
  };
  const initialMessage = buildWhatsAppMessage(lead);
  const [message, setMessage] = useState(initialMessage);

  // Update message when lead changes
  useEffect(() => {
    setMessage(buildWhatsAppMessage(lead));
    setSelectedStrategy((lead['Active Strategy'] as 'A' | 'B' | 'C' | 'D') || 'A');
  }, [lead]);

  const handleCreateMessage = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/regenerate_message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cafeName: lead['Company Name'],
          city: lead.City,
          review: lead['Last Review'],
          strategy: selectedStrategy,
          leadId: lead.ID,
          phone: lead.Phone,
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || t('table.messageError'));
      }
      const data = await response.json();
      const generated = data.message || '';
      if (generated) {
        setMessage(generated);
        onUpdateLead?.(lead, { 'Ready Message': generated, 'Active Strategy': selectedStrategy });
        toast({ title: t('panel.createMessage'), description: t('panel.messageType') + ' ' + selectedStrategy });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : t('table.messageError'),
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const sendMessageToWhatsApp = (textToSend: string, stepUpdate?: '' | 'greeting_sent' | 'main_sent') => {
    if (isSendingWhatsApp) return;
    setIsSendingWhatsApp(true);
    setTimeout(() => setIsSendingWhatsApp(false), 5000);

    const formattedPhone = (lead.Phone || '').replace(/[\s\-\(\)]/g, '');
    const encodedMessage = encodeURIComponent(textToSend);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');

    onUpdateLead?.(lead, {
      'WhatsApp Status': 'Pending',
      'Ready Message': textToSend,
      ...(stepUpdate !== undefined && { 'Two-step Step': stepUpdate }),
    });

    fetch('/api/request_press_enter', { method: 'POST' }).catch(() => {});
    fetch('/api/log_sent_message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: lead['Company Name'],
        phone: lead.Phone,
        message: textToSend,
      }),
    }).catch(() => {});

    toast({
      title: t('panel.whatsappOpening'),
      description: t('panel.whatsappEnterDesc'),
    });
  };

  const handleSendGreeting = () => {
    sendMessageToWhatsApp(TWO_STEP_GREETING, 'greeting_sent');
  };

  const handleSendMainMessage = () => {
    const mainText = selectedStrategy === 'A' ? STRATEGY_A_MAIN_MESSAGE : message;
    sendMessageToWhatsApp(mainText, 'main_sent');
  };

  const handleSendWhatsApp = () => {
    if (messageFlow === 'Two-step') {
      if (twoStepStep !== 'greeting_sent') {
        handleSendGreeting();
      } else {
        handleSendMainMessage();
      }
    } else {
      sendMessageToWhatsApp(message);
    }
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
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {lead.City || '-'}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                {lead.Phone || '-'}
              </span>
              {lead.Website && (
                <a
                  href={lead.Website.startsWith('http') ? lead.Website : `https://${lead.Website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-primary hover:underline truncate max-w-full"
                  title="Web sitesini aç"
                >
                  <Globe className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{lead.Website.replace(/^https?:\/\//i, '')}</span>
                  <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
                </a>
              )}
              {lead.Mail && (
                <a
                  href={`mailto:${lead.Mail}`}
                  className="flex items-center gap-1.5 text-primary hover:underline truncate max-w-full"
                  title="E-posta gönder"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{lead.Mail}</span>
                </a>
              )}
              {lead.Instagram && (
                <a
                  href={lead.Instagram.startsWith('http') ? lead.Instagram : `https://${lead.Instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-primary hover:underline truncate max-w-full"
                  title="Instagram profilini aç"
                >
                  <span className="text-xs font-medium shrink-0">IG</span>
                  <span className="truncate">{lead.Instagram.replace(/^https?:\/\/(www\.)?instagram\.com\/?/i, '')}</span>
                  <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
                </a>
              )}
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
                {lead['Last Review'] || t('panel.noReviewYet')}
              </p>
            </div>
          </div>

          {/* Message flow (Single vs Two-step) */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('panel.messageFlow')}
            </h4>
            <Select
              value={messageFlow}
              onValueChange={(v) => onUpdateLead?.(lead, { 'Message Flow': v as 'Single' | 'Two-step' })}
            >
              <SelectTrigger className="w-full max-w-[260px] h-9 text-sm border-border/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Single" className="text-sm">{t('panel.singleMessage')}</SelectItem>
                <SelectItem value="Two-step" className="text-sm">{t('panel.twoStepGreetingFirst')}</SelectItem>
              </SelectContent>
            </Select>
            {messageFlow === 'Two-step' && (
              <p className="text-xs text-muted-foreground">{t('table.twoStepHint')}</p>
            )}
          </div>

          {/* Message type & preparation (strategy A/B/C/D) */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyber-lime" />
              {t('panel.messageType')} / {t('table.selectStrategy')}
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={selectedStrategy}
                onValueChange={(v) => {
                  const s = v as 'A' | 'B' | 'C' | 'D';
                  setSelectedStrategy(s);
                  const template = getStrategyTemplate(lead, s);
                  setMessage(template);
                  onUpdateLead?.(lead, { 'Active Strategy': s, 'Ready Message': template });
                }}
              >
                <SelectTrigger className="w-[200px] h-9 text-sm border-border/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STRATEGIES.map((s) => (
                    <SelectItem key={s} value={s} className="text-sm">
                      {t(`table.strategy${s}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCreateMessage}
                disabled={isGenerating}
                className="h-9 gap-1.5 border-cyber-lime/50 text-cyber-lime hover:bg-cyber-lime/10"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {isGenerating ? '…' : t('panel.createMessage')}
              </Button>
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

        {/* Footer - WhatsApp Button(s) */}
        <div className="p-6 border-t border-border flex-shrink-0 space-y-3">
          {messageFlow === 'Two-step' ? (
            <>
              <div className="flex flex-col gap-2">
                {twoStepStep !== 'greeting_sent' ? (
                  <Button
                    type="button"
                    onClick={handleSendGreeting}
                    disabled={isSendingWhatsApp}
                    className="w-full h-12 bg-cyber-lime hover:bg-cyber-lime/90 text-cyber-lime-foreground font-semibold text-base btn-glow gap-2"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    {t('panel.step1Greeting')}: {t('panel.sendGreeting')}
                  </Button>
                ) : (
                  <>
                    <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      {t('panel.step1Greeting')} — {t('panel.greetingSent')}
                    </div>
                    <Button
                      type="button"
                      onClick={handleSendMainMessage}
                      disabled={isSendingWhatsApp}
                      className="w-full h-12 bg-cyber-lime hover:bg-cyber-lime/90 text-cyber-lime-foreground font-semibold text-base btn-glow gap-2"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      {t('panel.step2MainMessage')}: {t('panel.sendMainMessage')}
                    </Button>
                  </>
                )}
              </div>
            </>
          ) : (
            <Button
              type="button"
              onClick={handleSendWhatsApp}
              disabled={isSendingWhatsApp}
              className="w-full h-12 bg-cyber-lime hover:bg-cyber-lime/90 text-cyber-lime-foreground font-semibold text-base btn-glow gap-2"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Send via WhatsApp
            </Button>
          )}
          <p className="text-xs text-center text-muted-foreground">
            {messageFlow === 'Two-step'
              ? (twoStepStep !== 'greeting_sent' ? 'Önce selam gider; ikinci tıklamada ana mesaj gider.' : 'Ana mesajı gönder (A/B/C/D).')
              : 'Opens WhatsApp with the message pre-filled'}
          </p>
        </div>
      </div>
    </>
  );
}
