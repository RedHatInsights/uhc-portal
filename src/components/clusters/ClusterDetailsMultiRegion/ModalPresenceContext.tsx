import React from 'react';

type ModalPresenceContextType = {
  isAnyLocalModalOpen: boolean;
  registerModal: () => void;
  unregisterModal: () => void;
};

const ModalPresenceContext = React.createContext<ModalPresenceContextType>({
  isAnyLocalModalOpen: false,
  registerModal: () => {},
  unregisterModal: () => {},
});

export const ModalPresenceProvider = ({ children }: { children: React.ReactNode }) => {
  const countRef = React.useRef(0);
  const [isAnyLocalModalOpen, setIsAnyLocalModalOpen] = React.useState(false);

  const registerModal = React.useCallback(() => {
    countRef.current += 1;
    setIsAnyLocalModalOpen(true);
  }, []);

  const unregisterModal = React.useCallback(() => {
    countRef.current = Math.max(0, countRef.current - 1);
    setIsAnyLocalModalOpen(countRef.current > 0);
  }, []);

  const value = React.useMemo(
    () => ({ isAnyLocalModalOpen, registerModal, unregisterModal }),
    [isAnyLocalModalOpen, registerModal, unregisterModal],
  );

  return <ModalPresenceContext.Provider value={value}>{children}</ModalPresenceContext.Provider>;
};

export const useModalPresence = () => React.useContext(ModalPresenceContext);
