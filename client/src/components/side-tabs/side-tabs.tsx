import React, { useState, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageSquare, X, Loader2 } from 'lucide-react';

const SignalChatPanel = lazy(() => import('./signal-chat-panel'));

type TabId = 'chat' | null;

export default function SideTabs() {
  const [activeTab, setActiveTab] = useState<TabId>(null);

  const toggleTab = (tab: TabId) => {
    setActiveTab(prev => prev === tab ? null : tab);
  };

  return (
    <>
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[60] flex flex-col gap-2" data-testid="side-tabs">
        <AnimatePresence>
          {!activeTab && (
            <motion.button
              initial={{ x: 60 }}
              animate={{ x: 0 }}
              exit={{ x: 60 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={() => toggleTab('chat')}
              className="group flex items-center gap-1.5 pl-2.5 pr-1.5 py-3 rounded-l-xl bg-gradient-to-r from-cyan-600 to-purple-700 text-white shadow-[0_4px_20px_rgba(0,255,255,0.25)] hover:shadow-[0_4px_30px_rgba(0,255,255,0.4)] transition-all"
              data-testid="side-tab-chat"
              title="Signal Chat"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-[10px] font-bold tracking-wide writing-vertical hidden sm:block" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                CHAT
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {activeTab && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[65]"
              onClick={() => setActiveTab(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-[340px] max-w-[90vw] bg-slate-950 border-l border-white/10 shadow-[-8px_0_40px_rgba(0,0,0,0.5)] z-[70] flex flex-col"
              data-testid="side-panel"
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 shrink-0 bg-slate-900/80">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                    <MessageSquare className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    Signal Chat
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
                  data-testid="close-side-panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-hidden">
                <Suspense fallback={
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                  </div>
                }>
                  {activeTab === 'chat' && (
                    <SignalChatPanel onClose={() => setActiveTab(null)} />
                  )}
                </Suspense>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
