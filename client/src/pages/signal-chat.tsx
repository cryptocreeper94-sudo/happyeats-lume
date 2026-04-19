import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Send, Hash, Users, LogIn, UserPlus, Eye, EyeOff,
  Wifi, WifiOff, ChevronLeft, Shield, Loader2, LogOut, AtSign, Languages
} from 'lucide-react';
import { useLanguage } from '@/i18n/context';

interface ChatUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarColor: string;
  role: string;
  trustLayerId: string;
}

interface ChatChannel {
  id: string;
  name: string;
  description: string;
  category: string;
  isDefault: boolean;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  content: string;
  username: string;
  displayName: string;
  avatarColor: string;
  trustLayerId: string;
  channelId: string;
  createdAt: string;
  role?: string;
  userId?: string;
}

interface OnlineUser {
  userId: string;
  username: string;
  displayName: string;
  avatarColor: string;
}

const TOKEN_KEY = 'signal_chat_token';
const USER_KEY = 'signal_chat_user';

function getStoredAuth(): { token: string | null; user: ChatUser | null } {
  try {
    const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    const user = userStr ? JSON.parse(userStr) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

function storeAuth(token: string, user: ChatUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

function UserAvatar({ username, color, size = 'md' }: { username: string; color: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base' };
  return (
    <div 
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
      style={{ backgroundColor: color }}
      data-testid={`avatar-${username}`}
    >
      {username.charAt(0).toUpperCase()}
    </div>
  );
}

function AuthScreen({ onAuth }: { onAuth: (token: string, user: ChatUser) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' 
        ? '/api/chat/auth/login' 
        : '/api/chat/auth/register';
      
      const body = mode === 'login' 
        ? { username, password, rememberMe } 
        : { username, email, password, displayName: displayName || username, rememberMe };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      
      if (!data.success) {
        setError(data.error || 'Authentication failed');
        return;
      }

      if (rememberMe) {
        storeAuth(data.token, data.user);
      } else {
        sessionStorage.setItem(TOKEN_KEY, data.token);
        sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }
      onAuth(data.token, data.user);
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-[0_0_40px_rgba(0,255,255,0.3)]">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent" data-testid="signal-chat-title">
            Signal Chat
          </h1>
          <p className="text-slate-400 text-sm mt-2">Trust Layer Network Messaging</p>
        </div>

        <div className="relative rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 shadow-2xl">
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyan-500/20 via-purple-500/10 to-cyan-500/20 -z-10 blur-sm opacity-50" />
          
          <div className="flex gap-1 mb-6 p-1 bg-slate-800/50 rounded-lg">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
                mode === 'login' 
                  ? 'bg-cyan-500/20 text-cyan-400 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-300'
              }`}
              data-testid="tab-login"
            >
              <LogIn className="w-4 h-4 inline mr-1.5" />Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
                mode === 'register' 
                  ? 'bg-cyan-500/20 text-cyan-400 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-300'
              }`}
              data-testid="tab-register"
            >
              <UserPlus className="w-4 h-4 inline mr-1.5" />Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Username</label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                  required
                  data-testid="input-username"
                />
              </div>
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="How others see you"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                    data-testid="input-displayname"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                    required
                    data-testid="input-email"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? '8+ chars, 1 uppercase, 1 special' : 'Enter password'}
                  className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                  required
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  data-testid="toggle-password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer group" data-testid="label-remember-me">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-white/20 bg-slate-800/50 text-cyan-500 focus:ring-cyan-500/30 cursor-pointer" />
              <span className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                Keep me signed in for 30 days
                <span className="block text-[10px] text-slate-500 mt-0.5">Anyone with access to this device can use your account. Only use on personal devices.</span>
              </span>
            </label>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2"
                  data-testid="auth-error"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold hover:from-cyan-400 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(0,255,255,0.2)]"
              data-testid="btn-auth-submit"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Shield className="w-3 h-3" />
            <span>Secured by Trust Layer SSO</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ChannelSidebar({ 
  groupedChannels, 
  activeChannelId, 
  onSelect, 
  onClose 
}: { 
  groupedChannels: Record<string, ChatChannel[]>; 
  activeChannelId: string | null; 
  onSelect: (id: string) => void;
  onClose?: () => void;
}) {
  const categoryLabels: Record<string, string> = {
    ecosystem: 'Ecosystem',
    'app-support': 'App Support',
    community: 'Community',
    general: 'General',
  };

  return (
    <div className="p-3">
      {onClose && (
        <button onClick={onClose} className="mb-3 p-2 rounded-lg hover:bg-slate-800/50 text-slate-400 md:hidden" data-testid="close-sidebar">
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      <div className="flex items-center gap-2 mb-4 px-2">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
          <MessageSquare className="w-3 h-3 text-white" />
        </div>
        <span className="text-sm font-bold text-white">Channels</span>
      </div>
      {Object.entries(groupedChannels).map(([category, chans]) => (
        <div key={category} className="mb-4">
          <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 mb-1.5">
            {categoryLabels[category] || category}
          </h4>
          {chans.map(ch => (
            <button
              key={ch.id}
              onClick={() => onSelect(ch.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-all ${
                ch.id === activeChannelId
                  ? 'bg-cyan-500/15 text-cyan-400'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
              data-testid={`channel-${ch.name}`}
            >
              <Hash className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{ch.name}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function ChatApp({ initialToken, initialUser }: { initialToken: string; initialUser: ChatUser }) {
  const { lang, t } = useLanguage();
  const [user] = useState<ChatUser>(initialUser);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [translating, setTranslating] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tokenRef = useRef(initialToken);

  const translateMessage = async (msgId: string, text: string) => {
    if (translations[msgId]) {
      setTranslations(prev => { const next = { ...prev }; delete next[msgId]; return next; });
      return;
    }
    setTranslating(msgId);
    try {
      const targetLang = lang === 'es' ? 'en' : 'es';
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang }),
      });
      const data = await res.json();
      if (data.translation) {
        setTranslations(prev => ({ ...prev, [msgId]: data.translation }));
      }
    } catch {}
    setTranslating(null);
  };

  useEffect(() => {
    fetch('/api/chat/channels')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.channels) {
          setChannels(data.channels);
          const defaultChannel = data.channels.find((c: ChatChannel) => c.isDefault) || data.channels[0];
          if (defaultChannel) setActiveChannelId(defaultChannel.id);
        }
      })
      .catch(() => {});
  }, []);

  const connectWebSocket = useCallback((channelId: string) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws/chat`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join', token: tokenRef.current, channelId }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'history':
            setMessages(data.messages || []);
            setConnected(true);
            break;
          case 'message':
            setMessages(prev => {
              if (prev.some(m => m.id === data.id)) return prev;
              return [...prev, data];
            });
            break;
          case 'presence':
            setConnected(true);
            break;
          case 'user_joined':
            setOnlineUsers(prev => {
              if (prev.some(u => u.userId === data.userId)) return prev;
              return [...prev, { userId: data.userId, username: data.username, displayName: data.displayName || data.username, avatarColor: data.avatarColor || '#06b6d4' }];
            });
            break;
          case 'user_left':
            setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
            break;
          case 'typing':
            if (data.username !== user.username) {
              setTypingUsers(prev => {
                if (prev.includes(data.username)) return prev;
                return [...prev, data.username];
              });
              setTimeout(() => {
                setTypingUsers(prev => prev.filter(u => u !== data.username));
              }, 3000);
            }
            break;
          case 'error':
            if (data.message?.includes('Invalid') || data.message?.includes('expired')) {
              clearAuth();
              window.location.reload();
            }
            break;
        }
      } catch {}
    };

    ws.onclose = () => {
      setConnected(false);
      reconnectRef.current = setTimeout(() => {
        if (activeChannelId) connectWebSocket(activeChannelId);
      }, 3000);
    };

    ws.onerror = () => ws.close();
  }, [user.username, activeChannelId]);

  useEffect(() => {
    if (activeChannelId) {
      setMessages([]);
      setTypingUsers([]);
      connectWebSocket(activeChannelId);
    }
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [activeChannelId, connectWebSocket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: 'message', content: input.trim() }));
    setInput('');
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const sendTyping = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'typing' }));
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {}, 2000);
  };

  const switchChannel = (channelId: string) => {
    if (channelId === activeChannelId) return;
    setActiveChannelId(channelId);
    setShowSidebar(false);
  };

  const handleLogout = () => {
    wsRef.current?.close();
    clearAuth();
    window.location.reload();
  };

  const activeChannel = channels.find(c => c.id === activeChannelId);

  const groupedChannels = channels.reduce((acc, ch) => {
    const cat = ch.category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ch);
    return acc;
  }, {} as Record<string, ChatChannel[]>);

  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden" data-testid="signal-chat-app">
      <header className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-800/50 text-slate-400"
            data-testid="toggle-sidebar"
          >
            <Hash className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,255,0.2)]">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Signal Chat</h1>
            <div className="flex items-center gap-1.5">
              {connected ? (
                <><Wifi className="w-3 h-3 text-green-400" /><span className="text-[10px] text-green-400">Connected</span></>
              ) : (
                <><WifiOff className="w-3 h-3 text-red-400" /><span className="text-[10px] text-red-400">Reconnecting</span></>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="p-2 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 transition-colors relative"
            data-testid="toggle-members"
          >
            <Users className="w-5 h-5" />
            {onlineUsers.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 text-[9px] text-white flex items-center justify-center font-bold">
                {onlineUsers.length}
              </span>
            )}
          </button>
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <UserAvatar username={user.username} color={user.avatarColor} size="sm" />
            <div className="hidden sm:block">
              <div className="text-xs font-medium text-white">{user.displayName}</div>
              <div className="text-[10px] text-slate-500">{user.trustLayerId}</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-slate-800/50 text-slate-500 hover:text-red-400 transition-colors"
              data-testid="btn-logout"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="absolute inset-0 z-30 md:hidden"
            >
              <div className="absolute inset-0 bg-black/60" onClick={() => setShowSidebar(false)} />
              <div className="relative w-64 h-full bg-slate-900 border-r border-white/5 overflow-y-auto">
                <ChannelSidebar
                  groupedChannels={groupedChannels}
                  activeChannelId={activeChannelId}
                  onSelect={switchChannel}
                  onClose={() => setShowSidebar(false)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <aside className="hidden md:block w-60 bg-slate-900/50 border-r border-white/5 overflow-y-auto shrink-0">
          <ChannelSidebar
            groupedChannels={groupedChannels}
            activeChannelId={activeChannelId}
            onSelect={switchChannel}
          />
        </aside>

        <main className="flex-1 flex flex-col min-w-0">
          {activeChannel && (
            <div className="px-4 py-2.5 border-b border-white/5 bg-slate-900/30 shrink-0">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-slate-500" />
                <span className="font-semibold text-white text-sm">{activeChannel.name}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{activeChannel.description}</p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1" data-testid="chat-messages">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <Hash className="w-12 h-12 mb-3 text-slate-700" />
                <p className="text-sm font-medium">Welcome to #{activeChannel?.name || 'channel'}</p>
                <p className="text-xs mt-1">Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const prevMsg = i > 0 ? messages[i - 1] : null;
                const sameAuthor = prevMsg?.username === msg.username;
                const timeDiff = prevMsg ? (new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime()) : Infinity;
                const grouped = sameAuthor && timeDiff < 5 * 60 * 1000;
                
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 px-2 py-0.5 hover:bg-slate-800/30 rounded-lg group ${!grouped ? 'mt-3' : ''}`}
                    data-testid={`message-${msg.id}`}
                  >
                    {!grouped ? (
                      <UserAvatar username={msg.username} color={msg.avatarColor || '#06b6d4'} size="md" />
                    ) : (
                      <div className="w-9 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      {!grouped && (
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className="font-semibold text-sm text-white">{msg.displayName || msg.username}</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                      <p className="text-sm text-slate-200 break-words">{msg.content}</p>
                      {translations[msg.id] && (
                        <p className="text-sm text-cyan-300/80 break-words mt-1 pl-2 border-l-2 border-cyan-500/30 italic">{translations[msg.id]}</p>
                      )}
                      <button
                        onClick={() => translateMessage(msg.id, msg.content)}
                        className="hidden group-hover:inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-cyan-400 mt-0.5 transition-colors"
                        data-testid={`button-translate-${msg.id}`}
                      >
                        {translating === msg.id ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Languages className="size-3" />
                        )}
                        {translations[msg.id] ? t("signalChat.hideTranslation") : t("common.translateMessage")}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <AnimatePresence>
            {typingUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 pb-1"
              >
                <span className="text-xs text-cyan-400 animate-pulse">
                  {typingUsers.length === 1 
                    ? `${typingUsers[0]} is typing...` 
                    : `${typingUsers.join(', ')} are typing...`}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="px-4 py-3 border-t border-white/5 bg-slate-900/20 shrink-0">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (e.target.value) sendTyping();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={activeChannel ? `Message #${activeChannel.name}` : 'Select a channel...'}
                className="flex-1 px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all text-sm"
                disabled={!connected}
                data-testid="chat-input"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || !connected}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:from-cyan-400 hover:to-purple-500 transition-all shadow-[0_2px_12px_rgba(0,255,255,0.15)]"
                data-testid="chat-send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>

        <AnimatePresence>
          {showMembers && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-slate-900/50 border-l border-white/5 overflow-hidden shrink-0"
            >
              <div className="p-4 w-60">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Online — {onlineUsers.length}
                </h3>
                <div className="space-y-2">
                  {onlineUsers.map(u => (
                    <div key={u.userId} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800/30" data-testid={`member-${u.userId}`}>
                      <div className="relative">
                        <UserAvatar username={u.username} color={u.avatarColor} size="sm" />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-slate-900" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm text-white truncate">{u.displayName}</div>
                        <div className="text-[10px] text-slate-500">@{u.username}</div>
                      </div>
                    </div>
                  ))}
                  {onlineUsers.length === 0 && (
                    <p className="text-xs text-slate-600 text-center py-4">No one else online</p>
                  )}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function SignalChatPage() {
  const [authState, setAuthState] = useState<{ token: string | null; user: ChatUser | null }>(getStoredAuth);
  const [verifying, setVerifying] = useState(!!authState.token);

  useEffect(() => {
    document.title = 'Signal Chat | Trust Layer';
  }, []);

  useEffect(() => {
    if (!authState.token) {
      setVerifying(false);
      return;
    }
    fetch('/api/chat/auth/me', {
      headers: { 'Authorization': `Bearer ${authState.token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.user) {
          setAuthState({ token: authState.token, user: data.user });
        } else {
          clearAuth();
          setAuthState({ token: null, user: null });
        }
      })
      .catch(() => {
        clearAuth();
        setAuthState({ token: null, user: null });
      })
      .finally(() => setVerifying(false));
  }, []);

  if (verifying) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!authState.token || !authState.user) {
    return (
      <AuthScreen onAuth={(token, user) => setAuthState({ token, user })} />
    );
  }

  return <ChatApp initialToken={authState.token} initialUser={authState.user} />;
}
