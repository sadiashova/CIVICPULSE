export interface SampleLocation {
  id: string;
  address: string;
  landmark: string;
  lat: number;
  lng: number;
  cityZone: string;
}

export const SAMPLE_LOCATIONS: SampleLocation[] = [
  // Sector 1 - Civic Center & Government Plaza
  {
    id: 'loc-01',
    address: '100 Municipal Way & City Hall Plaza',
    landmark: 'City Hall Main Entrance',
    lat: 40.7128,
    lng: -74.006,
    cityZone: 'Sector 1 - Civic Center',
  },
  {
    id: 'loc-02',
    address: '240 Federal Reserve Way',
    landmark: 'Metropolitan Courthouse',
    lat: 40.7135,
    lng: -74.0042,
    cityZone: 'Sector 1 - Civic Center',
  },
  {
    id: 'loc-03',
    address: '45 Liberty Promenade',
    landmark: 'Founders Memorial Park',
    lat: 40.7119,
    lng: -74.0075,
    cityZone: 'Sector 1 - Civic Center',
  },
  {
    id: 'loc-04',
    address: '310 Justice Boulevard',
    landmark: 'Public Records Archive Hall',
    lat: 40.7142,
    lng: -74.0051,
    cityZone: 'Sector 1 - Civic Center',
  },

  // Sector 2 - East Meadow & Residential Park
  {
    id: 'loc-05',
    address: '742 Evergreen Terrace & Oak Ave',
    landmark: 'Meadowbrook Community Center',
    lat: 40.7282,
    lng: -73.9942,
    cityZone: 'Sector 2 - East Meadow',
  },
  {
    id: 'loc-06',
    address: '89 Willow Creek Lane',
    landmark: 'East Meadow Public School #14',
    lat: 40.7295,
    lng: -73.9928,
    cityZone: 'Sector 2 - East Meadow',
  },
  {
    id: 'loc-07',
    address: '1440 Sycamore Drive',
    landmark: 'Pinecrest Botanical Gardens',
    lat: 40.7271,
    lng: -73.996,
    cityZone: 'Sector 2 - East Meadow',
  },
  {
    id: 'loc-08',
    address: '520 Birchwood Parkway',
    landmark: 'Maplewood Senior Living Center',
    lat: 40.7305,
    lng: -73.9912,
    cityZone: 'Sector 2 - East Meadow',
  },

  // Sector 3 - Medical Corridor & Tech Campus
  {
    id: 'loc-09',
    address: '620 Health Sciences Boulevard',
    landmark: 'Mercy General Hospital Emergency Bay',
    lat: 40.735,
    lng: -73.985,
    cityZone: 'Sector 3 - Medical Corridor',
  },
  {
    id: 'loc-10',
    address: '850 Bioresearch Way',
    landmark: 'Genome Innovation Institute',
    lat: 40.7368,
    lng: -73.9835,
    cityZone: 'Sector 3 - Medical Corridor',
  },
  {
    id: 'loc-11',
    address: '410 Pasteur Memorial Avenue',
    landmark: 'Childrens Diagnostic Clinic',
    lat: 40.7342,
    lng: -73.9868,
    cityZone: 'Sector 3 - Medical Corridor',
  },
  {
    id: 'loc-12',
    address: '990 Curie Tech Promenade',
    landmark: 'Advanced Surgical Robotics Lab',
    lat: 40.7375,
    lng: -73.982,
    cityZone: 'Sector 3 - Medical Corridor',
  },

  // Sector 4 - Downtown & Financial District
  {
    id: 'loc-13',
    address: '450 West Lexington Boulevard',
    landmark: 'Lexington Financial Center',
    lat: 40.7412,
    lng: -73.9898,
    cityZone: 'Sector 4 - Downtown',
  },
  {
    id: 'loc-14',
    address: '120 Broadway & 5th Avenue',
    landmark: 'Grand Commerce Arcade',
    lat: 40.7425,
    lng: -73.9875,
    cityZone: 'Sector 4 - Downtown',
  },
  {
    id: 'loc-15',
    address: '88 Wall Street Crossing',
    landmark: 'Stock Exchange Plaza',
    lat: 40.7401,
    lng: -73.9915,
    cityZone: 'Sector 4 - Downtown',
  },
  {
    id: 'loc-16',
    address: '302 Market Center Walk',
    landmark: 'Metro Center Underground Concourse',
    lat: 40.7438,
    lng: -73.986,
    cityZone: 'Sector 4 - Downtown',
  },
  {
    id: 'loc-17',
    address: '175 Columbus Circle North',
    landmark: 'Central Theater District Stage Door',
    lat: 40.7449,
    lng: -73.9845,
    cityZone: 'Sector 4 - Downtown',
  },

  // Sector 5 - Transit Hub & Logistics Port
  {
    id: 'loc-18',
    address: '800 Terminal Road & Freight Expressway',
    landmark: 'Central Intermodal Freight Depot',
    lat: 40.705,
    lng: -74.015,
    cityZone: 'Sector 5 - Transit Hub',
  },
  {
    id: 'loc-19',
    address: '42 Rail Interchange Way',
    landmark: 'Grand Central Passenger Rail Terminal',
    lat: 40.7065,
    lng: -74.0135,
    cityZone: 'Sector 5 - Transit Hub',
  },
  {
    id: 'loc-20',
    address: '1200 Dockside Marine Way',
    landmark: 'Container Port Crane Basin #3',
    lat: 40.7032,
    lng: -74.0175,
    cityZone: 'Sector 5 - Transit Hub',
  },
  {
    id: 'loc-21',
    address: '610 Logistics Expressway West',
    landmark: 'Municipal Fleet Maintenance Depot',
    lat: 40.7078,
    lng: -74.012,
    cityZone: 'Sector 5 - Transit Hub',
  },

  // Sector 6 - University Quarter & Innovation District
  {
    id: 'loc-22',
    address: '320 University Boulevard & Quad Way',
    landmark: 'Metropolitan University Science Quad',
    lat: 40.751,
    lng: -73.978,
    cityZone: 'Sector 6 - University Quarter',
  },
  {
    id: 'loc-23',
    address: '550 Scholar Row',
    landmark: 'Albertus Magnus Central Library',
    lat: 40.7525,
    lng: -73.9765,
    cityZone: 'Sector 6 - University Quarter',
  },
  {
    id: 'loc-24',
    address: '180 Varsity Stadium Drive',
    landmark: 'Civic Athletic Complex & Arena',
    lat: 40.7495,
    lng: -73.9798,
    cityZone: 'Sector 6 - University Quarter',
  },
  {
    id: 'loc-25',
    address: '810 Engineering Parkway',
    landmark: 'Materials Nano-Fabrication Foundry',
    lat: 40.7538,
    lng: -73.9745,
    cityZone: 'Sector 6 - University Quarter',
  },

  // Sector 7 - Waterfront & Historic District
  {
    id: 'loc-26',
    address: '15 Harborview Esplanade',
    landmark: 'Maritime Museum Pier #4',
    lat: 40.702,
    lng: -74.009,
    cityZone: 'Sector 7 - Waterfront',
  },
  {
    id: 'loc-27',
    address: '280 Boardwalk Marina Walk',
    landmark: 'Waterfront Ferry Terminal Gate 2',
    lat: 40.7008,
    lng: -74.011,
    cityZone: 'Sector 7 - Waterfront',
  },
  {
    id: 'loc-28',
    address: '45 Cobblestone Old Wharf Road',
    landmark: 'Historic Old Lighthouse Square',
    lat: 40.7035,
    lng: -74.0075,
    cityZone: 'Sector 7 - Waterfront',
  },

  // Sector 8 - Industrial Park & Recycling Zone
  {
    id: 'loc-29',
    address: '1400 Industrial Foundry Road',
    landmark: 'Municipal Waste Incinerator & Eco-Center',
    lat: 40.695,
    lng: -73.998,
    cityZone: 'Sector 8 - Industrial Park',
  },
  {
    id: 'loc-30',
    address: '880 Smelter Way & Forge Ave',
    landmark: 'Heavy Machinery Steelworks Yard',
    lat: 40.6935,
    lng: -73.9995,
    cityZone: 'Sector 8 - Industrial Park',
  },
  {
    id: 'loc-31',
    address: '2100 Chemical Plant Road',
    landmark: 'Water Filtration & Reclamation Substation',
    lat: 40.6965,
    lng: -73.996,
    cityZone: 'Sector 8 - Industrial Park',
  },
  {
    id: 'loc-32',
    address: '500 Timberland Processing Loop',
    landmark: 'City Green Waste Composting Facility',
    lat: 40.692,
    lng: -74.0015,
    cityZone: 'Sector 8 - Industrial Park',
  },
];
