"use client";

import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import { useMap } from 'react-leaflet';

import { Location } from '../types/locations';

interface HeatmapProps {
  locations: Location[];
  isEnabled: boolean;
}

const Heatmap: React.FC<HeatmapProps> = ({ locations, isEnabled }) => {
  const map = useMap();

  useEffect(() => {
    if (!isEnabled) {
      // Remove heatmap layer if it exists
      map.eachLayer((layer) => {
        if (layer instanceof L.HeatLayer) {
          map.removeLayer(layer);
        }
      });
      return;
    }

    // Calculate heat intensity for each location
    const heatData = locations.map(location => {
      // Normalize sentiment to 0-1 range (lower sentiment = higher intensity)
      const sentimentIntensity = location.latestSentiment !== undefined 
        ? (1 - (location.latestSentiment + 1) / 2)
        : 0.5; // Default to neutral if sentiment is undefined
      
      // Normalize skeet count to 0-1 range (higher count = higher intensity)
      const maxSkeets = Math.max(...locations.map(l => l.latestSkeetsAmount || 0));
      const skeetIntensity = (location.latestSkeetsAmount || 0) / maxSkeets;
      
      // Combine intensities (70% sentiment, 30% skeet count)
      const intensity = (sentimentIntensity * 0.7) + (skeetIntensity * 0.3);
      
      return {
        lat: location.lat,
        lng: location.long,
        intensity: intensity
      };
    });

    // Create heatmap layer with adjusted settings
    const heatLayer = L.heatLayer(
      heatData.map(point => [point.lat, point.lng, point.intensity]),
      {
        radius: 20, // Smaller radius for more precise heat spots
        blur: 10,   // Less blur for sharper edges
        maxZoom: 10,
        minOpacity: 0.2, // Minimum opacity to ensure visibility
        max: 1.0,   // Maximum intensity
        gradient: {
            0.1: 'blue',    // Start with blue at low intensity
            0.3: 'cyan',    // Quick transition to cyan
            0.5: 'lime',    // Mid-range intensity
            0.7: 'yellow',  // Higher intensity
            0.9: 'red'      // Maximum intensity
  
        }
      }
    );

    // Add heatmap layer to map
    heatLayer.addTo(map);

    // Cleanup function
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [locations, isEnabled, map]);

  return null;
};

export default Heatmap; 