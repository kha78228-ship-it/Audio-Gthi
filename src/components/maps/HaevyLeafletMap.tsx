import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapMember, SafeZone } from '../../types';
import { calculateDistanceKm, formatDistance, estimateTravelTime } from '../../utils/mapsUtils';

interface HaevyLeafletMapProps {
  userLocation: { lat: number; lng: number };
  members: MapMember[];
  selectedMemberId: string | null;
  onSelectMember: (member: MapMember) => void;
  safeZones: SafeZone[];
  mapStyle: 'dark' | 'satellite' | 'street';
  isLiveTracking: boolean;
  filterCategory: 'all' | 'couple' | 'family' | 'friend';
}

const TILE_LAYERS = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
    maxZoom: 19
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18
  },
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  }
};

export const HaevyLeafletMap: React.FC<HaevyLeafletMapProps> = ({
  userLocation,
  members,
  selectedMemberId,
  onSelectMember,
  safeZones,
  mapStyle,
  isLiveTracking,
  filterCategory
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const zonesGroupRef = useRef<L.LayerGroup | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const routeDistanceMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    // Custom bottom-right zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial tile layer
    const config = TILE_LAYERS[mapStyle];
    const tileLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Layer groups for markers & zones
    zonesGroupRef.current = L.layerGroup().addTo(map);
    markersGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when mapStyle changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const config = TILE_LAYERS[mapStyle];
    tileLayerRef.current.setUrl(config.url);
  }, [mapStyle]);

  // Render Safe Zones
  useEffect(() => {
    if (!mapInstanceRef.current || !zonesGroupRef.current) return;
    zonesGroupRef.current.clearLayers();

    safeZones.forEach((zone) => {
      const circle = L.circle([zone.latitude, zone.longitude], {
        radius: zone.radiusMeters,
        color: zone.color,
        fillColor: zone.color,
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '4, 6'
      });

      // Zone tooltip
      circle.bindTooltip(
        `<div style="font-family: inherit; font-size: 11px; font-weight: 600; padding: 2px 4px;">
          <span style="color: ${zone.color};">●</span> ${zone.name}
        </div>`,
        { permanent: false, direction: 'top', className: 'haevy-zone-tooltip' }
      );

      zonesGroupRef.current?.addLayer(circle);
    });
  }, [safeZones]);

  // Render User Marker, Member Markers, and Route Line
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;
    markersGroupRef.current.clearLayers();

    // 1. Current User Marker ("Bạn / Chính tôi")
    const userIconHtml = `
      <div class="relative flex items-center justify-center cursor-pointer group" style="width: 44px; height: 44px;">
        <div class="absolute inset-0 rounded-full bg-emerald-500/25 animate-ping"></div>
        <div class="absolute inset-1 rounded-full bg-emerald-500/35 animate-pulse"></div>
        <div class="relative w-9 h-9 rounded-full bg-zinc-950 border-2 border-emerald-400 shadow-xl flex items-center justify-center overflow-hidden">
          <div class="w-full h-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black text-xs">
            BẠN
          </div>
        </div>
        <div class="absolute -bottom-1 bg-zinc-900/90 text-emerald-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/40 shadow">
          Vị trí của bạn
        </div>
      </div>
    `;

    const userMarkerIcon = L.divIcon({
      html: userIconHtml,
      className: 'haevy-user-map-marker',
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lng], {
      icon: userMarkerIcon,
      zIndexOffset: 1000
    });
    markersGroupRef.current.addLayer(userMarker);

    // Filter members by category if needed
    const visibleMembers = members.filter((m) => {
      if (filterCategory === 'all') return true;
      return m.category === filterCategory;
    });

    // 2. Member Markers
    visibleMembers.forEach((member) => {
      const isSelected = member.id === selectedMemberId;
      const isLover = member.role === 'lover' || member.role === 'spouse';
      const isFamily = member.category === 'family';

      // Styling parameters
      let borderColor = 'border-sky-400';
      let ringColor = 'bg-sky-500/20';
      let badgeBg = 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      let auraGlow = 'shadow-sky-500/50';

      if (isLover) {
        borderColor = 'border-rose-400';
        ringColor = 'bg-rose-500/30';
        badgeBg = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
        auraGlow = 'shadow-rose-500/60';
      } else if (isFamily) {
        borderColor = 'border-amber-400';
        ringColor = 'bg-amber-500/25';
        badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
        auraGlow = 'shadow-amber-500/50';
      }

      const memberIconHtml = `
        <div class="relative flex flex-col items-center justify-center cursor-pointer transition-transform duration-300 ${isSelected ? 'scale-115' : 'hover:scale-105'}" style="width: 52px; height: 60px;">
          ${isLover ? `<div class="absolute -top-2 text-sm animate-bounce">💖</div>` : ''}
          ${member.activity !== 'still' ? `<div class="absolute inset-0 rounded-full ${ringColor} animate-ping"></div>` : ''}
          
          <div class="relative w-10 h-10 rounded-full bg-zinc-900 border-2 ${borderColor} shadow-lg ${auraGlow} overflow-hidden">
            <img src="${member.avatar}" alt="${member.name}" class="w-full h-full object-cover" />
          </div>

          <!-- Battery pill badge -->
          <div class="absolute top-7 -right-1 bg-zinc-950/95 text-[9px] font-bold px-1 rounded-full border border-zinc-700 flex items-center gap-0.5 ${member.battery < 20 ? 'text-red-400' : 'text-emerald-400'}">
            <span>${member.battery}%</span>
          </div>

          <!-- Name label -->
          <div class="mt-1 bg-zinc-900/90 text-zinc-200 text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-zinc-700/80 shadow whitespace-nowrap max-w-[80px] truncate text-center">
            ${member.name}
          </div>
        </div>
      `;

      const memberMarkerIcon = L.divIcon({
        html: memberIconHtml,
        className: 'haevy-member-map-marker',
        iconSize: [52, 60],
        iconAnchor: [26, 30]
      });

      const marker = L.marker([member.latitude, member.longitude], {
        icon: memberMarkerIcon,
        zIndexOffset: isSelected ? 900 : 500
      });

      marker.on('click', () => {
        onSelectMember(member);
      });

      markersGroupRef.current?.addLayer(marker);
    });

    // 3. Render Route Line to Selected Member (or Lover by default if none selected)
    const activeTarget = selectedMemberId
      ? members.find((m) => m.id === selectedMemberId)
      : members.find((m) => m.role === 'lover' || m.role === 'spouse');

    // Clean previous line & distance tag
    if (routeLineRef.current) {
      mapInstanceRef.current.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }
    if (routeDistanceMarkerRef.current) {
      mapInstanceRef.current.removeLayer(routeDistanceMarkerRef.current);
      routeDistanceMarkerRef.current = null;
    }

    if (activeTarget && mapInstanceRef.current) {
      const isLover = activeTarget.role === 'lover' || activeTarget.role === 'spouse';
      const lineColor = isLover ? '#f43f5e' : '#38bdf8'; // rose-500 or sky-400
      const distKm = calculateDistanceKm(
        userLocation.lat,
        userLocation.lng,
        activeTarget.latitude,
        activeTarget.longitude
      );
      const times = estimateTravelTime(distKm);

      // Curved or dashed polyline
      const line = L.polyline(
        [
          [userLocation.lat, userLocation.lng],
          [activeTarget.latitude, activeTarget.longitude]
        ],
        {
          color: lineColor,
          weight: 3.5,
          opacity: 0.85,
          dashArray: '8, 8',
          lineCap: 'round'
        }
      ).addTo(mapInstanceRef.current);

      routeLineRef.current = line;

      // Distance tag marker in the middle
      const midLat = (userLocation.lat + activeTarget.latitude) / 2;
      const midLng = (userLocation.lng + activeTarget.longitude) / 2;

      const tagHtml = `
        <div class="bg-zinc-950/95 border border-zinc-700 shadow-xl rounded-full px-2 py-0.5 text-[10px] font-bold flex items-center gap-1.5 text-zinc-100 whitespace-nowrap cursor-pointer">
          <span style="color: ${lineColor};">⚡ ${formatDistance(distKm)}</span>
          <span class="text-zinc-400">~${times.motorcycleMin}p xe máy</span>
        </div>
      `;

      const tagIcon = L.divIcon({
        html: tagHtml,
        className: 'haevy-route-distance-tag',
        iconSize: [110, 24],
        iconAnchor: [55, 12]
      });

      const distMarker = L.marker([midLat, midLng], {
        icon: tagIcon,
        interactive: false
      }).addTo(mapInstanceRef.current);

      routeDistanceMarkerRef.current = distMarker;
    }
  }, [userLocation, members, selectedMemberId, filterCategory]);

  // Center on selected member if user clicks a member
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedMemberId) return;
    const target = members.find((m) => m.id === selectedMemberId);
    if (target) {
      mapInstanceRef.current.panTo([target.latitude, target.longitude], {
        animate: true,
        duration: 0.8
      });
    }
  }, [selectedMemberId]);

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800/80 shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Subtle Map Atmosphere Vignette */}
      <div className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_80px_rgba(0,0,0,0.6)]" />
    </div>
  );
};
