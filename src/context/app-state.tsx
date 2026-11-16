"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const CATEGORIES = ["All", "Food", "Skincare", "Fashion"] as const;

export type Category = (typeof CATEGORIES)[number];
export type Role = "shopper" | "founder";

type AppStateValue = {
  role: Role;
  category: Category;
  setRole: (role: Role) => void;
  setCategory: (category: Category) => void;
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("shopper");
  const [category, setCategory] = useState<Category>("All");

  const value = useMemo<AppStateValue>(
    () => ({ role, category, setRole, setCategory }),
    [role, category],
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used inside an AppStateProvider");
  }

  return context;
}
