import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/i18n/context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, ArrowLeft, ChevronRight, Clock, Truck, ShoppingCart,
  Shield, ToggleLeft, ToggleRight, Lock, Unlock, Info,
  Layers, Eye, EyeOff, Navigation, Zap, AlertTriangle, X, Check, LocateFixed, Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { MapContainer, TileLayer, Rectangle, Popup, useMap, Marker, Tooltip, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface ZoneData {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  bounds: { north: number; south: number; east: number; west: number } | null;
  exits: Array<{ exit: number; name: string; lat: number; lng: number }> | null;
  cutoffTime: string | null;
  dinnerCutoffTime: string | null;
  color: string | null;
  isActive: boolean | null;
  tenantId: number | null;
}

const NASHVILLE_CENTER: [number, number] = [36.05, -86.65];

function createExitIcon(isActive: boolean) {
  return L.divIcon({
    className: "custom-exit-marker",
    html: `<div style="width:10px;height:10px;border-radius:50%;background:${isActive ? '#22c55e' : '#ef4444'};border:2px solid ${isActive ? '#166534' : '#991b1b'};box-shadow:0 0 6px ${isActive ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.3)'}"></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });
}

function FitBounds({ zones }: { zones: ZoneData[] }) {
  const map = useMap();
  useEffect(() => {
    if (zones.length === 0) return;
    const allBounds: [number, number][] = [];
    zones.forEach(z => {
      if (z.bounds) {
        allBounds.push([z.bounds.north, z.bounds.west]);
        allBounds.push([z.bounds.south, z.bounds.east]);
      }
    });
    if (allBounds.length > 0) {
      map.fitBounds(L.latLngBounds(allBounds), { padding: [30, 30] });
    }
  }, [zones, map]);
  return null;
}

function createUserIcon() {
  return L.divIcon({
    className: "user-location-marker",
    html: `<div style="position:relative;"><div style="width:18px;height:18px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 12px rgba(59,130,246,0.6),0 0 30px rgba(59,130,246,0.25);"></div><div style="position:absolute;inset:-6px;border-radius:50%;border:2px solid rgba(59,130,246,0.3);animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function UserLocationLayer({ zones }: { zones: ZoneData[] }) {
  const map = useMap();
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [nearestZone, setNearestZone] = useState<{ zone: ZoneData; distanceMi: number } | null>(null);

  const locateUser = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(coords);
        setLocating(false);
        map.flyTo(coords, 11, { duration: 1.2 });
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [map]);

  // Auto-locate on mount
  useEffect(() => {
    locateUser();
  }, []);

  // Calculate nearest active zone
  useEffect(() => {
    if (!userPos) { setNearestZone(null); return; }
    const activeZones = zones.filter(z => z.isActive && z.bounds);
    if (activeZones.length === 0) { setNearestZone(null); return; }

    let closest: { zone: ZoneData; distanceMi: number } | null = null;
    const userLatLng = L.latLng(userPos[0], userPos[1]);

    for (const z of activeZones) {
      if (!z.bounds) continue;
      const centerLat = (z.bounds.north + z.bounds.south) / 2;
      const centerLng = (z.bounds.east + z.bounds.west) / 2;
      const zoneCenterLatLng = L.latLng(centerLat, centerLng);
      const distMeters = userLatLng.distanceTo(zoneCenterLatLng);
      const distMi = distMeters * 0.000621371;

      // Check if user is INSIDE the zone bounds
      const isInside = userPos[0] >= z.bounds.south && userPos[0] <= z.bounds.north
        && userPos[1] >= z.bounds.west && userPos[1] <= z.bounds.east;
      const effectiveDist = isInside ? 0 : distMi;

      if (!closest || effectiveDist < closest.distanceMi) {
        closest = { zone: z, distanceMi: effectiveDist };
      }
    }
    setNearestZone(closest);
  }, [userPos, zones]);

  return (
    <>
      {userPos && (
        <>
          <Circle
            center={userPos}
            radius={200}
            pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.08, weight: 1, opacity: 0.3 }}
          />
          <Marker position={userPos} icon={createUserIcon()}>
            <Popup>
              <div style={{ color: '#fff', fontSize: '12px', textAlign: 'center' }}>
                <strong>📍 You Are Here</strong>
                {nearestZone && (
                  <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>
                    {nearestZone.distanceMi === 0
                      ? `Inside ${nearestZone.zone.name}`
                      : `${nearestZone.distanceMi.toFixed(1)} mi to ${nearestZone.zone.name}`}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        </>
      )}

      {/* Locate Me Button — positioned bottom-left of map */}
      <div className="leaflet-bottom leaflet-left" style={{ marginBottom: '10px', marginLeft: '10px' }}>
        <div className="leaflet-control">
          <button
            onClick={locateUser}
            disabled={locating}
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(12,18,34,0.9)', border: '1px solid rgba(255,255,255,0.1)',
              color: userPos ? '#3b82f6' : '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
            title="Find my location"
            data-testid="button-locate-me"
          >
            {locating
              ? <span style={{ width: '16px', height: '16px', border: '2px solid rgba(59,130,246,0.3)', borderTop: '2px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'block' }} />
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>
            }
          </button>
        </div>
      </div>

      {/* Proximity Card — bottom-right of map */}
      {userPos && nearestZone && (
        <div className="leaflet-bottom leaflet-right" style={{ marginBottom: '10px', marginRight: '10px' }}>
          <div className="leaflet-control">
            <div style={{
              background: 'rgba(12,18,34,0.9)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
              padding: '10px 14px', color: '#fff', maxWidth: '220px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
            }}>
              <div style={{ fontSize: '9px', fontWeight: 600, opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Your Location</div>
              {nearestZone.distanceMi === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.5)' }} />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#86efac' }}>Inside {nearestZone.zone.name}</span>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700 }}>{nearestZone.distanceMi.toFixed(1)} mi away</div>
                  <div style={{ fontSize: '10px', opacity: 0.5 }}>Nearest: {nearestZone.zone.name}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ZoneRectangle({ zone, isSelected, onClick, t }: { zone: ZoneData; isSelected: boolean; onClick: () => void; t: (key: string, params?: Record<string, string | number>) => string }) {
  if (!zone.bounds) return null;
  const bounds: [[number, number], [number, number]] = [
    [zone.bounds.south, zone.bounds.west],
    [zone.bounds.north, zone.bounds.east],
  ];
  const active = zone.isActive === true;
  return (
    <Rectangle
      bounds={bounds}
      pathOptions={{
        color: active ? (zone.color || '#22c55e') : '#ef4444',
        weight: isSelected ? 3 : 2,
        opacity: isSelected ? 1 : 0.7,
        fillColor: active ? (zone.color || '#22c55e') : '#ef4444',
        fillOpacity: isSelected ? 0.25 : 0.12,
        dashArray: active ? undefined : '8 4',
      }}
      eventHandlers={{ click: onClick }}
    >
      <Tooltip direction="center" permanent className="zone-label-tooltip">
        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '11px', color: active ? '#fff' : '#fca5a5', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
          {zone.name}
          <div style={{ fontSize: '9px', fontWeight: 'normal', opacity: 0.7 }}>
            {active ? t('zones.active') : t('zones.inactive')}
          </div>
        </div>
      </Tooltip>
    </Rectangle>
  );
}

export default function ZoneMapPage() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [selectedZone, setSelectedZone] = useState<ZoneData | null>(null);
  const [adminMode, setAdminMode] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [showExits, setShowExits] = useState(true);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  const { data: zones = [], isLoading } = useQuery<ZoneData[]>({
    queryKey: ["/api/zones"],
    queryFn: async () => {
      const res = await fetch("/api/zones");
      if (!res.ok) throw new Error("Failed to fetch zones");
      return res.json();
    },
    refetchInterval: 10000,
  });

  const toggleZone = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await fetch(`/api/zones/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-pin": adminPin },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to update zone" }));
        throw new Error(err.error || "Failed to update zone");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/zones"] });
    },
  });

  const handleAdminUnlock = useCallback(async () => {
    try {
      const res = await fetch("/api/tenants/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: adminPin }),
      });
      if (res.ok) {
        setAdminMode(true);
        setShowPinDialog(false);
        setAdminPin("");
      } else {
        setAdminPin("");
      }
    } catch {
      setAdminPin("");
    }
  }, [adminPin]);

  const filteredZones = zones.filter(z => {
    if (filterActive === 'active') return z.isActive === true;
    if (filterActive === 'inactive') return z.isActive !== true;
    return true;
  });

  const activeCount = zones.filter(z => z.isActive === true).length;
  const inactiveCount = zones.filter(z => z.isActive !== true).length;

  useEffect(() => {
    document.title = "Delivery Zones — Middle Tennessee";
    return () => { document.title = "Happy Eats - Delivery for Drivers"; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070b16] via-[#0c1222] to-[#070b16] text-white">
      <style>{`
        .zone-label-tooltip {
          background: rgba(0,0,0,0.75) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 8px !important;
          padding: 4px 8px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important;
        }
        .zone-label-tooltip::before { display: none !important; }
        .leaflet-container { background: #0c1222 !important; }
        .leaflet-tile-pane { filter: brightness(0.6) saturate(0.3) hue-rotate(180deg) invert(1); }
        .leaflet-control-zoom a { background: rgba(12,18,34,0.9) !important; color: #fff !important; border-color: rgba(255,255,255,0.1) !important; }
        .leaflet-control-attribution { display: none !important; }
        @keyframes ping { 75%, 100% { transform: scale(2.5); opacity: 0; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <nav className="sticky top-0 z-50 bg-[#070b16]/80 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/command-center">
              <Button variant="ghost" size="icon" className="text-white/40 hover:text-white hover:bg-white/5 rounded-xl" data-testid="button-back">
                <ArrowLeft className="size-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <MapPin className="size-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white leading-tight">{t('zones.deliveryZones')}</h1>
                <p className="text-[10px] text-white/30">{t('zones.middleTennessee')}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {adminMode ? (
              <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[10px]" data-testid="badge-admin">
                <Unlock className="size-2.5 mr-1" /> {t('zones.adminMode')}
              </Badge>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPinDialog(true)}
                className="text-white/30 hover:text-white text-xs gap-1.5"
                data-testid="button-admin-login"
              >
                <Lock className="size-3" /> <span className="hidden sm:inline">{t('zones.admin')}</span>
              </Button>
            )}
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {showPinDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => { setShowPinDialog(false); setAdminPin(""); }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-xs bg-[#0c1222] border border-white/[0.1] rounded-2xl p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Admin PIN"
            >
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <Shield className="size-4 text-cyan-400" /> {t('zones.adminAccess')}
              </h3>
              <p className="text-xs text-white/40 mb-4">{t('zones.enterPinManage')}</p>
              <Input
                type="password"
                maxLength={4}
                value={adminPin}
                onChange={e => setAdminPin(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => e.key === 'Enter' && handleAdminUnlock()}
                placeholder={t('zones.fourDigitPin')}
                className="bg-white/5 border-white/10 text-white text-center text-lg tracking-[0.5em] mb-3"
                autoFocus
                data-testid="input-admin-pin"
              />
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => { setShowPinDialog(false); setAdminPin(""); }} className="flex-1 text-white/40 text-xs">{t('common.cancel')}</Button>
                <Button onClick={handleAdminUnlock} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold" data-testid="button-unlock">
                  {t('zones.unlock')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-56px)]">
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0c1222]">
              <div className="text-center">
                <div className="size-12 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-white/40">{t('zones.loadingZones')}</p>
              </div>
            </div>
          ) : (
            <MapContainer
              center={NASHVILLE_CENTER}
              zoom={9}
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <FitBounds zones={filteredZones} />

              {filteredZones.map(zone => (
                <ZoneRectangle
                  key={zone.id}
                  zone={zone}
                  isSelected={selectedZone?.id === zone.id}
                  onClick={() => setSelectedZone(zone)}
                  t={t}
                />
              ))}

              {showExits && filteredZones.map(zone =>
                zone.exits?.map((exit, i) => (
                  <Marker
                    key={`${zone.id}-exit-${i}`}
                    position={[exit.lat, exit.lng]}
                    icon={createExitIcon(zone.isActive === true)}
                  >
                    <Popup className="zone-exit-popup">
                      <div style={{ color: '#fff', fontSize: '12px' }}>
                        <strong>{exit.exit > 0 ? `Exit ${exit.exit}` : exit.name}</strong>
                        {exit.exit > 0 && <div style={{ fontSize: '10px', opacity: 0.7 }}>{exit.name}</div>}
                        <div style={{ fontSize: '10px', opacity: 0.5, marginTop: '2px' }}>{zone.name}</div>
                      </div>
                    </Popup>
                  </Marker>
                ))
              )}

              <UserLocationLayer zones={filteredZones} />
            </MapContainer>
          )}

          <div className="absolute top-3 left-3 z-[500] flex flex-col gap-2">
            <Card className="bg-[#0c1222]/90 backdrop-blur-xl border-white/[0.08] shadow-xl">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="size-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30" />
                  <span className="text-[10px] text-white/50 font-medium">{activeCount} {t('zones.active')}</span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex items-center gap-1.5">
                  <div className="size-3 rounded-full bg-red-500 shadow-lg shadow-red-500/30" />
                  <span className="text-[10px] text-white/50 font-medium">{inactiveCount} {t('zones.inactive')}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="absolute top-3 right-3 z-[500] flex flex-col gap-2">
            <Card className="bg-[#0c1222]/90 backdrop-blur-xl border-white/[0.08] shadow-xl">
              <CardContent className="p-2 flex flex-col gap-1">
                {(['all', 'active', 'inactive'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilterActive(f)}
                    className={`text-[10px] px-3 py-1.5 rounded-lg transition-all font-medium ${filterActive === f ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`}
                    data-testid={`filter-${f}`}
                  >
                    {f === 'all' ? t('zones.allZones') : f === 'active' ? t('zones.activeOnly') : t('zones.inactiveOnly')}
                  </button>
                ))}
                <div className="border-t border-white/5 pt-1 mt-1">
                  <button
                    onClick={() => setShowExits(!showExits)}
                    className={`text-[10px] px-3 py-1.5 rounded-lg transition-all font-medium w-full text-left flex items-center gap-1.5 ${showExits ? 'text-white/60' : 'text-white/30'}`}
                    data-testid="toggle-exits"
                  >
                    {showExits ? <Eye className="size-2.5" /> : <EyeOff className="size-2.5" />}
                    {showExits ? t('zones.hideExits') : t('zones.showExits')}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="w-full lg:w-96 lg:border-l border-t lg:border-t-0 border-white/[0.04] bg-[#070b16]/50 backdrop-blur-xl overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">{t('zones.zoneDirectory')}</h2>
              <Badge className="bg-white/5 text-white/30 border-white/10 text-[10px]">
                {zones.length} {t('zones.zones')}
              </Badge>
            </div>

            <AnimatePresence>
              {selectedZone && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <Card className="bg-white/[0.03] border-white/[0.08] overflow-hidden">
                    <div className={`h-1 w-full`} style={{ background: selectedZone.isActive ? (selectedZone.color || '#22c55e') : '#ef4444' }} />
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-sm font-bold text-white">{selectedZone.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`text-[9px] ${selectedZone.isActive ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-red-500/15 text-red-300 border-red-500/30'}`}>
                              {selectedZone.isActive ? t('zones.active').toUpperCase() : t('zones.inactive').toUpperCase()}
                            </Badge>
                            {selectedZone.cutoffTime && (
                              <span className="text-[10px] text-white/30 flex items-center gap-1">
                                <Clock className="size-2.5" /> {selectedZone.cutoffTime} {t('zones.cutoff').toLowerCase()}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedZone(null)} className="text-white/20 hover:text-white size-6" data-testid="button-close-detail">
                          <X className="size-3" />
                        </Button>
                      </div>

                      {selectedZone.description && (
                        <p className="text-[11px] text-white/40 leading-relaxed mb-3">{selectedZone.description}</p>
                      )}

                      {selectedZone.exits && selectedZone.exits.length > 0 && (
                        <div className="mb-3">
                          <p className="text-[9px] text-white/25 uppercase tracking-wider font-semibold mb-1.5">{t('zones.keyLocations')}</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedZone.exits.map((exit, i) => (
                              <Badge key={i} className="bg-white/[0.04] text-white/40 border-white/[0.06] text-[9px]">
                                {exit.exit > 0 ? `Exit ${exit.exit}` : ''} {exit.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {selectedZone.isActive ? (
                          <Link href={`/order/${selectedZone.slug}`}>
                            <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold gap-1.5" data-testid="button-order-zone">
                              <ShoppingCart className="size-3" /> {t('zones.orderNow')}
                            </Button>
                          </Link>
                        ) : (
                          <Button size="sm" disabled className="bg-white/5 text-white/20 text-xs font-bold gap-1.5 cursor-not-allowed">
                            <AlertTriangle className="size-3" /> {t('zones.notYetActive')}
                          </Button>
                        )}

                        {adminMode && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleZone.mutate({ id: selectedZone.id, isActive: !selectedZone.isActive })}
                            className={`text-xs font-bold gap-1.5 ${selectedZone.isActive ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'}`}
                            data-testid="button-toggle-zone-detail"
                          >
                            {selectedZone.isActive ? <><EyeOff className="size-3" /> {t('zones.deactivate')}</> : <><Check className="size-3" /> {t('zones.activate')}</>}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              {filteredZones.map((zone, i) => (
                <motion.div
                  key={zone.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <div
                    onClick={() => setSelectedZone(zone)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all group ${selectedZone?.id === zone.id ? 'bg-white/[0.06] border border-white/[0.12]' : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.04] hover:border-white/[0.06]'}`}
                    data-testid={`zone-item-${zone.slug}`}
                  >
                    <div className="relative">
                      <div
                        className={`size-3 rounded-full ${zone.isActive ? 'shadow-lg shadow-emerald-500/40' : 'shadow-lg shadow-red-500/30'}`}
                        style={{ background: zone.isActive ? (zone.color || '#22c55e') : '#ef4444' }}
                      />
                      {zone.isActive && (
                        <div className="absolute inset-0 size-3 rounded-full animate-ping opacity-30" style={{ background: zone.color || '#22c55e' }} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white/80 group-hover:text-white transition-colors truncate">{zone.name}</p>
                      <p className="text-[10px] text-white/25 truncate">
                        {zone.exits?.length || 0} {t('zones.locations')}
                        {zone.cutoffTime && ` · ${zone.cutoffTime} ${t('zones.cutoff').toLowerCase()}`}
                      </p>
                    </div>

                    {adminMode ? (
                      <Switch
                        checked={zone.isActive === true}
                        onCheckedChange={(checked) => {
                          toggleZone.mutate({ id: zone.id, isActive: checked });
                          if (selectedZone?.id === zone.id) {
                            setSelectedZone({ ...zone, isActive: checked });
                          }
                        }}
                        className="data-[state=checked]:bg-emerald-500"
                        data-testid={`switch-zone-${zone.slug}`}
                      />
                    ) : (
                      <ChevronRight className="size-3.5 text-white/15 group-hover:text-white/30 transition-colors shrink-0" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredZones.length === 0 && (
              <div className="text-center py-8">
                <MapPin className="size-8 text-white/10 mx-auto mb-2" />
                <p className="text-sm text-white/30">{t('zones.noZonesMatch')}</p>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-white/[0.04]">
              <div className="flex items-center gap-2 mb-3">
                <Info className="size-3 text-white/20" />
                <p className="text-[10px] text-white/20">
                  {adminMode ? t('zones.adminHelpText') : t('zones.userHelpText')}
                </p>
              </div>

              {!adminMode && (
                <Link href="/vendor-portal">
                  <Button variant="ghost" size="sm" className="w-full text-white/30 hover:text-white text-xs gap-2 justify-start" data-testid="button-vendor-signup">
                    <Truck className="size-3" /> {t('zones.vendorPortalLink')}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
