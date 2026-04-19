import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/theme-context";
import { AuthProvider } from "@/lib/auth-context";
import { LanguageProvider } from "@/i18n/context";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/layout/navbar";
import { PromoTicker } from "@/components/layout/promo-ticker";
import { Footer } from "@/components/layout/footer";
import { ComingSoonBanner, ComingSoonBannerTL } from "@/components/coming-soon-banner";
import { DomainProvider, isTrustLayerDomain } from "@/hooks/use-domain";
import { lazy, Suspense, useEffect } from "react";
import { FloatingRoleSwitcher } from "@/components/floating-role-switcher";
import { EcosystemTab } from "@/components/ecosystem-tab";
import { AnalyticsTracker } from "@/hooks/useAnalytics";
import { FloatingOrderTracker } from "@/components/floating-order-tracker";
import NotFound from "./pages/not-found";
import Landing from "./pages/landing";
import VendorPortal from "./pages/vendor-portal";
import VendorLanding from "./pages/vendor-landing";
import VendorAgreement from "./pages/vendor-agreement";
import Vendors from "./pages/vendors";
import VendorDetail from "./pages/vendor-detail";
import Tracking from "./pages/tracking";
import Concierge from "./pages/concierge";
import Privacy from "./pages/privacy";
import Terms from "./pages/terms";
import AdminDashboard from "./pages/admin/dashboard";
import Weather from "./pages/weather";
import Team from "./pages/team";

import Roadmap from "./pages/roadmap";
import Developer from "./pages/developer";

import OrderPage from "./pages/order";
import DemoPage from "./pages/demo";

import FranchisePage from "./pages/franchise";
import MarketingDemo from "./pages/marketing-demo";
import FlyerPage from "./pages/flyer";
import InfoPage from "./pages/info";
import PartnerAgreement from "./pages/partner-agreement";
import FoodTruckFlyer from "./pages/food-truck-flyer";
import AIFlyerCreator from "./pages/ai-flyer-creator";
import OfficeDashboard from "./pages/office";
import MarketingHub from "./pages/marketing-hub";
import Blog from "./pages/blog";
import BlogPostPage from "./pages/blog-post";
// import CDLDirectory from "./pages/cdl-directory";
import SignalChat from "./pages/signal-chat";
import FranchiseOnboarding from "./pages/franchise-onboarding";
import FranchiseDashboard from "./pages/franchise-dashboard";
import ZoneOrderPage from "./pages/zone-order";
import VendorOrders from "./pages/vendor-orders";
import DriverOrders from "./pages/driver-orders";
import LiveOps from "./pages/live-ops";
import SandboxHub from "./pages/sandbox-hub";
import VendorMenuManager from "./pages/vendor-menu-manager";
import VendorOrderPage from "./pages/vendor-order-page";
import HappyEatsKitchen from "./pages/kitchen";
import KitchenManage from "./pages/kitchen-manage";
import CommandCenter from "./pages/command-center";
import ZoneControl from "./pages/zone-control";
import InvestorsPage from "./pages/investors";
import ExecutiveSummary from "./pages/executive-summary";
import OrbitStaffingHandoff from "./pages/orbit-staffing-handoff";
import ZoneMapPage from "./pages/zone-map";
import AffiliateDashboard from "./pages/affiliate-dashboard";
import ExploreHub from "./pages/explore-hub";
import InviteCodesPage from "./pages/invite-codes";
import OperationsManual from "./pages/operations-manual";
import SMSConsent from "./pages/sms-consent";
import CustomerAuth from "./pages/customer-auth";
import CustomerAccount from "./pages/customer-account";
import OrderHistory from "./pages/order-history";
import ReviewPage from "./pages/review";

import MediaEditor from "./pages/media-editor";
import Ecosystem from "./pages/ecosystem";
import FlyerCatalog from "./pages/flyer-catalog";
import GenesisBadge from "./components/genesis-badge";
import KathyManual from "./pages/guide";
import VendorPage from "./pages/vendor-page";
import StoreShopping from "./pages/store-shopping";
import { FloatingThemeToggle } from "@/components/theme-toggle";

const SideTabs = lazy(() => import("@/components/side-tabs/side-tabs"));

function ReferralLanding({ params }: { params: { hash: string } }) {
  const [, setLocation] = useLocation();
  useEffect(() => {
    if (params?.hash) {
      localStorage.setItem("referredBy", params.hash);
      fetch("/api/affiliate/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralHash: params.hash, platform: "happyeats" }),
      }).catch(() => {});
      setLocation("/signup");
    }
  }, [params?.hash, setLocation]);
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <p className="text-white/50 text-sm">Redirecting...</p>
    </div>
  );
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function Router() {
  const isTL = isTrustLayerDomain();
  
  return (
    <>
    <ScrollToTop />
    <FloatingThemeToggle />
    <Switch>
      <Route path="/" component={ExploreHub} />
      <Route path="/home" component={Landing} />
      <Route path="/vendor-portal" component={VendorPortal} />
      <Route path="/vendor/join" component={VendorPortal} />
      <Route path="/vendor" component={VendorLanding} />
      <Route path="/vendor-agreement" component={VendorAgreement} />
      <Route path="/vendors" component={Vendors} />
      <Route path="/vendor/login" component={VendorMenuManager} />
      <Route path="/vendor/manage" component={VendorMenuManager} />
      <Route path="/vendor/:id" component={VendorDetail} />
      <Route path="/order" component={OrderPage} />
      <Route path="/order/:zoneSlug" component={ZoneOrderPage} />
      <Route path="/tracking" component={Tracking} />
      <Route path="/tracking/:id" component={Tracking} />
      <Route path="/concierge" component={Concierge} />

      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/owner">
        <ProtectedRoute requiredRole={["owner", "developer"]}>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/developer">
        <ProtectedRoute requiredRole={["owner", "developer"]}>
          <Developer />
        </ProtectedRoute>
      </Route>
      <Route path="/weather" component={Weather} />
      <Route path="/team" component={Team} />
      <Route path="/roadmap" component={Roadmap} />
      <Route path="/guide" component={KathyManual} />

      <Route path="/demo" component={DemoPage} />
      <Route path="/franchise" component={FranchisePage} />
      <Route path="/franchise/onboarding" component={FranchiseOnboarding} />
      <Route path="/franchise/dashboard" component={FranchiseDashboard} />
      <Route path="/marketing-demo" component={MarketingDemo} />
      <Route path="/flyer" component={FlyerPage} />
      <Route path="/info" component={InfoPage} />
      <Route path="/partner/:name" component={PartnerAgreement} />
      <Route path="/food-truck-flyer" component={FoodTruckFlyer} />
      <Route path="/ai-flyer" component={AIFlyerCreator} />
      <Route path="/marketing-materials">
        <Redirect to="/marketing?tab=print" />
      </Route>
      <Route path="/brand-assets">
        <Redirect to="/marketing?tab=brand" />
      </Route>
      <Route path="/office" component={OfficeDashboard} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      {/* <Route path="/cdl-directory" component={CDLDirectory} /> */}
      {/* vendor/login and vendor/manage moved above vendor/:id to prevent wildcard matching */}
      <Route path="/menu/:vendorId" component={VendorOrderPage} />
      <Route path="/vendor-orders/:truckId" component={VendorOrders} />
      <Route path="/driver-orders/:zoneSlug" component={DriverOrders} />
      <Route path="/live-ops" component={LiveOps} />
      <Route path="/sandbox" component={SandboxHub} />
      <Route path="/kitchen" component={HappyEatsKitchen} />
      <Route path="/kitchen/manage" component={KitchenManage} />
      <Route path="/command-center">
        <ProtectedRoute requiredRole={["owner", "developer"]}>
          <CommandCenter />
        </ProtectedRoute>
      </Route>
      <Route path="/zone-control">
        <ProtectedRoute requiredRole={["owner", "developer"]}>
          <ZoneControl />
        </ProtectedRoute>
      </Route>
      <Route path="/investors" component={InvestorsPage} />
      <Route path="/executive-summary" component={ExecutiveSummary} />
      <Route path="/orbit-staffing">
        <ProtectedRoute requiredRole={["owner", "developer"]}>
          <OrbitStaffingHandoff />
        </ProtectedRoute>
      </Route>
      <Route path="/ref/:hash" component={ReferralLanding} />
      <Route path="/affiliate" component={AffiliateDashboard} />
      <Route path="/explore" component={ExploreHub} />
      <Route path="/ecosystem" component={Ecosystem} />
      <Route path="/flyer-catalog" component={FlyerCatalog} />
      <Route path="/invite-codes">
        <ProtectedRoute requiredRole={["owner", "developer"]}>
          <InviteCodesPage />
        </ProtectedRoute>
      </Route>
      <Route path="/operations-manual">
        <ProtectedRoute requiredRole={["owner", "developer"]}>
          <OperationsManual />
        </ProtectedRoute>
      </Route>
      <Route path="/sms-consent" component={SMSConsent} />
      <Route path="/signin" component={CustomerAuth} />
      <Route path="/signup" component={CustomerAuth} />
      <Route path="/account" component={CustomerAccount} />
      <Route path="/order-history" component={OrderHistory} />

      <Route path="/review/:orderId/:token" component={ReviewPage} />
      <Route path="/zones" component={ZoneMapPage} />
      <Route path="/v/:slug" component={VendorPage} />
      <Route path="/media-editor" component={MediaEditor} />
      <Route path="/signal-chat" component={SignalChat} />
      <Route path="/store" component={StoreShopping} />
      <Route path="/marketing">
        <ProtectedRoute requiredRole={["owner", "developer"]}>
          <MarketingHub />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
    </>
  );
}

function getVendorSubdomain(): string | null {
  if (typeof window === 'undefined') return null;
  const host = window.location.hostname.toLowerCase();
  const mainDomains = ['happyeats.app', 'happy-eats.app', 'tldriverconnect.com'];
  for (const domain of mainDomains) {
    if (host.endsWith(`.${domain}`) && host !== `www.${domain}`) {
      const sub = host.replace(`.${domain}`, '');
      // Map known subdomains to vendor slugs
      const map: Record<string, string> = { 'shellskitchen': 'shells-kitchen' };
      return map[sub] || sub;
    }
  }
  return null;
}

function AppContent() {
  const [location, setLocation] = useLocation();
  const isTL = isTrustLayerDomain();
  const isLanding = location === "/" || location === "/home";

  // Vendor subdomain detection — redirect to /v/:slug
  const vendorSlug = getVendorSubdomain();
  useEffect(() => {
    if (vendorSlug && !location.startsWith('/v/') && !location.startsWith('/api/')) {
      setLocation(`/v/${vendorSlug}`);
    }
  }, [vendorSlug, location, setLocation]);

  const isSignalChat = location === "/signal-chat";

  const isSelfContained = location === "/explore" || (location === "/" && !isTL) || location === "/command-center" || location === "/sandbox" || location === "/zone-control" || location.startsWith("/v/") || location === "/vendor/login" || location === "/vendor/manage" || location === "/live-ops" || location === "/store";

  const isTLBranded = (location === "/" && isTL) || location === "/franchise" || location.startsWith("/franchise/") || location === "/marketing-demo" || location === "/demo";

  const isTLDriverPage = false; // No TL driver pages in HappyEats

  const isHEOrderFlow = location.startsWith("/order/") || location.startsWith("/vendor-orders/") || location.startsWith("/driver-orders/") || location.startsWith("/menu/") || location === "/tracking" || location.startsWith("/tracking/");

  const isHEVendor = location.startsWith("/vendor/") || location === "/vendor-portal";

  const isHEFood = location.startsWith("/kitchen") || location === "/zones";

  const isCustomerPage = location === "/signin" || location === "/signup" || location === "/account" || location === "/order-history";

  const isContentPage = location === "/flyer" || location === "/ai-flyer" || location === "/info" || location === "/sms-consent" || location === "/media-editor";

  if (isSignalChat) {
    return (
      <div className="min-h-screen min-h-dvh">
        <AnalyticsTracker />
        <Router />
        <Toaster />
      </div>
    );
  }

  if (isSelfContained) {
    return (
      <div className="min-h-screen min-h-dvh">
        <AnalyticsTracker />
        <Router />
        <FloatingRoleSwitcher />
        <Toaster />
      </div>
    );
  }

  if (isTLBranded) {
    return (
      <div className="min-h-screen min-h-dvh">
        <AnalyticsTracker />
        <Router />
        <FloatingRoleSwitcher />
        <Toaster />
      </div>
    );
  }

  if (false) { /* TL driver pages removed from HappyEats */ }

  if (isHEOrderFlow || isHEVendor || isHEFood || isCustomerPage || isContentPage) {
    return (
      <div className="min-h-screen min-h-dvh flex flex-col pt-14 m-0 themed-bg">
        <AnalyticsTracker />
        <Navbar />
        <ComingSoonBanner />
        <main className="container mx-auto max-w-[1920px] 2xl:max-w-[2400px] 4xl:max-w-none animate-[in-fade_0.5s_ease-out] flex-1 pb-24 md:pb-8 p-3 sm:p-4 md:p-6 2xl:p-8">
          <Router />
        </main>
        <Footer />
        <FloatingOrderTracker />
        <FloatingRoleSwitcher />
        <EcosystemTab />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-dvh flex flex-col pt-14 m-0 themed-bg">
      <AnalyticsTracker />
      <Navbar />
      <ComingSoonBanner />
      <PromoTicker />
      <main className={`container mx-auto max-w-[1920px] 2xl:max-w-[2400px] 4xl:max-w-none animate-[in-fade_0.5s_ease-out] flex-1 pb-24 md:pb-8 ${isLanding ? 'p-0' : 'p-3 sm:p-4 md:p-6 2xl:p-8'}`}>
        <Router />
      </main>
      <GenesisBadge />
      <Footer />
      <FloatingOrderTracker />
      <FloatingRoleSwitcher />
      <EcosystemTab />
      <Suspense fallback={null}>
        <SideTabs />
      </Suspense>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <DomainProvider>
            <ThemeProvider>
              <TooltipProvider>
                <AppContent />
              </TooltipProvider>
            </ThemeProvider>
          </DomainProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
