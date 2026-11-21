import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  MapPin,
  ShieldCheck,
  Store,
  ClipboardCheck,
  RefreshCw,
  Compass,
  Box,
  Layers,
} from 'lucide-react';
import { Cause } from '../types.ts';

interface IndiaImpactMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  causes: Cause[];
}

const STATE_COORDS: Record<string, [number, number]> = {
  'Andhra Pradesh': [15.91, 79.74],
  'Arunachal Pradesh': [28.22, 94.73],
  Assam: [26.2, 92.94],
  Bihar: [25.09, 85.31],
  Chhattisgarh: [21.28, 81.87],
  Goa: [15.3, 74.12],
  Gujarat: [22.26, 71.19],
  Haryana: [29.06, 76.09],
  'Himachal Pradesh': [31.1, 77.17],
  Jharkhand: [23.61, 85.28],
  Karnataka: [15.32, 75.71],
  Kerala: [10.85, 76.27],
  'Madhya Pradesh': [22.97, 78.66],
  Maharashtra: [19.75, 75.71],
  Manipur: [24.66, 93.91],
  Meghalaya: [25.47, 91.37],
  Mizoram: [23.16, 92.94],
  Nagaland: [26.16, 94.56],
  Odisha: [20.95, 85.1],
  Punjab: [31.15, 75.34],
  Rajasthan: [27.02, 74.22],
  Sikkim: [27.53, 88.51],
  'Tamil Nadu': [11.13, 78.66],
  Telangana: [18.11, 79.02],
  Tripura: [23.94, 91.99],
  'Uttar Pradesh': [26.85, 80.95],
  Uttarakhand: [30.07, 79.02],
  'West Bengal': [22.99, 87.85],
  Delhi: [28.7, 77.1],
  'Jammu & Kashmir': [33.78, 76.58],
  Ladakh: [34.15, 77.58],
  Puducherry: [11.94, 79.81],
};

// Geographic coordinates of the 8 Living India National Mission hubs across India
const MISSION_HUB_COORDS: Record<string, { city: string; state: string; coords: [number, number] }> = {
  'cause-women-entrepreneurship': { city: 'Jaipur', state: 'Rajasthan', coords: [26.9124, 75.7873] },
  'cause-ai-free-training': { city: 'Bengaluru', state: 'Karnataka', coords: [12.9716, 77.5946] },
  'cause-everyday-essentials': { city: 'Pune', state: 'Maharashtra', coords: [18.5204, 73.8567] },
  'cause-protect-earth': { city: 'Kochi', state: 'Kerala', coords: [9.9312, 76.2673] },
  'cause-hill-and-city': { city: 'Dehradun', state: 'Uttarakhand', coords: [30.3165, 78.0322] },
  'cause-sports-ecosystem': { city: 'Imphal', state: 'Manipur', coords: [24.817, 93.9368] },
  'cause-water-security': { city: 'Chennai', state: 'Tamil Nadu', coords: [13.0827, 80.2707] },
  'cause-living-culture': { city: 'Varanasi', state: 'Uttar Pradesh', coords: [25.3176, 82.9739] },
};

export const IndiaImpactMapModal: React.FC<IndiaImpactMapModalProps> = ({
  isOpen,
  onClose,
  causes,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const [loading, setLoading] = useState(false);
  const [view3D, setView3D] = useState(true);
  const [filter, setFilter] = useState<'all' | 'missions' | 'makers' | 'audits'>('all');
  const [selectedLabel, setSelectedLabel] = useState<string>('All India Live Telemetry');
  const [mapData, setMapData] = useState<{
    verifiedMakers: any[];
    verifiedAudits: any[];
    stats: {
      verifiedMakersCount: number;
      verifiedAuditsCount: number;
      activeSubscriptions: number;
      bulkInquiriesCount: number;
    };
  }>({
    verifiedMakers: [],
    verifiedAudits: [],
    stats: {
      verifiedMakersCount: 0,
      verifiedAuditsCount: 0,
      activeSubscriptions: 0,
      bulkInquiriesCount: 0,
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);
    fetch('/api/map/public', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d) setMapData(d);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const flyToLocation = (coords: [number, number], label: string, zoom = 6.5) => {
    setSelectedLabel(label);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(coords, zoom, { duration: 1.1 });
    }
  };

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;
    let cancelled = false;

    const initLeaflet = async () => {
      try {
        const L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');
        if (cancelled || !mapContainerRef.current) return;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          center: [22.2, 80.2],
          zoom: 4.5,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        // Open-source CartoDB Dark Matter tiles for dramatic 3D Living India night-studio look
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 19,
        }).addTo(map);

        const makeGlowingPin = (colorHex: string, ringColor: string, code: string) =>
          L.divIcon({
            className: 'ugt-3d-pin',
            html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:28px;height:28px;">
              <span style="position:absolute;inset:0;border-radius:9999px;background:${ringColor};opacity:0.42;animation:pulse-ring 2s infinite;"></span>
              <span style="position:relative;width:18px;height:18px;border-radius:9999px;background:${colorHex};border:2px solid #ffffff;box-shadow:0 0 14px ${colorHex};display:flex;align-items:center;justify-content:center;font-family:monospace;font-size:8px;font-weight:800;color:#02140D;">${code}</span>
            </div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

        // 1. Live 8 Living India National Mission Hubs (Real DB raised_amount & targets)
        if (filter === 'all' || filter === 'missions') {
          causes.forEach((c, idx) => {
            const hub = MISSION_HUB_COORDS[c.id] || {
              city: 'India',
              state: 'National',
              coords: [22.5, 79.0] as [number, number],
            };
            const raised = Math.round(c.raised_amount || 0);
            const target = Math.round(c.target_amount || 500000);
            const pct = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;

            L.marker(hub.coords, {
              icon: makeGlowingPin('#34D399', 'rgba(52,211,153,0.55)', `0${idx + 1}`),
            })
              .bindPopup(
                `<div style="font-family:'Plus Jakarta Sans',sans-serif;background:#031810;color:#ffffff;padding:8px 10px;border-radius:10px;min-width:190px;border:1px solid rgba(52,211,153,0.45);">
                  <div style="font-family:monospace;font-size:10px;color:#34D399;letter-spacing:0.12em;">MISSION 0${idx + 1} · ${hub.state.toUpperCase()}</div>
                  <div style="font-weight:800;font-size:13px;margin:3px 0;">${c.title}</div>
                  <div style="font-size:11px;color:#cbd5e1;">${hub.city}, ${hub.state}</div>
                  <div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.12);display:flex;justify-content:space-between;font-family:monospace;font-size:11px;">
                    <span style="color:#34D399;font-weight:700;">₹${raised.toLocaleString('en-IN')}</span>
                    <span style="color:#94a3b8;">${pct}% of ₹${target.toLocaleString('en-IN')}</span>
                  </div>
                </div>`,
                { className: 'ugt-dark-popup' }
              )
              .addTo(map);
          });
        }

        // 2. Real Verified Zero-Chemical Manufacturers
        if (filter === 'all' || filter === 'makers') {
          mapData.verifiedMakers.forEach((m: any) => {
            const coords = STATE_COORDS[m.state] || [22.5, 79.0];
            L.marker(coords, {
              icon: makeGlowingPin('#FCD34D', 'rgba(252,211,77,0.55)', 'M'),
            })
              .bindPopup(
                `<div style="font-family:'Plus Jakarta Sans',sans-serif;background:#031810;color:#ffffff;padding:8px 10px;border-radius:10px;min-width:190px;border:1px solid rgba(252,211,77,0.5);">
                  <div style="font-family:monospace;font-size:10px;color:#FCD34D;letter-spacing:0.12em;">VERIFIED MAKER</div>
                  <div style="font-weight:800;font-size:13px;margin:3px 0;">${m.store_name}</div>
                  <div style="font-size:11px;color:#cbd5e1;">${m.business_type} · ${m.city}, ${m.state}</div>
                  <div style="margin-top:6px;font-family:monospace;font-size:11px;color:#34D399;">Certified Live Products: ${m.live_products || 0}</div>
                </div>`,
                { className: 'ugt-dark-popup' }
              )
              .addTo(map);
          });
        }

        // 3. Real Verified GPS Ground Field Audits
        if (filter === 'all' || filter === 'audits') {
          mapData.verifiedAudits.forEach((a: any) => {
            const coords: [number, number] =
              a.latitude && a.longitude
                ? [Number(a.latitude), Number(a.longitude)]
                : STATE_COORDS[a.state] || [22.5, 79.0];
            L.marker(coords, {
              icon: makeGlowingPin('#38BDF8', 'rgba(56,189,248,0.55)', 'A'),
            })
              .bindPopup(
                `<div style="font-family:'Plus Jakarta Sans',sans-serif;background:#031810;color:#ffffff;padding:8px 10px;border-radius:10px;min-width:190px;border:1px solid rgba(56,189,248,0.5);">
                  <div style="font-family:monospace;font-size:10px;color:#38BDF8;letter-spacing:0.12em;">GPS FIELD AUDIT</div>
                  <div style="font-weight:800;font-size:13px;margin:3px 0;">${a.subject_name}</div>
                  <div style="font-size:11px;color:#cbd5e1;">${a.audit_type} · ${a.district ? a.district + ', ' : ''}${a.state}</div>
                  <div style="margin-top:6px;font-family:monospace;font-size:10px;color:#34D399;">✓ Verified by ${a.auditor_name}</div>
                </div>`,
                { className: 'ugt-dark-popup' }
              )
              .addTo(map);
          });
        }

        mapInstanceRef.current = map;
      } catch (e) {
        console.error('Map load error:', e);
      }
    };

    initLeaflet();
    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, mapData, filter, causes]);

  if (!isOpen) return null;

  const totalRaised = causes.reduce((s, c) => s + (c.raised_amount || 0), 0);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl bg-[#02140D] border border-emerald-400/30 rounded-2xl shadow-[0_32px_90px_-20px_rgba(0,0,0,0.95)] overflow-hidden my-3 flex flex-col max-h-[94vh] text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hero-horizon-bar" />

        {/* Dark Studio Header */}
        <div className="px-5 py-4 bg-[#031C13] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-400/15 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-300 flex items-center space-x-1.5">
                <span className="live-dot" />
                <span>LIVE REAL-TIME GEOSPATIAL TELEMETRY</span>
              </div>
              <h2 className="text-base sm:text-xl font-display font-extrabold uppercase tracking-tight text-white">
                3D LIVING INDIA LIVE MAP
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setView3D((v) => !v)}
              className={`px-3.5 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-[0.14em] font-bold inline-flex items-center space-x-1.5 border transition-all ${
                view3D
                  ? 'bg-emerald-400 text-black border-emerald-300'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/15'
              }`}
            >
              {view3D ? <Box className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
              <span>{view3D ? '3D Tilt Active' : 'Switch to 3D'}</span>
            </button>

            <button
              type="button"
              onClick={() => flyToLocation([22.2, 80.2], 'All India Live Telemetry', 4.5)}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-[10px] font-mono uppercase tracking-wider text-white/85"
            >
              Reset India
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors"
              aria-label="Close map"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Telemetry & Filter Strip */}
        <div className="px-5 py-3 bg-[#02120B] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/35 text-emerald-300 font-bold">
              ● {causes.length || 8} Missions (₹{Math.round(totalRaised).toLocaleString('en-IN')})
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-400/15 border border-amber-300/35 text-amber-200 font-bold">
              ● {mapData.stats.verifiedMakersCount} Verified Makers
            </span>
            <span className="px-3 py-1 rounded-full bg-sky-400/15 border border-sky-300/35 text-sky-200 font-bold">
              ● {mapData.stats.verifiedAuditsCount} Field Audits
            </span>
            <span className="hidden md:inline px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/75">
              {mapData.stats.activeSubscriptions} Boxes · {mapData.stats.bulkInquiriesCount} CSR
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-[10px] font-mono uppercase tracking-wider">
            {(['all', 'missions', 'makers', 'audits'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full font-bold transition-all ${
                  filter === f
                    ? 'bg-white text-black'
                    : 'bg-white/[0.06] border border-white/15 text-white/75 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Main 3D Map + Live Clickable Directory */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12">
          {/* 3D Perspective Studio Map Viewport */}
          <div className="lg:col-span-8 relative min-h-[380px] sm:min-h-[480px] bg-[#010A06] overflow-hidden flex items-center justify-center">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-10"
              style={{
                background:
                  'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 55%, rgba(2, 20, 13, 0.82) 100%)',
              }}
            />

            <div className="absolute top-3 left-3 z-20 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-emerald-400/35 text-[10px] font-mono uppercase tracking-[0.14em] text-emerald-300">
              FOCUS: {selectedLabel}
            </div>

            {loading && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 text-xs font-mono text-emerald-300 space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>SYNCING LIVE INDIA TELEMETRY...</span>
              </div>
            )}

            <div
              className="w-full h-full min-h-[380px] sm:min-h-[480px] transition-transform duration-700 ease-out"
              style={{
                transform: view3D
                  ? 'perspective(1350px) rotateX(22deg) scale(1.14) translateY(-14px)'
                  : 'none',
                transformOrigin: 'center center',
              }}
            >
              <div
                ref={mapContainerRef}
                className="w-full h-full min-h-[380px] sm:min-h-[480px]"
                style={{ filter: 'hue-rotate(-15deg) saturate(1.25) contrast(1.06)' }}
              />
            </div>
          </div>

          {/* Interactive Real-Data Live Telemetry Sidebar */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-white/10 p-4 space-y-5 bg-[#03160F] overflow-y-auto max-h-[500px] scrollbar-thin">
            {/* 8 Living India Missions (Click to Fly 3D Map) */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-emerald-300 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>08 Living India Mission Nodes</span>
              </div>
              <div className="space-y-1.5">
                {causes.map((c, idx) => {
                  const hub = MISSION_HUB_COORDS[c.id] || {
                    city: 'India',
                    state: 'National',
                    coords: [22.5, 79.0] as [number, number],
                  };
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => flyToLocation(hub.coords, `${c.title} (${hub.city})`)}
                      className="w-full text-left p-2.5 rounded-xl bg-white/[0.04] hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-400/45 transition-all flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-white truncate">
                          <span className="font-mono text-[10px] text-emerald-400 mr-1.5">
                            0{idx + 1}/
                          </span>
                          {c.title}
                        </div>
                        <div className="text-[10px] text-white/55">
                          {hub.city}, {hub.state}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-emerald-300 text-[11px] shrink-0">
                        ₹{Math.round(c.raised_amount || 0).toLocaleString('en-IN')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Real Approved Zero-Chemical Makers */}
            <div className="space-y-2 pt-3 border-t border-white/10">
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-amber-300 flex items-center space-x-1.5">
                <Store className="w-3.5 h-3.5" />
                <span>Verified Zero-Chemical Makers ({mapData.verifiedMakers.length})</span>
              </div>
              {mapData.verifiedMakers.length === 0 ? (
                <p className="text-[11px] text-white/50 leading-relaxed">
                  Admin-approved manufacturers with Quality &amp; Zero-Chemical certificates appear here live.
                </p>
              ) : (
                mapData.verifiedMakers.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() =>
                      flyToLocation(STATE_COORDS[m.state] || [22.5, 79.0], `${m.store_name} (${m.state})`)
                    }
                    className="w-full text-left p-2.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-300/25 text-xs transition-all"
                  >
                    <div className="font-bold text-white">{m.store_name}</div>
                    <div className="text-[11px] text-amber-200">
                      {m.business_type} · {m.city}, {m.state}
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Real Verified Ground Field Audits */}
            <div className="space-y-2 pt-3 border-t border-white/10">
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-sky-300 flex items-center space-x-1.5">
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>Verified GPS Field Audits ({mapData.verifiedAudits.length})</span>
              </div>
              {mapData.verifiedAudits.length === 0 ? (
                <p className="text-[11px] text-white/50 leading-relaxed">
                  GPS-tagged field inspections verified by UGT India Admin appear live on this 3D map.
                </p>
              ) : (
                mapData.verifiedAudits.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() =>
                      flyToLocation(
                        a.latitude && a.longitude
                          ? [Number(a.latitude), Number(a.longitude)]
                          : STATE_COORDS[a.state] || [22.5, 79.0],
                        `${a.subject_name} (${a.state})`,
                        8
                      )
                    }
                    className="w-full text-left p-2.5 rounded-xl bg-sky-400/10 hover:bg-sky-400/20 border border-sky-300/25 text-xs transition-all"
                  >
                    <div className="font-bold text-white">{a.subject_name}</div>
                    <div className="text-[11px] text-sky-200">
                      {a.audit_type} · {a.district ? `${a.district}, ` : ''}{a.state}
                    </div>
                    <div className="text-[10px] text-emerald-300 mt-0.5 flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified by {a.auditor_name}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
