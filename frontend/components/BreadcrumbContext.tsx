"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type BreadcrumbSegment = { label: string; href?: string };

type BreadcrumbValue =
  | { type: "label"; label: string }
  | { type: "segments"; segments: BreadcrumbSegment[] }
  | null;

type BreadcrumbContextType = {
  breadcrumb: BreadcrumbValue;
  setBreadcrumbLabel: (label: string) => void;
  setBreadcrumbSegments: (segments: BreadcrumbSegment[]) => void;
  clearBreadcrumb: () => void;
  hideBreadcrumb: boolean;
  setHideBreadcrumb: (hide: boolean) => void;
};

export const BreadcrumbContext = createContext<BreadcrumbContextType | null>(null);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbValue>(null);
  const [hideBreadcrumb, setHideBreadcrumb] = useState(false);

  const setBreadcrumbLabel = useCallback((label: string) => {
    setBreadcrumb({ type: "label", label });
  }, []);

  const setBreadcrumbSegments = useCallback((segments: BreadcrumbSegment[]) => {
    setBreadcrumb({ type: "segments", segments });
  }, []);

  const clearBreadcrumb = useCallback(() => {
    setBreadcrumb(null);
  }, []);

  return (
    <BreadcrumbContext.Provider
      value={{
        breadcrumb,
        setBreadcrumbLabel,
        setBreadcrumbSegments,
        clearBreadcrumb,
        hideBreadcrumb,
        setHideBreadcrumb,
      }}
    >
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) {
    throw new Error("useBreadcrumb must be used within BreadcrumbProvider");
  }
  return ctx;
}
