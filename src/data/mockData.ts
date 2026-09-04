export interface EarthquakeEvent {
  id: string;
  title: string;
  date: string;
  magnitude: number;
  depth: number; // in km
  lat: number;
  lng: number;
  region: string;
  affectedCount: number;
  affectedHouses?: number; // optional
  victimsStatus: {
    critical: number;
    minor: number;
    safe: number;
  };
  needs: {
    type: string;
    requested: number;
    delivered: number;
    unit: string;
  }[];
}

export interface VictimReport {
  id: string;
  earthquakeId?: string;
  reporterName: string;
  description: string;
  images?: string[];
  lat: number;
  lng: number;
  affectedPeople: number;
  affectedHouses?: number; // optional
  needs: ('Alimentos' | 'Agua Potable' | 'Carpas/Refugio' | 'Kits de Aseo' | 'Atención Médica')[];
  status: 'pending' | 'in_progress' | 'resolved';
  date: string;
  phone?: string;
  locationName: string;
}

export const earthquakeEvents: EarthquakeEvent[] = [
  {
    id: "eq-choco-2026",
    title: "Sismo de Quibdó - Chocó",
    date: "2026-08-24T14:32:00Z",
    magnitude: 6.2,
    depth: 18,
    lat: 5.6983,
    lng: -76.6502,
    region: "Chocó",
    affectedCount: 1250,
    victimsStatus: {
      critical: 45,
      minor: 320,
      safe: 885
    },
    needs: [
      { type: "Carpas/Refugio", requested: 250, delivered: 120, unit: "unidades" },
      { type: "Agua Potable", requested: 5000, delivered: 3500, unit: "litros" },
      { type: "Alimentos", requested: 1200, delivered: 600, unit: "raciones" },
      { type: "Atención Médica", requested: 150, delivered: 90, unit: "consultas" }
    ]
  },
  {
    id: "eq-cauca-2026",
    title: "Sismo de Popayán - Cauca",
    date: "2026-08-20T08:15:00Z",
    magnitude: 5.8,
    depth: 12,
    lat: 2.4419,
    lng: -76.6063,
    region: "Cauca",
    affectedCount: 820,
    victimsStatus: {
      critical: 28,
      minor: 190,
      safe: 602
    },
    needs: [
      { type: "Carpas/Refugio", requested: 180, delivered: 150, unit: "unidades" },
      { type: "Agua Potable", requested: 3000, delivered: 2800, unit: "litros" },
      { type: "Alimentos", requested: 800, delivered: 750, unit: "raciones" },
      { type: "Kits de Aseo", requested: 400, delivered: 220, unit: "kits" }
    ]
  },
  {
    id: "eq-santander-2026",
    title: "Sismo de Mesa de los Santos",
    date: "2026-08-18T22:04:00Z",
    magnitude: 5.4,
    depth: 147,
    lat: 6.8286,
    lng: -73.1189,
    region: "Santander",
    affectedCount: 150,
    victimsStatus: {
      critical: 2,
      minor: 15,
      safe: 133
    },
    needs: [
      { type: "Carpas/Refugio", requested: 20, delivered: 20, unit: "unidades" },
      { type: "Agua Potable", requested: 500, delivered: 500, unit: "litros" },
      { type: "Kits de Aseo", requested: 50, delivered: 45, unit: "kits" }
    ]
  },
  {
    id: "eq-armenia-1999",
    title: "Sismo de Armenia (Simulado Activo)",
    date: "2026-08-10T13:19:00Z",
    magnitude: 6.0,
    depth: 15,
    lat: 4.5339,
    lng: -75.6811,
    region: "Quindío",
    affectedCount: 3500,
    victimsStatus: {
      critical: 120,
      minor: 850,
      safe: 2530
    },
    needs: [
      { type: "Carpas/Refugio", requested: 800, delivered: 450, unit: "unidades" },
      { type: "Agua Potable", requested: 15000, delivered: 9000, unit: "litros" },
      { type: "Alimentos", requested: 4000, delivered: 2500, unit: "raciones" },
      { type: "Kits de Aseo", requested: 1500, delivered: 800, unit: "kits" }
    ]
  }
];

export const initialVictimReports: VictimReport[] = [
  {
    id: "rep-001",
    earthquakeId: "eq-choco-2026",
    reporterName: "María Liliana Córdoba",
    description: "Deslizamiento en el barrio El Reposo afectó a 8 viviendas. Familias en la intemperie. Necesitamos colchonetas y carpas urgentemente.",
    lat: 5.6895,
    lng: -76.6620,
    affectedPeople: 45,
    needs: ["Carpas/Refugio", "Alimentos", "Kits de Aseo"],
    status: "pending",
    date: "2026-08-24T15:10:00Z",
    phone: "312 456 7890",
    locationName: "Barrio El Reposo, Quibdó"
  },
  {
    id: "rep-002",
    earthquakeId: "eq-choco-2026",
    reporterName: "José Alirio Palacios",
    description: "El acueducto rural colapsó debido al sismo. Toda la vereda Las Mercedes está sin agua potable hace 24 horas. Riesgo de infecciones sanitarias.",
    lat: 5.7210,
    lng: -76.6350,
    affectedPeople: 180,
    needs: ["Agua Potable", "Kits de Aseo"],
    status: "in_progress",
    date: "2026-08-24T16:05:00Z",
    phone: "315 987 6543",
    locationName: "Vereda Las Mercedes, Quibdó"
  },
  {
    id: "rep-003",
    earthquakeId: "eq-choco-2026",
    reporterName: "Dra. Sandra Patiño",
    description: "Centro de salud de Istmina presenta grietas estructurales severas. Estamos atendiendo a la población en el parque central, pero nos faltan insumos médicos básicos.",
    lat: 5.1614,
    lng: -76.6841,
    affectedPeople: 90,
    needs: ["Atención Médica", "Carpas/Refugio"],
    status: "pending",
    date: "2026-08-24T17:40:00Z",
    phone: "311 222 3344",
    locationName: "Parque Central, Istmina"
  },
  {
    id: "rep-004",
    earthquakeId: "eq-cauca-2026",
    reporterName: "Carlos Mario Benítez",
    description: "Derrumbe parcial de viviendas históricas en la Comuna 4 de Popayán. Varias personas heridas leves y escombros bloqueando la vía principal.",
    lat: 2.4435,
    lng: -76.6090,
    affectedPeople: 35,
    needs: ["Atención Médica", "Carpas/Refugio"],
    status: "resolved",
    date: "2026-08-20T08:45:00Z",
    phone: "300 765 4321",
    locationName: "Comuna 4, Popayán"
  },
  {
    id: "rep-005",
    earthquakeId: "eq-cauca-2026",
    reporterName: "Hermana Teresa Ruiz",
    description: "El albergue de la iglesia San Francisco está saturado. Requerimos colchonetas, sábanas y víveres no perecederos para 60 niños y adultos mayores.",
    lat: 2.4402,
    lng: -76.6045,
    affectedPeople: 60,
    needs: ["Alimentos", "Carpas/Refugio"],
    status: "in_progress",
    date: "2026-08-20T10:12:00Z",
    phone: "320 555 1234",
    locationName: "Iglesia San Francisco, Popayán"
  },
  {
    id: "rep-006",
    earthquakeId: "eq-santander-2026",
    reporterName: "Pedro Nel Rodríguez",
    description: "Caída de tejas y agrietamiento de muros en 3 colegios de Los Santos. No hay lesionados graves, pero se suspendieron clases preventivamente.",
    lat: 6.8290,
    lng: -73.1195,
    affectedPeople: 15,
    needs: ["Kits de Aseo"],
    status: "resolved",
    date: "2026-08-19T06:30:00Z",
    phone: "318 444 8899",
    locationName: "Casco Urbano, Los Santos"
  },
  {
    id: "rep-007",
    earthquakeId: "eq-armenia-1999",
    reporterName: "Julián Giraldo",
    description: "Simulacro de colapso en el centro de Armenia. 150 damnificados ficticios reportados para probar tiempos de respuesta logística de defensa civil.",
    lat: 4.5360,
    lng: -75.6790,
    affectedPeople: 150,
    needs: ["Alimentos", "Agua Potable", "Carpas/Refugio"],
    status: "in_progress",
    date: "2026-08-11T09:00:00Z",
    phone: "310 999 8888",
    locationName: "Plaza de Bolívar, Armenia"
  }
];
