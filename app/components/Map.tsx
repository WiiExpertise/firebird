"use client";

import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, CircleMarker, Popup, LayerGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import 'leaflet.heat';

import { Location } from '../types/locations';
import Heatmap from './Heatmap';
import { locationCache } from '../cache/locationCache';
import { skeetCache } from '../cache/skeetCache';

interface MapComponentProps {
  locations: Location[]; // Array of locations to display
  center: [number, number];
  zoom: number;
  onMarkerClick?: (locationId: string) => void; // callback for marker clicks
  selectedLocationId?: string | null;
  showHeatmap?: boolean; // Add heatmap toggle prop
}

// Helper function for marker styling based on category AND selection
const getMarkerOptions = (
  location: Location,
  isSelected: boolean, // Add parameter to check if selected
): L.PathOptions => {
  let categoryColor: string;
  let fillColor: string;

  switch (location.category) {
    case 'Wildfire': categoryColor = '#f97316'; fillColor = '#fb923c'; break; // Orange
    case 'Hurricane': categoryColor = '#3b82f6'; fillColor = '#60a5fa'; break; // Blue
    case 'Earthquake': categoryColor = '#a16207'; fillColor = '#ca8a04'; break; // Brown/Yellow
    case 'NonDisaster': categoryColor = '#16a34a'; fillColor = '#22c55e'; break; // Green
    default: categoryColor = '#6b7280'; fillColor = '#9ca3af'; break; // Gray fallback
  }

  // Modify appearance if selected
  return {
    color: isSelected ? '#000000' : categoryColor, // Black border if selected
    weight: isSelected ? 2 : 1,                   // Thicker border if selected
    fillColor: fillColor,
    fillOpacity: isSelected ? 0.9 : 0.7,          // Higher opacity if selected
  };
};

const MapComponent: React.FC<MapComponentProps> = ({
  locations,
  center,
  zoom,
  onMarkerClick,
  selectedLocationId,
  showHeatmap = false, // Default to false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize caches
  useEffect(() => {
    locationCache.initialize();
    skeetCache.initialize();
  }, []);

  // Subscribe to cache updates
  useEffect(() => {
    const unsubscribeLocation = locationCache.subscribe(() => {
      // Handle location cache updates if needed
    });

    const unsubscribeSkeet = skeetCache.subscribe(() => {
      // Handle skeet cache updates if needed
    });

    return () => {
      unsubscribeLocation();
      unsubscribeSkeet();
    };
  }, []);

  const handleMarkerClick = async (location: Location) => {
    onMarkerClick?.(location.id);

    // Fetch skeets for the clicked location
    setIsLoading(true);
    setError(null);
    try {
      await skeetCache.fetchSkeets(location.id);
    } catch (err) {
      console.error('Error fetching skeets:', err);
      setError('Failed to load skeets for this location');
    } finally {
      setIsLoading(false);
    }
  };

  // Set up Leaflet icon defaults
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
      iconUrl: require('leaflet/dist/images/marker-icon.png').default,
      shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
    });
  }, []);

  // Used to make it fit the astehtic (is there an lsp for spelling? )
  const tileUrlCarto = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
  const attributionCarto = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      minZoom={4}
      scrollWheelZoom={true}
      dragging={true}
      zoomControl={true}
      maxBounds={[[15.0, -170.0], [60.0, -50.0]]} // Extended bounds to include more of North America
      maxBoundsViscosity={1.0} // Prevents dragging outside these bounds
      style={{ height: '100%', width: '100%', zIndex: 0 }} // map takes container size
      className="rounded-lg"
    >
      <TileLayer url={tileUrlCarto} attribution={attributionCarto} />

      {/* LayerGroup for markers to ensure they're below the heatmap */}
      <LayerGroup>
        {locations.map((location) => {
          if (typeof location.lat !== 'number' || typeof location.long !== 'number') {
            console.warn(`Invalid coordinates for location: ${location.id}`, location);
            return null;
          }

          const isSelected = location.id === selectedLocationId;
          const markerOptions = getMarkerOptions(location, isSelected);

          return (
            <CircleMarker
              key={location.id}
              center={[location.lat, location.long]}
              pathOptions={markerOptions}
              radius={isSelected ? (showHeatmap ? 6 : 10) : (showHeatmap ? 4 : 8)} // Smaller when heatmap is enabled
              eventHandlers={{
                click: () => handleMarkerClick(location),
              }}
            >
              <Popup>
                <b>{location.locationName || 'Unknown Location'}</b><br />
                {location.formattedAddress || 'No address available'}<br />
                Category: {location.category || 'N/A'}<br />
                Sentiment: {location.latestSentiment?.toFixed(2) || 'N/A'}<br />
                Skeets: {location.latestSkeetsAmount || 0}
              </Popup>
            </CircleMarker>
          );
        })}
      </LayerGroup>

      {/* Heatmap component will be rendered on top */}
      <Heatmap locations={locations} isEnabled={showHeatmap} />
    </MapContainer>
  );
};

export default MapComponent;
