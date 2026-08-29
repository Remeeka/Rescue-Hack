import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon URLs in bundled apps
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom colored marker helper
const createColoredMarker = (color, label = '') => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background-color: ${color};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 11px;
        font-weight: bold;
      ">
        ${label}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

export default function RescueMap({ caseData, sightings = [] }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Default coordinate center (fallback: Chennai / City center coords)
  const defaultCenter = [13.0827, 80.2707];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    const bounds = [];

    // 1. Last Known Location Marker
    const originLat = 13.0827;
    const originLng = 80.2707;
    const originMarker = L.marker([originLat, originLng], {
      icon: createColoredMarker('#dc2626', '★'),
    }).bindPopup(`
      <div style="font-family: sans-serif; font-size: 13px; line-height: 1.4;">
        <div style="background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 11px; display: inline-block; margin-bottom: 4px;">
          LAST CONFIRMED ORIGIN
        </div>
        <div style="font-weight: bold; font-size: 14px; color: #0f172a;">${caseData?.last_known_location || 'Central Point'}</div>
        <div style="color: #64748b; font-size: 12px; margin-top: 2px;">Time: ${caseData?.last_known_time || 'Unspecified'}</div>
        <div style="margin-top: 6px; font-size: 12px; color: #334155;">Missing: <strong>${caseData?.full_name || 'Subject'}</strong></div>
      </div>
    `);

    markersLayer.addLayer(originMarker);
    bounds.push([originLat, originLng]);

    // 2. Sightings Markers (offset simulated relative coordinates if string names are provided)
    sightings.forEach((sighting, index) => {
      // Deterministic slight offset for demo visualization
      const angle = (index + 1) * 1.3;
      const dist = 0.008 * (index + 1);
      const lat = originLat + Math.cos(angle) * dist;
      const lng = originLng + Math.sin(angle) * dist;

      let pinColor = '#94a3b8'; // Grey for insufficient
      let badgeColor = '#f1f5f9';
      let badgeText = '#475569';
      const rel = sighting.relevance_level || 'INSUFFICIENT INFORMATION';

      if (rel === 'HIGH') {
        pinColor = '#ea580c'; // Orange-Red
        badgeColor = '#ffedd5';
        badgeText = '#9a3412';
      } else if (rel === 'MEDIUM') {
        pinColor = '#eab308'; // Amber
        badgeColor = '#fef3c7';
        badgeText = '#92400e';
      } else if (rel === 'LOW') {
        pinColor = '#3b82f6'; // Blue
        badgeColor = '#dbeafe';
        badgeText = '#1e40af';
      }

      const marker = L.marker([lat, lng], {
        icon: createColoredMarker(pinColor, (index + 1).toString()),
      }).bindPopup(`
        <div style="font-family: sans-serif; font-size: 13px; line-height: 1.4; max-width: 220px;">
          <div style="background: ${badgeColor}; color: ${badgeText}; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px; display: inline-block; margin-bottom: 4px;">
            AI RELEVANCE: ${rel}
          </div>
          <div style="font-weight: bold; font-size: 13px; color: #0f172a;">${sighting.extracted_location || sighting.location || 'Reported Location'}</div>
          <div style="color: #64748b; font-size: 12px;">Time: ${sighting.extracted_time || sighting.time || 'Approximate'}</div>
          <div style="margin-top: 6px; font-size: 12px; color: #334155; border-top: 1px solid #e2e8f0; padding-top: 4px;">
            ${sighting.extracted_summary || sighting.original_report}
          </div>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">Language: ${sighting.extracted_language || 'English'}</div>
        </div>
      `);

      markersLayer.addLayer(marker);
      bounds.push([lat, lng]);
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [caseData, sightings]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <h3 className="text-sm font-semibold text-white">Geographic Sightings Plot</h3>
        </div>
        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-300">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span> Origin
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600 inline-block"></span> High
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Medium
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Low
          </span>
        </div>
      </div>
      <div ref={mapContainerRef} className="w-full h-80 md:h-96 relative z-0" />
    </div>
  );
}
