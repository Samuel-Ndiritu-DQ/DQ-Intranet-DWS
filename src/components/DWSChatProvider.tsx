import React, { createContext, useContext, useState, useEffect } from 'react';
import { DWSChatWidget } from './DWSChatWidget';

interface DWSChatContextType {
  isOpen: boolean;
  openChat: (initialMessage?: string) => void;
  closeChat: () => void;
  sendMessage: (message: string) => void;
}

const DWSChatContext = createContext<DWSChatContextType | undefined>(undefined);

export function useDWSChat() {
  const context = useContext(DWSChatContext);
  if (!context) {
    throw new Error('useDWSChat must be used within DWSChatProvider');
  }
  return context;
}

interface DWSChatProviderProps {
  children: React.ReactNode;
}

export function DWSChatProvider({ children }: DWSChatProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string | undefined>();

  const openChat = (message?: string) => {
    setInitialMessage(message);
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
    setInitialMessage(undefined);
  };

  const sendMessage = (message: string) => {
    if (!isOpen) {
      openChat(message);
    } else {
      // Dispatch event that the chat widget will listen to
      window.dispatchEvent(new CustomEvent('dws-chat-send-message', { detail: { message } }));
    }
  };

  // Listen for messages from hero search bar
  useEffect(() => {
    const handleHeroMessage = (event: CustomEvent) => {
      if (event.detail?.message) {
        // Open chat with the message - widget will handle it via initialMessage prop
        openChat(event.detail.message);
      }
    };

    window.addEventListener('dq-hero-sent-to-chat', handleHeroMessage as EventListener);
    return () => {
      window.removeEventListener('dq-hero-sent-to-chat', handleHeroMessage as EventListener);
    };
  }, []);

  return (
    <DWSChatContext.Provider value={{ isOpen, openChat, closeChat, sendMessage }}>
      {children}
      <DWSChatWidget isOpen={isOpen} onToggle={closeChat} initialMessage={initialMessage} />
      {/* Floating chat button when closed */}
      {!isOpen && (
        <button
          onClick={() => openChat()}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 z-[9998] hover:scale-110"
          aria-label="Open DWS AI Assistant"
          title="Open DWS AI Assistant"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}
    </DWSChatContext.Provider>
  );
}
