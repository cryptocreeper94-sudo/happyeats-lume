import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  Send, 
  X, 
  Volume2, 
  VolumeX,
  Loader2,
  Bot,
  User,
  Mic,
  MicOff
} from "lucide-react";
import { useLanguage } from "@/i18n/context";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  assistantType: "business" | "driver";
  userId?: number;
}

export function AIChat({ assistantType, userId = 1 }: AIChatProps) {
  const { lang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const assistantName = assistantType === "business" ? t('aiChat.businessAssistant') : t('aiChat.roadBuddy');
  const assistantColor = assistantType === "business" ? "bg-purple-600" : "bg-emerald-600";
  const welcomeMessage = assistantType === "business" 
    ? t('aiChat.welcomeBusiness')
    : t('aiChat.welcomeDriver');

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: welcomeMessage,
        timestamp: new Date()
      }]);
    } else if (isOpen && messages.length === 1 && messages[0].id === "welcome") {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: welcomeMessage,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, welcomeMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = lang === 'es' ? 'es-ES' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [lang]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const cleanTextForSpeech = (text: string): string => {
    return text
      .replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]+/g, '')
      .replace(/[\u2600-\u27BF]/g, '')
      .replace(/[*#_~`]/g, '')
      .replace(/\n+/g, '. ')
      .trim();
  };

  const speakText = async (text: string) => {
    if (!voiceEnabled) return;
    
    const cleanText = cleanTextForSpeech(text);
    if (!cleanText) return;

    try {
      const response = await fetch("/api/ai/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanText })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.pause();
        }
        
        audioRef.current = new Audio(audioUrl);
        audioRef.current.play();
      }
    } catch (error) {
      console.error("Voice synthesis failed:", error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          assistantType,
          userId,
          conversationId,
          lang
        })
      });

      if (!response.ok) throw new Error("Chat request failed");

      const data = await response.json();
      
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (voiceEnabled) {
        speakText(data.response);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: t('aiChat.errorConnection'),
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-44 right-4 z-50">
        <Button
          data-testid="button-open-ai-chat"
          onClick={() => setIsOpen(true)}
          className={`w-12 h-12 rounded-full ${assistantColor} hover:opacity-90 shadow-xl flex items-center justify-center`}
        >
          <div className="relative">
            {assistantType === "driver" ? (
              <span className="text-xl">🚛</span>
            ) : (
              <span className="text-xl">💼</span>
            )}
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-pulse" />
          </div>
        </Button>
        <p className="text-[9px] text-center text-muted-foreground mt-0.5">
          {assistantType === "driver" ? t('aiChat.roadBuddy') : t('aiChat.askAi')}
        </p>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-20 right-4 w-[calc(100vw-2rem)] sm:w-96 h-[min(500px,70vh)] flex flex-col bg-slate-900/90 backdrop-blur-md border-slate-700/50 shadow-2xl z-50 animate-in slide-in-from-right-10 duration-300">
      <div className={`flex items-center justify-between p-4 ${assistantColor} rounded-t-lg`}>
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <span className="font-semibold">{assistantName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            data-testid="button-toggle-voice"
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-white/20"
            onClick={() => {
              setVoiceEnabled(!voiceEnabled);
              if (audioRef.current) {
                audioRef.current.pause();
              }
            }}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button
            data-testid="button-close-ai-chat"
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-white/20"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <div className={`w-8 h-8 rounded-full ${assistantColor} flex items-center justify-center flex-shrink-0`}>
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-100"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 justify-start">
              <div className={`w-8 h-8 rounded-full ${assistantColor} flex items-center justify-center`}>
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-700 p-3 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          {recognitionRef.current && (
            <Button
              data-testid="button-voice-input"
              variant="outline"
              size="icon"
              className={`flex-shrink-0 ${isListening ? "bg-red-600 border-red-600" : ""}`}
              onClick={toggleListening}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          )}
          <Input
            data-testid="input-ai-message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('aiChat.placeholder')}
            className="bg-slate-800 border-slate-600"
            disabled={isLoading}
          />
          <Button
            data-testid="button-send-message"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className={assistantColor}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
