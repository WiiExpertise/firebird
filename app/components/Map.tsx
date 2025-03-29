"use client";

import React from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS

import { Location, Category } from '../types/locations';

interface MapComponentProps {
  locations: Location[]; // Array of locations to display
  center: [number, number];
  zoom: number;
  onMarkerClick?: (locationId: string) => void; // callback for marker clicks
}

// Helper function for marker styling based on category
const getMarkerOptions = (category: Category): L.PathOptions => {
  switch (category) {
    case 'Wildfire':
      return { color: '#f97316', fillColor: '#fb923c', fillOpacity: 0.7, weight: 1 }; // Orange
    case 'Hurricane':
      return { color: '#3b82f6', fillColor: '#60a5fa', fillOpacity: 0.7, weight: 1 }; // Blue
    case 'Earthquake':
      return { color: '#a16207', fillColor: '#ca8a04', fillOpacity: 0.7, weight: 1 }; // Brown/Yellow
    case 'NonDisaster':
      return { color: '#16a34a', fillColor: '#22c55e', fillOpacity: 0.7, weight: 1 }; // Green
    default:
      return { color: '#6b7280', fillColor: '#9ca3af', fillOpacity: 0.5, weight: 1 }; // Gray fallback
  }
};

const MapComponent: React.FC<MapComponentProps> = ({
  locations,
  center,
  zoom,
  onMarkerClick,
}) => {
  React.useEffect(() => {
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
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%', zIndex: 0 }} // map takes container size
      className="rounded-lg"
    >

      <TileLayer url={tileUrlCarto} attribution={attributionCarto} />

      {locations.map((location) => {
        if (typeof location.lat !== 'number' || typeof location.long !== 'number') {
          console.warn(`Invalid coordinates for location: ${location.id}`, location);
          return null;
        }

        const markerOptions = getMarkerOptions(location.category);

        return (
          <CircleMarker
            key={location.id}
            center={[location.lat, location.long]}
            pathOptions={markerOptions}
            radius={8} // Adjust radius as needed
            eventHandlers={{
              click: () => {
                console.log(`Marker clicked: ${location.id}`); // Log click
                if (onMarkerClick) {
                  onMarkerClick(location.id); // Call the callback prop
                }
              },
            }}
          >
            <Popup>
              <b>{location.locationName || 'Unknown Location'}</b><br />
              {location.formattedAddress || 'No address available'}<br />
              Category: {location.category || 'N/A'}<br />
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
};

export default MapComponent;
