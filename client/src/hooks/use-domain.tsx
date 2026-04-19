import { createContext, useContext, ReactNode } from "react";

interface DomainInfo {
  isTL: boolean;
  brandName: string;
  tagline: string;
}

import { happyEatsTenant } from "@tenant/config";

// Tenant values loaded from configuration
const HE_BRAND = happyEatsTenant.name;
const HE_TAGLINE = happyEatsTenant.tagline;

const DomainContext = createContext<DomainInfo>({
  isTL: false,
  brandName: HE_BRAND,
  tagline: HE_TAGLINE,
});

export function useDomain() {
  return useContext(DomainContext);
}

export function isTrustLayerDomain() {
  const hostname = window.location.hostname;
  return hostname.includes('tldriverconnect') || hostname.includes('trustlayer');
}

export function DomainProvider({ children }: { children: ReactNode }) {
  const isTL = isTrustLayerDomain();
  
  const value: DomainInfo = isTL
    ? {
        isTL: true,
        brandName: "TL Driver Connect",
        tagline: "Nationwide Driver Services & Franchise Platform",
      }
    : {
        isTL: false,
        brandName: HE_BRAND,
        tagline: HE_TAGLINE,
      };

  return (
    <DomainContext.Provider value={value}>
      {children}
    </DomainContext.Provider>
  );
}
