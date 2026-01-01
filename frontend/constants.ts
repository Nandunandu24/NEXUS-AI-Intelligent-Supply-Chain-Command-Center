
import { PortData, RiskLevel, Vessel } from './types';

export const PORTS: PortData[] = [
  { id: 'SGP', name: 'Port of Singapore', state: 'Central', country: 'Singapore', coordinates: [103.85, 1.28], riskLevel: RiskLevel.LOW, congestionIndex: 12, predictedDelay: 2, financialImpact: 450000, activeVessels: 450 },
  { id: 'SHA', name: 'Port of Shanghai', state: 'Shanghai', country: 'China', coordinates: [121.47, 31.23], riskLevel: RiskLevel.MEDIUM, congestionIndex: 45, predictedDelay: 12, financialImpact: 2300000, activeVessels: 820 },
  { id: 'ROT', name: 'Port of Rotterdam', state: 'South Holland', country: 'Netherlands', coordinates: [4.47, 51.92], riskLevel: RiskLevel.LOW, congestionIndex: 18, predictedDelay: 4, financialImpact: 890000, activeVessels: 310 },
  { id: 'LAX', name: 'Port of Los Angeles', state: 'California', country: 'USA', coordinates: [-118.24, 33.74], riskLevel: RiskLevel.HIGH, congestionIndex: 78, predictedDelay: 36, financialImpact: 5600000, activeVessels: 145 },
  { id: 'DXB', name: 'Jebel Ali Port', state: 'Dubai', country: 'UAE', coordinates: [55.03, 24.99], riskLevel: RiskLevel.LOW, congestionIndex: 22, predictedDelay: 3, financialImpact: 1200000, activeVessels: 280 },
  { id: 'HAM', name: 'Port of Hamburg', state: 'Hamburg', country: 'Germany', coordinates: [9.99, 53.55], riskLevel: RiskLevel.MEDIUM, congestionIndex: 42, predictedDelay: 10, financialImpact: 1100000, activeVessels: 190 },
  { id: 'MUM', name: 'Nhava Sheva', state: 'Maharashtra', country: 'India', coordinates: [72.95, 18.95], riskLevel: RiskLevel.CRITICAL, congestionIndex: 92, predictedDelay: 48, financialImpact: 7800000, activeVessels: 210 },
  { id: 'CPT', name: 'Port of Cape Town', state: 'Western Cape', country: 'South Africa', coordinates: [18.42, -33.92], riskLevel: RiskLevel.HIGH, congestionIndex: 82, predictedDelay: 40, financialImpact: 4200000, activeVessels: 75 },
  { id: 'BUS', name: 'Port of Busan', state: 'Yeongnam', country: 'South Korea', coordinates: [129.07, 35.17], riskLevel: RiskLevel.LOW, congestionIndex: 15, predictedDelay: 1, financialImpact: 300000, activeVessels: 520 },
  { id: 'TJP', name: 'Port of Tanjung Pelepas', state: 'Johor', country: 'Malaysia', coordinates: [103.55, 1.36], riskLevel: RiskLevel.MEDIUM, congestionIndex: 38, predictedDelay: 8, financialImpact: 600000, activeVessels: 240 }
];

export const VESSELS: Vessel[] = [
  {
    id: 'V-101',
    name: 'Nexus Voyager',
    speed: 18.4,
    destination: 'Port of Singapore',
    status: 'en-route',
    history: [[-122.41, 37.77], [-120.0, 35.0], [-118.24, 33.74]],
    path: [[-118.24, 33.74], [-150, 20], [140, 10], [103.85, 1.28]]
  },
  {
    id: 'V-102',
    name: 'Oceanic Prime',
    speed: 21.2,
    destination: 'Port of Rotterdam',
    status: 'en-route',
    history: [[125.0, 35.0], [121.47, 31.23]],
    path: [[121.47, 31.23], [100, 0], [40, -20], [18.42, -33.92], [-10, 20], [4.47, 51.92]]
  },
  {
    id: 'V-103',
    name: 'Global Horizon',
    speed: 0.2, // Stuck
    destination: 'Nhava Sheva',
    status: 'stuck',
    history: [[45.0, 15.0], [50.0, 20.0], [55.03, 24.99]],
    path: [[55.03, 24.99], [65, 15], [72.95, 18.95]]
  },
  {
    id: 'V-104',
    name: 'Atlas Carrier',
    speed: 12.1,
    destination: 'Port of Los Angeles',
    status: 'en-route',
    history: [[130, 30], [135, 33], [139.64, 35.44]],
    path: [[139.64, 35.44], [180, 40], [-140, 45], [-118.24, 33.74]]
  },
  {
    id: 'V-105',
    name: 'Polaris Fleet',
    speed: 19.8,
    destination: 'Port of Busan',
    status: 'en-route',
    history: [[103.85, 1.28], [110, 5], [120, 20]],
    path: [[120, 20], [125, 28], [129.07, 35.17]]
  },
  {
    id: 'V-106',
    name: 'Crescent Moon',
    speed: 16.5,
    destination: 'Jebel Ali Port',
    status: 'en-route',
    history: [[72.95, 18.95], [65, 20]],
    path: [[65, 20], [60, 23], [55.03, 24.99]]
  }
];

export const SHIPPING_ROUTES = [
  { from: 'SGP', to: 'ROT', status: 'optimal' },
  { from: 'SHA', to: 'LAX', status: 'delayed' },
  { from: 'DXB', to: 'MUM', status: 'critical' }
];

export const SHAP_VALUES = [
  { feature: 'Weather (Cyclone)', value: 0.45 },
  { feature: 'Port Labor Strike', value: 0.38 },
  { feature: 'Vessel Mechanical', value: 0.12 }
];

export const DELAY_TREND_DATA = [
  { time: '08:00', delay: 22 },
  { time: '10:00', delay: 28 },
  { time: '12:00', delay: 32 },
  { time: '14:00', delay: 30 },
  { time: '16:00', delay: 36 },
  { time: '18:00', delay: 42 }
];

export const APP_THEME = {
  bg: 'bg-slate-950',
  card: 'bg-slate-900/50 backdrop-blur-md border border-slate-800',
  accent: 'text-cyan-400',
  risk: {
    [RiskLevel.LOW]: 'text-emerald-400',
    [RiskLevel.MEDIUM]: 'text-yellow-400',
    [RiskLevel.HIGH]: 'text-orange-400',
    [RiskLevel.CRITICAL]: 'text-rose-500'
  }
};
