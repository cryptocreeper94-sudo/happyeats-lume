import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MessageSquare, Send, Hash, Users, LogIn, UserPlus, Eye, EyeOff,
  Wifi, WifiOff, ChevronLeft, Shield, Loader2, LogOut, AtSign, X
} from 'lucide-react';

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
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
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
}

function UserAvatar({ username, color, size = 'sm' }: { username: string; color: string; size?: 'sm' | 'md' }) {
  const sizes = { sm: 'w-6 h-6 text-[10px]', md: 'w-8 h-8 text-xs' };
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
      style={{ backgroundColor: color }}
    >
      {username.charAt(0).toUpperCase()}
    </div>
  );
}

function PanelAuth({ onAuth }: { onAuth: (token: string, user: ChatUser) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/chat/auth/login' : '/api/chat/auth/register';
      const body = mode === 'login'
        ? { username, password }
        : { username, email, password, displayName: displayName || username };
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
      storeAuth(data.token, data.user);
      onAuth(data.token, data.user);
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-center py-4 px-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center mx-auto mb-2 shadow-[0_0_20px_rgba(0,255,255,0.3)]">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-base font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Signal Chat
        </h2>
        <p className="text-slate-500 text-[10px] mt-0.5">Trust Layer Network</p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="flex gap-1 mb-4 p-0.5 bg-slate-800/50 rounded-lg">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 rounded-md text-xs font-medium transition-all ${
              mode === 'login' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-slate-300'
            }`}
            data-testid="panel-tab-login"
          >
            <LogIn className="w-3 h-3 inline mr-1" />Sign In
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2 rounded-md text-xs font-medium transition-all ${
              mode === 'register' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-slate-300'
            }`}
            data-testid="panel-tab-register"
          >
            <UserPlus className="w-3 h-3 inline mr-1" />Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[10px] text-slate-400 mb-0.5 block">Username</label>
            <div className="relative">
              <AtSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-8 pr-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
                required
                data-testid="panel-input-username"
              />
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="text-[10px] text-slate-400 mb-0.5 block">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How others see you"
                  className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
                  data-testid="panel-input-displayname"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 mb-0.5 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
                  required
                  data-testid="panel-input-email"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-[10px] text-slate-400 mb-0.5 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? '8+ chars, 1 upper, 1 special' : 'Password'}
                className="w-full px-3 py-2 pr-9 bg-slate-800/50 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
                required
                data-testid="panel-input-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm font-semibold disabled:opacity-50 shadow-[0_2px_12px_rgba(0,255,255,0.15)]"
            data-testid="panel-btn-auth"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
          <Shield className="w-2.5 h-2.5" />
          <span>Secured by Trust Layer SSO</span>
        </div>
      </div>
    </div>
  );
}

function PanelChat({ initialToken, initialUser, onLogout }: { initialToken: string; initialUser: ChatUser; onLogout: () => void }) {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [view, setView] = useState<'channels' | 'chat' | 'members'>('channels');
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tokenRef = useRef(initialToken);

  useEffect(() => {
    fetch('/api/chat/channels')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.channels) {
          setChannels(data.channels);
          const defaultChannel = data.channels.find((c: ChatChannel) => c.isDefault) || data.channels[0];
          if (defaultChannel) {
            setActiveChannelId(defaultChannel.id);
            setView('chat');
          }
        }
      })
      .catch(() => {});
  }, []);

  const connectWebSocket = useCallback((channelId: string) => {
    if (wsRef.current) wsRef.current.close();
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
            if (data.username !== initialUser.username) {
              setTypingUsers(prev => prev.includes(data.username) ? prev : [...prev, data.username]);
              setTimeout(() => setTypingUsers(prev => prev.filter(u => u !== data.username)), 3000);
            }
            break;
          case 'error':
            if (data.message?.includes('Invalid') || data.message?.includes('expired')) {
              clearAuth();
              onLogout();
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
  }, [initialUser.username, activeChannelId, onLogout]);

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

  const activeChannel = channels.find(c => c.id === activeChannelId);

  const groupedChannels = channels.reduce((acc, ch) => {
    const cat = ch.category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ch);
    return acc;
  }, {} as Record<string, ChatChannel[]>);

  const categoryLabels: Record<string, string> = {
    ecosystem: 'Ecosystem',
    'app-support': 'App Support',
    community: 'Community',
    general: 'General',
  };

  const handleLogout = () => {
    wsRef.current?.close();
    clearAuth();
    onLogout();
  };

  if (view === 'channels') {
    return (
      <div className="flex flex-col h-full">
        <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              <MessageSquare className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-bold text-white">Channels</span>
          </div>
          <div className="flex items-center gap-1">
            <UserAvatar username={initialUser.username} color={initialUser.avatarColor} size="sm" />
            <button onClick={handleLogout} className="p-1 rounded hover:bg-slate-800/50 text-slate-500 hover:text-red-400 transition-colors" data-testid="panel-btn-logout">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {Object.entries(groupedChannels).map(([category, chans]) => (
            <div key={category} className="mb-3">
              <h4 className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider px-2 mb-1">
                {categoryLabels[category] || category}
              </h4>
              {chans.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => { setActiveChannelId(ch.id); setView('chat'); }}
                  className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all ${
                    ch.id === activeChannelId
                      ? 'bg-cyan-500/15 text-cyan-400'
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                  data-testid={`panel-channel-${ch.name}`}
                >
                  <Hash className="w-3 h-3 shrink-0" />
                  <span className="truncate">{ch.name}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="px-3 py-2 border-t border-white/5 shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            {connected ? (
              <><Wifi className="w-3 h-3 text-green-400" /><span className="text-green-400">Connected</span></>
            ) : (
              <><WifiOff className="w-3 h-3 text-red-400" /><span className="text-red-400">Reconnecting</span></>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'members') {
    return (
      <div className="flex flex-col h-full">
        <div className="px-3 py-2 border-b border-white/5 flex items-center gap-2 shrink-0">
          <button onClick={() => setView('chat')} className="p-1 rounded hover:bg-slate-800/50 text-slate-400">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-white">Online — {onlineUsers.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {onlineUsers.map(u => (
            <div key={u.userId} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800/30">
              <div className="relative">
                <UserAvatar username={u.username} color={u.avatarColor} />
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-[1.5px] border-slate-900" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-white truncate">{u.displayName}</div>
                <div className="text-[9px] text-slate-500">@{u.username}</div>
              </div>
            </div>
          ))}
          {onlineUsers.length === 0 && (
            <p className="text-[10px] text-slate-600 text-center py-4">No one else online</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-white/5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button onClick={() => setView('channels')} className="p-1 rounded hover:bg-slate-800/50 text-slate-400" data-testid="panel-back-channels">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <Hash className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-semibold text-white truncate">{activeChannel?.name}</span>
          </div>
          <button
            onClick={() => setView('members')}
            className="p-1 rounded hover:bg-slate-800/50 text-slate-400 relative"
            data-testid="panel-show-members"
          >
            <Users className="w-4 h-4" />
            {onlineUsers.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 text-[8px] text-white flex items-center justify-center font-bold">
                {onlineUsers.length}
              </span>
            )}
          </button>
        </div>
        {activeChannel?.description && (
          <p className="text-[10px] text-slate-500 mt-0.5 ml-7 truncate">{activeChannel.description}</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5" data-testid="panel-chat-messages">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <Hash className="w-8 h-8 mb-2 text-slate-700" />
            <p className="text-xs font-medium">Welcome to #{activeChannel?.name}</p>
            <p className="text-[10px] mt-0.5">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const prevMsg = i > 0 ? messages[i - 1] : null;
            const sameAuthor = prevMsg?.username === msg.username;
            const timeDiff = prevMsg ? (new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime()) : Infinity;
            const grouped = sameAuthor && timeDiff < 5 * 60 * 1000;
            return (
              <div key={msg.id} className={`flex gap-2 px-1 py-0.5 hover:bg-slate-800/30 rounded ${!grouped ? 'mt-2' : ''}`}>
                {!grouped ? (
                  <UserAvatar username={msg.username} color={msg.avatarColor || '#06b6d4'} />
                ) : (
                  <div className="w-6 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  {!grouped && (
                    <div className="flex items-baseline gap-1.5 mb-0.5">
                      <span className="font-semibold text-[11px] text-white">{msg.displayName || msg.username}</span>
                      <span className="text-[9px] text-slate-500">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-slate-200 break-words leading-relaxed">{msg.content}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {typingUsers.length > 0 && (
        <div className="px-3 pb-0.5">
          <span className="text-[10px] text-cyan-400 animate-pulse">
            {typingUsers.length === 1
              ? `${typingUsers[0]} is typing...`
              : `${typingUsers.join(', ')} are typing...`}
          </span>
        </div>
      )}

      <div className="px-2 py-2 border-t border-white/5 shrink-0">
        <div className="flex gap-1.5">
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
            placeholder={activeChannel ? `#${activeChannel.name}` : 'Select channel...'}
            className="flex-1 px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
            disabled={!connected}
            data-testid="panel-chat-input"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || !connected}
            className="px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white disabled:opacity-30 hover:from-cyan-400 hover:to-purple-500 transition-all"
            data-testid="panel-chat-send"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SignalChatPanel({ onClose }: { onClose: () => void }) {
  const [authState, setAuthState] = useState<{ token: string | null; user: ChatUser | null }>(getStoredAuth);
  const [verifying, setVerifying] = useState(!!authState.token);

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
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!authState.token || !authState.user) {
    return <PanelAuth onAuth={(token, user) => setAuthState({ token, user })} />;
  }

  return (
    <PanelChat
      initialToken={authState.token}
      initialUser={authState.user}
      onLogout={() => setAuthState({ token: null, user: null })}
    />
  );
}
