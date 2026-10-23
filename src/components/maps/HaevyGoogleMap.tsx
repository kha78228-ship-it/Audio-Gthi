// Source: Google Maps Platform Code Assist
import React, { useEffect, useRef, useState } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useMapsLibrary
} from '@vis.gl/react-google-maps';
import {
  Navigation,
  Car,
  Bike,
  Footprints,
  Sparkles,
  Coffee,
  Utensils,
  Trees,
  Cross,
  Eye,
  X,
  MapPin,
  Star,
  Clock,
  CheckCircle2,
  Compass,
  Route as RouteIcon
} from 'lucide-react';
import { MapMember, SafeZone } from '../../types';
import { calculateDistanceKm, formatDistance } from '../../utils/mapsUtils';

export interface DiscoveredMeetupPlace {
  id: string;
  displayName: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  rating?: number;
  userRatingCount?: number;
  categoryLabel: string;
}

export interface ComputedRouteSummary {
  distanceMeters: number;
  durationMillis: number;
  travelMode: 'DRIVING' | 'TWO_WHEELER' | 'WALKING';
}

interface HaevyGoogleMapProps {
  apiKey: string;
  userLocation: { lat: number; lng: number };
  members: MapMember[];
  selectedMemberId: string | null;
  onSelectMember: (member: MapMember) => void;
  safeZones: SafeZone[];
  mapStyle: 'dark' | 'satellite' | 'street';
  isLiveTracking: boolean;
  filterCategory: 'all' | 'couple' | 'family' | 'friend';
  showTrafficLayer: boolean;
  activeRouteTravelMode: 'DRIVING' | 'TWO_WHEELER' | 'WALKING' | null;
  onChangeRouteTravelMode: (mode: 'DRIVING' | 'TWO_WHEELER' | 'WALKING' | null) => void;
  streetViewTarget: { lat: number; lng: number; title: string } | null;
  onCloseStreetView: () => void;
  onOpenStreetView: (target: { lat: number; lng: number; title: string }) => void;
  isMeetupFinderOpen: boolean;
  onCloseMeetupFinder: () => void;
  selectedMeetupSpot: DiscoveredMeetupPlace | null;
  onSelectMeetupSpot: (spot: DiscoveredMeetupPlace | null) => void;
  onRouteSummaryChange?: (summary: ComputedRouteSummary | null) => void;
}

/**
 * Controller sub-component inside <Map> that manages imperative Google Maps layers:
 * - Camera pan/zoom synchronization
 * - Safe Zone Geofence Circles (google.maps.Circle)
 * - Live Traffic Layer (google.maps.TrafficLayer)
 * - Modern Routes API computation (Route.computeRoutes + createPolylines)
 * - Connection tether lines between User and Partner/Selected Member
 */
const GoogleMapLayersController: React.FC<{
  userLocation: { lat: number; lng: number };
  members: MapMember[];
  selectedMember: MapMember | null;
  safeZones: SafeZone[];
  showTrafficLayer: boolean;
  activeRouteTravelMode: 'DRIVING' | 'TWO_WHEELER' | 'WALKING' | null;
  selectedMeetupSpot: DiscoveredMeetupPlace | null;
  onRouteSummaryChange?: (summary: ComputedRouteSummary | null) => void;
}> = ({
  userLocation,
  members,
  selectedMember,
  safeZones,
  showTrafficLayer,
  activeRouteTravelMode,
  selectedMeetupSpot,
  onRouteSummaryChange
}) => {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');

  const safeZoneCirclesRef = useRef<google.maps.Circle[]>([]);
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);
  const routePolylinesRef = useRef<google.maps.Polyline[]>([]);
  const tetherPolylineRef = useRef<google.maps.Polyline | null>(null);
  const historyPolylineRef = useRef<google.maps.Polyline | null>(null);

  // Pan smoothly when selected member or meetup spot changes
  useEffect(() => {
    if (!map) return;
    if (selectedMeetupSpot) {
      map.panTo({ lat: selectedMeetupSpot.lat, lng: selectedMeetupSpot.lng });
      map.setZoom(16);
      return;
    }
    if (selectedMember && !activeRouteTravelMode) {
      map.panTo({ lat: selectedMember.latitude, lng: selectedMember.longitude });
      map.setZoom(15);
    }
  }, [map, selectedMember?.id, selectedMeetupSpot?.id, activeRouteTravelMode]);

  // Manage Live Traffic Layer
  useEffect(() => {
    if (!map || typeof google === 'undefined') return;
    if (!trafficLayerRef.current) {
      trafficLayerRef.current = new google.maps.TrafficLayer();
    }
    trafficLayerRef.current.setMap(showTrafficLayer ? map : null);

    return () => {
      if (trafficLayerRef.current) {
        trafficLayerRef.current.setMap(null);
      }
    };
  }, [map, showTrafficLayer]);

  // Manage Safe Zone Geofence Circles
  useEffect(() => {
    if (!map || typeof google === 'undefined') return;

    safeZoneCirclesRef.current.forEach((c) => c.setMap(null));
    safeZoneCirclesRef.current = [];

    const circles = safeZones.map((zone) => {
      const color =
        zone.color ||
        (zone.type === 'home'
          ? '#10b981'
          : zone.type === 'school'
          ? '#f59e0b'
          : zone.type === 'work'
          ? '#3b82f6'
          : '#ec4899');

      return new google.maps.Circle({
        map,
        center: { lat: zone.latitude, lng: zone.longitude },
        radius: zone.radiusMeters,
        strokeColor: color,
        strokeOpacity: 0.75,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.14,
        clickable: false
      });
    });

    safeZoneCirclesRef.current = circles;

    return () => {
      safeZoneCirclesRef.current.forEach((c) => c.setMap(null));
      safeZoneCirclesRef.current = [];
    };
  }, [map, safeZones]);

  // Manage Lover / Selected Member subtle tether & route history breadcrumbs
  useEffect(() => {
    if (!map || typeof google === 'undefined') return;

    if (tetherPolylineRef.current) {
      tetherPolylineRef.current.setMap(null);
      tetherPolylineRef.current = null;
    }
    if (historyPolylineRef.current) {
      historyPolylineRef.current.setMap(null);
      historyPolylineRef.current = null;
    }

    // If active turn-by-turn route is NOT active, show romantic/connection tether to selected member or lover
    const targetMember =
      selectedMember || members.find((m) => m.role === 'lover' || m.role === 'spouse') || null;

    if (targetMember && !activeRouteTravelMode) {
      const isLover = targetMember.role === 'lover' || targetMember.role === 'spouse';
      tetherPolylineRef.current = new google.maps.Polyline({
        map,
        path: [
          { lat: userLocation.lat, lng: userLocation.lng },
          { lat: targetMember.latitude, lng: targetMember.longitude }
        ],
        geodesic: true,
        strokeColor: isLover ? '#f43f5e' : '#10b981',
        strokeOpacity: 0,
        icons: [
          {
            icon: {
              path: 'M 0,-1 0,1',
              strokeOpacity: 0.85,
              strokeWeight: isLover ? 3 : 2,
              scale: 3
            },
            offset: '0',
            repeat: '14px'
          }
        ]
      });
    }

    // Render member's breadcrumb history trail when selected
    if (selectedMember && selectedMember.routeHistory && selectedMember.routeHistory.length > 0) {
      const pathCoords = [
        ...selectedMember.routeHistory.map((pt) => ({ lat: pt.lat, lng: pt.lng })),
        { lat: selectedMember.latitude, lng: selectedMember.longitude }
      ];
      historyPolylineRef.current = new google.maps.Polyline({
        map,
        path: pathCoords,
        strokeColor:
          selectedMember.role === 'lover' || selectedMember.role === 'spouse'
            ? '#fb7185'
            : '#38bdf8',
        strokeOpacity: 0.65,
        strokeWeight: 3
      });
    }

    return () => {
      if (tetherPolylineRef.current) tetherPolylineRef.current.setMap(null);
      if (historyPolylineRef.current) historyPolylineRef.current.setMap(null);
    };
  }, [map, userLocation, members, selectedMember, activeRouteTravelMode]);

  // Modern Routes API: Route.computeRoutes via useMapsLibrary('routes')
  useEffect(() => {
    routePolylinesRef.current.forEach((p) => p.setMap(null));
    routePolylinesRef.current = [];

    const destinationTarget = selectedMeetupSpot
      ? { lat: selectedMeetupSpot.lat, lng: selectedMeetupSpot.lng }
      : selectedMember
      ? { lat: selectedMember.latitude, lng: selectedMember.longitude }
      : null;

    if (!map || !routesLib || !destinationTarget || !activeRouteTravelMode) {
      onRouteSummaryChange?.(null);
      return;
    }

    let isCancelled = false;

    const computeModernRoute = async () => {
      try {
        const RouteClass = (routesLib as any).Route;
        if (!RouteClass || typeof RouteClass.computeRoutes !== 'function') {
          throw new Error('Route.computeRoutes unavailable');
        }

        const request = {
          origin: { lat: userLocation.lat, lng: userLocation.lng },
          destination: destinationTarget,
          travelMode: activeRouteTravelMode,
          fields: ['path', 'distanceMeters', 'durationMillis', 'viewport']
        };

        const { routes } = await RouteClass.computeRoutes(request);
        if (isCancelled) return;

        if (!routes || routes.length === 0) {
          onRouteSummaryChange?.(null);
          return;
        }

        const primaryRoute = routes[0];
        const newPolylines: google.maps.Polyline[] = primaryRoute.createPolylines();
        newPolylines.forEach((polyline: google.maps.Polyline) => {
          polyline.setOptions({
            strokeColor:
              selectedMember?.role === 'lover' || selectedMember?.role === 'spouse'
                ? '#f43f5e'
                : '#10b981',
            strokeWeight: 6,
            strokeOpacity: 0.92
          });
          polyline.setMap(map);
        });
        routePolylinesRef.current = newPolylines;

        if (primaryRoute.viewport) {
          map.fitBounds(primaryRoute.viewport);
        }

        onRouteSummaryChange?.({
          distanceMeters: primaryRoute.distanceMeters ?? 0,
          durationMillis: primaryRoute.durationMillis ?? 0,
          travelMode: activeRouteTravelMode
        });
      } catch (err) {
        if (isCancelled) return;
        console.warn('Routes API fallback to direct geodesic path:', err);
        // Graceful visual fallback polyline if Routes API is not enabled on user's custom key
        const distKm = calculateDistanceKm(
          userLocation.lat,
          userLocation.lng,
          destinationTarget.lat,
          destinationTarget.lng
        );
        const speedKmh =
          activeRouteTravelMode === 'WALKING'
            ? 5
            : activeRouteTravelMode === 'TWO_WHEELER'
            ? 32
            : 28;
        const durationMillis = Math.max(60000, Math.round((distKm / speedKmh) * 3600 * 1000));

        const fallbackLine = new google.maps.Polyline({
          map,
          path: [
            { lat: userLocation.lat, lng: userLocation.lng },
            destinationTarget
          ],
          geodesic: true,
          strokeColor: '#10b981',
          strokeWeight: 5,
          strokeOpacity: 0.85
        });
        routePolylinesRef.current = [fallbackLine];

        onRouteSummaryChange?.({
          distanceMeters: Math.round(distKm * 1000),
          durationMillis,
          travelMode: activeRouteTravelMode
        });
      }
    };

    computeModernRoute();

    return () => {
      isCancelled = true;
      routePolylinesRef.current.forEach((p) => p.setMap(null));
      routePolylinesRef.current = [];
    };
  }, [
    map,
    routesLib,
    userLocation.lat,
    userLocation.lng,
    selectedMember?.id,
    selectedMember?.latitude,
    selectedMember?.longitude,
    selectedMeetupSpot?.id,
    activeRouteTravelMode
  ]);

  return null;
};

/**
 * Smart Midpoint Meetup & Date Spot Finder using Google Places API (New) (`Place.searchByText`)
 */
const SmartMeetupFinderPanel: React.FC<{
  userLocation: { lat: number; lng: number };
  targetMember: MapMember;
  onClose: () => void;
  selectedSpot: DiscoveredMeetupPlace | null;
  onSelectSpot: (spot: DiscoveredMeetupPlace) => void;
  onNavigateToSpot: (spot: DiscoveredMeetupPlace) => void;
}> = ({
  userLocation,
  targetMember,
  onClose,
  selectedSpot,
  onSelectSpot,
  onNavigateToSpot
}) => {
  const placesLib = useMapsLibrary('places');
  const [category, setCategory] = useState<'cafe' | 'restaurant' | 'park' | 'pharmacy'>('cafe');
  const [places, setPlaces] = useState<DiscoveredMeetupPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Midpoint coordinate between User and Target Member
  const midLat = (userLocation.lat + targetMember.latitude) / 2;
  const midLng = (userLocation.lng + targetMember.longitude) / 2;

  useEffect(() => {
    if (!placesLib) return;

    let isCancelled = false;
    const fetchMidpointPlaces = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const PlaceClass = (placesLib as any).Place;
        if (!PlaceClass || typeof PlaceClass.searchByText !== 'function') {
          throw new Error('Places API (New) searchByText not available');
        }

        const queryMap: Record<typeof category, { query: string; label: string }> = {
          cafe: { query: 'Quán cà phê hẹn hò yên tĩnh', label: 'Quán Cà Phê' },
          restaurant: { query: 'Nhà hàng quán ăn ngon', label: 'Nhà Hàng' },
          park: { query: 'Công viên điểm dạo phố', label: 'Công Viên' },
          pharmacy: { query: 'Nhà thuốc bệnh viện y tế', label: 'Y Tế / Nhà Thuốc' }
        };

        const request = {
          textQuery: queryMap[category].query,
          fields: ['id', 'displayName', 'formattedAddress', 'location', 'rating', 'userRatingCount'],
          locationBias: {
            center: { lat: midLat, lng: midLng },
            radius: 2500
          },
          maxResultCount: 6,
          language: 'vi',
          region: 'VN'
        };

        const { places: foundPlaces } = await PlaceClass.searchByText(request);
        if (isCancelled) return;

        if (!foundPlaces || foundPlaces.length === 0) {
          setPlaces([]);
          setLoading(false);
          return;
        }

        const mapped: DiscoveredMeetupPlace[] = foundPlaces
          .map((p: any) => {
            const lat = typeof p.location?.lat === 'function' ? p.location.lat() : p.location?.lat;
            const lng = typeof p.location?.lng === 'function' ? p.location.lng() : p.location?.lng;
            if (typeof lat !== 'number' || typeof lng !== 'number') return null;
            return {
              id: p.id || `${lat}-${lng}`,
              displayName: p.displayName || 'Địa điểm hẹn',
              formattedAddress: p.formattedAddress || 'Khu vực trung tâm giữa 2 người',
              lat,
              lng,
              rating: p.rating,
              userRatingCount: p.userRatingCount,
              categoryLabel: queryMap[category].label
            };
          })
          .filter(Boolean) as DiscoveredMeetupPlace[];

        setPlaces(mapped);
      } catch (err) {
        if (isCancelled) return;
        console.warn('Places searchByText error:', err);
        setErrorMsg('Không thể tải danh sách địa điểm từ Google Places API. Hãy kiểm tra quyền Places API (New) trên khóa API của bạn.');
        setPlaces([]);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchMidpointPlaces();
    return () => {
      isCancelled = true;
    };
  }, [placesLib, category, midLat, midLng]);

  return (
    <div className="absolute top-16 left-4 z-30 w-80 sm:w-96 max-h-[75vh] flex flex-col bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/90 rounded-2xl shadow-2xl overflow-hidden">
      <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between bg-gradient-to-r from-rose-500/15 via-emerald-500/10 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-white">
              Điểm Hẹn Giữa Bạn & {targetMember.name}
            </h3>
            <p className="text-[10px] text-zinc-400">
              Google Places API (New) • Tọa độ trung điểm công bằng
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>

      {/* Category Filter */}
      <div className="p-2 border-b border-zinc-800/80 grid grid-cols-4 gap-1 bg-zinc-900/40">
        <button
          type="button"
          onClick={() => setCategory('cafe')}
          className={`py-1.5 px-2 rounded-lg text-[10px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
            category === 'cafe'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Coffee size={13} />
          <span>Cà Phê</span>
        </button>
        <button
          type="button"
          onClick={() => setCategory('restaurant')}
          className={`py-1.5 px-2 rounded-lg text-[10px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
            category === 'restaurant'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Utensils size={13} />
          <span>Nhà Hàng</span>
        </button>
        <button
          type="button"
          onClick={() => setCategory('park')}
          className={`py-1.5 px-2 rounded-lg text-[10px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
            category === 'park'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Trees size={13} />
          <span>Công Viên</span>
        </button>
        <button
          type="button"
          onClick={() => setCategory('pharmacy')}
          className={`py-1.5 px-2 rounded-lg text-[10px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
            category === 'pharmacy'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Cross size={13} />
          <span>Y Tế</span>
        </button>
      </div>

      {/* Results list */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2 max-h-80">
        {loading ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-400">Đang tìm địa điểm thực tế giữa 2 người...</p>
          </div>
        ) : errorMsg ? (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
            {errorMsg}
          </div>
        ) : places.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-400">
            Không tìm thấy địa điểm phù hợp quanh điểm giữa.
          </div>
        ) : (
          places.map((place) => {
            const distFromUser = calculateDistanceKm(
              userLocation.lat,
              userLocation.lng,
              place.lat,
              place.lng
            );
            const distFromMember = calculateDistanceKm(
              targetMember.latitude,
              targetMember.longitude,
              place.lat,
              place.lng
            );
            const isChosen = selectedSpot?.id === place.id;

            return (
              <div
                key={place.id}
                onClick={() => onSelectSpot(place)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isChosen
                    ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg'
                    : 'bg-zinc-900/70 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-zinc-100">{place.displayName}</h4>
                  {place.rating && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 shrink-0">
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      {place.rating.toFixed(1)}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                  {place.formattedAddress}
                </p>
                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-zinc-800/70 text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-semibold">
                      Bạn: {formatDistance(distFromUser)}
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-rose-300 font-semibold">
                      {targetMember.name.split(' ').pop()}: {formatDistance(distFromMember)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateToSpot(place);
                    }}
                    className="px-2 py-0.5 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    <Navigation size={10} />
                    <span>Hẹn Ở Đây</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

/**
 * Interactive 360° Street View Modal using google.maps.StreetViewPanorama
 */
const StreetViewPanoramaModal: React.FC<{
  target: { lat: number; lng: number; title: string };
  onClose: () => void;
}> = ({ target, onClose }) => {
  const panoContainerRef = useRef<HTMLDivElement | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!panoContainerRef.current || typeof google === 'undefined') return;
    setStatusMessage(null);

    const svService = new google.maps.StreetViewService();
    const panorama = new google.maps.StreetViewPanorama(panoContainerRef.current, {
      position: { lat: target.lat, lng: target.lng },
      pov: { heading: 165, pitch: 0 },
      zoom: 1,
      addressControl: true,
      fullscreenControl: false,
      motionTracking: false
    });

    svService.getPanorama(
      { location: { lat: target.lat, lng: target.lng }, radius: 150 },
      (data, status) => {
        if (status === google.maps.StreetViewStatus.OK && data?.location?.latLng) {
          panorama.setPosition(data.location.latLng);
        } else {
          setStatusMessage(
            'Khu vực này hiện chưa có ảnh Street View 360° mặt đất gần nhất trong bán kính 150m.'
          );
        }
      }
    );
  }, [target.lat, target.lng]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl h-[75vh] bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Compass size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Góc Nhìn Thực Tế Street View 360°</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                  {target.title}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Quan sát quang cảnh đường phố xung quanh vị trí hiện tại để dễ dàng nhận diện
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 relative bg-zinc-900">
          <div ref={panoContainerRef} className="w-full h-full" />
          {statusMessage && (
            <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center p-6 text-center">
              <Compass size={36} className="text-amber-400 mb-2" />
              <p className="text-sm font-bold text-zinc-200 mb-1">{statusMessage}</p>
              <p className="text-xs text-zinc-400 max-w-md">
                Tọa độ: {target.lat.toFixed(5)}, {target.lng.toFixed(5)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const HaevyGoogleMap: React.FC<HaevyGoogleMapProps> = ({
  apiKey,
  userLocation,
  members,
  selectedMemberId,
  onSelectMember,
  safeZones,
  mapStyle,
  isLiveTracking,
  filterCategory,
  showTrafficLayer,
  activeRouteTravelMode,
  onChangeRouteTravelMode,
  streetViewTarget,
  onCloseStreetView,
  onOpenStreetView,
  isMeetupFinderOpen,
  onCloseMeetupFinder,
  selectedMeetupSpot,
  onSelectMeetupSpot,
  onRouteSummaryChange
}) => {
  const [computedRoute, setComputedRoute] = useState<ComputedRouteSummary | null>(null);

  const visibleMembers = members.filter((m) => {
    if (filterCategory === 'all') return true;
    return m.category === filterCategory;
  });

  const selectedMember = members.find((m) => m.id === selectedMemberId) || null;
  const partnerOrSelectedMember =
    selectedMember || members.find((m) => m.role === 'lover' || m.role === 'spouse') || members[0];

  const mapTypeId =
    mapStyle === 'satellite' ? 'hybrid' : mapStyle === 'street' ? 'roadmap' : 'roadmap';

  const handleRouteUpdate = (summary: ComputedRouteSummary | null) => {
    setComputedRoute(summary);
    onRouteSummaryChange?.(summary);
  };

  return (
    <div className="relative w-full h-full min-h-[420px] overflow-hidden bg-zinc-950">
      <APIProvider apiKey={apiKey} language="vi" region="VN">
        <Map
          style={{ width: '100%', height: '100%' }}
          defaultCenter={userLocation}
          defaultZoom={14}
          mapId="DEMO_MAP_ID"
          mapTypeId={mapTypeId}
          colorScheme={mapStyle === 'dark' ? 'DARK' : 'FOLLOW_SYSTEM'}
          gestureHandling="greedy"
          disableDefaultUI={true}
          zoomControl={true}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        >
          {/* Imperative Layers Controller (Routes API, TrafficLayer, SafeZone Circles, Tethers) */}
          <GoogleMapLayersController
            userLocation={userLocation}
            members={visibleMembers}
            selectedMember={selectedMember}
            safeZones={safeZones}
            showTrafficLayer={showTrafficLayer}
            activeRouteTravelMode={activeRouteTravelMode}
            selectedMeetupSpot={selectedMeetupSpot}
            onRouteSummaryChange={handleRouteUpdate}
          />

          {/* 1. User Self Location Marker */}
          {isLiveTracking && (
            <AdvancedMarker position={userLocation} title="Vị trí của bạn (Trực tuyến)" zIndex={50}>
              <div className="relative flex items-center justify-center">
                <div className="absolute -inset-3 rounded-full bg-emerald-500/30 animate-ping" />
                <div className="w-11 h-11 rounded-full bg-zinc-950 border-[3px] border-emerald-400 shadow-xl flex items-center justify-center text-emerald-300 font-extrabold text-[10px]">
                  BẠN
                </div>
              </div>
            </AdvancedMarker>
          )}

          {/* 2. Safe Zone Center Badges */}
          {safeZones.map((zone) => {
            const badgeColor =
              zone.type === 'home'
                ? 'border-emerald-500/60 text-emerald-300 bg-emerald-950/90'
                : zone.type === 'school'
                ? 'border-amber-500/60 text-amber-300 bg-amber-950/90'
                : zone.type === 'work'
                ? 'border-sky-500/60 text-sky-300 bg-sky-950/90'
                : 'border-rose-500/60 text-rose-300 bg-rose-950/90';

            return (
              <AdvancedMarker
                key={zone.id}
                position={{ lat: zone.latitude, lng: zone.longitude }}
                zIndex={5}
              >
                <div
                  className={`px-2 py-0.5 rounded-full border text-[9px] font-bold shadow-md backdrop-blur-md flex items-center gap-1 ${badgeColor}`}
                >
                  <span>🛡️ {zone.name}</span>
                  <span className="opacity-75">({zone.radiusMeters}m)</span>
                </div>
              </AdvancedMarker>
            );
          })}

          {/* 3. Family, Lover & Friends AdvancedMarkers */}
          {visibleMembers.map((member) => {
            const isLover = member.role === 'lover' || member.role === 'spouse';
            const isFamily = member.category === 'family';
            const isSelected = member.id === selectedMemberId;

            const ringColorClass = isLover
              ? 'border-rose-500 shadow-rose-500/50'
              : isFamily
              ? 'border-amber-400 shadow-amber-500/40'
              : 'border-sky-400 shadow-sky-500/40';

            const activityEmoji =
              member.activity === 'driving'
                ? '🚗'
                : member.activity === 'walking'
                ? '🚶'
                : member.isCharging
                ? '⚡'
                : '📍';

            return (
              <AdvancedMarker
                key={member.id}
                position={{ lat: member.latitude, lng: member.longitude }}
                onClick={() => onSelectMember(member)}
                zIndex={isSelected ? 60 : isLover ? 45 : 30}
              >
                <div
                  className={`relative flex flex-col items-center cursor-pointer transition-transform duration-300 ${
                    isSelected ? 'scale-115' : 'hover:scale-110'
                  }`}
                >
                  {/* Animated aura ring for Partner/Lover or Selected Member */}
                  {(isLover || isSelected) && (
                    <div
                      className={`absolute -inset-2 rounded-full animate-ping opacity-35 ${
                        isLover ? 'bg-rose-500' : 'bg-emerald-400'
                      }`}
                    />
                  )}

                  {/* Top floating badge (Heart for lover or Low Battery alert) */}
                  {isLover ? (
                    <div className="mb-0.5 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-extrabold shadow flex items-center gap-0.5 animate-bounce">
                      <span>💖 {member.relationshipLabel}</span>
                    </div>
                  ) : member.battery <= 20 ? (
                    <div className="mb-0.5 px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[9px] font-bold shadow animate-pulse">
                      🪫 Pin yếu {member.battery}%
                    </div>
                  ) : null}

                  {/* Avatar Circle */}
                  <div
                    className={`w-12 h-12 rounded-full border-[3px] overflow-hidden bg-zinc-900 shadow-xl ${ringColorClass}`}
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Activity + Battery Pill */}
                  <div className="-mt-2 px-2 py-0.5 rounded-full bg-zinc-950/95 border border-zinc-700 text-[9px] font-bold text-zinc-100 shadow-md flex items-center gap-1 whitespace-nowrap">
                    <span>{activityEmoji}</span>
                    <span className="truncate max-w-[85px]">{member.name.split(' ').slice(-2).join(' ')}</span>
                    <span
                      className={
                        member.battery < 20 ? 'text-red-400 font-extrabold' : 'text-emerald-400'
                      }
                    >
                      {member.battery}%
                    </span>
                  </div>
                </div>
              </AdvancedMarker>
            );
          })}

          {/* 4. Selected Meetup Spot Marker & InfoWindow */}
          {selectedMeetupSpot && (
            <>
              <AdvancedMarker
                position={{ lat: selectedMeetupSpot.lat, lng: selectedMeetupSpot.lng }}
                zIndex={70}
              >
                <div className="flex flex-col items-center">
                  <div className="px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-extrabold shadow-xl border border-white/40 flex items-center gap-1 animate-bounce">
                    <Sparkles size={11} />
                    <span>Điểm Hẹn: {selectedMeetupSpot.displayName}</span>
                  </div>
                  <div className="w-4 h-4 rotate-45 bg-rose-500 -mt-1.5 border-r border-b border-white/40" />
                </div>
              </AdvancedMarker>

              <InfoWindow
                position={{ lat: selectedMeetupSpot.lat, lng: selectedMeetupSpot.lng }}
                onCloseClick={() => onSelectMeetupSpot(null)}
              >
                <div className="text-zinc-900 p-1 max-w-[220px]">
                  <div className="text-[10px] font-bold text-rose-600 uppercase">
                    📍 Điểm Hẹn Giữa Hai Người
                  </div>
                  <div className="text-xs font-extrabold mt-0.5">
                    {selectedMeetupSpot.displayName}
                  </div>
                  <div className="text-[11px] text-zinc-600 mt-0.5">
                    {selectedMeetupSpot.formattedAddress}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onChangeRouteTravelMode('TWO_WHEELER')}
                      className="px-2 py-1 rounded bg-emerald-600 text-white text-[10px] font-bold cursor-pointer"
                    >
                      Chỉ Đường Tới Điểm Hẹn
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onOpenStreetView({
                          lat: selectedMeetupSpot.lat,
                          lng: selectedMeetupSpot.lng,
                          title: selectedMeetupSpot.displayName
                        })
                      }
                      className="px-2 py-1 rounded bg-sky-600 text-white text-[10px] font-bold cursor-pointer"
                    >
                      Xem 360°
                    </button>
                  </div>
                </div>
              </InfoWindow>
            </>
          )}

          {/* 5. Smart Midpoint Meetup Finder Overlay (Uses Google Places API New) */}
          {isMeetupFinderOpen && partnerOrSelectedMember && (
            <SmartMeetupFinderPanel
              userLocation={userLocation}
              targetMember={partnerOrSelectedMember}
              onClose={onCloseMeetupFinder}
              selectedSpot={selectedMeetupSpot}
              onSelectSpot={(spot) => onSelectMeetupSpot(spot)}
              onNavigateToSpot={(spot) => {
                onSelectMeetupSpot(spot);
                onChangeRouteTravelMode('TWO_WHEELER');
              }}
            />
          )}
        </Map>
      </APIProvider>

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
              {computedRoute && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                  {(computedRoute.distanceMeters / 1000).toFixed(1)} km • ~
                  {Math.max(1, Math.round(computedRoute.durationMillis / 60000))} phút
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <button
                type="button"
                onClick={() => onChangeRouteTravelMode('TWO_WHEELER')}
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
                onClick={() => onChangeRouteTravelMode('DRIVING')}
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
                onClick={() => onChangeRouteTravelMode('WALKING')}
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
            onClick={() => onChangeRouteTravelMode(null)}
            className="w-7 h-7 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
            title="Tắt dẫn đường"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Street View 360° Modal */}
      {streetViewTarget && (
        <StreetViewPanoramaModal target={streetViewTarget} onClose={onCloseStreetView} />
      )}
    </div>
  );
};
