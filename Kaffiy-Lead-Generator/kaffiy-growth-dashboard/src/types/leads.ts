export interface LeadRecord {
  ID?: string;
  "Company Name"?: string;
  City?: string;
  Phone?: string;
  "Phone Status"?: string;
  "WhatsApp Status"?: string;
  "Last Review"?: string;
  "AI Message"?: string;
  "Ready Message"?: string;
  "Active Strategy"?: string;
  "Message Flow"?: 'Single' | 'Two-step';
  "Two-step Step"?: '' | 'greeting_sent' | 'main_sent';
  selected_strategy?: string;
  sent_strategy?: string;
  last_activity_at?: string;
  [key: string]: string | undefined;
}
