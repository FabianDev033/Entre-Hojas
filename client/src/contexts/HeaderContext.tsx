import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface HeaderState {
  placeholder: string;
  showBackButton: boolean;
  showShadow: boolean;
  showSearch: boolean;
  showSearchIcon: boolean;
  showShare: boolean;
  showHeader: boolean;
  showCartTitle: boolean;
  showCheckoutTitle: boolean;
}

interface HeaderContextType {
  header: HeaderState;
  setHeader: React.Dispatch<React.SetStateAction<HeaderState>>;
  configureHeader: (config: Partial<HeaderState>) => void;
}

const HeaderContext = createContext<HeaderContextType | null>(null);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [header, setHeader] = useState({
    placeholder: "Search plants...",
    showBackButton: false,
    showShadow: false,
    showSearch: true,
    showSearchIcon: false,
    showShare: true,
    showHeader: true,
    showCartTitle: false,
    showCheckoutTitle: false,
  });
  const configureHeader = useCallback((newConfig: Partial<HeaderState>) => {
    setHeader((prev) => ({ ...prev, ...newConfig }));
  }, []);

  return (
    <HeaderContext.Provider value={{ header, setHeader, configureHeader }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const context = useContext(HeaderContext);

  if (!context) {
    throw new Error("useHeader must be used inside HeaderProvider");
  }

  return context;
}
