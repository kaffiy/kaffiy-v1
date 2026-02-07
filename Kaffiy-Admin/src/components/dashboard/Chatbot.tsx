import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const mockMessages: Message[] = [
  {
    id: "1",
    text: "Merhaba! Size nasıl yardımcı olabilirim?",
    sender: "bot",
    timestamp: new Date(Date.now() - 120000),
  },
];

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Mock bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Anladım! Size yardımcı olmak için buradayım. Daha fazla bilgi verebilir misiniz?",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-xl z-50",
          "bg-gradient-to-br from-primary via-primary/95 to-primary/90",
          "hover:from-primary/95 hover:via-primary hover:to-primary",
          "text-primary-foreground border-2 border-primary-foreground/10",
          "transition-all duration-300 hover:scale-110 hover:shadow-2xl",
          "flex items-center justify-center p-0"
        )}
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <MessageCircle className="w-5 h-5" />
        )}
      </Button>

      {/* Chat Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md p-0 flex flex-col bg-gradient-to-b from-card/95 to-card border-l border-border/50 backdrop-blur-xl"
        >
          {/* Header */}
          <SheetHeader className="px-5 py-5 border-b border-border/30 bg-gradient-to-br from-primary/8 via-primary/5 to-transparent backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm border border-primary/20">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <SheetTitle className="text-base font-semibold text-foreground tracking-tight">
                  Yardım Chatbot
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  Çevrimiçi
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Messages Area */}
          <ScrollArea className="flex-1 px-5 py-5">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                    message.sender === "user" ? "justify-end" : "justify-start"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {message.sender === "bot" && (
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center flex-shrink-0 border border-primary/20 shadow-sm">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[78%] rounded-2xl px-4 py-3 shadow-sm",
                      message.sender === "user"
                        ? "bg-gradient-to-br from-primary to-primary/95 text-primary-foreground rounded-br-md"
                        : "bg-gradient-to-br from-muted/60 to-muted/40 text-foreground border border-border/30 rounded-bl-md backdrop-blur-sm"
                    )}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <span className={cn(
                      "text-[10px] mt-1.5 block",
                      message.sender === "user" 
                        ? "text-primary-foreground/70" 
                        : "text-muted-foreground/70"
                    )}>
                      {message.timestamp.toLocaleTimeString("tr-TR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {message.sender === "user" && (
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary/25 to-primary/15 flex items-center justify-center flex-shrink-0 border border-primary/30 shadow-sm">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          <div className="px-5 py-4 border-t border-border/30 bg-gradient-to-b from-muted/30 to-card/60 backdrop-blur-sm">
            <div className="flex flex-wrap gap-2 mb-3">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs rounded-xl border-border/40 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all duration-200 bg-background/50"
                onClick={() => {
                  const text = "Kampanya nasıl oluşturulur?";
                  setInputValue(text);
                  setTimeout(() => handleSend(), 100);
                }}
              >
                <Sparkles className="w-3 h-3 mr-1.5" />
                Kampanya
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs rounded-xl border-border/40 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all duration-200 bg-background/50"
                onClick={() => {
                  const text = "Raporları nasıl görüntülerim?";
                  setInputValue(text);
                  setTimeout(() => handleSend(), 100);
                }}
              >
                Raporlar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs rounded-xl border-border/40 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all duration-200 bg-background/50"
                onClick={() => {
                  const text = "Premium nedir?";
                  setInputValue(text);
                  setTimeout(() => handleSend(), 100);
                }}
              >
                Premium
              </Button>
            </div>

            {/* Input Area */}
            <div className="flex gap-2.5">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Mesajınızı yazın..."
                className="flex-1 h-10 rounded-xl border-border/40 bg-background/80 focus:bg-background focus:border-primary/40 transition-all duration-200 text-sm"
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="h-10 w-10 p-0 rounded-xl bg-gradient-to-br from-primary to-primary/90 hover:from-primary/95 hover:to-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
