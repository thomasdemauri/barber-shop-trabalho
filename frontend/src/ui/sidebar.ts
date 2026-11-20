import { createContext, useContext } from 'react';

export type SidebarState = { open: boolean; toggle: () => void };

export const SidebarContext = createContext<SidebarState>({ open: true, toggle: () => {} });

export const useSidebar = () => useContext(SidebarContext);
