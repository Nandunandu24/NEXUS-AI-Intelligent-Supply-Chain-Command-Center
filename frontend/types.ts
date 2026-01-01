
export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export type WeatherConditionType = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'foggy';

export interface WeatherData {
  temp: string;
  condition: string;
  type: WeatherConditionType;
  windSpeed?: string;
}

export interface PortData {
  id: string;
  name: string;
  country: string;
  state: string;
  coordinates: [number, number];
  riskLevel: RiskLevel;
  congestionIndex: number;
  predictedDelay: number;
  financialImpact: number;
  activeVessels: number;
  weather?: WeatherData;
}

export interface MapIncident {
  id: string;
  type: 'cyclone' | 'danger';
  coordinates: [number, number];
  label: string;
  radius: number;
}

export interface Vessel {
  id: string;
  name: string;
  speed: number;
  destination: string;
  path: [number, number][];
  history: [number, number][];
  status: 'en-route' | 'anchored' | 'congested' | 'stuck';
  weather?: WeatherData;
}

export interface Decision {
  id: string;
  action: string;
  category: 'Rerouting' | 'Inventory' | 'Labor' | 'Financial';
  confidence: number;
  expectedROI: string;
  riskReduction: number;
  status: 'Pending' | 'Approved' | 'Declined';
  impactAnalysis: string;
  agentConsensus: {
    risk: number;
    ops: number;
    cost: number;
    sustainability: number;
  };
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}
