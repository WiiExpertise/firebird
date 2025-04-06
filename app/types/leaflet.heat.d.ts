import { Layer } from 'leaflet';

declare module 'leaflet' {
  interface HeatLayerOptions {
    minOpacity?: number;
    maxZoom?: number;
    max?: number;
    radius?: number;
    blur?: number;
    gradient?: { [key: number]: string };
  }

  interface HeatLayer extends Layer {
    setOptions(options: HeatLayerOptions): this;
    addLatLng(latlng: L.LatLngExpression, intensity?: number): this;
    setLatLngs(latlngs: L.LatLngExpression[]): this;
  }

  interface HeatLayerStatic {
    new (latlngs: L.LatLngExpression[], options?: HeatLayerOptions): HeatLayer;
  }

  interface HeatLayerFactory {
    (latlngs: L.LatLngExpression[], options?: HeatLayerOptions): HeatLayer;
  }

  const HeatLayer: HeatLayerStatic;
  const heatLayer: HeatLayerFactory;
} 