import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppState, Transaction } from '../types';
import { parseSMS } from '../utils/parser';

interface AppContextValue extends AppState {
  analyze: (rawInput: string) => void;
  reset: () => void;
}

const defaultState: AppState = {
  transactions: [],
  sessionStart: new Date(),
  isAnalyzed: false,
  rawInput: '',
};

const AppContext = createContext<AppContextValue>({
  ...defaultState,
  analyze: () => {},
  reset: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);

  const analyze = (rawInput: string) => {
    const transactions = parseSMS(rawInput);
    setState({
      transactions,
      sessionStart: new Date(),
      isAnalyzed: true,
      rawInput,
    });
  };

  const reset = () => {
    setState({ ...defaultState, sessionStart: new Date() });
  };

  return (
    <AppContext.Provider value={{ ...state, analyze, reset }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
