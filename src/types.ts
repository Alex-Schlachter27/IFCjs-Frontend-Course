export interface GisParameters {
  container: HTMLDivElement;
  accessToken: string;
  zoom: number;
  center: [number, number];
  pitch: number;
  bearing: number;
  buildings: Building[];
}

export interface Building {
  uid: string;
  userID: string;
  lat: number;
  lng: number;
  name: string;
  models: Model[];
}

export interface LngLat {
  lng: number;
  lat: number;
}

export interface Model {
  name: string;
  id: string;
}

export interface Tool {
  name: string;
  tooltip?: string;
  active: boolean;
  icon: any;
  action: (...args: any) => void;
}

export interface Floorplan {
  name: string;
  id: string;
}

export interface Property {
  name: string;
  value: string;
}

export interface PropertySet {
  name: string;
  properties: Property[];
}

