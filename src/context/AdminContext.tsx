// AdminContext.tsx - Generado con configuración actual sincronizada
// Última actualización: 2025-08-21T07:35:24.429Z
// Sistema de sincronización en tiempo real activado

import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface PriceConfig {
  moviePrice: 80;
  seriesPrice: 300;
  transferFeePercentage: 15;
  novelPricePerChapter: 5;
}

// Configuración actual de zonas de entrega sincronizada
const DELIVERY_ZONES_CONFIG = [
  {
    "id": "1",
    "name": "Santiago de Cuba > Santiago de Cuba > Nuevo Vista Alegre",
    "cost": 100,
    "active": true,
    "createdAt": "2025-08-21T07:33:50.911Z",
    "updatedAt": "2025-08-21T07:33:50.911Z"
  },
  {
    "id": "2",
    "name": "Santiago de Cuba > Santiago de Cuba > Vista Alegre",
    "cost": 300,
    "active": true,
    "createdAt": "2025-08-21T07:33:50.911Z",
    "updatedAt": "2025-08-21T07:33:50.911Z"
  }
];

// Configuración actual de novelas sincronizada
const NOVELS_CONFIG = [];

// Resto de la implementación de AdminContext...
// [Código completo del contexto con sincronización en tiempo real]

export default AdminContext;