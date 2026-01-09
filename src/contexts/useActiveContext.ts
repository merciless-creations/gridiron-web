import { useContext } from 'react';
import { ActiveContextContext } from './ActiveContextContext';
import type { ActiveContextState } from './types';

export function useActiveContext(): ActiveContextState {
  const context = useContext(ActiveContextContext);
  if (context === undefined) {
    throw new Error('useActiveContext must be used within an ActiveContextProvider');
  }
  return context;
}
