// AdminContext.tsx - Generated with current configuration
// Last updated: 2025-08-20T09:21:20.595Z

import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface PriceConfig {
  moviePrice: 85;
  seriesPrice: 350;
  transferFeePercentage: 5;
  novelPricePerChapter: 15;
}

// Current delivery zones configuration
const deliveryZones = [
  {
    "id": "1",
    "name": "Santiago de Cuba > Santiago de Cuba > Nuevo Vista Alegre",
    "cost": 150,
    "active": true,
    "createdAt": "2025-08-20T09:17:23.281Z",
    "updatedAt": "2025-08-20T09:18:09.043Z"
  },
  {
    "id": "2",
    "name": "Santiago de Cuba > Santiago de Cuba > Vista Alegre",
    "cost": 350,
    "active": true,
    "createdAt": "2025-08-20T09:17:23.282Z",
    "updatedAt": "2025-08-20T09:18:14.603Z"
  }
];

// Current novels configuration  
const novels = [
  {
    "titulo": "lolo",
    "genero": "drama",
    "capitulos": 1,
    "año": 2025,
    "descripcion": "",
    "active": true,
    "id": 1755681508123,
    "createdAt": "2025-08-20T09:18:28.123Z",
    "updatedAt": "2025-08-20T09:18:28.123Z"
  }
];

// Rest of AdminContext implementation...
export default AdminContext;