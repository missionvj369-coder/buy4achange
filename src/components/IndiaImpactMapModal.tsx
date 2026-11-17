import React, { useEffect, useRef, useState } from 'react';
import { X, MapPin, ShieldCheck, Store, ClipboardCheck, RefreshCw } from 'lucide-react';
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

export const IndiaImpactMapModal: React.FC<IndiaImpactMapModalProps> = ({
  isOpen,
  onClose,
  causes,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'makers' | 'audits'>('all');
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

  // Dynamically load open-source Leaflet + OpenStreetMap tiles ONLY when opened
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
          center: [22.5, 79.0],
          zoom: 4.5,
          scrollWheelZoom: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(map);

        if (filter === 'all' || filter === 'makers') {
          mapData.verifiedMakers.forEach((m: any) => {
            const coords = STATE_COORDS[m.state] || [22.5, 79.0];
            L.circleMarker(coords, {
              radius: 8,
              fillColor: '#166534',
              color: '#ffffff',
              weight: 2,
              fillOpacity: 0.9,
            })
              .bindPopup(
                `<div style="font-family:Inter,sans-serif;font-size:12px;">
                  <strong>${m.store_name}</strong><br/>
                  <span style="color:#166534;font-weight:600;">✓ Verified Zero-Chemical Maker</span><br/>
                  ${m.business_type} · ${m.city}, ${m.state}<br/>
                  Live Certified Products: ${m.live_products || 0}
                </div>`
              )
              .addTo(map);
          });
        }

        if (filter === 'all' || filter === 'audits') {
          mapData.verifiedAudits.forEach((a: any) => {
            const coords: [number, number] =
              a.latitude && a.longitude
                ? [Number(a.latitude), Number(a.longitude)]
                : STATE_COORDS[a.state] || [22.5, 79.0];
            L.circleMarker(coords, {
              radius: 7,
              fillColor: '#0284c7',
              color: '#ffffff',
              weight: 2,
              fillOpacity: 0.9,
            })
              .bindPopup(
                `<div style="font-family:Inter,sans-serif;font-size:12px;">
                  <strong>${a.subject_name}</strong><br/>
                  <span style="color:#0284c7;font-weight:600;">✓ Field Audit Verified</span><br/>
                  ${a.audit_type} · ${a.district ? a.district + ', ' : ''}${a.state}
                </div>`
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
  }, [isOpen, mapData, filter]);

  if (!isOpen) return null;

  const totalRaised = causes.reduce((s, c) => s + (c.raised_amount || 0), 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/55 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-[#FAF9F6] border-b border-gray-200 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#166534]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-gray-900">
                Living India Live Map (OpenStreetMap)
              </h2>
              <p className="text-xs text-gray-500">
                Verified Zero-Chemical Manufacturers, Field Audits &amp; National Mission Reach
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 text-gray-600"
            aria-label="Close map"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Telemetry Bar */}
        <div className="px-5 py-3 bg-white border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] font-semibold">
              ● {mapData.stats.verifiedMakersCount} Verified Makers
            </span>
            <span className="px-2.5 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 font-semibold">
              ● {mapData.stats.verifiedAuditsCount} Field Audits
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#FAF9F6] border border-gray-200 text-gray-700 font-semibold">
              ₹{Math.round(totalRaised).toLocaleString('en-IN')} Mission Funds
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-xs">
            {(['all', 'makers', 'audits'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg font-semibold ${
                  filter === f
                    ? 'bg-[#166534] text-white'
                    : 'bg-[#FAF9F6] border border-gray-200 text-gray-700'
                }`}
              >
                {f === 'all' ? 'All' : f === 'makers' ? 'Makers' : 'Field Audits'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12">
          {/* OpenStreetMap Viewport */}
          <div className="lg:col-span-8 relative min-h-[340px] sm:min-h-[440px] bg-[#FAF9F6]">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 text-xs text-gray-600 space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#166534]" />
                <span>Loading India map data...</span>
              </div>
            )}
            <div ref={mapContainerRef} className="w-full h-full min-h-[340px] sm:min-h-[440px]" />
          </div>

          {/* Accessible Directory Sidebar (Works Even on Slow Connections / Old Phones) */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-gray-200 p-4 space-y-4 bg-white overflow-y-auto max-h-[440px]">
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#166534] flex items-center space-x-1.5">
                <Store className="w-3.5 h-3.5" />
                <span>Verified Zero-Chemical Makers</span>
              </div>
              {mapData.verifiedMakers.length === 0 ? (
                <p className="text-xs text-gray-500">
                  Approved zero-chemical manufacturers appear live on the map as soon as Admin approves them.
                </p>
              ) : (
                mapData.verifiedMakers.map((m) => (
                  <div key={m.id} className="p-2.5 rounded-lg bg-[#FAF9F6] border border-gray-200 text-xs">
                    <div className="font-semibold text-gray-900">{m.store_name}</div>
                    <div className="text-[11px] text-[#166534]">
                      {m.business_type} · {m.city}, {m.state}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2 pt-3 border-t border-gray-200">
              <div className="text-xs font-bold uppercase tracking-wider text-sky-800 flex items-center space-x-1.5">
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>Verified Ground Field Audits</span>
              </div>
              {mapData.verifiedAudits.length === 0 ? (
                <p className="text-xs text-gray-500">
                  Verified UGT India field inspection reports with GPS coordinates appear here.
                </p>
              ) : (
                mapData.verifiedAudits.map((a) => (
                  <div key={a.id} className="p-2.5 rounded-lg bg-sky-50/50 border border-sky-200 text-xs">
                    <div className="font-semibold text-gray-900">{a.subject_name}</div>
                    <div className="text-[11px] text-sky-800">
                      {a.audit_type} · {a.district ? `${a.district}, ` : ''}{a.state}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5 flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3 text-[#166534]" />
                      <span>Audited by {a.auditor_name}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
