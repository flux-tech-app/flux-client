import { createContext, useContext, useState } from 'react';

const FluxChatContext = createContext();

export function FluxChatProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);
  const toggleChat = () => setIsOpen(prev => !prev);

  return (
    <FluxChatContext.Provider value={{ isOpen, setIsOpen, openChat, closeChat, toggleChat }}>
      {children}
    </FluxChatContext.Provider>
  );
}

export function useFluxChat() {
  const context = useContext(FluxChatContext);
  if (!context) {
    throw new Error('useFluxChat must be used within FluxChatProvider');
  }
  return context;
}
