import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Bike,
  Car,
  Coffee,
  Compass,
  Footprints,
  Route as RouteIcon,
  Sparkles,
  Star,
  Trees,
  Utensils,
  X
} from 'lucide-react';
import { MapMember, SafeZone } from '../../types';
import { calculateDistanceKm, formatDistance, estimateTravelTime } from '../../utils/mapsUtils';
import { ComputedRouteSummary, DiscoveredMeetupPlace } from './HaevyGoogleMap';

interface HaevyLeafletMapProps {
  userLocation: { lat: number; lng: number };
  members: MapMember[];
  selectedMemberId: string | null;
  onSelectMember: (member: MapMember) => void;
  safeZones: SafeZone[];
  mapStyle: 'dark' | 'satellite' | 'street';
  isLiveTracking: boolean;
  filterCategory: 'all' | 'couple' | 'family' | 'friend';
  activeRouteTravelMode?: 'DRIVING' | 'TWO_WHEELER' | 'WALKING' | null;
  onChangeRouteTravelMode?: (mode: 'DRIVING' | 'TWO_WHEELER' | 'WALKING' | null) => void;
  streetViewTarget?: { lat: number; lng: number; title: string } | null;
  onCloseStreetView?: () => void;
  onOpenStreetView?: (target: { lat: number; lng: number; title: string }) => void;
  isMeetupFinderOpen?: boolean;
  onCloseMeetupFinder?: () => void;
  selectedMeetupSpot?: DiscoveredMeetupPlace | null;
  onSelectMeetupSpot?: (spot: DiscoveredMeetupPlace | null) => void;
  onRouteSummaryChange?: (summary: ComputedRouteSummary | null) => void;
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
  filterCategory,
  activeRouteTravelMode = null,
  onChangeRouteTravelMode,
  streetViewTarget = null,
  onCloseStreetView,
  isMeetupFinderOpen = false,
  onCloseMeetupFinder,
  selectedMeetupSpot = null,
  onSelectMeetupSpot,
  onRouteSummaryChange
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const zonesGroupRef = useRef<L.LayerGroup | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const routeDistanceMarkerRef = useRef<L.Marker | null>(null);

  const [meetupCategory, setMeetupCategory] = useState<'cafe' | 'restaurant' | 'park'>('cafe');

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

      circle.bindTooltip(
        `<div style="font-family: inherit; font-size: 11px; font-weight: 600; padding: 2px 4px;">
          <span style="color: ${zone.color};">●</span> ${zone.name}
        </div>`,
        { permanent: false, direction: 'top', className: 'haevy-zone-tooltip' }
      );

      zonesGroupRef.current?.addLayer(circle);
    });
  }, [safeZones]);

  // Render User Marker, Member Markers, Meetup Spot, and Route Line
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;
    markersGroupRef.current.clearLayers();

    // 1. Current User Marker ("Bạn / Chính tôi")
    if (isLiveTracking) {
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
    }

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

      let borderColor = 'border-sky-400';
      let ringColor = 'bg-sky-500/20';
      let auraGlow = 'shadow-sky-500/50';

      if (isLover) {
        borderColor = 'border-rose-400';
        ringColor = 'bg-rose-500/30';
        auraGlow = 'shadow-rose-500/60';
      } else if (isFamily) {
        borderColor = 'border-amber-400';
        ringColor = 'bg-amber-500/25';
        auraGlow = 'shadow-amber-500/50';
      }

      const memberIconHtml = `
        <div class="relative flex flex-col items-center justify-center cursor-pointer transition-transform duration-300 ${isSelected ? 'scale-115' : 'hover:scale-105'}" style="width: 52px; height: 60px;">
          ${isLover ? `<div class="absolute -top-2 text-sm animate-bounce">💖</div>` : ''}
          ${member.activity !== 'still' ? `<div class="absolute inset-0 rounded-full ${ringColor} animate-ping"></div>` : ''}
          
          <div class="relative w-10 h-10 rounded-full bg-zinc-900 border-2 ${borderColor} shadow-lg ${auraGlow} overflow-hidden">
            <img src="${member.avatar}" alt="${member.name}" class="w-full h-full object-cover" />
          </div>

          <div class="absolute top-7 -right-1 bg-zinc-950/95 text-[9px] font-bold px-1 rounded-full border border-zinc-700 flex items-center gap-0.5 ${member.battery < 20 ? 'text-red-400' : 'text-emerald-400'}">
            <span>${member.battery}%</span>
          </div>

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

    // 2b. Selected Meetup Spot Marker
    if (selectedMeetupSpot) {
      const spotHtml = `
        <div class="flex flex-col items-center">
          <div class="px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-extrabold shadow-xl border border-white/40 whitespace-nowrap animate-bounce">
            📍 Điểm Hẹn: ${selectedMeetupSpot.displayName}
          </div>
        </div>
      `;
      const spotIcon = L.divIcon({
        html: spotHtml,
        className: 'haevy-meetup-spot-marker',
        iconSize: [140, 28],
        iconAnchor: [70, 14]
      });
      const spotMarker = L.marker([selectedMeetupSpot.lat, selectedMeetupSpot.lng], {
        icon: spotIcon,
        zIndexOffset: 950
      });
      markersGroupRef.current?.addLayer(spotMarker);
    }

    // 3. Render Route Line to Selected Meetup Spot or Selected Member (or Lover by default)
    const activeMemberTarget = selectedMemberId
      ? members.find((m) => m.id === selectedMemberId)
      : members.find((m) => m.role === 'lover' || m.role === 'spouse');

    const destCoords = selectedMeetupSpot
      ? { lat: selectedMeetupSpot.lat, lng: selectedMeetupSpot.lng, isLover: true }
      : activeMemberTarget
      ? {
          lat: activeMemberTarget.latitude,
          lng: activeMemberTarget.longitude,
          isLover: activeMemberTarget.role === 'lover' || activeMemberTarget.role === 'spouse'
        }
      : null;

    if (routeLineRef.current) {
      mapInstanceRef.current.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }
    if (routeDistanceMarkerRef.current) {
      mapInstanceRef.current.removeLayer(routeDistanceMarkerRef.current);
      routeDistanceMarkerRef.current = null;
    }

    if (destCoords && mapInstanceRef.current) {
      const lineColor = activeRouteTravelMode
        ? '#10b981'
        : destCoords.isLover
        ? '#f43f5e'
        : '#38bdf8';
      const distKm = calculateDistanceKm(
        userLocation.lat,
        userLocation.lng,
        destCoords.lat,
        destCoords.lng
      );
      const times = estimateTravelTime(distKm);

      if (activeRouteTravelMode) {
        const durationMin =
          activeRouteTravelMode === 'WALKING'
            ? times.walkingMin
            : activeRouteTravelMode === 'DRIVING'
            ? times.drivingMin
            : times.motorcycleMin;
        onRouteSummaryChange?.({
          distanceMeters: Math.round(distKm * 1000),
          durationMillis: durationMin * 60000,
          travelMode: activeRouteTravelMode
        });
      } else {
        onRouteSummaryChange?.(null);
      }

      const line = L.polyline(
        [
          [userLocation.lat, userLocation.lng],
          [destCoords.lat, destCoords.lng]
        ],
        {
          color: lineColor,
          weight: activeRouteTravelMode ? 5 : 3.5,
          opacity: 0.9,
          dashArray: activeRouteTravelMode ? undefined : '8, 8',
          lineCap: 'round'
        }
      ).addTo(mapInstanceRef.current);

      routeLineRef.current = line;

      const midLat = (userLocation.lat + destCoords.lat) / 2;
      const midLng = (userLocation.lng + destCoords.lng) / 2;

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
  }, [
    userLocation,
    members,
    selectedMemberId,
    filterCategory,
    isLiveTracking,
    selectedMeetupSpot,
    activeRouteTravelMode
  ]);

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

  // Center on meetup spot when selected
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedMeetupSpot) return;
    mapInstanceRef.current.panTo([selectedMeetupSpot.lat, selectedMeetupSpot.lng], {
      animate: true,
      duration: 0.8
    });
  }, [selectedMeetupSpot]);

  const selectedMember = members.find((m) => m.id === selectedMemberId) || null;
  const partnerOrSelectedMember =
    selectedMember || members.find((m) => m.role === 'lover' || m.role === 'spouse') || members[0];

  const midpointLat = partnerOrSelectedMember
    ? (userLocation.lat + partnerOrSelectedMember.latitude) / 2
    : userLocation.lat;
  const midpointLng = partnerOrSelectedMember
    ? (userLocation.lng + partnerOrSelectedMember.longitude) / 2
    : userLocation.lng;

  const curatedMeetupSpots: DiscoveredMeetupPlace[] = [
    {
      id: `spot-${meetupCategory}-1`,
      displayName:
        meetupCategory === 'cafe'
          ? 'The Workshop Specialty Coffee'
          : meetupCategory === 'restaurant'
          ? 'Pizza 4P’s Bến Thành'
          : 'Công Viên Bến Bạch Đằng',
      formattedAddress: 'Trung điểm thuận tiện nhất giữa hai bạn • Quận 1, TP.HCM',
      lat: midpointLat + 0.0011,
      lng: midpointLng - 0.0009,
      rating: 4.8,
      userRatingCount: 1240,
      categoryLabel:
        meetupCategory === 'cafe' ? 'Quán Cà Phê' : meetupCategory === 'restaurant' ? 'Nhà Hàng' : 'Công Viên'
    },
    {
      id: `spot-${meetupCategory}-2`,
      displayName:
        meetupCategory === 'cafe'
          ? 'Katinat Saigon Kafe Đồng Khởi'
          : meetupCategory === 'restaurant'
          ? 'Nhà Hàng Secret Garden'
          : 'Phố Đi Bộ Nguyễn Huệ',
      formattedAddress: 'Cách điểm giữa 150m • Không gian thoáng đãng, dễ đỗ xe',
      lat: midpointLat - 0.001,
      lng: midpointLng + 0.0012,
      rating: 4.7,
      userRatingCount: 890,
      categoryLabel:
        meetupCategory === 'cafe' ? 'Quán Cà Phê' : meetupCategory === 'restaurant' ? 'Nhà Hàng' : 'Công Viên'
    }
  ];

  const activeRouteDistKm =
    selectedMeetupSpot || selectedMember
      ? calculateDistanceKm(
          userLocation.lat,
          userLocation.lng,
          selectedMeetupSpot ? selectedMeetupSpot.lat : selectedMember!.latitude,
          selectedMeetupSpot ? selectedMeetupSpot.lng : selectedMember!.longitude
        )
      : 0;
  const activeRouteTimes = estimateTravelTime(activeRouteDistKm);

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800/80 shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Subtle Map Atmosphere Vignette */}
      <div className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_80px_rgba(0,0,0,0.6)]" />

      {/* Active Route Summary Floating Pill (Top Center) */}
      {activeRouteTravelMode && (selectedMember || selectedMeetupSpot) && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-zinc-950/95 backdrop-blur-xl border border-emerald-500/50 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <RouteIcon size={16} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
              <span>
                Lộ trình tới{' '}
                {selectedMeetupSpot ? selectedMeetupSpot.displayName : selectedMember?.name}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                {activeRouteDistKm.toFixed(1)} km • ~
                {activeRouteTravelMode === 'WALKING'
                  ? activeRouteTimes.walkingMin
                  : activeRouteTravelMode === 'DRIVING'
                  ? activeRouteTimes.drivingMin
                  : activeRouteTimes.motorcycleMin}{' '}
                phút
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <button
                type="button"
                onClick={() => onChangeRouteTravelMode?.('TWO_WHEELER')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                  activeRouteTravelMode === 'TWO_WHEELER'
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                <Bike size={11} />
                <span>Xe máy</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeRouteTravelMode?.('DRIVING')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                  activeRouteTravelMode === 'DRIVING'
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                <Car size={11} />
                <span>Ô tô</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeRouteTravelMode?.('WALKING')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                  activeRouteTravelMode === 'WALKING'
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                <Footprints size={11} />
                <span>Đi bộ</span>
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChangeRouteTravelMode?.(null)}
            className="w-7 h-7 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
            title="Tắt dẫn đường"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Smart Midpoint Meetup Finder Overlay */}
      {isMeetupFinderOpen && partnerOrSelectedMember && (
        <div className="absolute top-16 left-4 z-30 w-80 sm:w-96 bg-zinc-950/95 backdrop-blur-2xl border border-rose-500/40 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-3.5 bg-gradient-to-r from-rose-950/60 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <Sparkles size={16} />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white">Điểm Hẹn Giữa Hai Người</h4>
                <p className="text-[10px] text-zinc-400">
                  Trung điểm giữa bạn & <span className="text-rose-300 font-semibold">{partnerOrSelectedMember.name}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onCloseMeetupFinder}
              className="w-7 h-7 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <div className="p-2.5 border-b border-zinc-800/80 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setMeetupCategory('cafe')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer ${
                meetupCategory === 'cafe'
                  ? 'bg-rose-500 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              <Coffee size={12} />
              <span>Cà Phê</span>
            </button>
            <button
              type="button"
              onClick={() => setMeetupCategory('restaurant')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer ${
                meetupCategory === 'restaurant'
                  ? 'bg-rose-500 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              <Utensils size={12} />
              <span>Ăn Uống</span>
            </button>
            <button
              type="button"
              onClick={() => setMeetupCategory('park')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer ${
                meetupCategory === 'park'
                  ? 'bg-rose-500 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              <Trees size={12} />
              <span>Dạo Mát</span>
            </button>
          </div>

          <div className="p-2.5 space-y-2 max-h-60 overflow-y-auto">
            {curatedMeetupSpots.map((spot) => {
              const isChosen = selectedMeetupSpot?.id === spot.id;
              return (
                <div
                  key={spot.id}
                  onClick={() => onSelectMeetupSpot?.(spot)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isChosen
                      ? 'bg-rose-500/15 border-rose-500/50'
                      : 'bg-zinc-900/70 hover:bg-zinc-900 border-zinc-800/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-white">{spot.displayName}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{spot.formattedAddress}</div>
                    </div>
                    {spot.rating && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 text-[10px] font-bold flex items-center gap-0.5 shrink-0">
                        <Star size={10} className="fill-amber-400 text-amber-400" />
                        {spot.rating}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMeetupSpot?.(spot);
                        onChangeRouteTravelMode?.('TWO_WHEELER');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[10px] cursor-pointer"
                    >
                      Hẹn Tại Đây & Chỉ Đường
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 360° Street View / Satellite Location Preview Modal */}
      {streetViewTarget && (
        <div className="absolute inset-4 z-40 rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-700 shadow-2xl flex flex-col">
          <div className="h-12 px-4 bg-zinc-900/95 border-b border-zinc-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Compass size={16} className="text-sky-400 animate-spin" />
              <div>
                <h4 className="text-xs font-extrabold text-white">
                  Góc Nhìn Thực Tế Khu Vực: {streetViewTarget.title}
                </h4>
                <p className="text-[10px] text-zinc-400">
                  Tọa độ GPS: {streetViewTarget.lat.toFixed(5)}, {streetViewTarget.lng.toFixed(5)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onCloseStreetView}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <X size={14} />
              <span>Đóng</span>
            </button>
          </div>
          <div className="flex-1 relative bg-zinc-900 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/15 border border-sky-500/40 flex items-center justify-center text-sky-400 mb-3">
              <Compass size={32} />
            </div>
            <h5 className="text-sm font-bold text-white mb-1">{streetViewTarget.title}</h5>
            <p className="text-xs text-zinc-400 max-w-md mb-4">
              Tọa độ định vị trực tiếp: {streetViewTarget.lat.toFixed(5)}°N, {streetViewTarget.lng.toFixed(5)}°E. Bạn có thể chuyển bản đồ sang chế độ Vệ Tinh để quan sát toàn cảnh khu vực xung quanh.
            </p>
            <button
              type="button"
              onClick={onCloseStreetView}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs cursor-pointer"
            >
              Quay Lại Bản Đồ Chính
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

