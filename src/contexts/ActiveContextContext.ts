import { createContext } from 'react';
import type { ActiveContextState } from './types';

export const ActiveContextContext = createContext<ActiveContextState | undefined>(undefined);
